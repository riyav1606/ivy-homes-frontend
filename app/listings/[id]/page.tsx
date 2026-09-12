"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { fetchListingById, fetchSimilarListings, isCorruptListing, isFakeListing } from "@/lib/api";
import { Listing } from "@/lib/types";
import { isFavourite, toggleFavourite } from "@/lib/auth";
import { formatPrice } from "@/components/ListingCard";
import ListingCard from "@/components/ListingCard";
import {
  ArrowLeft,
  Heart,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Compass,
  Layers,
  Car,
  Phone,
  User,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const item = await fetchListingById(id);
        setListing(item);
        if (item) {
          setFav(isFavourite(item.listing_id));
          const sim = await fetchSimilarListings(item);
          setSimilar(sim);
        }
      } catch (err) {
        console.error("Error loading listing detail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-ivy-800 border-t-transparent mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Loading property details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Property Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">
          Listing with ID <code className="bg-slate-100 px-1 py-0.5 rounded">{id}</code> could not be located.
        </p>
        <Link
          href="/listings"
          className="px-4 py-2 bg-ivy-800 text-white rounded-lg text-xs font-bold hover:bg-ivy-900 transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const isCorrupt = isCorruptListing(listing);
  const isFake = isFakeListing(listing);
  const pricePerSqft = listing.carpet_area > 0 && listing.price > 0
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  const handleToggleFav = () => {
    const newState = toggleFavourite(listing.listing_id);
    setFav(newState);
  };

  return (
    <div className="space-y-8">
      {/* Back link & Top actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-ivy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        <button
          onClick={handleToggleFav}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            fav
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Heart className={`w-4 h-4 ${fav ? "fill-rose-600 text-rose-600" : ""}`} />
          {fav ? "Saved to Favourites" : "Save Property"}
        </button>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {listing.is_live ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Property
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 rounded-full">
              Inactive / Withdrawn
            </span>
          )}

          {listing.is_verified && (
            <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Operations Verified
            </span>
          )}

          {isCorrupt && (
            <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Data Anomaly Flagged
            </span>
          )}

          {isFake && (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Duplicate / Telemarketing Lead-Gen
            </span>
          )}
        </div>

        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {listing.bedroom} BHK Apartment in {listing.apartment_name}
            </h1>
            <p className="text-sm font-medium text-slate-500 capitalize flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {listing.locality}, Mumbai · Lat: {listing.latitude}, Lon: {listing.longitude}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {formatPrice(listing.price)}
            </span>
            {pricePerSqft && (
              <span className="text-xs font-semibold text-slate-500">
                ₹{pricePerSqft.toLocaleString()} per sqft carpet
              </span>
            )}
          </div>
        </div>

        {/* Highlight Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Carpet Area</span>
            <span className="text-lg font-black text-slate-800">{listing.carpet_area} sqft</span>
            <span className="text-[11px] text-slate-500 block">
              Super: {listing.super_built_up_area} sqft
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Floor Plan</span>
            <span className="text-lg font-black text-slate-800">
              Floor {listing.floor} of {listing.total_floors}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {listing.bathroom} Baths · {listing.balcony} Balcony
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Furnishing</span>
            <span className="text-lg font-black text-slate-800 capitalize truncate block">
              {listing.furnishing.replace("-", " ")}
            </span>
            <span className="text-[11px] text-slate-500 block capitalize">
              Facing: {listing.facing_direction || "N/A"}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Parking</span>
            <span className="text-lg font-black text-slate-800">
              {listing.covered_parking} Covered
            </span>
            <span className="text-[11px] text-slate-500 block">Dedicated spot</span>
          </div>
        </div>

        {/* Description & Seller Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Property Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {listing.description || "No description provided."}
            </p>

            {listing.project_id && (
              <div className="p-4 bg-ivy-50/70 border border-ivy-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-ivy-800 uppercase tracking-wider block">
                    Associated Project
                  </span>
                  <p className="text-xs text-ivy-950 font-semibold">
                    Part of developer project <code className="bg-white px-1 py-0.5 rounded">{listing.project_id}</code>
                  </p>
                </div>
                <Link
                  href={`/projects?id=${listing.project_id}`}
                  className="px-3 py-1.5 bg-ivy-800 text-white text-xs font-bold rounded-lg hover:bg-ivy-900 transition-colors"
                >
                  View Project
                </Link>
              </div>
            )}
          </div>

          {/* Seller / Broker Box */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Seller & Contact Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {listing.posted_by_name}
                </span>
                <span className="text-xs text-slate-500 capitalize">{listing.posted_by}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center gap-2">
              <Phone className="w-4 h-4 text-ivy-700" />
              <span className="font-mono font-bold text-slate-800">
                {listing.posted_by_contact}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>Source: {listing.website}</span>
              <a
                href={listing.listing_url}
                target="_blank"
                rel="noreferrer"
                className="text-ivy-700 font-semibold hover:underline flex items-center gap-1"
              >
                Original Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Comparable Properties in {listing.locality}
            </h2>
            <p className="text-xs text-slate-500">
              Same locality, matching {listing.bedroom} BHK, and within 15% of price band.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {similar.length} recommendations
          </span>
        </div>

        {similar.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">
            No comparable live listings found within 15% price band in this locality.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((sim) => (
              <ListingCard key={sim.listing_id} listing={sim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
