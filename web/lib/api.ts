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
  Donation,
  ImpactStats,
  MapFeatureCollection,
  MockSchool,
  TimelinePoint,
  User,
} from "./types";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CheckoutResponse {
  sessionUrl: string;
}

const isMock = process.env.NEXT_PUBLIC_MOCK === "true";

const API: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Attach auth token to every request
API.interceptors.request.use((config) => {
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

export async function fetchSchoolById(id: string): Promise<MockSchool | null> {
  if (isMock) return getMockSchoolById(id);
  const { data } = await API.get<MockSchool>(`/schools/${id}`);
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

export interface CheckoutInput {
  schoolId: string | null;
  amount: number;
  recurring: boolean;
}

export async function createCheckout({
  schoolId,
  amount,
  recurring,
}: CheckoutInput): Promise<CheckoutResponse> {
  if (isMock) return { sessionUrl: "/donate/success?mock=true" };
  const { data } = await API.post<CheckoutResponse>("/donations/checkout", {
    schoolId,
    amount,
    recurring,
  });
  return data;
}

export async function fetchMyDonations(): Promise<Donation[]> {
  if (isMock) return mockDonations;
  const { data } = await API.get<Donation[]>("/donations/mine");
  return data;
}

export default API;
