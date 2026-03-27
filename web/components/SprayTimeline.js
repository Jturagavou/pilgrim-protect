"use client";

import { formatDate } from "@/lib/formatters";

export default function SprayTimeline({ reports = [] }) {
  if (!reports.length) {
    return (
      <p className="text-sm text-gray-400 italic">No spray reports yet.</p>
    );
  }

  // Sort most recent first
  const sorted = [...reports].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-200" />

      <div className="space-y-6">
        {sorted.map((report, i) => (
          <div key={report._id || i} className="relative pl-10">
            {/* Dot */}
            <div
              className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-white shadow ${
                report.verified ? "bg-emerald-500" : "bg-orange-400"
              }`}
            />

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-emerald-700">
                  {formatDate(report.date)}
                </span>
                {report.verified && (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">{report.roomsSprayed} rooms</span> sprayed
              </p>

              {report.notes && (
                <p className="text-xs text-gray-500 mt-1">{report.notes}</p>
              )}

              {report.worker?.name && (
                <p className="text-xs text-gray-400 mt-2">
                  Worker: {report.worker.name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
