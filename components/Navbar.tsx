"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSession, logout, getFavourites } from "@/lib/auth";
import { Home, Heart, BarChart3, Building2, KeyRound, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(getSession());
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    setSession(getSession());
    setFavCount(getFavourites().length);

    const handleFavChange = () => {
      setFavCount(getFavourites().length);
    };
    window.addEventListener("favourites_changed", handleFavChange);
    return () => window.removeEventListener("favourites_changed", handleFavChange);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setSession(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/listings", label: "Buy / Listings", icon: Home },
    { href: "/rentals", label: "Rentals", icon: KeyRound },
    { href: "/projects", label: "Projects", icon: Building2 },
    {
      href: "/favourites",
      label: "Saved",
      icon: Heart,
      badge: favCount > 0 ? favCount : null,
    },
    { href: "/insights", label: "Insights & Audit", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/listings" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ivy-800 to-ivy-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            I
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">
              Ivy<span className="text-ivy-800">Homes</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
              Mumbai Edition
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== "/listings" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative ${
                  active
                    ? "text-ivy-900 bg-ivy-50 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-ivy-700" : "text-slate-400"}`} />
                {link.label}
                {link.badge !== null && link.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-ivy-800 text-white rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Account / Login */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-ivy-100 text-ivy-800 flex items-center justify-center text-xs font-bold">
                  {session.user.name?.[0] || "D"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {session.user.name || "Demo User"}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-ivy-800 hover:bg-ivy-900 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserIcon className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
