// Domain types used across the donor website.
// These reflect the *current* mock/API shapes. The v2 shared types live in
// `api/src/types/shared.ts` and will replace these as prompts 02+ wire up the
// new data model.

export type LegacyStatus = "active" | "pending" | "overdue";

export type SponsorshipStatus =
  | "needs-funding"
  | "funded"
  | "contracted"
  | "checked-in"
  | "data-gathered";

export type MapGapState = "helped" | "struggling";

export type SchoolDataSource =
  | "seed"
  | "manual"
  | "manual-csv"
  | "master-csv"
  | "pilgrim-data"
  | "unknown";

export type SchoolCompleteness = "ready" | "needs-enrichment" | "manual-review";

export interface SchoolDataQuality {
  source: SchoolDataSource;
  imported: boolean;
  completeness: SchoolCompleteness;
  missingFields: string[];
  summary: string;
}

export interface MockWorker {
  name: string;
}

export interface MockSponsor {
  name: string;
}

export interface MockSprayReport {
  _id: string;
  date: string;
  roomsSprayed: number;
  photos: string[];
  notes: string;
  worker: MockWorker;
  verified: boolean;
}

export interface AdminSprayReport {
  _id: string;
  date: string;
  roomsSprayed: number;
  photos: string[];
  notes: string;
  verified: boolean;
  gpsCoords?: { lat?: number; lng?: number };
  school?: { _id?: string; name: string; district?: string };
  worker?: { _id?: string; name: string };
}

export interface MockSchool {
  _id: string;
  name: string;
  district: string;
  location: { type: "Point"; coordinates: [number, number] };
  totalRooms: number;
  studentCount: number;
  photos: string[];
  sponsor: MockSponsor | null;
  status: LegacyStatus;
  lastSprayDate: string;
  sprayReports: MockSprayReport[];
  dataQuality?: SchoolDataQuality;
}

/** API + seed shape for /schools/[id] (v2 fields optional for legacy mock). */
export interface SchoolProfileSchool {
  _id: string;
  name: string;
  district: string;
  subCounty?: string;
  location: { type: "Point"; coordinates: [number, number] };
  lat?: number;
  lng?: number;
  totalRooms: number;
  studentCount: number;
  netsCount?: number;
  hasMalariaClub?: boolean;
  photos: string[];
  sponsor: MockSponsor | null;
  status: LegacyStatus | string;
  sponsorshipStatus?: SponsorshipStatus | string;
  fundingProgress?: { raised: number; goal: number };
  lastSprayDate: string | null;
  sprayReports: MockSprayReport[];
  notes?: string;
  source?: SchoolDataSource;
  sourceFile?: string;
  importedAt?: string | null;
  dataQuality?: SchoolDataQuality;
}

export interface MapFeatureProperties {
  _id: string;
  name: string;
  district: string;
  subCounty?: string;
  studentCount: number;
  totalRooms: number;
  /** Legacy spray lifecycle — kept for dashboard compat */
  status: LegacyStatus | string;
  /** v2 pipeline */
  sponsorshipStatus?: SponsorshipStatus | string;
  gapState?: MapGapState;
  netsCount?: number;
  hasMalariaClub?: boolean;
  lat?: number;
  lng?: number;
  lastSprayDate: string | null;
  totalSprayReports: number;
  thumbnailUrl: string | null;
}

export interface MapFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MapFeatureProperties;
}

export interface MapFeatureCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

export interface ImpactStats {
  totalSchools: number;
  totalRoomsSprayed: number;
  totalStudentsProtected: number;
  totalSprayReports: number;
}

export interface TimelinePoint {
  month: string; // "2026-03"
  roomsSprayed: number;
  reportsCount: number;
}

export type UserRole = "donor" | "field_worker" | "admin" | "super_admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type DonationStatus = "completed" | "pending" | "failed";

export interface Donation {
  _id: string;
  amount: number;
  school: { _id: string; name: string };
  recurring: boolean;
  createdAt: string;
  status: DonationStatus;
}
