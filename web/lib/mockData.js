// ── Mock Data for Pilgrim Protect ──
// 10 Uganda schools matching the backend seed data

const schools = [
  {
    _id: "s1",
    name: "Gulu Primary School",
    district: "Gulu",
    location: { type: "Point", coordinates: [32.2999, 2.7746] },
    totalRooms: 12,
    studentCount: 450,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "active",
    lastSprayDate: "2026-03-20T00:00:00Z",
    sprayReports: [
      {
        _id: "r1a",
        date: "2026-03-20T00:00:00Z",
        roomsSprayed: 6,
        photos: ["/images/placeholder-spray.jpg"],
        notes: "Sprayed 6 classrooms, headmaster present",
        worker: { name: "James Okello" },
        verified: true,
      },
      {
        _id: "r1b",
        date: "2026-02-10T00:00:00Z",
        roomsSprayed: 6,
        photos: ["/images/placeholder-spray.jpg"],
        notes: "Completed remaining classrooms",
        worker: { name: "James Okello" },
        verified: true,
      },
    ],
  },
  {
    _id: "s2",
    name: "Lira Town Primary",
    district: "Lira",
    location: { type: "Point", coordinates: [32.5338, 2.2499] },
    totalRooms: 10,
    studentCount: 380,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: { name: "Grace Foundation" },
    status: "active",
    lastSprayDate: "2026-03-15T00:00:00Z",
    sprayReports: [
      {
        _id: "r2a",
        date: "2026-03-15T00:00:00Z",
        roomsSprayed: 10,
        photos: [],
        notes: "Full spray — all rooms completed",
        worker: { name: "Sarah Apio" },
        verified: true,
      },
    ],
  },
  {
    _id: "s3",
    name: "Soroti Central Primary",
    district: "Soroti",
    location: { type: "Point", coordinates: [33.6111, 1.7147] },
    totalRooms: 8,
    studentCount: 310,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "pending",
    lastSprayDate: "2026-01-05T00:00:00Z",
    sprayReports: [
      {
        _id: "r3a",
        date: "2026-01-05T00:00:00Z",
        roomsSprayed: 4,
        photos: [],
        notes: "Partial spray, supply shortage",
        worker: { name: "Peter Ouma" },
        verified: false,
      },
    ],
  },
  {
    _id: "s4",
    name: "Jinja Riverside Academy",
    district: "Jinja",
    location: { type: "Point", coordinates: [33.2026, 0.4244] },
    totalRooms: 15,
    studentCount: 620,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: { name: "Malaria Free Kids" },
    status: "active",
    lastSprayDate: "2026-03-18T00:00:00Z",
    sprayReports: [
      {
        _id: "r4a",
        date: "2026-03-18T00:00:00Z",
        roomsSprayed: 8,
        photos: [],
        notes: "Phase 1 of 2 completed",
        worker: { name: "David Waiswa" },
        verified: true,
      },
      {
        _id: "r4b",
        date: "2026-03-12T00:00:00Z",
        roomsSprayed: 7,
        photos: [],
        notes: "Phase 2 completed",
        worker: { name: "David Waiswa" },
        verified: true,
      },
    ],
  },
  {
    _id: "s5",
    name: "Mbale Hill View Primary",
    district: "Mbale",
    location: { type: "Point", coordinates: [34.1755, 1.0647] },
    totalRooms: 9,
    studentCount: 340,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "active",
    lastSprayDate: "2026-03-10T00:00:00Z",
    sprayReports: [
      {
        _id: "r5a",
        date: "2026-03-10T00:00:00Z",
        roomsSprayed: 9,
        photos: [],
        notes: "All rooms sprayed successfully",
        worker: { name: "Grace Nambi" },
        verified: true,
      },
    ],
  },
  {
    _id: "s6",
    name: "Tororo Border Primary",
    district: "Tororo",
    location: { type: "Point", coordinates: [34.1809, 0.6927] },
    totalRooms: 7,
    studentCount: 280,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "overdue",
    lastSprayDate: "2025-11-15T00:00:00Z",
    sprayReports: [
      {
        _id: "r6a",
        date: "2025-11-15T00:00:00Z",
        roomsSprayed: 7,
        photos: [],
        notes: "Routine quarterly spray",
        worker: { name: "Moses Okiror" },
        verified: true,
      },
    ],
  },
  {
    _id: "s7",
    name: "Iganga Community School",
    district: "Iganga",
    location: { type: "Point", coordinates: [33.4686, 0.6092] },
    totalRooms: 11,
    studentCount: 410,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: { name: "Hope for Uganda" },
    status: "active",
    lastSprayDate: "2026-03-22T00:00:00Z",
    sprayReports: [
      {
        _id: "r7a",
        date: "2026-03-22T00:00:00Z",
        roomsSprayed: 11,
        photos: [],
        notes: "Complete building spray",
        worker: { name: "Sarah Apio" },
        verified: true,
      },
    ],
  },
  {
    _id: "s8",
    name: "Kamuli Bright Future Primary",
    district: "Kamuli",
    location: { type: "Point", coordinates: [33.1197, 0.9474] },
    totalRooms: 6,
    studentCount: 220,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "pending",
    lastSprayDate: "2026-02-01T00:00:00Z",
    sprayReports: [
      {
        _id: "r8a",
        date: "2026-02-01T00:00:00Z",
        roomsSprayed: 3,
        photos: [],
        notes: "Half completed — will return",
        worker: { name: "Peter Ouma" },
        verified: false,
      },
    ],
  },
  {
    _id: "s9",
    name: "Pallisa Star Academy",
    district: "Pallisa",
    location: { type: "Point", coordinates: [33.7094, 1.1450] },
    totalRooms: 10,
    studentCount: 370,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "active",
    lastSprayDate: "2026-03-05T00:00:00Z",
    sprayReports: [
      {
        _id: "r9a",
        date: "2026-03-05T00:00:00Z",
        roomsSprayed: 10,
        photos: [],
        notes: "Full spray before term starts",
        worker: { name: "Grace Nambi" },
        verified: true,
      },
    ],
  },
  {
    _id: "s10",
    name: "Kumi Township Primary",
    district: "Kumi",
    location: { type: "Point", coordinates: [33.9361, 1.4608] },
    totalRooms: 8,
    studentCount: 290,
    photos: ["/images/placeholder-school.jpg"],
    sponsor: null,
    status: "active",
    lastSprayDate: "2026-02-28T00:00:00Z",
    sprayReports: [
      {
        _id: "r10a",
        date: "2026-02-28T00:00:00Z",
        roomsSprayed: 8,
        photos: [],
        notes: "Quarterly maintenance spray",
        worker: { name: "James Okello" },
        verified: true,
      },
    ],
  },
];

// ── Derived mock responses ──

export const mockMapData = {
  type: "FeatureCollection",
  features: schools.map((s) => ({
    type: "Feature",
    geometry: s.location,
    properties: {
      _id: s._id,
      name: s.name,
      district: s.district,
      studentCount: s.studentCount,
      totalRooms: s.totalRooms,
      status: s.status,
      lastSprayDate: s.lastSprayDate,
      totalSprayReports: s.sprayReports.length,
      thumbnailUrl: s.photos[0] || null,
    },
  })),
};

export const mockImpact = {
  totalSchools: schools.length,
  totalRoomsSprayed: schools.reduce(
    (sum, s) => sum + s.sprayReports.reduce((a, r) => a + r.roomsSprayed, 0),
    0
  ),
  totalStudentsProtected: schools.reduce((sum, s) => sum + s.studentCount, 0),
  totalSprayReports: schools.reduce(
    (sum, s) => sum + s.sprayReports.length,
    0
  ),
};

export const mockTimeline = [
  { month: "2025-11", roomsSprayed: 7, reportsCount: 1 },
  { month: "2025-12", roomsSprayed: 0, reportsCount: 0 },
  { month: "2026-01", roomsSprayed: 4, reportsCount: 1 },
  { month: "2026-02", roomsSprayed: 14, reportsCount: 3 },
  { month: "2026-03", roomsSprayed: 62, reportsCount: 8 },
];

export const mockSchools = schools;

export const mockUser = {
  _id: "u1",
  name: "Demo Donor",
  email: "demo@pilgrimprotect.org",
  role: "donor",
};

export const mockDonations = [
  {
    _id: "d1",
    amount: 50,
    school: { _id: "s1", name: "Gulu Primary School" },
    recurring: false,
    createdAt: "2026-03-10T00:00:00Z",
    status: "completed",
  },
  {
    _id: "d2",
    amount: 25,
    school: { _id: "s4", name: "Jinja Riverside Academy" },
    recurring: true,
    createdAt: "2026-02-15T00:00:00Z",
    status: "completed",
  },
];

export function getMockSchoolById(id) {
  return schools.find((s) => s._id === id) || null;
}
