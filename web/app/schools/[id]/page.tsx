/** Created with Cursor — AI-assisted. */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Database,
  FileText,
  MapPin,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { fetchSchoolById } from "@/lib/api";
import { daysSince, formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
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

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseReportNotes(notes?: string) {
  if (!notes) return [];
  return notes
    .split(";")
    .map((part) => part.trim())
    .map((part) => {
      const [key, ...valueParts] = part.split("=");
      if (!key || valueParts.length === 0) return null;
      return {
        key: humanizeKey(key.trim()),
        value: valueParts.join("=").trim(),
      };
    })
    .filter((entry): entry is { key: string; value: string } => Boolean(entry));
}

function splitSourceFiles(sourceFile?: string) {
  return (sourceFile || "")
    .split(",")
    .map((file) => file.trim())
    .filter(Boolean);
}

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
  const dataQuality = school.dataQuality;

  const totalRoomsSprayed = (school.sprayReports || []).reduce(
    (sum, r) => sum + r.roomsSprayed,
    0
  );
  const latestReport = [...(school.sprayReports || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  const latestReportDetails = parseReportNotes(latestReport?.notes);
  const sourceFiles = splitSourceFiles(school.sourceFile);
  const daysSinceSpray = daysSince(school.lastSprayDate);
  const supportUrgency =
    !school.lastSprayDate || daysSinceSpray > 365
      ? "High urgency"
      : daysSinceSpray > 180
        ? "Needs follow-up soon"
        : "Recently documented";
  const latestRoomsSprayed = latestReport?.roomsSprayed ?? 0;
  const latestRoomCoverage = school.totalRooms
    ? Math.min(100, (latestRoomsSprayed / school.totalRooms) * 100)
    : 0;
  const verifiedReports = (school.sprayReports || []).filter((report) => report.verified).length;

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

      {dataQuality ? (
        <div
          className={`mt-6 mb-6 rounded-2xl border px-4 py-4 text-sm ${
            dataQuality.completeness === "ready"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <p className="font-medium">
            {dataQuality.completeness === "ready"
              ? "This school profile is ready for public storytelling and donor visibility."
              : "This school profile is still being completed from imported field data."}
          </p>
          <p className="mt-1 leading-relaxed">
            {dataQuality.summary}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mt-6 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-depth border border-border px-3 py-1 text-xs font-medium text-ink">
          <CheckCircle2 className="h-3.5 w-3.5 text-pilgrim-olive" aria-hidden />
          {phaseLabel}
        </span>
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
        {school.source ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <Database className="h-3.5 w-3.5" aria-hidden />
            {school.source}
          </span>
        ) : null}
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

      <div className="mb-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.8rem] border border-border bg-card p-6 shadow-sm">
          <p className="font-condensed text-xs uppercase tracking-[0.18em] text-pilgrim-orange">
            Why support this school
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink">
            A visible protection story, grounded in real school data
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Support here helps connect field operations, follow-up reporting, and
            school-level visibility. Even before every profile field is complete,
            this page already shows the operational arc donors care about: who needs
            help, what has been documented, and what progress still depends on support.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-paper-soft px-4 py-3">
              <div className="text-lg font-display font-semibold text-ink">
                {supportUrgency}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Support signal
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-paper-soft px-4 py-3">
              <div className="text-lg font-display font-semibold text-ink">
                {formatPercent(latestRoomCoverage)}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Latest documented room coverage
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-paper-soft px-4 py-3">
              <div className="text-lg font-display font-semibold text-ink">
                {formatNumber(school.studentCount)}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Students in this school record
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-[1.8rem] border border-border bg-[#4f4c49] p-6 text-white shadow-[0_20px_45px_rgba(45,45,45,0.14)]">
          <p className="font-condensed text-xs uppercase tracking-[0.18em] text-pilgrim-gold">
            Next step
          </p>
          <h2 className="mt-3 font-display text-3xl leading-[0.95]">
            Help this school move further into the protection cycle.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/78">
            Pilgrim still routes giving through its established donation channels,
            but this page gives the context needed to make support feel concrete.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-pilgrim-gold" aria-hidden />
              <span>
                {school.lastSprayDate
                  ? `Last documented spray was ${daysSinceSpray} days ago.`
                  : "No spray date has been logged publicly yet."}
              </span>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-pilgrim-gold" aria-hidden />
              <span>
                {showFunding
                  ? `${formatCurrency(Math.round(goalUsd))} is the current visible goal for this school profile.`
                  : "Operational support helps fund follow-up, logistics, and reporting visibility."}
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/donate?school=${school._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-pilgrim-orange px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(255,109,35,0.26)] transition-colors hover:bg-pilgrim-orange-deep"
            >
              Support this school
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/88 transition-colors hover:bg-white/8"
            >
              Compare giving options
            </Link>
          </div>
        </aside>
      </div>

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
          {!school.sponsor ? (
            <Link
              href={`/donate?school=${school._id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Support this school
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mb-12 rounded-[1.8rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-condensed text-xs uppercase tracking-[0.18em] text-pilgrim-orange">
              School dossier
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Everything currently known from the live school record
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            These fields come from the API and imported Pilgrim data, so the page
            can keep improving as new survey and spray records are added.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "District",
              value: school.district,
              detail: school.subCounty ? `${school.subCounty} sub-county` : "Sub-county not listed",
              Icon: MapPin,
            },
            {
              label: "Enrollment",
              value: formatNumber(school.studentCount),
              detail: "Students recorded",
              Icon: Users,
            },
            {
              label: "School rooms",
              value: formatNumber(school.totalRooms),
              detail: `${formatNumber(latestRoomsSprayed)} rooms in latest report`,
              Icon: Building2,
            },
            {
              label: "Spray evidence",
              value: formatNumber(school.sprayReports?.length ?? 0),
              detail: `${formatNumber(verifiedReports)} verified reports`,
              Icon: ClipboardCheck,
            },
            {
              label: "Last spray",
              value: formatDate(school.lastSprayDate),
              detail:
                daysSinceSpray === Infinity
                  ? "No public spray date"
                  : `${formatNumber(daysSinceSpray)} days ago`,
              Icon: CalendarDays,
            },
            {
              label: "Nets",
              value: school.netsCount != null ? formatNumber(school.netsCount) : "N/A",
              detail: "Recorded mosquito nets",
              Icon: Package,
            },
            {
              label: "Malaria club",
              value: school.hasMalariaClub ? "Yes" : "Not yet",
              detail: "School prevention activity",
              Icon: Shield,
            },
            {
              label: "Data source",
              value: school.source || "unknown",
              detail: dataQuality?.completeness
                ? humanizeKey(dataQuality.completeness)
                : "Quality not scored",
              Icon: Database,
            },
          ].map(({ label, value, detail, Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-paper-soft p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </p>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <p className="mt-3 font-display text-2xl leading-none text-ink">
                {value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" aria-hidden />
              <h3 className="font-display text-lg text-ink">Imported record trail</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {dataQuality?.summary || "No data quality summary is available yet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sourceFiles.length ? (
                sourceFiles.map((file) => (
                  <span
                    key={file}
                    className="rounded-full border border-border bg-paper-soft px-3 py-1 text-xs text-muted-foreground"
                  >
                    {file}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Source file details have not been attached yet.
                </span>
              )}
            </div>
            {school.importedAt ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Imported {formatDate(school.importedAt)}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" aria-hidden />
              <h3 className="font-display text-lg text-ink">Latest spray report details</h3>
            </div>
            {latestReport ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Date
                    </p>
                    <p className="mt-1 font-medium text-ink">
                      {formatDate(latestReport.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Rooms sprayed
                    </p>
                    <p className="mt-1 font-medium text-ink">
                      {formatNumber(latestReport.roomsSprayed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Verification
                    </p>
                    <p className="mt-1 font-medium text-ink">
                      {latestReport.verified ? "Verified" : "Awaiting verification"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Recorded by
                    </p>
                    <p className="mt-1 font-medium text-ink">
                      {latestReport.worker?.name || "Field team"}
                    </p>
                  </div>
                </div>
                {latestReportDetails.length ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {latestReportDetails.slice(0, 8).map((item) => (
                      <div
                        key={`${item.key}-${item.value}`}
                        className="rounded-xl bg-paper-soft px-3 py-2"
                      >
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {item.key}
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-ink">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No spray report has been attached to this school yet.
              </p>
            )}
          </div>
        </div>
      </section>

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
