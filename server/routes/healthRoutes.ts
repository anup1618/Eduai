import { Router, Request, Response } from 'express';
import { getDbStatus } from '../config/db';
import Student from '../models/Student';
import Intervention from '../models/Intervention';
import Setting from '../models/Setting';
import { INITIAL_STUDENTS } from '../../src/data/initialStudents';
import { DEFAULT_WEIGHTS } from '../../src/engine/scoringEngine';
import { DEFAULT_ACADEMIC_THRESHOLDS } from '../../src/engine/academicRiskEngine';
import { DEFAULT_PLACEMENT_THRESHOLDS } from '../../src/engine/placementRiskEngine';

const router = Router();

// GET database and server health
router.get('/', async (_req: Request, res: Response) => {
  const dbStatus = getDbStatus();

  let studentCount = 0;
  let interventionCount = 0;

  if (dbStatus.isConnected) {
    try {
      studentCount = await Student.countDocuments();
      interventionCount = await Intervention.countDocuments();
    } catch (e) {
      console.error('Error counting documents:', e);
    }
  }

  return res.json({
    success: true,
    server: 'running',
    timestamp: new Date().toISOString(),
    database: {
      ...dbStatus,
      studentCount,
      interventionCount,
    },
  });
});

// POST seed / reset database with demo dataset
router.post('/seed', async (_req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not currently connected. Please verify connection string in .env and ensure MongoDB service is running.',
      database: dbStatus,
    });
  }

  try {
    // 1. Clear existing collections
    await Student.deleteMany({});
    await Intervention.deleteMany({});
    await Setting.deleteMany({});

    // 2. Insert students
    await Student.insertMany(INITIAL_STUDENTS);

    // 3. Extract and insert initial interventions
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

    if (initialList.length > 0) {
      await Intervention.insertMany(initialList);
    }

    // 4. Save default settings
    await Setting.create({
      key: 'global_settings',
      weights: DEFAULT_WEIGHTS,
      academicThresholds: DEFAULT_ACADEMIC_THRESHOLDS,
      placementThresholds: DEFAULT_PLACEMENT_THRESHOLDS,
    });

    return res.json({
      success: true,
      message: `Database successfully seeded with ${INITIAL_STUDENTS.length} students, ${initialList.length} interventions, and default calibration settings.`,
      seeded: {
        students: INITIAL_STUDENTS.length,
        interventions: initialList.length,
      },
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message,
    });
  }
});

export default router;
