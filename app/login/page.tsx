"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getSession, DEMO_PASSWORD } from "@/lib/auth";
import { Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, KeyRound, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo1@ivy.homes");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      // Already logged in
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/listings");
      }, 500);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-ivy-800 text-white flex items-center justify-center font-black text-xl shadow-md mb-4">
            I
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Portal Authentication
          </h2>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Real session authentication against the live API at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /auth/login</code> with API Key header.
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ivy-700" />
            <span>Select Demo Candidate Account:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["demo1@ivy.homes", "demo2@ivy.homes", "demo3@ivy.homes"].map((acc) => {
              const active = email === acc;
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? "bg-ivy-800 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {acc.split("@")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error / Success message */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authenticated successfully! Redirecting...</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-ivy-700"
                placeholder="demo1@ivy.homes"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Key Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-ivy-700 font-mono"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-ivy-800 hover:bg-ivy-900 disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            {loading ? "Authenticating..." : "Sign In with Session Token"}
          </button>
        </form>

        {/* Session Policy Note */}
        <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-ivy-700" />
            Session Persistence Guarantee
          </div>
          <p>
            The bearer token is persisted in <code className="bg-slate-50 px-1 py-0.5 rounded">localStorage</code> and synced via HTTP cookies. Tokens survive reloads and background refreshes prevent expiry.
          </p>
        </div>
      </div>
    </div>
  );
}
