"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Listing } from "@/lib/types";
import { isFavourite, toggleFavourite } from "@/lib/auth";
import { isCorruptListing, isFakeListing } from "@/lib/api";
import { Heart, CheckCircle2, AlertTriangle, ShieldAlert, Compass, Layers, Car, Sparkles } from "lucide-react";

interface Props {
  listing: Listing;
}

export function formatPrice(inr: number): string {
  if (inr <= 0) return `₹${inr.toLocaleString()}`;
  if (inr >= 10000000) {
    return `₹${(inr / 10000000).toFixed(2)} Cr`;
  }
  if (inr >= 100000) {
    return `₹${(inr / 100000).toFixed(2)} L`;
  }
  return `₹${inr.toLocaleString()}`;
}

export default function ListingCard({ listing }: Props) {
  const [fav, setFav] = useState(false);
  const isCorrupt = isCorruptListing(listing);
  const isFake = isFakeListing(listing);

  useEffect(() => {
    setFav(isFavourite(listing.listing_id));
  }, [listing.listing_id]);

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavourite(listing.listing_id);
    setFav(newState);
  };

  const pricePerSqft = listing.carpet_area > 0 && listing.price > 0
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-ivy-600 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Header & Status Badges */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {listing.is_live ? (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 rounded-full">
                Inactive
              </span>
            )}

            {listing.is_verified && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}

            {isCorrupt && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Corrupt Data
              </span>
            )}

            {isFake && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Spam Seller
              </span>
            )}
          </div>

          {/* Favourite Button */}
          <button
            onClick={handleFavClick}
            className={`p-2 rounded-full transition-colors ${
              fav ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
            title={fav ? "Remove from saved" : "Save property"}
          >
            <Heart className={`w-4 h-4 ${fav ? "fill-rose-600" : ""}`} />
          </button>
        </div>

        {/* Content Body */}
        <Link href={`/listings/${listing.listing_id}`} className="block p-4">
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(listing.price)}
            </span>
            {pricePerSqft && (
              <span className="text-xs font-semibold text-slate-500">
                ₹{pricePerSqft.toLocaleString()} / sqft
              </span>
            )}
          </div>

          {/* Title & Locality */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-ivy-800 transition-colors">
            {listing.bedroom} BHK {listing.apartment_name}
          </h3>
          <p className="text-xs font-medium text-slate-500 capitalize mb-3">
            {listing.locality}, Mumbai
          </p>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Carpet</span>
              <span className="font-bold">{listing.carpet_area} sqft</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Floor</span>
              <span className="font-bold">
                {listing.floor}/{listing.total_floors}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Furnishing</span>
              <span className="font-bold capitalize truncate block">
                {listing.furnishing.replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Meta Tags */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            {listing.facing_direction && (
              <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded capitalize">
                <Compass className="w-3 h-3 text-slate-400" />
                {listing.facing_direction}
              </span>
            )}
            {listing.covered_parking > 0 && (
              <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded">
                <Car className="w-3 h-3 text-slate-400" />
                {listing.covered_parking} Parking
              </span>
            )}
            {listing.project_id && (
              <span className="flex items-center gap-1 bg-ivy-50 text-ivy-800 border border-ivy-200 px-2 py-0.5 rounded font-semibold">
                <Sparkles className="w-3 h-3 text-ivy-600" />
                {listing.project_id}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Via {listing.website}</span>
        <span>ID: {listing.listing_id}</span>
      </div>
    </div>
  );
}
