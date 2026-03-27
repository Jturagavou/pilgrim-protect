import Link from "next/link";
import { formatDate, statusColor, statusLabel } from "@/lib/formatters";

export default function SchoolCard({ school }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Thumbnail placeholder */}
      <div className="h-36 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
        <svg className="w-12 h-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
        </svg>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {school.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{school.district} District</p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${statusColor(school.status)}`}
          >
            {statusLabel(school.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
          <div>
            <span className="font-semibold text-gray-900">{school.studentCount}</span> students
          </div>
          <div>
            <span className="font-semibold text-gray-900">{school.totalRooms}</span> rooms
          </div>
        </div>

        {school.lastSprayDate && (
          <p className="text-[11px] text-gray-400 mt-2">
            Last sprayed: {formatDate(school.lastSprayDate)}
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <Link
            href={`/schools/${school._id}`}
            className="flex-1 text-center text-xs font-medium bg-emerald-600 text-white rounded-lg px-3 py-1.5 hover:bg-emerald-700 transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/donate?school=${school._id}`}
            className="flex-1 text-center text-xs font-medium border border-emerald-600 text-emerald-600 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors"
          >
            Sponsor
          </Link>
        </div>
      </div>
    </div>
  );
}
