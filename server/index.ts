import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { getDbStatus } from './config/db';
import studentRoutes from './routes/studentRoutes';
import interventionRoutes from './routes/interventionRoutes';
import settingsRoutes from './routes/settingsRoutes';
import healthRoutes from './routes/healthRoutes';
import studyAssistantRoutes from './routes/studyAssistantRoutes';
import problemRoutes from './routes/problemRoutes';
import Student from './models/Student';
import Intervention from './models/Intervention';
import Setting from './models/Setting';
import Problem from './models/Problem';
import { DEMO_PROBLEMS } from '../src/data/portalData';
import { INITIAL_STUDENTS } from '../src/data/initialStudents';
import { DEFAULT_WEIGHTS } from '../src/engine/scoringEngine';
import { DEFAULT_ACADEMIC_THRESHOLDS } from '../src/engine/academicRiskEngine';
import { DEFAULT_PLACEMENT_THRESHOLDS } from '../src/engine/placementRiskEngine';

import authRoutes from './routes/authRoutes';
import { authenticate } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(authenticate);

// Request logger for development
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    const userRole = req.user?.role ? ` [${req.user.role}]` : ' [public]';
    console.log(`[API] ${req.method} ${req.path}${userRole}`);
  }
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/study-assistant', studyAssistantRoutes);
app.use('/api/problems', problemRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'EduPulse AI API Server',
    status: 'Online',
    database: getDbStatus(),
    docs: {
      health: '/api/health',
      students: '/api/students',
      interventions: '/api/interventions',
      settings: '/api/settings',
    },
  });
});

// Auto-seed helper if MongoDB is connected and collection is empty
const autoSeedIfEmpty = async () => {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('[MongoDB] Database is empty. Auto-seeding initial student dataset...');
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

      if (initialList.length > 0) {
        await Intervention.insertMany(initialList);
      }

      await Setting.findOneAndUpdate(
        { key: 'global_settings' },
        {
          key: 'global_settings',
          weights: DEFAULT_WEIGHTS,
          academicThresholds: DEFAULT_ACADEMIC_THRESHOLDS,
          placementThresholds: DEFAULT_PLACEMENT_THRESHOLDS,
        },
        { upsert: true }
      );

      console.log(`[MongoDB] Auto-seeded ${INITIAL_STUDENTS.length} students & ${initialList.length} interventions successfully!`);
    } else {
      console.log(`[MongoDB] Existing database found with ${studentCount} students.`);
    }

    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      await Problem.insertMany(DEMO_PROBLEMS);
      console.log(`[MongoDB] Auto-seeded ${DEMO_PROBLEMS.length} problem requests successfully!`);
    }
  } catch (e: any) {
    console.error('[MongoDB] Auto-seed check error:', e.message);
  }
};

// Start Server and initialize DB
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await autoSeedIfEmpty();
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(` EduPulse AI MongoDB API Server running on:    `);
    console.log(` http://localhost:${PORT}                      `);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  server.on('error', (err: any) => {
    console.error('[API Server Error]:', err.message);
  });
};

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});

export default app;
