import { Rental } from "@/lib/types";
import { formatPrice } from "./ListingCard";
import { Compass, ShieldCheck, Calendar } from "lucide-react";

interface Props {
  rental: Rental;
}

export default function RentalCard({ rental }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-ivy-600 hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                ₹{rental.price.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deposit: ₹{rental.deposit.toLocaleString()}
              {rental.maintenance ? ` · Maint: ₹${rental.maintenance}/mo` : ""}
            </p>
          </div>

          <span className="px-2 py-0.5 text-xs font-bold bg-ivy-50 text-ivy-800 border border-ivy-200 rounded capitalize">
            {rental.furnishing.replace("-", " ")}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mt-3">
          {rental.bedroom} BHK in {rental.apartment_name}
        </h3>
        <p className="text-xs font-medium text-slate-500 capitalize mb-4">
          {rental.locality}, Mumbai
        </p>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-lg text-xs text-slate-700 mb-3">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Area</span>
            <span className="font-bold">{rental.carpet_area} sqft</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Floor</span>
            <span className="font-bold">
              {rental.floor}/{rental.total_floors}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Baths</span>
            <span className="font-bold">{rental.bathroom}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 italic mb-3">
          "{rental.description}"
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-ivy-700" />
          {rental.posted_by_name} ({rental.posted_by})
        </span>
        <span className="text-slate-400">{rental.posted_by_contact}</span>
      </div>
    </div>
  );
}
