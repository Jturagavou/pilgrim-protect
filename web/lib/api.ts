import axios, { type AxiosInstance } from "axios";
import {
  mockMapData,
  mockImpact,
  mockTimeline,
  mockSchools,
  getMockSchoolById,
  mockUser,
  mockDonations,
} from "./mockData";
import { getToken } from "./auth";
import type {
  AdminSprayReport,
  Donation,
  ImpactStats,
  MapFeatureCollection,
  MockSchool,
  SchoolProfileSchool,
  TimelinePoint,
  User,
} from "./types";

export interface AuthResponse {
  token: string;
  user: User;
}

const isMock = process.env.NEXT_PUBLIC_MOCK === "true";

/** True when the Next app uses bundled mock data instead of the Express API. */
export function isMockMode(): boolean {
  return isMock;
}

/** Set after `/api/public/runtime-config` in production when build baked a wrong/empty NEXT_PUBLIC_API_URL. */
let clientApiBaseOverride: string | null = null;

export function setClientApiBaseUrl(url: string | null): void {
  const t = url?.trim().replace(/\/+$/, "") ?? "";
  clientApiBaseOverride = t || null;
}

function effectiveApiBaseUrl(): string {
  if (typeof window !== "undefined" && clientApiBaseOverride) {
    return clientApiBaseOverride;
  }
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
    "http://localhost:8080/api/v1"
  );
}

const API: AxiosInstance = axios.create({
  baseURL: effectiveApiBaseUrl(),
});

// Attach auth token + correct API base (runtime override wins in the browser)
API.interceptors.request.use((config) => {
  config.baseURL = effectiveApiBaseUrl();
  if (typeof window !== "undefined") {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Public endpoints ──

export async function fetchMapData(): Promise<MapFeatureCollection> {
  if (isMock) return mockMapData;
  const { data } = await API.get<MapFeatureCollection>("/stats/map");
  return data;
}

export async function fetchImpact(): Promise<ImpactStats> {
  if (isMock) return mockImpact;
  const { data } = await API.get<ImpactStats>("/stats/impact");
  return data;
}

export async function fetchTimeline(): Promise<TimelinePoint[]> {
  if (isMock) return mockTimeline;
  const { data } = await API.get<TimelinePoint[]>("/stats/timeline");
  return data;
}

export async function fetchSchools(): Promise<MockSchool[]> {
  if (isMock) return mockSchools;
  const { data } = await API.get<MockSchool[]>("/schools");
  return data;
}

export async function fetchSchoolById(
  id: string
): Promise<SchoolProfileSchool | null> {
  if (isMock) return getMockSchoolById(id) as SchoolProfileSchool | null;
  const { data } = await API.get<SchoolProfileSchool>(`/schools/${id}`);
  return data;
}

// ── Auth endpoints ──

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function registerDonor({
  name,
  email,
  password,
}: RegisterInput): Promise<AuthResponse> {
  if (isMock) return { token: "mock-token-abc", user: mockUser };
  const { data } = await API.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
    role: "donor",
  });
  return data;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginDonor({
  email,
  password,
}: LoginInput): Promise<AuthResponse> {
  if (isMock) return { token: "mock-token-abc", user: mockUser };
  const { data } = await API.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<{ user: User }> {
  if (isMock) return { user: mockUser };
  const { data } = await API.get<{ user: User }>("/auth/me");
  return data;
}

// ── Donation endpoints ──

export async function fetchMyDonations(): Promise<Donation[]> {
  if (isMock) return mockDonations;
  const { data } = await API.get<Donation[]>("/donations/mine");
  return data;
}

// ── Admin / school mutations (require live API + admin token) ──

export interface SchoolMutationPayload {
  name?: string;
  district?: string;
  subCounty?: string;
  lat?: number;
  lng?: number;
  location?: { type: "Point"; coordinates: [number, number] };
  totalRooms?: number;
  studentCount?: number;
  netsCount?: number;
  hasMalariaClub?: boolean;
  photos?: string[];
  sponsorshipStatus?: string;
  fundingProgress?: { raised: number; goal: number };
  notes?: string;
  status?: string;
  source?: string;
  sourceFile?: string;
  importedAt?: string;
}

function requireLiveApi(): void {
  if (isMock) {
    throw new Error(
      "Set NEXT_PUBLIC_MOCK=false and run the API to create or edit schools."
    );
  }
}

export async function createSchool(
  body: SchoolMutationPayload
): Promise<MockSchool> {
  requireLiveApi();
  const { data } = await API.post<MockSchool>("/schools", body);
  return data;
}

export async function updateSchool(
  id: string,
  body: SchoolMutationPayload
): Promise<MockSchool> {
  requireLiveApi();
  const { data } = await API.put<MockSchool>(`/schools/${id}`, body);
  return data;
}

export async function deleteSchool(id: string): Promise<void> {
  requireLiveApi();
  await API.delete(`/schools/${id}`);
}

export async function bulkCreateSchools(
  schools: SchoolMutationPayload[]
): Promise<{
  created: number;
  schools: MockSchool[];
  errors: { index: number; message: string }[];
}> {
  requireLiveApi();
  const { data } = await API.post<{
    created: number;
    schools: MockSchool[];
    errors: { index: number; message: string }[];
  }>("/schools/bulk", { schools });
  return data;
}

export async function uploadSchoolImage(file: File): Promise<{ url: string }> {
  requireLiveApi();
  const form = new FormData();
  form.append("image", file);
  const { data } = await API.post<{ url: string }>("/upload/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchSprayReports(params?: {
  school?: string;
  worker?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AdminSprayReport[]> {
  requireLiveApi();
  const { data } = await API.get<AdminSprayReport[]>("/spray-reports", {
    params,
  });
  return data;
}

export async function verifySprayReport(
  id: string,
  verified = true
): Promise<AdminSprayReport> {
  requireLiveApi();
  const { data } = await API.patch<AdminSprayReport>(
    `/spray-reports/${id}/verify`,
    { verified }
  );
  return data;
}

export default API;
