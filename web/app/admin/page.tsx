/** Created with Cursor — AI-assisted. */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  bulkCreateSchools,
  createSchool,
  deleteSchool,
  fetchSchoolById,
  fetchSchools,
  fetchSprayReports,
  isMockMode,
  updateSchool,
  uploadSchoolImage,
  verifySprayReport,
} from "@/lib/api";
import { getUser, isLoggedIn } from "@/lib/auth";
import { parseSchoolCsv } from "@/lib/schoolCsv";
import { sponsorshipPhaseLabel } from "@/lib/mapLabels";
import type {
  AdminSprayReport,
  SchoolDataQuality,
  SchoolProfileSchool,
  SponsorshipStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PHASES: SponsorshipStatus[] = [
  "needs-funding",
  "funded",
  "contracted",
  "checked-in",
  "data-gathered",
];

type FormState = {
  name: string;
  district: string;
  subCounty: string;
  lat: string;
  lng: string;
  studentCount: string;
  totalRooms: string;
  netsCount: string;
  hasMalariaClub: boolean;
  sponsorshipStatus: SponsorshipStatus;
  raisedUsd: string;
  goalUsd: string;
  photosText: string;
  notes: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    district: "",
    subCounty: "",
    lat: "",
    lng: "",
    studentCount: "0",
    totalRooms: "0",
    netsCount: "0",
    hasMalariaClub: false,
    sponsorshipStatus: "needs-funding",
    raisedUsd: "0",
    goalUsd: "0",
    photosText: "",
    notes: "",
  };
}

function schoolToForm(s: SchoolProfileSchool): FormState {
  const raised = s.fundingProgress?.raised ?? 0;
  const goal = s.fundingProgress?.goal ?? 0;
  const lng = s.location?.coordinates?.[0] ?? s.lng ?? 0;
  const lat = s.location?.coordinates?.[1] ?? s.lat ?? 0;
  return {
    name: s.name,
    district: s.district,
    subCounty: s.subCounty ?? "",
    lat: String(lat),
    lng: String(lng),
    studentCount: String(s.studentCount),
    totalRooms: String(s.totalRooms),
    netsCount: String(s.netsCount ?? 0),
    hasMalariaClub: Boolean(s.hasMalariaClub),
    sponsorshipStatus: (s.sponsorshipStatus as SponsorshipStatus) || "needs-funding",
    raisedUsd: String(Math.round(raised / 100)),
    goalUsd: String(Math.round(goal / 100)),
    photosText: (s.photos || []).join("\n"),
    notes: s.notes ?? "",
  };
}

function getDataQuality(s: SchoolProfileSchool): SchoolDataQuality {
  return (
    s.dataQuality ?? {
      source: /Uganda_Schools_Master_Database\.csv/i.test(s.notes ?? "")
        ? "master-csv"
        : "unknown",
      imported: /Uganda_Schools_Master_Database\.csv/i.test(s.notes ?? ""),
      completeness:
        /Uganda_Schools_Master_Database\.csv/i.test(s.notes ?? "") &&
        (!s.studentCount ||
          !s.totalRooms ||
          !s.district ||
          s.district === "Unspecified District")
          ? "needs-enrichment"
          : "manual-review",
      missingFields: [],
      summary: "Data quality unavailable for this record.",
    }
  );
}

function isImportedSchool(s: SchoolProfileSchool): boolean {
  return getDataQuality(s).imported;
}

function schoolNeedsEnrichment(s: SchoolProfileSchool): boolean {
  return getDataQuality(s).completeness === "needs-enrichment";
}

function schoolReady(s: SchoolProfileSchool): boolean {
  return getDataQuality(s).completeness === "ready";
}

type ViewFilter = "all" | "imported" | "needs-enrichment";

function qualityLabel(completeness?: SchoolDataQuality["completeness"]): string {
  if (completeness === "ready") return "Ready";
  if (completeness === "needs-enrichment") return "Needs enrichment";
  return "Manual review";
}

function qualityBadgeClass(completeness?: SchoolDataQuality["completeness"]): string {
  if (completeness === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (completeness === "needs-enrichment") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-border bg-background text-foreground";
}

function verificationBadgeClass(verified: boolean): string {
  return verified
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
}

function sourceBadgeClass(source?: string): string {
  if (source === "master-csv") {
    return "border-sky-200 bg-sky-50 text-sky-900";
  }
  return "border-border bg-background text-foreground";
}

export default function AdminSchoolsPage() {
  const router = useRouter();
  const mock = isMockMode();
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<SchoolProfileSchool[]>([]);
  const [reports, setReports] = useState<AdminSprayReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewFilter>("all");
  const [tab, setTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchSchools();
      setRows(list as unknown as SchoolProfileSchool[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load schools");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    if (mock) {
      setReports([]);
      setReportsLoading(false);
      return;
    }
    setReportsLoading(true);
    setReportError("");
    try {
      const list = await fetchSprayReports();
      setReports(list);
    } catch (e) {
      setReportError(
        e instanceof Error ? e.message : "Failed to load spray reports"
      );
    } finally {
      setReportsLoading(false);
    }
  }, [mock]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth/login");
      return;
    }
    const u = getUser();
    if (!u || (u.role !== "admin" && u.role !== "super_admin")) {
      router.replace("/");
      return;
    }
    setAllowed(true);
    load();
    loadReports();
  }, [router, load, loadReports]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  async function openEdit(id: string) {
    setError("");
    try {
      const s = await fetchSchoolById(id);
      if (!s) {
        setError("School not found");
        return;
      }
      setEditingId(id);
      setForm(schoolToForm(s));
      setDialogOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }

  async function handleSave() {
    if (mock) return;
    setSaving(true);
    setError("");
    try {
      const raised = Math.max(0, Math.round(Number(form.raisedUsd) * 100));
      const goal = Math.max(0, Math.round(Number(form.goalUsd) * 100));
      const lat = Number(form.lat);
      const lng = Number(form.lng);
      if (!form.name.trim() || !form.district.trim()) {
        setError("Name and district are required.");
        setSaving(false);
        return;
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError("Valid latitude and longitude are required.");
        setSaving(false);
        return;
      }
      const photos = form.photosText
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      const payload = {
        name: form.name.trim(),
        district: form.district.trim(),
        subCounty: form.subCounty.trim() || undefined,
        lat,
        lng,
        totalRooms: Math.max(0, Number(form.totalRooms) || 0),
        studentCount: Math.max(0, Number(form.studentCount) || 0),
        netsCount: Math.max(0, Number(form.netsCount) || 0),
        hasMalariaClub: form.hasMalariaClub,
        sponsorshipStatus: form.sponsorshipStatus,
        fundingProgress: { raised, goal },
        photos,
        notes: form.notes.trim() || undefined,
      };
      if (editingId) {
        await updateSchool(editingId, payload);
      } else {
        await createSchool(payload);
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (mock) return;
    if (!window.confirm("Delete this school and its spray report links?")) return;
    setError("");
    try {
      await deleteSchool(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || mock) return;
    setImportMsg("");
    setError("");
    try {
      const text = await file.text();
      const parsed = parseSchoolCsv(text);
      if (!parsed.length) {
        setImportMsg("No valid rows found.");
        return;
      }
      const res = await bulkCreateSchools(parsed);
      setImportMsg(
        `Imported ${res.created} school(s). ${res.errors.length ? `${res.errors.length} row(s) skipped.` : ""}`
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed");
    }
    e.target.value = "";
  }

  async function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || mock) return;
    setError("");
    try {
      const { url } = await uploadSchoolImage(file);
      setForm((f) => ({
        ...f,
        photosText: f.photosText ? `${f.photosText.trim()}\n${url}` : url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  }

  async function handleVerifyReport(id: string, verified: boolean) {
    if (mock) return;
    setReportError("");
    try {
      await verifySprayReport(id, verified);
      await loadReports();
    } catch (e) {
      setReportError(
        e instanceof Error ? e.message : "Failed to update report verification"
      );
    }
  }

  const importedCount = rows.filter(isImportedSchool).length;
  const needsEnrichmentCount = rows.filter(schoolNeedsEnrichment).length;
  const readyCount = rows.filter(schoolReady).length;
  const verifiedReportsCount = reports.filter((report) => report.verified).length;
  const pendingReviewCount = reports.filter((report) => !report.verified).length;
  const reportsWithPhotosCount = reports.filter(
    (report) => report.photos?.length
  ).length;
  const visibleRows = rows
    .filter((school) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        school.name.toLowerCase().includes(q) ||
        school.district.toLowerCase().includes(q) ||
        (school.subCounty ?? "").toLowerCase().includes(q);

      const matchesView =
        view === "all"
          ? true
          : view === "imported"
            ? isImportedSchool(school)
            : schoolNeedsEnrichment(school);

      return matchesQuery && matchesView;
    })
    .sort((a, b) => {
      const qualityOrder = {
        "needs-enrichment": 0,
        "manual-review": 1,
        ready: 2,
      } as const;
      const aOrder = qualityOrder[getDataQuality(a).completeness];
      const bOrder = qualityOrder[getDataQuality(b).completeness];
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
  const selectedSchool = useMemo(
    () => rows.find((row) => row._id === selectedSchoolId) ?? visibleRows[0] ?? null,
    [rows, selectedSchoolId, visibleRows]
  );
  const selectedSchoolQuality = selectedSchool ? getDataQuality(selectedSchool) : null;
  const selectedSchoolReports = useMemo(
    () =>
      selectedSchool
        ? reports.filter((report) => report.school?._id === selectedSchool._id)
        : [],
    [reports, selectedSchool]
  );
  const recentReports = reports.slice(0, 8);

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-border bg-gradient-to-br from-paper-soft via-paper to-paper-depth px-6 py-8 shadow-[0_18px_45px_rgba(45,45,45,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-pilgrim-orange">
            Operations Console
          </div>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">School admin</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Create and edit schools, import CSV, upload photos (Cloudinary when
            configured).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={mock}
              onChange={onCsv}
            />
            <span
              className={`inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium ${mock ? "opacity-50 pointer-events-none" : "hover:bg-muted"}`}
            >
              Import CSV
            </span>
          </label>
          <Button onClick={openCreate} disabled={mock}>
            Add school
          </Button>
        </div>
        </div>
      </section>

      {mock ? (
        <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 shadow-sm">
          <strong className="font-medium">Mock mode is on.</strong>{" "}
          This console is styled and navigable, but changes are disabled while{" "}
          <code className="text-xs">NEXT_PUBLIC_MOCK=true</code>). Turn it off
          and run the API to manage real schools. Use{" "}
          <code className="text-xs">admin@test.com</code> /{" "}
          <code className="text-xs">password123</code> after{" "}
          <code className="text-xs">npm run seed</code>.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-2 mb-4">
          {error}
        </div>
      ) : null}
      {importMsg ? (
        <p className="text-sm text-muted-foreground mb-4">{importMsg}</p>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-[1.4rem] border border-border bg-card/90 px-4 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Total schools
          </div>
          <div className="mt-1 font-display text-2xl text-ink">
            {rows.length}
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-border bg-card/90 px-4 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Imported from master CSV
          </div>
          <div className="mt-1 font-display text-2xl text-ink">
            {importedCount}
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-border bg-card/90 px-4 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Need enrichment
          </div>
          <div className="mt-1 font-display text-2xl text-ink">
            {needsEnrichmentCount}
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-border bg-card/90 px-4 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Ready profiles
          </div>
          <div className="mt-1 font-display text-2xl text-ink">
            {readyCount}
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-border bg-card/90 px-4 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Pending report review
          </div>
          <div className="mt-1 font-display text-2xl text-ink">
            {pendingReviewCount}
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-border bg-card/90 px-4 py-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Verified reports
          </div>
          <div className="mt-1 font-display text-2xl text-ink">
            {verifiedReportsCount}
          </div>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="py-0">
              <CardHeader className="border-b pb-4">
                <CardTitle>Operational queue</CardTitle>
                <CardDescription>
                  The schools that need attention first, based on data quality.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {visibleRows.slice(0, 6).map((school) => {
                    const quality = getDataQuality(school);
                    return (
                      <button
                        key={school._id}
                        type="button"
                        onClick={() => {
                          setSelectedSchoolId(school._id);
                          setTab("schools");
                        }}
                        className="flex w-full items-start justify-between rounded-xl border border-border bg-paper-soft px-4 py-3 text-left transition-colors hover:bg-paper-depth"
                      >
                        <div>
                          <p className="font-medium text-ink">{school.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {school.district}
                            {school.subCounty ? ` · ${school.subCounty}` : ""}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {quality.summary}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${qualityBadgeClass(quality.completeness)}`}
                        >
                          {qualityLabel(quality.completeness)}
                        </Badge>
                      </button>
                    );
                  })}
                  {!visibleRows.length ? (
                    <div className="rounded-xl border border-dashed border-border bg-paper-soft/70 px-4 py-6 text-sm text-muted-foreground">
                      No schools are in the queue yet. Import CSV data or create a school to start triage.
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardHeader className="border-b pb-4">
                <CardTitle>Report review</CardTitle>
                <CardDescription>
                  Field submissions waiting for admin confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {reportError ? (
                  <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {reportError}
                  </div>
                ) : null}
                <div className="space-y-3">
                  {recentReports.filter((report) => !report.verified).length ? (
                    recentReports
                      .filter((report) => !report.verified)
                      .slice(0, 5)
                      .map((report) => (
                        <div
                          key={report._id}
                          className="rounded-xl border border-border bg-paper-soft px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-ink">
                                {report.school?.name ?? "Unknown school"}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {report.worker?.name ?? "Unknown worker"} ·{" "}
                                {new Date(report.date).toLocaleDateString("en-US")}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleVerifyReport(report._id, true)}
                              disabled={mock}
                            >
                              Verify
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No reports are waiting for review right now.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All schools" },
                { id: "imported", label: "Imported" },
                { id: "needs-enrichment", label: "Needs enrichment" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setView(option.id as ViewFilter)}
                  className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium ${
                    view === option.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-ink hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="w-full lg:w-80">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by school, district, or sub-county"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            CSV columns:{" "}
            <code>
              name,district,subCounty,lng,lat,studentCount,totalRooms,netsCount,hasMalariaClub,sponsorshipStatus
            </code>
            . Header row required; <code>hasMalariaClub</code> true/false;{" "}
            <code>sponsorshipStatus</code> optional.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.25rem] border border-border bg-paper-soft px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                1. Import cleanly
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Start with the master CSV, then use the filter to isolate schools
                that still need enrichment before publishing them confidently.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-paper-soft px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                2. Fill operational gaps
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Prioritize student counts, room totals, coordinates, and district
                detail so public-facing pages feel trustworthy and usable.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-paper-soft px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                3. Review reports
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Verify field submissions quickly so the public map and school pages
                reflect real activity with minimal lag.
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="py-0">
              <CardHeader className="border-b pb-4">
                <CardTitle>School triage</CardTitle>
                <CardDescription>
                  Sort, inspect, and move schools from imported data to usable profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/60 text-left text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">School</th>
                          <th className="px-3 py-2 font-medium">District</th>
                          <th className="px-3 py-2 font-medium">Data</th>
                          <th className="px-3 py-2 font-medium">Phase</th>
                          <th className="px-3 py-2 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {visibleRows.map((s) => (
                          <tr
                            key={s._id}
                            className={`hover:bg-muted/30 ${selectedSchool?._id === s._id ? "bg-muted/30" : ""}`}
                          >
                            <td className="px-3 py-2 font-medium text-ink">
                              <button
                                type="button"
                                onClick={() => setSelectedSchoolId(s._id)}
                                className="text-left"
                              >
                                <span className="text-primary hover:underline">
                                  {s.name}
                                </span>
                              </button>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {isImportedSchool(s) ? (
                                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-900">
                                    Imported
                                  </Badge>
                                ) : null}
                                {schoolNeedsEnrichment(s) ? (
                                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
                                    Needs enrichment
                                  </Badge>
                                ) : null}
                                {schoolReady(s) ? (
                                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-900">
                                    Ready
                                  </Badge>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {s.district}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              <div className="text-xs">
                                Students: {s.studentCount || "—"}
                              </div>
                              <div className="text-xs">
                                Rooms: {s.totalRooms || "—"}
                              </div>
                              {getDataQuality(s).missingFields.length ? (
                                <div className="mt-1 text-xs text-amber-700">
                                  Missing: {getDataQuality(s).missingFields.join(", ")}
                                </div>
                              ) : (
                                <div className="mt-1 text-xs text-emerald-700">
                                  {getDataQuality(s).summary}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {sponsorshipPhaseLabel(
                                String(s.sponsorshipStatus || "needs-funding")
                              )}
                            </td>
                            <td className="px-3 py-2 text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                disabled={mock}
                                onClick={() => openEdit(s._id)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                type="button"
                                disabled={mock}
                                onClick={() => handleDelete(s._id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {!visibleRows.length ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-3 py-8 text-center text-sm text-muted-foreground"
                            >
                              No schools match this view yet.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardHeader className="border-b pb-4">
                <CardTitle>
                  {selectedSchool ? selectedSchool.name : "Select a school"}
                </CardTitle>
                <CardDescription>
                  Context panel for the current school record.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedSchool ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={sourceBadgeClass(selectedSchoolQuality?.source)}
                      >
                        {selectedSchoolQuality?.source ?? "unknown"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={qualityBadgeClass(selectedSchoolQuality?.completeness)}
                      >
                        {qualityLabel(selectedSchoolQuality?.completeness)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-paper-soft px-3 py-2">
                        <div className="text-lg font-semibold text-ink">
                          {selectedSchool.studentCount || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">students</div>
                      </div>
                      <div className="rounded-xl border border-border bg-paper-soft px-3 py-2">
                        <div className="text-lg font-semibold text-ink">
                          {selectedSchool.totalRooms || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">rooms</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Missing fields
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSchoolQuality?.missingFields.length ? (
                          selectedSchoolQuality.missingFields.map((field) => (
                            <Badge key={field} variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
                              {field}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-emerald-700">
                            No critical fields are missing.
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Recent reports for this school
                      </p>
                      <div className="mt-3 space-y-3">
                        {selectedSchoolReports.length ? (
                          selectedSchoolReports.slice(0, 4).map((report) => (
                            <div
                              key={report._id}
                              className="rounded-xl border border-border bg-paper-soft px-3 py-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-ink">
                                    {new Date(report.date).toLocaleDateString("en-US")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {report.roomsSprayed} rooms sprayed ·{" "}
                                    {report.worker?.name ?? "Unknown worker"}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={verificationBadgeClass(report.verified)}
                                >
                                  {report.verified ? "Verified" : "Needs review"}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No spray reports linked to this school yet.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openEdit(selectedSchool._id)}
                        disabled={mock}
                      >
                        Edit selected school
                      </Button>
                      <Link
                        href={`/schools/${selectedSchool._id}`}
                        className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-ink hover:bg-muted"
                      >
                        View public page
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-paper-soft/70 px-4 py-6 text-sm text-muted-foreground">
                    Choose a school from the table to inspect its operational state,
                    missing fields, and linked field reports.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="py-0">
            <CardHeader className="border-b pb-4">
              <CardTitle>Field report review</CardTitle>
              <CardDescription>
                Verify incoming spray reports and spot missing evidence quickly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {reportError ? (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {reportError}
                </div>
              ) : null}
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-paper-soft px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total reports
                  </div>
                  <div className="mt-1 font-display text-2xl text-ink">
                    {reports.length}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-paper-soft px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    With photos
                  </div>
                  <div className="mt-1 font-display text-2xl text-ink">
                    {reportsWithPhotosCount}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-paper-soft px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Waiting on review
                  </div>
                  <div className="mt-1 font-display text-2xl text-ink">
                    {pendingReviewCount}
                  </div>
                </div>
              </div>

              {reportsLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">School</th>
                        <th className="px-3 py-2 font-medium">Worker</th>
                        <th className="px-3 py-2 font-medium">Field data</th>
                        <th className="px-3 py-2 font-medium">Evidence</th>
                        <th className="px-3 py-2 font-medium text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reports.map((report) => (
                        <tr key={report._id} className="hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <div className="font-medium text-ink">
                              {report.school?.name ?? "Unknown school"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {report.school?.district ?? "District unavailable"}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {report.worker?.name ?? "Unknown worker"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            <div className="text-xs">
                              Date: {new Date(report.date).toLocaleDateString("en-US")}
                            </div>
                            <div className="text-xs">
                              Rooms sprayed: {report.roomsSprayed}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            <div className="text-xs">
                              Photos: {report.photos?.length ?? 0}
                            </div>
                            <div className="text-xs line-clamp-2">
                              {report.notes || "No notes"}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Badge
                                variant="outline"
                                className={verificationBadgeClass(report.verified)}
                              >
                                {report.verified ? "Verified" : "Needs review"}
                              </Badge>
                              <Button
                                size="sm"
                                variant={report.verified ? "outline" : "default"}
                                onClick={() =>
                                  handleVerifyReport(report._id, !report.verified)
                                }
                                disabled={mock}
                              >
                                {report.verified ? "Unverify" : "Verify"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!reports.length ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-8 text-center text-sm text-muted-foreground"
                          >
                            No spray reports have been submitted yet.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit school" : "New school"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, district: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="subCounty">Sub-county</Label>
                <Input
                  id="subCounty"
                  value={form.subCounty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subCounty: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  inputMode="decimal"
                  value={form.lat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lat: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  inputMode="decimal"
                  value={form.lng}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lng: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="studentCount">Students</Label>
                <Input
                  id="studentCount"
                  inputMode="numeric"
                  value={form.studentCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentCount: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="totalRooms">Rooms</Label>
                <Input
                  id="totalRooms"
                  inputMode="numeric"
                  value={form.totalRooms}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, totalRooms: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="netsCount">Nets</Label>
                <Input
                  id="netsCount"
                  inputMode="numeric"
                  value={form.netsCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, netsCount: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phase">Sponsorship phase</Label>
              <select
                id="phase"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={form.sponsorshipStatus}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sponsorshipStatus: e.target.value as SponsorshipStatus,
                  }))
                }
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>
                    {sponsorshipPhaseLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hasMalariaClub}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hasMalariaClub: e.target.checked }))
                }
              />
              Malaria club at this school
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="raised">Funding raised (USD)</Label>
                <Input
                  id="raised"
                  inputMode="decimal"
                  value={form.raisedUsd}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, raisedUsd: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="goal">Funding goal (USD)</Label>
                <Input
                  id="goal"
                  inputMode="decimal"
                  value={form.goalUsd}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goalUsd: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="photos">Photo URLs (one per line)</Label>
              <textarea
                id="photos"
                className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.photosText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, photosText: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">
                Upload image (append URL)
              </Label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block text-xs"
                disabled={mock}
                onChange={onPhotoPick}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="notes">Internal notes</Label>
              <textarea
                id="notes"
                className="min-h-[56px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || mock}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
