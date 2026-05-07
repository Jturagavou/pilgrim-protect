import axios from 'axios';
import { getToken } from './auth';
import { mockLogin, mockGetSchools, mockGetMyReports, mockSubmitReport, mockUploadImage } from '../mock/mockData';

// Default to the live demo API so the field app is usable without local network setup.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://pilgrimprotectstory.org/api/v1';
const ALLOW_MOCK = process.env.EXPO_PUBLIC_ALLOW_MOCK === 'true';

function healthCheckUrl() {
  const base = BASE_URL.replace(/\/api\/v\d+\/?$/i, '');
  return `${base}/health`;
}

// Track whether we're in mock mode
let useMock = false;

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
API.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Detect backend unreachable → switch to mock mode in dev
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__ && ALLOW_MOCK && (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error')) {
      console.log('[API] Backend unreachable — explicit mock mode enabled');
      useMock = true;
    }
    return Promise.reject(error);
  }
);

/**
 * Check if backend is reachable; if not, enable mock mode (dev only)
 */
export async function initApi() {
  if (!__DEV__ || !ALLOW_MOCK) return;
  try {
    await axios.get(healthCheckUrl(), { timeout: 3000 });
  } catch {
    console.log('[API] Backend not available — explicit mock mode enabled');
    useMock = true;
  }
}

/**
 * POST /api/auth/login
 */
export async function login(email, password) {
  if (useMock && __DEV__) return mockLogin(email, password);
  const res = await API.post('/auth/login', { email, password });
  return res.data;
}

/**
 * GET /api/auth/me
 */
export async function getMe() {
  if (useMock && __DEV__) return { user: { _id: 'mock1', name: 'James Okello', email: 'worker1@test.com', role: 'worker' } };
  const res = await API.get('/auth/me');
  return res.data;
}

/**
 * GET /api/schools
 */
export async function getSchools() {
  if (useMock && __DEV__) return mockGetSchools();
  const res = await API.get('/schools');
  return res.data;
}

/**
 * GET /api/stats/impact
 */
export async function getImpactStats() {
  if (useMock && __DEV__) {
    const schools = await mockGetSchools();
    return {
      totalSchools: schools.length,
      totalRoomsSprayed: schools.reduce((sum, school) => sum + (school.totalRooms || 0), 0),
      totalStudentsProtected: schools.reduce((sum, school) => sum + (school.studentCount || 0), 0),
      totalSprayReports: 0,
    };
  }
  const res = await API.get('/stats/impact');
  return res.data;
}

/**
 * GET /api/schools/:id
 */
export async function getSchoolDetails(schoolId) {
  if (useMock && __DEV__) {
    const schools = await mockGetSchools();
    const school = schools.find((item) => item._id === schoolId) || null;
    return school ? { ...school, sprayReports: [] } : null;
  }
  const res = await API.get(`/schools/${schoolId}`);
  return res.data;
}

/**
 * POST /api/spray-reports
 */
export async function submitSprayReport(reportData) {
  if (useMock && __DEV__) return mockSubmitReport(reportData);
  const res = await API.post('/spray-reports', reportData);
  return res.data;
}

/**
 * GET /api/spray-reports/mine
 */
export async function getMyReports() {
  if (useMock && __DEV__) return mockGetMyReports();
  const res = await API.get('/spray-reports/mine');
  return res.data;
}

/**
 * POST /api/upload/image — multipart form data
 */
export async function uploadImage(imageUri) {
  if (useMock && __DEV__) return mockUploadImage(imageUri);

  const formData = new FormData();
  const filename = imageUri.split('/').pop();
  const ext = filename.split('.').pop();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  });

  const token = await getToken();
  if (!token) {
    throw new Error('Please sign in before syncing report photos.');
  }

  const res = await axios.post(`${BASE_URL}/upload/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000,
  });
  return res.data;
}

export default API;
