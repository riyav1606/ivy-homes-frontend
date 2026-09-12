"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFavourites, getSession } from "@/lib/auth";
import { fetchListingById } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import { Heart, Home, ShieldCheck, Sparkles } from "lucide-react";

export default function FavouritesPage() {
  const [session, setSession] = useState(getSession());
  const [favListings, setFavListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavs = async () => {
    setLoading(true);
    const currSession = getSession();
    setSession(currSession);
    const favIds = getFavourites(currSession?.user.email);

    try {
      const promises = favIds.map((id) => fetchListingById(id));
      const results = await Promise.all(promises);
      const valid = results.filter((x): x is Listing => x !== null);
      setFavListings(valid);
    } catch (err) {
      console.error("Error loading favourites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavs();
    const handleFavChange = () => {
      loadFavs();
    };
    window.addEventListener("favourites_changed", handleFavChange);
    return () => window.removeEventListener("favourites_changed", handleFavChange);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-600 fill-rose-600" />
            Saved Properties
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Persisted per-user session in local storage. Survives page reloads and re-logins.
          </p>
        </div>

        {/* User context badge */}
        <div className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-ivy-700" />
          <span>Account: {session?.user.email || "demo1@ivy.homes"}</span>
        </div>
      </div>

      {/* Favourites list */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-ivy-800 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading your saved properties...</p>
        </div>
      ) : favListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No saved properties yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Click the heart icon on any property in the listings or details screen to save it to your account.
          </p>
          <Link
            href="/listings"
            className="px-5 py-2.5 bg-ivy-800 text-white rounded-xl text-xs font-bold hover:bg-ivy-900 transition-colors inline-flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            Browse Mumbai Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favListings.map((listing) => (
            <ListingCard key={listing.listing_id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
