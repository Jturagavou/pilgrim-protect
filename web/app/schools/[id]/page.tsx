"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchSchoolById } from "@/lib/api";
import { formatDate, statusColor, statusLabel, formatNumber } from "@/lib/formatters";
import MapView from "@/components/MapView";
import SprayTimeline from "@/components/SprayTimeline";
import PhotoGallery from "@/components/PhotoGallery";
import DonateButton from "@/components/DonateButton";
import type { MapFeature, MockSchool } from "@/lib/types";

export default function SchoolProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [school, setSchool] = useState<MockSchool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchSchoolById(id)
      .then(setSchool)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">School Not Found</h1>
        <p className="text-gray-500 mt-2">The school you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const feature: MapFeature = {
    type: "Feature",
    geometry: school.location,
    properties: {
      _id: school._id,
      name: school.name,
      district: school.district,
      studentCount: school.studentCount,
      totalRooms: school.totalRooms,
      status: school.status,
      lastSprayDate: school.lastSprayDate,
      totalSprayReports: school.sprayReports.length,
      thumbnailUrl: school.photos[0] || null,
    },
  };

  const totalRoomsSprayed = (school.sprayReports || []).reduce(
    (sum, r) => sum + r.roomsSprayed,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
          <p className="text-gray-500 mt-1">{school.district} District, Uganda</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusColor(school.status)}`}
            >
              {statusLabel(school.status)}
            </span>
            {school.sponsor && (
              <span className="text-xs text-gray-400">
                Sponsored by {school.sponsor.name}
              </span>
            )}
          </div>
        </div>
        <DonateButton schoolId={school._id} size="lg" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Students", value: formatNumber(school.studentCount) },
          { label: "Total Rooms", value: school.totalRooms },
          { label: "Rooms Sprayed", value: totalRoomsSprayed },
          { label: "Last Sprayed", value: formatDate(school.lastSprayDate) },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column: map + photos */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <div className="rounded-xl overflow-hidden border h-[250px]">
              <MapView
                features={[feature]}
                initialCenter={school.location.coordinates}
                initialZoom={12}
                compact
                interactive={false}
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
            <PhotoGallery photos={school.photos || []} />
          </div>
        </div>

        {/* Right column: spray timeline */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Spray History
          </h2>
          <SprayTimeline reports={school.sprayReports || []} />
        </div>
      </div>
    </div>
  );
}
