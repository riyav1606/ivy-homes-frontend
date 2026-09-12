import Link from "next/link";
import { Home, KeyRound, Building2, BarChart3, ArrowRight, ShieldCheck, Database, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="py-8 sm:py-12">
      {/* Hero Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ivy-50 border border-ivy-200 rounded-full text-xs font-bold text-ivy-800 mb-4">
          <ShieldCheck className="w-4 h-4 text-ivy-700" />
          Technical Assignment — Candidate Portal (Mumbai)
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Property Intelligence & Verified Market Data
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Comprehensive Mumbai property portal built on top of the Ivy Homes real estate API.
          Featuring audited listings, client-side filter resilience, rental yields, and API anomaly detection.
        </p>
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Listings */}
        <Link
          href="/listings"
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-ivy-700 hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-ivy-50 text-ivy-800 flex items-center justify-center mb-4 group-hover:bg-ivy-800 group-hover:text-white transition-colors">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Buy Listings</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Browse 5,100 sale listings with fallback filtering on BHK, locality, furnishing, and price bands.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-ivy-800 group-hover:translate-x-1 transition-transform">
            Explore Properties <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 2: Rentals */}
        <Link
          href="/rentals"
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-ivy-700 hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Rentals</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              2,100 rental homes across Mumbai. Audited monthly rents, security deposits, and maintenance charges.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
            View Rentals <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 3: Projects */}
        <Link
          href="/projects"
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-ivy-700 hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Builder Projects</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              590 residential developments. Unit inventory, possession timelines, and real vs reported listing counters.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
            View Projects <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 4: Insights */}
        <Link
          href="/insights"
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-ivy-700 hover:shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Insights & Audit</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Visual analytics and live audit cataloging all 18 API discrepancies, corrupt records, and spam clusters.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
            Audit Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Assignment Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Part 2 & Part 3 Audit Complete: submission.json Generated
              </h4>
              <p className="text-xs text-slate-500">
                Exact answers calculated for Questions 1–10 and 18 documented discrepancies with evidence cataloged.
              </p>
            </div>
          </div>

          <Link
            href="/insights"
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            Review Answers & Discrepancies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
