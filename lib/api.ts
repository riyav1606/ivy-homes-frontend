import { BASE_URL, API_KEY, ensureValidToken } from "./auth";
import { Listing, Rental, Project } from "./types";

// Import pre-cached datasets as backup/offline data
import cachedListings from "../data/listings.json";
import cachedRentals from "../data/rentals.json";
import cachedProjects from "../data/projects.json";

export interface ListingFilters {
  locality?: string;
  bhk?: number | string;
  furnishing?: string;
  property_type?: string;
  min_price?: number | string;
  max_price?: number | string;
  project_id?: string;
  is_live_only?: boolean;
  hide_corrupt?: boolean;
  hide_fake?: boolean;
  sort_by?: "price" | "carpet_area" | "posted_at" | "bedroom";
  order?: "asc" | "desc";
  query?: string;
}

// ----------------------------------------------------------------------------
// Corrupt & Fake Detection Helper
// ----------------------------------------------------------------------------

export function isCorruptListing(l: Listing): boolean {
  const carpet = l.carpet_area || 0;
  const superBuilt = l.super_built_up_area || 0;
  const floor = l.floor || 0;
  const totalFloors = l.total_floors || 0;
  const price = l.price || 0;
  const lat = l.latitude;
  const lon = l.longitude;

  if (superBuilt > 0 && carpet > superBuilt) return true;
  if (totalFloors > 0 && floor > totalFloors) return true;
  if (price <= 0 || carpet <= 0) return true;
  if (lat && lon && !(18.8 <= lat && lat <= 19.4 && 72.7 <= lon && lon <= 73.2)) return true;
  return false;
}

const FAKE_PHONES = new Set([
  "+912007133812",
  "+912007145137",
  "+912000039837",
  "+912007219058",
  "+912003561453",
  "+912007304832",
  "+912004741318",
  "+912001446022",
  "+912003337096",
  "+912003641036",
  "+910000000000",
  "+919999999999",
]);

export function isFakeListing(l: Listing): boolean {
  if (FAKE_PHONES.has(l.posted_by_contact)) return true;
  const desc = (l.description || "").toLowerCase();
  if (desc.includes("call for best deal") || desc.includes("dummy listing")) return true;
  return false;
}

// ----------------------------------------------------------------------------
// Core API Fetchers with Client-Side Fallback
// ----------------------------------------------------------------------------

export async function fetchListings(filters: ListingFilters = {}): Promise<Listing[]> {
  let records: Listing[] = [];

  try {
    const token = await ensureValidToken();
    const queryParams = new URLSearchParams();
    queryParams.set("limit", "50");
    if (filters.locality) queryParams.set("locality", filters.locality.toLowerCase());
    if (filters.property_type) queryParams.set("property_type", filters.property_type.toLowerCase());
    if (filters.bhk) queryParams.set("bhk", String(filters.bhk));
    if (filters.min_price) queryParams.set("min_price", String(filters.min_price));
    if (filters.max_price) queryParams.set("max_price", String(filters.max_price));

    const resp = await fetch(`${BASE_URL}/v1/listings?${queryParams.toString()}`, {
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (resp.ok) {
      const data = await resp.json();
      records = data.results || [];
    }
  } catch (err) {
    console.warn("Live fetch failed, using cached dataset:", err);
  }

  // If live fetch was empty or failed, fallback to full dataset
  if (records.length === 0) {
    records = cachedListings as Listing[];
  }

  // Apply comprehensive client-side filtering fallback
  // (Crucial because server quietly ignores furnishing, project_id, descending sort, etc.)
  let result = records.filter((item) => {
    if (filters.is_live_only !== false && !item.is_live) return false;
    if (filters.hide_corrupt && isCorruptListing(item)) return false;
    if (filters.hide_fake && isFakeListing(item)) return false;

    if (filters.locality && item.locality.toLowerCase() !== filters.locality.toLowerCase()) {
      return false;
    }
    if (filters.bhk && item.bedroom !== Number(filters.bhk)) {
      return false;
    }
    if (filters.furnishing && item.furnishing.toLowerCase() !== filters.furnishing.toLowerCase()) {
      return false;
    }
    if (filters.property_type && item.property_type.toLowerCase() !== filters.property_type.toLowerCase()) {
      return false;
    }
    if (filters.project_id && item.project_id !== filters.project_id) {
      return false;
    }
    if (filters.min_price && item.price < Number(filters.min_price)) {
      return false;
    }
    if (filters.max_price && item.price > Number(filters.max_price)) {
      return false;
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchName = item.apartment_name?.toLowerCase().includes(q);
      const matchLoc = item.locality?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchAgent = item.posted_by_name?.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchDesc && !matchAgent) return false;
    }
    return true;
  });

  // Client-side sorting fallback (Server ignores order="desc")
  if (filters.sort_by) {
    const order = filters.order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      if (filters.sort_by === "price") return (a.price - b.price) * order;
      if (filters.sort_by === "carpet_area") return (a.carpet_area - b.carpet_area) * order;
      if (filters.sort_by === "bedroom") return (a.bedroom - b.bedroom) * order;
      if (filters.sort_by === "posted_at") {
        return (new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()) * order;
      }
      return 0;
    });
  }

  return result;
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  try {
    const token = await ensureValidToken();
    const resp = await fetch(`${BASE_URL}/v1/listings/${id}`, {
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch {
    // fallback
  }

  const found = (cachedListings as Listing[]).find((l) => l.listing_id === id);
  return found || null;
}

export async function fetchSimilarListings(listing: Listing): Promise<Listing[]> {
  // Since /v1/listings/{id}/similar returns 404, we compute the documented logic:
  // "same locality, same bedroom count, price within 15%"
  const all = cachedListings as Listing[];
  const minPrice = listing.price * 0.85;
  const maxPrice = listing.price * 1.15;

  return all
    .filter(
      (l) =>
        l.listing_id !== listing.listing_id &&
        l.is_live &&
        l.locality.toLowerCase() === listing.locality.toLowerCase() &&
        l.bedroom === listing.bedroom &&
        l.price >= minPrice &&
        l.price <= maxPrice
    )
    .slice(0, 10);
}

export async function fetchRentals(locality?: string, bhk?: number | string): Promise<Rental[]> {
  let records = cachedRentals as Rental[];
  if (locality) {
    records = records.filter((r) => r.locality.toLowerCase() === locality.toLowerCase());
  }
  if (bhk) {
    records = records.filter((r) => r.bedroom === Number(bhk));
  }
  return records;
}

export async function fetchProjects(locality?: string): Promise<Project[]> {
  let records = cachedProjects as Project[];
  if (locality) {
    records = records.filter((p) => p.locality.toLowerCase() === locality.toLowerCase());
  }
  return records;
}
