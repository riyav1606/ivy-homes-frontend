import { Project } from "@/lib/types";
import { Building2, Calendar, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

interface Props {
  project: Project;
  actualListingCount?: number;
}

export default function ProjectCard({ project, actualListingCount }: Props) {
  // Format price: remember project prices in Mumbai are in Crores (or mixed Lakhs/Crores)
  const formatProjectPrice = (min: number, max: number) => {
    // If min is around 80-100 and max is around 2-10, min is in Lakhs and max is in Cr
    if (min > max && min > 20 && max < 20) {
      return `₹${min.toFixed(1)} L - ₹${max.toFixed(2)} Cr`;
    }
    if (max < 20) {
      return `₹${min.toFixed(2)} Cr - ₹${max.toFixed(2)} Cr`;
    }
    return `₹${min} L - ₹${max} L`;
  };

  const isCountWrong =
    actualListingCount !== undefined && actualListingCount !== project.total_listings;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-ivy-600 hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold text-ivy-800 uppercase tracking-wider block">
              {project.developer_name}
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
              {project.apartment_name}
            </h3>
            <p className="text-xs font-medium text-slate-500 capitalize">
              {project.locality}, Mumbai
            </p>
          </div>

          <span
            className={`px-2 py-0.5 text-xs font-bold rounded capitalize ${
              project.project_status.toLowerCase() === "ready to move"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {project.project_status}
          </span>
        </div>

        {/* Price & Area Band */}
        <div className="my-3.5 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Price Range</span>
            <span className="font-extrabold text-slate-900 text-base">
              {formatProjectPrice(project.price_min, project.price_max)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Unit Sizes</span>
            <span className="font-semibold">
              {project.min_area_sqft} - {project.max_area_sqft} sqft
            </span>
          </div>
        </div>

        {/* Structural Specs */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-100 mb-3">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Units</span>
            <span className="font-bold text-slate-800">{project.total_units}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Towers</span>
            <span className="font-bold text-slate-800">{project.total_towers}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Floors</span>
            <span className="font-bold text-slate-800">{project.total_floors}</span>
          </div>
        </div>

        {/* Amenities chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.amenities?.slice(0, 4).map((amenity, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded capitalize"
            >
              {amenity}
            </span>
          ))}
          {project.amenities?.length > 4 && (
            <span className="text-[11px] px-1.5 py-0.5 text-slate-400 font-semibold">
              +{project.amenities.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Details with Audit Counter */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Possession: {project.possession_date}
          </span>

          {/* Real vs Reported Listing Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Listings:</span>
            {isCountWrong ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-bold"
                title={`Reported total_listings: ${project.total_listings}, Actual listings in DB: ${actualListingCount}`}
              >
                <AlertCircle className="w-3 h-3 text-amber-600" />
                {actualListingCount} (reported {project.total_listings})
              </span>
            ) : (
              <span className="font-bold text-slate-800 text-xs">
                {project.total_listings} available
              </span>
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 truncate">
          RERA: {project.rera_number || "Awaited"}
        </div>
      </div>
    </div>
  );
}
