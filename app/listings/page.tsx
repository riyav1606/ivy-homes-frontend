"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchListings, ListingFilters } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import { ChevronLeft, ChevronRight, Home, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";

const ITEMS_PER_PAGE = 24;

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ListingFilters>({
    locality: "",
    bhk: "",
    furnishing: "",
    property_type: "",
    min_price: "",
    max_price: "",
    is_live_only: true,
    hide_corrupt: true,
    hide_fake: false,
    sort_by: "price",
    order: "asc",
    query: "",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchListings(filters);
        setListings(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  // Paginate filtered results
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return listings.slice(start, start + ITEMS_PER_PAGE);
  }, [listings, currentPage]);

  return (
    <div>
      {/* Page Title & Subtitle */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mumbai Sale Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audited property catalog with client-side filter resilience and anomaly inspection.
          </p>
        </div>

        {/* Quick Audit Summary Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Database: 5,100 records (4,017 active)</span>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalResults={listings.length}
      />

      {/* Listings Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-ivy-800 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Mumbai listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No matching properties found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Try adjusting or resetting your filter criteria (such as furnishing, price range, or active-only toggle).
          </p>
          <button
            onClick={() =>
              setFilters({
                locality: "",
                bhk: "",
                furnishing: "",
                property_type: "",
                min_price: "",
                max_price: "",
                is_live_only: true,
                hide_corrupt: true,
                hide_fake: false,
                sort_by: "price",
                order: "asc",
                query: "",
              })
            }
            className="px-4 py-2 bg-ivy-800 text-white rounded-lg text-xs font-bold hover:bg-ivy-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedListings.map((listing) => (
              <ListingCard key={listing.listing_id} listing={listing} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-800">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                    let pageNum = idx + 1;
                    if (currentPage > 3 && totalPages > 5) {
                      pageNum = currentPage - 2 + idx;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          currentPage === pageNum
                            ? "bg-ivy-800 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
