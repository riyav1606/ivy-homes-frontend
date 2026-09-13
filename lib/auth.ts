import { AuthSession, User } from "./types";

export const API_KEY = "YOUR_API_KEY";
export const BASE_URL = "https://solve.ivy.homes";
export const DEMO_PASSWORD = "xyz";

const SESSION_KEY = "ivy_auth_session";
const FAVOURITES_PREFIX = "ivy_favs_";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Set sync cookie for SSR if needed
  document.cookie = `ivy_token=${session.token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `ivy_user=${encodeURIComponent(session.user.email)}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  document.cookie = "ivy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "ivy_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const resp = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || `Login failed with status ${resp.status}`);
  }

  const data = await resp.json();
  const token = data.access_token || data.token;
  const refreshToken = data.refresh_token;
  const expiresInSec = data.expires_in || 900;
  const expiresAt = Date.now() + expiresInSec * 1000;

  const session: AuthSession = {
    token,
    refreshToken,
    expiresAt,
    user: {
      email,
      name: email.split("@")[0].toUpperCase(),
    },
  };

  saveSession(session);
  return session;
}

export async function logout(): Promise<void> {
  const session = getSession();
  if (session?.token) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          Authorization: `Bearer ${session.token}`,
        },
      });
    } catch {
      // Tokens are stateless, ignore network failure
    }
  }
  clearSession();
}

export async function ensureValidToken(): Promise<string> {
  let session = getSession();
  if (!session) {
    // Auto login demo1 if no session exists
    session = await login("demo1@ivy.homes", DEMO_PASSWORD);
  }

  // If token is about to expire in less than 60 seconds
  if (Date.now() >= session.expiresAt - 60000) {
    try {
      if (session.refreshToken) {
        const resp = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            Authorization: `Bearer ${session.refreshToken}`,
          },
        });
        if (resp.ok) {
          const data = await resp.json();
          session.token = data.access_token || session.token;
          session.expiresAt = Date.now() + (data.expires_in || 900) * 1000;
          saveSession(session);
          return session.token;
        }
      }
      // If refresh failed, re-login with the same user
      const newSession = await login(session.user.email, DEMO_PASSWORD);
      return newSession.token;
    } catch {
      return session.token;
    }
  }

  return session.token;
}

// ----------------------------------------------------------------------------
// Per-User Persistent Favourites (Saved Listings)
// ----------------------------------------------------------------------------

export function getFavourites(userEmail?: string): string[] {
  if (typeof window === "undefined") return [];
  const email = userEmail || getSession()?.user.email;
  if (!email) return [];
  try {
    const raw = localStorage.getItem(`${FAVOURITES_PREFIX}${email}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavourite(listingId: string, userEmail?: string): boolean {
  if (typeof window === "undefined") return false;
  const email = userEmail || getSession()?.user.email;
  if (!email) return false;

  const current = getFavourites(email);
  const exists = current.includes(listingId);
  const updated = exists
    ? current.filter((id) => id !== listingId)
    : [...current, listingId];

  localStorage.setItem(`${FAVOURITES_PREFIX}${email}`, JSON.stringify(updated));
  window.dispatchEvent(new Event("favourites_changed"));
  return !exists;
}

export function isFavourite(listingId: string, userEmail?: string): boolean {
  const favs = getFavourites(userEmail);
  return favs.includes(listingId);
}
