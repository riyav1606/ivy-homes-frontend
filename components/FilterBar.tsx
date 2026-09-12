"use client";

import { ListingFilters } from "@/lib/api";
import { Search, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

interface Props {
  filters: ListingFilters;
  onChange: (newFilters: ListingFilters) => void;
  totalResults: number;
}

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

const PROPERTY_TYPES = [
  "all",
  "apartment",
  "villa",
  "independent house",
  "plot",
  "builder floor",
];

const FURNISHINGS = [
  { label: "All", value: "" },
  { label: "Fully Furnished", value: "fully-furnished" },
  { label: "Semi Furnished", value: "semi-furnished" },
  { label: "Unfurnished", value: "unfurnished" },
];

export default function FilterBar({ filters, onChange, totalResults }: Props) {
  const update = (key: keyof ListingFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({
      locality: "",
      bhk: "",
      furnishing: "",
      property_type: "",
      min_price: "",
      max_price: "",
      is_live_only: true,
      hide_corrupt: true,
      hide_fake: true,
      sort_by: "price",
      order: "asc",
      query: "",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
      {/* Top row: search bar, sorting, and reset */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search apartment, locality, or agent..."
            value={filters.query || ""}
            onChange={(e) => update("query", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-ivy-700 focus:bg-white transition-all"
          />
        </div>

        {/* Status count and Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{totalResults}</span> properties
          </span>

          <div className="flex items-center gap-2">
            <select
              value={`${filters.sort_by || "price"}_${filters.order || "asc"}`}
              onChange={(e) => {
                const [sort_by, order] = e.target.value.split("_") as [any, any];
                onChange({ ...filters, sort_by, order });
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:border-ivy-700"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="carpet_area_desc">Area: Largest First</option>
              <option value="carpet_area_asc">Area: Smallest First</option>
              <option value="posted_at_desc">Date: Newest First</option>
            </select>

            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-ivy-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-facet filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
        {/* Locality */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Locality
          </label>
          <select
            value={filters.locality || "all"}
            onChange={(e) => update("locality", e.target.value === "all" ? "" : e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 capitalize font-medium text-slate-800 focus:outline-none focus:border-ivy-700"
          >
            {LOCALITIES.map((loc) => (
              <option key={loc} value={loc} className="capitalize">
                {loc === "all" ? "All Localities" : loc}
              </option>
            ))}
          </select>
        </div>

        {/* BHK */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Bedrooms
          </label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            {["", "1", "2", "3", "4+"].map((bhkVal) => {
              const active = bhkVal === "" ? !filters.bhk : String(filters.bhk) === (bhkVal === "4+" ? "4" : bhkVal);
              return (
                <button
                  key={bhkVal}
                  type="button"
                  onClick={() => update("bhk", bhkVal === "" ? "" : bhkVal === "4+" ? 4 : Number(bhkVal))}
                  className={`flex-1 py-1 text-xs font-semibold transition-colors ${
                    active ? "bg-ivy-800 text-white" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {bhkVal === "" ? "Any" : bhkVal}
                </button>
              );
            })}
          </div>
        </div>

        {/* Furnishing */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Furnishing
          </label>
          <select
            value={filters.furnishing || ""}
            onChange={(e) => update("furnishing", e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-ivy-700"
          >
            {FURNISHINGS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Property Type
          </label>
          <select
            value={filters.property_type || "all"}
            onChange={(e) => update("property_type", e.target.value === "all" ? "" : e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 capitalize font-medium text-slate-800 focus:outline-none focus:border-ivy-700"
          >
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt} className="capitalize">
                {pt === "all" ? "All Types" : pt}
              </option>
            ))}
          </select>
        </div>

        {/* Data Quality / Audit Toggles */}
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.is_live_only !== false}
                onChange={(e) => update("is_live_only", e.target.checked)}
                className="w-3.5 h-3.5 rounded text-ivy-700 focus:ring-ivy-600"
              />
              Active Only
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.hide_corrupt !== false}
                onChange={(e) => update("hide_corrupt", e.target.checked)}
                className="w-3.5 h-3.5 rounded text-ivy-700 focus:ring-ivy-600"
              />
              Filter Corrupt
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
