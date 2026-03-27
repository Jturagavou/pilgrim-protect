"use client";

// Individual school marker component for custom rendering on map
export default function SchoolMarker({ status, name, onClick }) {
  const colors = {
    active: "bg-green-500 ring-green-200",
    pending: "bg-orange-500 ring-orange-200",
    overdue: "bg-red-500 ring-red-200",
  };

  const colorClass = colors[status] || "bg-gray-400 ring-gray-200";

  return (
    <button
      onClick={onClick}
      className={`w-5 h-5 rounded-full ${colorClass} ring-4 border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform`}
      title={name}
      aria-label={`View ${name}`}
    />
  );
}
