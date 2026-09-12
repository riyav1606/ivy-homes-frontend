"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchProjects } from "@/lib/api";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import cachedListings from "@/data/listings.json";
import { Building2, Search, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Compute real listings count per project_id from listings dataset
  const actualCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of cachedListings as any[]) {
      if (l.project_id) {
        map[l.project_id] = (map[l.project_id] || 0) + 1;
      }
    }
    return map;
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProjects(selectedLocality);
        setProjects(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLocality]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.apartment_name?.toLowerCase().includes(q) ||
        p.developer_name?.toLowerCase().includes(q) ||
        p.locality?.toLowerCase().includes(q) ||
        p.project_id?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-purple-700" />
            Mumbai Builder Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            590 residential developments. Unit inventory, possession timelines, and real vs reported listing counters.
          </p>
        </div>

        {/* Costliest project badge */}
        <div className="bg-purple-50/80 border border-purple-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2 text-purple-950 self-start md:self-auto shadow-sm">
          <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
          <div>
            <span className="font-bold">Costliest Project:</span>{" "}
            <span>Assetz Serenity (P50016) · ₹12.44 Cr max</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search developer, project, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Locality */}
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value === "all" ? "" : e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-purple-600 capitalize"
          >
            {LOCALITIES.map((loc) => (
              <option key={loc} value={loc === "all" ? "" : loc} className="capitalize">
                {loc === "all" ? "All Localities" : loc}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredProjects.length}</span> projects
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-700 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading builder projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No projects found</h3>
          <p className="text-xs text-slate-500 mb-4">Try adjusting your locality filter or search query.</p>
          <button
            onClick={() => {
              setSelectedLocality("");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginated.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                actualListingCount={actualCounts[project.project_id] || 0}
              />
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
