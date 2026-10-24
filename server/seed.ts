import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db';
import Student from './models/Student';
import Intervention from './models/Intervention';
import Setting from './models/Setting';
import { INITIAL_STUDENTS } from '../src/data/initialStudents';
import { DEFAULT_WEIGHTS } from '../src/engine/scoringEngine';
import { DEFAULT_ACADEMIC_THRESHOLDS } from '../src/engine/academicRiskEngine';
import { DEFAULT_PLACEMENT_THRESHOLDS } from '../src/engine/placementRiskEngine';

dotenv.config();

const runSeed = async () => {
  console.log('--- EduPulse AI MongoDB Seeding Script ---');
  const connected = await connectDB();
  if (!connected) {
    console.error('Cannot seed: Failed to connect to MongoDB. Check MONGODB_URI in your .env file.');
    process.exit(1);
  }

  try {
    console.log('Clearing existing collections...');
    await Student.deleteMany({});
    await Intervention.deleteMany({});
    await Setting.deleteMany({});

    console.log(`Inserting ${INITIAL_STUDENTS.length} unified student profiles...`);
    await Student.insertMany(INITIAL_STUDENTS);

    const initialList: any[] = [];
    INITIAL_STUDENTS.forEach((s) => {
      s.interventions.forEach((h) => {
        initialList.push({
          id: h.id,
          student_id: s.student_id,
          student_name: s.name,
          department: s.department,
          category: h.category,
          title: `${h.category} for ${s.name}`,
          description: h.description,
          faculty_assigned: h.faculty_assigned,
          target_date: h.target_date,
          status: h.status,
          created_at: h.created_at,
          updated_at: h.created_at,
          notes: (h.follow_up_notes || []).map((n, idx) => ({
            id: `NOTE-${idx}`,
            author: h.faculty_assigned,
            note: n,
            created_at: h.created_at,
          })),
        });
      });
    });

    console.log(`Inserting ${initialList.length} intervention records...`);
    if (initialList.length > 0) {
      await Intervention.insertMany(initialList);
    }

    console.log('Inserting default calibration weights & thresholds...');
    await Setting.create({
      key: 'global_settings',
      weights: DEFAULT_WEIGHTS,
      academicThresholds: DEFAULT_ACADEMIC_THRESHOLDS,
      placementThresholds: DEFAULT_PLACEMENT_THRESHOLDS,
    });

    console.log(' Seeding completed successfully!');
    console.log(`- Students: ${INITIAL_STUDENTS.length}`);
    console.log(`- Interventions: ${initialList.length}`);
    console.log(`- Platform Settings: saved`);
  } catch (err: any) {
    console.error('Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
};

runSeed();
