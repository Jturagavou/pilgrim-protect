"use client";

import { useEffect, useState } from "react";
import { fetchMapData } from "@/lib/api";
import MapView from "@/components/MapView";
import SchoolCard from "@/components/SchoolCard";
import type { MapFeature } from "@/lib/types";

export default function MapPage() {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchMapData()
      .then((data) => setFeatures(data.features || []))
      .catch(console.error);
  }, []);

  const filtered = features.filter((f) => {
    const p = f.properties;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r bg-white flex flex-col shrink-0 z-10`}
      >
        <div className="p-4 border-b space-y-3">
          <h2 className="font-bold text-lg text-gray-900">Schools</h2>
          <input
            type="text"
            placeholder="Search schools or districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-1">
            {["all", "active", "pending", "overdue"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">{filtered.length} schools</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filtered.map((f) => (
            <SchoolCard
              key={f.properties._id}
              school={{
                ...f.properties,
                lastSprayDate: f.properties.lastSprayDate,
              }}
            />
          ))}
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-20 bg-white shadow-md rounded-lg p-2 md:hidden"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Map */}
      <div className="flex-1">
        <MapView features={filtered} className="w-full h-full" />
      </div>
    </div>
  );
}
