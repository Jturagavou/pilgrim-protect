/** Created with Cursor — AI-assisted. */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  bulkCreateSchools,
  createSchool,
  deleteSchool,
  fetchSchoolById,
  fetchSchools,
  isMockMode,
  updateSchool,
  uploadSchoolImage,
} from "@/lib/api";
import { getUser, isLoggedIn } from "@/lib/auth";
import { parseSchoolCsv } from "@/lib/schoolCsv";
import { sponsorshipPhaseLabel } from "@/lib/mapLabels";
import type { SchoolProfileSchool, SponsorshipStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function AdminSchoolsPage() {
  const router = useRouter();
  const mock = isMockMode();
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<SchoolProfileSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [importMsg, setImportMsg] = useState("");

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
  }, [router, load]);

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

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink">School admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
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

      {mock ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 px-4 py-3 text-sm mb-6">
          <strong className="font-medium">Mock mode is on</strong> (
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

      <p className="text-xs text-muted-foreground mb-4">
        CSV columns:{" "}
        <code>
          name,district,subCounty,lng,lat,studentCount,totalRooms,netsCount,hasMalariaClub,sponsorshipStatus
        </code>
        . Header row required;{" "}
        <code>hasMalariaClub</code> true/false;{" "}
        <code>sponsorshipStatus</code> optional.
      </p>

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
                <th className="px-3 py-2 font-medium">Phase</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((s) => (
                <tr key={s._id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-ink">
                    <Link
                      href={`/schools/${s._id}`}
                      className="text-primary hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.district}
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
            </tbody>
          </table>
        </div>
      )}

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
