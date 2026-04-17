/** Created with Cursor — AI-assisted. */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Package, Shield } from "lucide-react";
import { fetchSchoolById } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/formatters";
import { sponsorshipPhaseLabel } from "@/lib/mapLabels";
import MapView from "@/components/MapView";
import SprayTimeline from "@/components/SprayTimeline";
import PhotoGallery from "@/components/PhotoGallery";
import SchoolProfileHero from "@/components/school/SchoolProfileHero";
import SchoolMetaBar from "@/components/school/SchoolMetaBar";
import SchoolPhaseTimeline from "@/components/school/SchoolPhaseTimeline";
import SchoolStorySection from "@/components/school/SchoolStorySection";
import type { MapFeature, SchoolProfileSchool } from "@/lib/types";

const HELPED = new Set([
  "funded",
  "contracted",
  "checked-in",
  "data-gathered",
]);

export default function SchoolProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [school, setSchool] = useState<SchoolProfileSchool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchSchoolById(id)
      .then(setSchool)
      .catch(() => setSchool(null))
      .finally(() => setLoading(false));
  }, [id]);

  const mapFeature: MapFeature | null = useMemo(() => {
    if (!school) return null;
    const lng = school.location.coordinates[0];
    const lat = school.location.coordinates[1];
    const st = school.sponsorshipStatus || "needs-funding";
    const gapState = HELPED.has(st as string) ? "helped" : "struggling";
    return {
      type: "Feature",
      geometry: school.location,
      properties: {
        _id: String(school._id),
        name: school.name,
        district: school.district,
        subCounty: school.subCounty,
        studentCount: school.studentCount,
        totalRooms: school.totalRooms,
        status: school.status,
        sponsorshipStatus: school.sponsorshipStatus,
        gapState,
        netsCount: school.netsCount,
        hasMalariaClub: school.hasMalariaClub,
        lat,
        lng,
        lastSprayDate: school.lastSprayDate,
        totalSprayReports: school.sprayReports?.length ?? 0,
        thumbnailUrl: school.photos?.[0] ?? null,
      },
    };
  }, [school]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-ink">School not found</h1>
        <p className="text-muted-foreground mt-2">
          This school does not exist or was removed.
        </p>
      </div>
    );
  }

  const phase =
    (school.sponsorshipStatus as string) || "needs-funding";
  const phaseLabel = sponsorshipPhaseLabel(phase);
  const raisedUsd = (school.fundingProgress?.raised ?? 0) / 100;
  const goalUsd = (school.fundingProgress?.goal ?? 0) / 100;
  const showFunding = goalUsd > 0;
  const lng = school.location.coordinates[0];
  const lat = school.location.coordinates[1];

  const totalRoomsSprayed = (school.sprayReports || []).reduce(
    (sum, r) => sum + r.roomsSprayed,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchoolProfileHero
        name={school.name}
        district={school.district}
        subCounty={school.subCounty}
        heroImageUrl={school.photos?.[0] ?? null}
        schoolId={String(school._id)}
      />

      <SchoolMetaBar
        district={school.district}
        subCounty={school.subCounty}
        studentCount={school.studentCount}
        phaseLabel={phaseLabel}
      />

      <div className="flex flex-wrap gap-2 mt-6 mb-6">
        {school.hasMalariaClub ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-depth border border-border px-3 py-1 text-xs font-medium text-ink">
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
            Malaria club at this school
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            No malaria club yet
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-depth border border-border px-3 py-1 text-xs font-medium text-ink">
          <Package className="h-3.5 w-3.5 text-pilgrim-olive" aria-hidden />
          {school.netsCount != null ? `${school.netsCount} nets` : "Nets —"}
        </span>
        <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground tabular-nums">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>

      {showFunding ? (
        <div className="mb-10 rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Sponsorship progress</span>
            <span className="font-medium text-ink tabular-nums">
              ${Math.round(raisedUsd).toLocaleString()} / $
              {Math.round(goalUsd).toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{
                width: `${Math.min(100, goalUsd ? (raisedUsd / goalUsd) * 100 : 0)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <SchoolPhaseTimeline current={school.sponsorshipStatus} />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            At a glance
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Students", value: formatNumber(school.studentCount) },
              { label: "Rooms", value: String(school.totalRooms) },
              {
                label: "Rooms sprayed (reports)",
                value: String(totalRoomsSprayed),
              },
              {
                label: "Last spray",
                value: formatDate(school.lastSprayDate),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-paper-soft px-3 py-2.5"
              >
                <div className="text-lg font-display font-semibold text-ink tabular-nums">
                  {s.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          {school.sponsor ? (
            <p className="text-sm text-muted-foreground">
              Supported in part by{" "}
              <span className="text-ink font-medium">{school.sponsor.name}</span>
            </p>
          ) : null}
        </div>
      </div>

      <SchoolStorySection schoolName={school.name} district={school.district} />

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg text-ink mb-3">Location</h2>
            <div className="rounded-xl overflow-hidden border border-border h-[250px]">
              {mapFeature ? (
                <MapView
                  features={[mapFeature]}
                  initialCenter={school.location.coordinates}
                  initialZoom={12}
                  compact
                  interactive={false}
                />
              ) : null}
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink mb-3">Photos</h2>
            <PhotoGallery photos={school.photos || []} />
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Spray history</h2>
          <SprayTimeline reports={school.sprayReports || []} />
        </div>
      </div>
    </div>
  );
}
