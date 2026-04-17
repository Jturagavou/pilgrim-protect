"use client";

import { useEffect, useState } from "react";
import { fetchImpact, fetchTimeline, fetchSchools } from "@/lib/api";
import { formatNumber, formatMonth } from "@/lib/formatters";
import ImpactCounter from "@/components/ImpactCounter";
import type { ImpactStats, MockSchool, TimelinePoint } from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [schools, setSchools] = useState<MockSchool[]>([]);

  useEffect(() => {
    fetchImpact().then(setImpact).catch(console.error);
    fetchTimeline().then(setTimeline).catch(console.error);
    fetchSchools().then(setSchools).catch(console.error);
  }, []);

  // Chart data: spray activity over time
  const lineData = {
    labels: timeline.map((t) => formatMonth(t.month)),
    datasets: [
      {
        label: "Rooms Sprayed",
        data: timeline.map((t) => t.roomsSprayed),
        borderColor: "#0050bd",
        backgroundColor: "rgba(0, 80, 189, 0.12)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Reports Filed",
        data: timeline.map((t) => t.reportsCount),
        borderColor: "#fb6202",
        backgroundColor: "rgba(251, 98, 2, 0.12)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Chart data: rooms per district
  const districtMap: Record<string, number> = {};
  schools.forEach((s) => {
    if (!districtMap[s.district]) districtMap[s.district] = 0;
    districtMap[s.district] += s.totalRooms;
  });
  const districts = Object.keys(districtMap).sort();
  const barData = {
    labels: districts,
    datasets: [
      {
        label: "Total Rooms",
        data: districts.map((d) => districtMap[d]),
        backgroundColor: "#617d0e",
        borderRadius: 4,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-ink mb-2">Impact Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Real-time overview of Pilgrim Protect's spraying program across Uganda
      </p>

      {/* Impact stats */}
      {impact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <ImpactCounter end={impact.totalSchools} label="Schools" />
          <ImpactCounter end={impact.totalRoomsSprayed} label="Rooms Sprayed" />
          <ImpactCounter end={impact.totalStudentsProtected} label="Students Protected" />
          <ImpactCounter end={impact.totalSprayReports} label="Reports" />
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">
            Spray Activity Over Time
          </h2>
          {timeline.length > 0 ? (
            <Line data={lineData} options={lineOptions} />
          ) : (
            <p className="text-muted-foreground text-sm">Loading...</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">
            Rooms by District
          </h2>
          {districts.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p className="text-muted-foreground text-sm">Loading...</p>
          )}
        </div>
      </div>

      {/* Schools table */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink mb-4">All Schools</h2>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">School</th>
                <th className="text-left px-4 py-3 font-medium">District</th>
                <th className="text-right px-4 py-3 font-medium">Students</th>
                <th className="text-right px-4 py-3 font-medium">Rooms</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schools.map((s) => (
                <tr key={s._id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <a
                      href={`/schools/${s._id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {s.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.district}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatNumber(s.studentCount)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {s.totalRooms}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                        s.status === "active"
                          ? "bg-pilgrim-olive"
                          : s.status === "pending"
                          ? "bg-secondary"
                          : "bg-destructive"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
