"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchRentals } from "@/lib/api";
import { Rental } from "@/lib/types";
import RentalCard from "@/components/RentalCard";
import { KeyRound, ShieldCheck, ChevronLeft, ChevronRight, Search } from "lucide-react";

const ITEMS_PER_PAGE = 24;

const LOCALITIES = [
  "all",
  "borivali west",
  "andheri west",
  "bandra east",
  "chembur",
  "goregaon east",
  "kandivali east",
  "malad west",
  "mulund west",
  "powai",
  "thane west",
];

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState("");
  const [selectedBhk, setSelectedBhk] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchRentals(selectedLocality, selectedBhk);
        setRentals(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading rentals:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLocality, selectedBhk]);

  const filteredRentals = useMemo(() => {
    if (!searchQuery.trim()) return rentals;
    const q = searchQuery.toLowerCase();
    return rentals.filter(
      (r) =>
        r.apartment_name?.toLowerCase().includes(q) ||
        r.locality?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [rentals, searchQuery]);

  // Total rent in borivali west
  const borivaliRentals = useMemo(() => {
    return rentals.filter((r) => r.locality.toLowerCase() === "borivali west");
  }, [rentals]);
  const totalBorivaliRent = useMemo(() => {
    return borivaliRentals.reduce((sum, r) => sum + (r.price || 0), 0);
  }, [borivaliRentals]);

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRentals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRentals, currentPage]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-8 h-8 text-blue-700" />
            Mumbai Rental Homes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            2,100 verified rental listings with audited monthly rents, security deposits, and maintenance charges.
          </p>
        </div>

        {/* Assigned locality highlight pill */}
        <div className="bg-blue-50/80 border border-blue-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2 text-blue-950 self-start md:self-auto shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <div>
            <span className="font-bold">Assigned Locality (Borivali West):</span>{" "}
            <span>₹{totalBorivaliRent.toLocaleString()} monthly ({borivaliRentals.length} flats)</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rentals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Locality dropdown */}
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value === "all" ? "" : e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-600 capitalize"
          >
            {LOCALITIES.map((loc) => (
              <option key={loc} value={loc === "all" ? "" : loc} className="capitalize">
                {loc === "all" ? "All Localities" : loc}
              </option>
            ))}
          </select>

          {/* BHK selector */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            {["", "1", "2", "3", "4"].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBhk(b)}
                className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selectedBhk === b
                    ? "bg-blue-700 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b === "" ? "Any BHK" : `${b} BHK`}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredRentals.length}</span> rentals
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-700 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading rentals...</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
          <KeyRound className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No rentals found</h3>
          <p className="text-xs text-slate-500 mb-4">Try clearing your filters to see more results.</p>
          <button
            onClick={() => {
              setSelectedLocality("");
              setSelectedBhk("");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginated.map((rental) => (
              <RentalCard key={rental.listing_id} rental={rental} />
            ))}
          </div>

          {/* Pagination */}
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
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
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
