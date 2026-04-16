// Shared domain types for Pilgrim Protect.
// Canonical shapes consumed by the web donor site, the field-worker mobile
// app, and (future) the Kotlin v2 Android client. Matches data model in
// MASTER-BUILD-PLAN section 4.

export type SponsorshipStatus =
  | "needs-funding"
  | "funded"
  | "contracted"
  | "checked-in"
  | "data-gathered";

export type UserRole = "donor" | "field_worker" | "admin" | "super_admin";

export interface School {
  _id: string;
  name: string;
  district: string;
  subCounty?: string;
  lat: number;
  lng: number;
  studentCount: number;
  netsCount: number;
  hasMalariaClub: boolean;
  sponsorshipStatus: SponsorshipStatus;
  sprayDates: string[];
  photos: string[];
  sponsorRef?: string;
  fundingProgress: { raised: number; goal: number };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  schoolId: string;
  stripePaymentId: string;
  createdAt: string;
}

export interface Stats {
  schoolsProtected: number;
  studentsCovered: number;
  dollarsRaised: number;
  goal: number;
  progressPct: number;
  updatedAt: string;
}
