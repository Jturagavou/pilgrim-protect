/**
 * Mock data matching the exact backend API contract.
 * Used when __DEV__ is true and no backend is reachable.
 * 10 Uganda schools: Gulu, Lira, Soroti, Jinja, Mbale, Tororo, Iganga, Kamuli, Pallisa, Kumi
 */

const MOCK_USER = {
  _id: 'mock_worker_001',
  name: 'James Okello',
  email: 'worker1@test.com',
  role: 'worker',
};

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-dev-token';

const MOCK_SCHOOLS = [
  {
    _id: 'school_001',
    name: 'Gulu Primary School',
    district: 'Gulu',
    location: { type: 'Point', coordinates: [32.2990, 2.7747] },
    totalRooms: 12,
    studentCount: 450,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago — green
  },
  {
    _id: 'school_002',
    name: 'Lira Town Primary School',
    district: 'Lira',
    location: { type: 'Point', coordinates: [32.5338, 2.2499] },
    totalRooms: 8,
    studentCount: 320,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago — orange
  },
  {
    _id: 'school_003',
    name: 'Soroti Central Primary',
    district: 'Soroti',
    location: { type: 'Point', coordinates: [33.6112, 1.7150] },
    totalRooms: 10,
    studentCount: 380,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago — red
  },
  {
    _id: 'school_004',
    name: 'Jinja Progressive Primary',
    district: 'Jinja',
    location: { type: 'Point', coordinates: [33.2026, 0.4244] },
    totalRooms: 15,
    studentCount: 520,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago — green
  },
  {
    _id: 'school_005',
    name: 'Mbale Victory Primary',
    district: 'Mbale',
    location: { type: 'Point', coordinates: [34.1755, 1.0647] },
    totalRooms: 9,
    studentCount: 290,
    status: 'active',
    lastSprayDate: null, // never sprayed — red
  },
  {
    _id: 'school_006',
    name: 'Tororo Township Primary',
    district: 'Tororo',
    location: { type: 'Point', coordinates: [34.1809, 0.6930] },
    totalRooms: 11,
    studentCount: 410,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago — green
  },
  {
    _id: 'school_007',
    name: 'Iganga Community Primary',
    district: 'Iganga',
    location: { type: 'Point', coordinates: [33.4686, 0.6094] },
    totalRooms: 7,
    studentCount: 260,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago — orange
  },
  {
    _id: 'school_008',
    name: 'Kamuli Riverside Primary',
    district: 'Kamuli',
    location: { type: 'Point', coordinates: [33.1197, 0.9472] },
    totalRooms: 6,
    studentCount: 200,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(), // 95 days ago — red
  },
  {
    _id: 'school_009',
    name: 'Pallisa District Primary',
    district: 'Pallisa',
    location: { type: 'Point', coordinates: [33.7093, 1.1450] },
    totalRooms: 8,
    studentCount: 310,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago — green
  },
  {
    _id: 'school_010',
    name: 'Kumi Town Council Primary',
    district: 'Kumi',
    location: { type: 'Point', coordinates: [33.9361, 1.4608] },
    totalRooms: 10,
    studentCount: 340,
    status: 'active',
    lastSprayDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago — orange
  },
];

const MOCK_REPORTS = [
  {
    _id: 'report_001',
    school: { _id: 'school_001', name: 'Gulu Primary School', district: 'Gulu' },
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    roomsSprayed: 6,
    photos: [
      'https://res.cloudinary.com/demo/image/upload/v1/spray_gulu_1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1/spray_gulu_2.jpg',
    ],
    notes: 'Sprayed 6 classrooms, headmaster was present',
    verified: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'report_002',
    school: { _id: 'school_004', name: 'Jinja Progressive Primary', district: 'Jinja' },
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    roomsSprayed: 10,
    photos: [
      'https://res.cloudinary.com/demo/image/upload/v1/spray_jinja_1.jpg',
    ],
    notes: 'Full school spray completed. Deputy head supervised.',
    verified: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'report_003',
    school: { _id: 'school_006', name: 'Tororo Township Primary', district: 'Tororo' },
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    roomsSprayed: 8,
    photos: [],
    notes: 'Sprayed 8 rooms. Camera was not available.',
    verified: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- Mock API functions ---

export function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'worker1@test.com' && password === 'password123') {
        resolve({ token: MOCK_TOKEN, user: MOCK_USER });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
}

export function mockGetSchools() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_SCHOOLS), 300);
  });
}

export function mockGetMyReports() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_REPORTS), 300);
  });
}

export function mockSubmitReport(reportData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: 'report_new_' + Date.now(),
        ...reportData,
        verified: false,
        createdAt: new Date().toISOString(),
      });
    }, 800);
  });
}

export function mockUploadImage(imageUri) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/spray_photo_mock.jpg`,
      });
    }, 400);
  });
}
