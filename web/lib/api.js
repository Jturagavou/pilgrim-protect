import axios from "axios";
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

const isMock = process.env.NEXT_PUBLIC_MOCK === "true";

const API = axios.create({
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

export async function fetchMapData() {
  if (isMock) return mockMapData;
  const { data } = await API.get("/stats/map");
  return data;
}

export async function fetchImpact() {
  if (isMock) return mockImpact;
  const { data } = await API.get("/stats/impact");
  return data;
}

export async function fetchTimeline() {
  if (isMock) return mockTimeline;
  const { data } = await API.get("/stats/timeline");
  return data;
}

export async function fetchSchools() {
  if (isMock) return mockSchools;
  const { data } = await API.get("/schools");
  return data;
}

export async function fetchSchoolById(id) {
  if (isMock) return getMockSchoolById(id);
  const { data } = await API.get(`/schools/${id}`);
  return data;
}

// ── Auth endpoints ──

export async function registerDonor({ name, email, password }) {
  if (isMock) return { token: "mock-token-abc", user: mockUser };
  const { data } = await API.post("/auth/register", {
    name,
    email,
    password,
    role: "donor",
  });
  return data;
}

export async function loginDonor({ email, password }) {
  if (isMock) return { token: "mock-token-abc", user: mockUser };
  const { data } = await API.post("/auth/login", { email, password });
  return data;
}

export async function fetchMe() {
  if (isMock) return { user: mockUser };
  const { data } = await API.get("/auth/me");
  return data;
}

// ── Donation endpoints ──

export async function createCheckout({ schoolId, amount, recurring }) {
  if (isMock) return { sessionUrl: "/donate/success?mock=true" };
  const { data } = await API.post("/donations/checkout", {
    schoolId,
    amount,
    recurring,
  });
  return data;
}

export async function fetchMyDonations() {
  if (isMock) return mockDonations;
  const { data } = await API.get("/donations/mine");
  return data;
}

export default API;
