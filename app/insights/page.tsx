"use client";

import { useState, useMemo } from "react";
import cachedListings from "@/data/listings.json";
import cachedRentals from "@/data/rentals.json";
import cachedProjects from "@/data/projects.json";
import submissionData from "@/submission.json";
import { formatPrice } from "@/components/ListingCard";
import {
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  Database,
  CheckCircle2,
  Building2,
  TrendingUp,
  FileCode2,
  Layers,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);

  // 1. Core Market Analytics (what /v1/analytics/summary promised)
  const analytics = useMemo(() => {
    const liveListings = (cachedListings as any[]).filter(
      (l) => l.is_live && l.price > 0 && l.carpet_area > 0
    );

    // Median price
    const sortedPrices = [...liveListings.map((l) => l.price)].sort((a, b) => a - b);
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;

    // Median price per sqft
    const sortedSqft = liveListings.map((l) => l.price / l.carpet_area).sort((a, b) => a - b);
    const medianPricePerSqft = Math.round(sortedSqft[Math.floor(sortedSqft.length / 2)] || 0);

    // Locality breakdown
    const locMap: Record<string, { count: number; prices: number[] }> = {};
    for (const l of liveListings) {
      const loc = l.locality;
      if (!locMap[loc]) locMap[loc] = { count: 0, prices: [] };
      locMap[loc].count += 1;
      locMap[loc].prices.push(l.price);
    }
    const byLocality = Object.entries(locMap)
      .map(([locality, data]) => {
        const sorted = [...data.prices].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)] || 0;
        return { locality, count: data.count, median_price: median };
      })
      .sort((a, b) => b.count - a.count);

    // BHK breakdown
    const bhkMap: Record<number, number> = {};
    for (const l of liveListings) {
      bhkMap[l.bedroom] = (bhkMap[l.bedroom] || 0) + 1;
    }
    const byBhk = Object.entries(bhkMap)
      .map(([bhk, count]) => ({ bhk: Number(bhk), count }))
      .sort((a, b) => a.bhk - b.bhk);

    return {
      totalListings: cachedListings.length,
      activeListings: liveListings.length,
      medianPrice,
      medianPricePerSqft,
      byLocality,
      byBhk,
    };
  }, []);

  // Filter findings by category
  const categories = useMemo(() => {
    const cats = new Set(submissionData.findings.map((f: any) => f.category));
    return ["all", ...Array.from(cats)];
  }, []);

  const filteredFindings = useMemo(() => {
    if (selectedCategory === "all") return submissionData.findings;
    return submissionData.findings.filter((f: any) => f.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 mb-3">
          <Database className="w-3.5 h-3.5 text-amber-700" />
          Part 1.6 & Part 3 Live Audit Dashboard
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Mumbai Market Analytics & API Auditing
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
          Comprehensive market intelligence combined with full verification checks against documented API rules.
          Displays real computed aggregates (replacing missing <code className="bg-slate-100 px-1 py-0.5 rounded">/v1/analytics/summary</code>) and catalogues all 18 discovered API discrepancies.
        </p>
      </div>

      {/* 1. Core Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Median Sale Price
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {formatPrice(analytics.medianPrice)}
          </span>
          <span className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Across 4,017 active homes
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Median Price / Sqft
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            ₹{analytics.medianPricePerSqft.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-ivy-700" />
            Carpet area normalized
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active vs Inactive
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {analytics.activeListings}
            </span>
            <span className="text-sm text-slate-400 font-bold">/ {analytics.totalListings}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            1,083 inactive/withdrawn listings served
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Borivali West Rent
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-700 mt-1 block">
            ₹{submissionData.answers.total_monthly_rent.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            Assigned Locality (215 rentals)
          </span>
        </div>
      </div>

      {/* 2. Visual Anomaly Audit Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          API Data Anomaly & Fraud Detection Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Corrupt listings */}
          <div className="p-5 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Corrupt Records
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 bg-rose-200 text-rose-900 rounded-full">
                  44 IDs
                </span>
              </div>
              <span className="text-3xl font-black text-rose-950 block mb-2">44</span>
              <p className="text-xs text-rose-800/80 leading-relaxed mb-4">
                Physically impossible listings in the database:
              </p>
              <ul className="text-xs space-y-1.5 text-rose-900 font-medium">
                <li>• 11 listings: Carpet area &gt; Super built-up</li>
                <li>• 11 listings: Floor &gt; Total floors</li>
                <li>• 11 listings: Negative listing price</li>
                <li>• 11 listings: Coordinates swapped into Arabian Sea</li>
              </ul>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-4 block">
              100% isolated and excluded from Q6 2BHK averages.
            </span>
          </div>

          {/* Card B: Fraud phone numbers */}
          <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Lead-Gen / Fake Listings
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                  313 IDs
                </span>
              </div>
              <span className="text-3xl font-black text-amber-950 block mb-2">313</span>
              <p className="text-xs text-amber-800/80 leading-relaxed mb-4">
                Spam enquiry-bait generated by telemarketing phone rings:
              </p>
              <ul className="text-xs space-y-1.5 text-amber-900 font-medium">
                <li>• 10 phone numbers each posting 19 to 38 listings</li>
                <li>• Top cluster: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">+912007133812</code> (38 ads)</li>
                <li>• Duplicate properties posted across distinct cities/areas</li>
              </ul>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-4 block">
              Disjoint from corrupt IDs; cleanly separated at threshold &gt; 15.
            </span>
          </div>

          {/* Card C: Project count mismatch */}
          <div className="p-5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Mismatched Project Counters
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full">
                  446 of 590
                </span>
              </div>
              <span className="text-3xl font-black text-purple-950 block mb-2">446</span>
              <p className="text-xs text-purple-800/80 leading-relaxed mb-4">
                Projects whose reported <code className="bg-white/80 px-1 py-0.5 rounded">total_listings</code> contradicts actual retrievable records referencing that project ID:
              </p>
              <ul className="text-xs space-y-1.5 text-purple-900 font-medium">
                <li>• 75.6% of projects report inaccurate counts</li>
                <li>• <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">P50001</code> reports 18, actual listings = 6</li>
                <li>• Query parameter <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">?project_id=...</code> quietly ignored</li>
              </ul>
            </div>
            <span className="text-[11px] text-purple-700 font-bold mt-4 block">
              Frontend dynamically counts actual listings per project.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Market Distribution Tables (Locality & BHK) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Localities Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
            <span>Mumbai Locality Distribution</span>
            <span className="text-xs text-slate-400 font-normal">Active sale homes</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 font-bold">Locality</th>
                  <th className="py-2.5 font-bold text-right">Active Listings</th>
                  <th className="py-2.5 font-bold text-right">Median Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {analytics.byLocality.map((item) => (
                  <tr key={item.locality} className="hover:bg-slate-50/50">
                    <td className="py-2.5 capitalize font-semibold text-slate-900">
                      {item.locality}
                      {item.locality === "borivali west" && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-ivy-100 text-ivy-800 rounded">
                          Assigned
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono">{item.count}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatPrice(item.median_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BHK Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
              <span>BHK Inventory Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">Active inventory</span>
            </h3>
            <div className="space-y-4">
              {analytics.byBhk.map((item) => {
                const pct = ((item.count / analytics.activeListings) * 100).toFixed(1);
                return (
                  <div key={item.bhk}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">{item.bhk} BHK Homes</span>
                      <span className="text-slate-500 font-semibold">
                        {item.count} listings ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-ivy-700 to-ivy-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl mt-6 text-xs text-slate-600 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">
              Q6 Calculation Anchor (Live 2BHKs)
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Excluding the 44 corrupt records and 313 fake records yields 1,215 live 2BHK listings with a mean price of <strong>₹62,965.53 / sqft</strong> carpet area.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Complete Findings Catalog (Part 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-ivy-800" />
              API Discrepancy Findings Catalog (18 Documented Lies)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified differences between documentation claims and actual API behavior for API Key IVY26-99BAF92DE5A1.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          {filteredFindings.map((finding: any, idx: number) => {
            const isExpanded = expandedFinding === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
              >
                <div
                  onClick={() => setExpandedFinding(isExpanded ? null : idx)}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded text-slate-800">
                      {finding.endpoint}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-ivy-100 text-ivy-900 rounded">
                      {finding.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {finding.documented}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {finding.evidence.length > 0 && (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        {finding.evidence.length} evidence
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 bg-white border-t border-slate-100 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Documented Claim
                        </span>
                        <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {finding.documented}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">
                          Actual Service Behavior
                        </span>
                        <p className="text-rose-950 bg-rose-50/50 p-3 rounded-lg border border-rose-200 font-medium">
                          {finding.actual}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Discovery Methodology
                        </span>
                        <p className="text-slate-600">{finding.how_found}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Application Impact & Mitigation
                        </span>
                        <p className="text-slate-600">{finding.impact}</p>
                      </div>
                    </div>

                    {finding.evidence.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Evidence Identifiers ({finding.evidence.length} samples):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {finding.evidence.map((ev: string, evIdx: number) => (
                            <span
                              key={evIdx}
                              className="px-2 py-0.5 bg-slate-100 border border-slate-200 font-mono text-[11px] rounded text-slate-800"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
