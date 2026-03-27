const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from api root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const School = require('../models/School');
const Worker = require('../models/Worker');
const Donor = require('../models/Donor');
const SprayReport = require('../models/SprayReport');
const Donation = require('../models/Donation');

const schoolsData = require('./schools.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pilgrim-protect';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Clearing existing data...');

    // Clear all collections
    await Promise.all([
      School.deleteMany({}),
      Worker.deleteMany({}),
      Donor.deleteMany({}),
      SprayReport.deleteMany({}),
      Donation.deleteMany({}),
    ]);
    console.log('Collections cleared.');

    // --- Seed Schools ---
    const schools = await School.insertMany(schoolsData);
    console.log(`Seeded ${schools.length} schools.`);

    // --- Seed Workers ---
    const worker1 = await Worker.create({
      name: 'James Okello',
      email: 'worker1@test.com',
      phone: '+256701000001',
      password: 'password123',
      role: 'worker',
      assignedSchools: [schools[0]._id, schools[1]._id, schools[2]._id],
      active: true,
    });

    const worker2 = await Worker.create({
      name: 'Grace Auma',
      email: 'worker2@test.com',
      phone: '+256701000002',
      password: 'password123',
      role: 'worker',
      assignedSchools: [schools[3]._id, schools[4]._id, schools[5]._id],
      active: true,
    });

    const admin = await Worker.create({
      name: 'Admin User',
      email: 'admin@test.com',
      phone: '+256701000000',
      password: 'password123',
      role: 'admin',
      assignedSchools: [],
      active: true,
    });

    console.log('Seeded 2 workers + 1 admin.');

    // --- Seed Donor ---
    const donor = await Donor.create({
      name: 'Sarah Johnson',
      email: 'donor@test.com',
      password: 'password123',
      stripeCustomerId: 'cus_mock_001',
      sponsoredSchools: [schools[0]._id],
      totalDonated: 15000, // $150.00 in cents
      receiveUpdates: true,
    });
    console.log('Seeded 1 donor.');

    // Update the sponsored school
    await School.findByIdAndUpdate(schools[0]._id, { sponsor: donor._id });

    // --- Seed Spray Reports ---
    const reportData = [
      {
        school: schools[0]._id,
        worker: worker1._id,
        date: new Date('2026-02-10'),
        roomsSprayed: 8,
        photos: ['https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/report1.jpg'],
        notes: 'Completed north wing. Good coverage on all surfaces.',
        gpsCoords: { lat: 2.7746, lng: 32.2990 },
        verified: true,
      },
      {
        school: schools[0]._id,
        worker: worker1._id,
        date: new Date('2026-03-05'),
        roomsSprayed: 6,
        photos: ['https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/report2.jpg'],
        notes: 'South wing complete. Minor repairs needed on 2 window screens.',
        gpsCoords: { lat: 2.7748, lng: 32.2992 },
        verified: true,
      },
      {
        school: schools[1]._id,
        worker: worker1._id,
        date: new Date('2026-02-20'),
        roomsSprayed: 12,
        photos: [],
        notes: 'Full school spray completed in single session.',
        gpsCoords: { lat: 2.2499, lng: 32.5339 },
        verified: false,
      },
      {
        school: schools[3]._id,
        worker: worker2._id,
        date: new Date('2026-03-01'),
        roomsSprayed: 10,
        photos: ['https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/report4.jpg'],
        notes: 'Classrooms and staff quarters sprayed.',
        gpsCoords: { lat: 0.4244, lng: 33.2026 },
        verified: true,
      },
      {
        school: schools[4]._id,
        worker: worker2._id,
        date: new Date('2026-03-15'),
        roomsSprayed: 7,
        photos: [],
        notes: 'First phase — remaining rooms scheduled for next visit.',
        gpsCoords: { lat: 1.0649, lng: 34.1755 },
        verified: false,
      },
    ];

    const reports = await SprayReport.insertMany(reportData);
    console.log(`Seeded ${reports.length} spray reports.`);

    // Update lastSprayDate on schools that were sprayed
    await School.findByIdAndUpdate(schools[0]._id, {
      lastSprayDate: new Date('2026-03-05'),
      status: 'active',
    });
    await School.findByIdAndUpdate(schools[1]._id, {
      lastSprayDate: new Date('2026-02-20'),
      status: 'active',
    });
    await School.findByIdAndUpdate(schools[3]._id, {
      lastSprayDate: new Date('2026-03-01'),
      status: 'active',
    });
    await School.findByIdAndUpdate(schools[4]._id, {
      lastSprayDate: new Date('2026-03-15'),
      status: 'active',
    });

    // --- Seed Donation ---
    await Donation.create({
      donor: donor._id,
      school: schools[0]._id,
      amount: 15000,
      currency: 'usd',
      stripePaymentId: 'mock_pi_seed_001',
      recurring: false,
      status: 'completed',
    });
    console.log('Seeded 1 donation.');

    // --- Summary ---
    console.log('\n--- Seed Complete ---');
    console.log('Test accounts:');
    console.log('  Worker 1: worker1@test.com / password123');
    console.log('  Worker 2: worker2@test.com / password123');
    console.log('  Admin:    admin@test.com   / password123');
    console.log('  Donor:    donor@test.com   / password123');
    console.log('--------------------\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
