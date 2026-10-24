import { Router, Request, Response } from 'express';
import Student from '../models/Student';
import { generateToken, requireAuth, AuthUser } from '../middleware/auth';
import { FEATURED_DEMO_FACULTY } from '../../src/data/portalData';

const router = Router();

// POST /api/auth/login - Authenticate institutional users (Admin, Faculty, Student)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { role, username, email, password, student_id } = req.body;

    if (!role || !['admin', 'faculty', 'student', 'tpo'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be "admin", "faculty", "student", or "tpo".',
      });
    }

    // 1. ADMIN AUTHENTICATION
    if (role === 'admin') {
      const adminEmail = (email || username || 'admin@edupulse.edu').trim();
      const adminPass = (password || '').trim();

      if (!adminPass) {
        return res.status(400).json({
          success: false,
          message: 'Password is required for Administrator authentication.',
        });
      }

      const user: AuthUser = {
        id: 'admin_root_1',
        name: 'Dean of Academic Affairs',
        role: 'admin',
        email: adminEmail,
        department: 'Institutional Governance',
      };

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Administrator authenticated successfully.',
        token,
        user,
      });
    }

    // 2. FACULTY AUTHENTICATION
    if (role === 'faculty') {
      const q = (username || email || '').trim().toLowerCase();
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Faculty name or email is required.',
        });
      }

      const matchedFaculty = FEATURED_DEMO_FACULTY.find(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          f.department.toLowerCase().includes(q)
      );

      const facultyName = matchedFaculty ? matchedFaculty.name : username || 'Faculty Advisor';
      const facultyDept = matchedFaculty ? matchedFaculty.department : 'Computer Science';
      const facultyEmail = matchedFaculty ? matchedFaculty.email : `${q.replace(/\s+/g, '.')}@edupulse.edu`;

      const user: AuthUser = {
        id: matchedFaculty ? matchedFaculty.id : `fac_${Date.now()}`,
        name: facultyName,
        role: 'faculty',
        email: facultyEmail,
        department: facultyDept,
      };

      const token = generateToken(user);
      return res.json({
        success: true,
        message: `Faculty member "${facultyName}" authenticated successfully.`,
        token,
        user,
      });
    }

    // 3. STUDENT AUTHENTICATION (Verifies against MongoDB Student collection)
    if (role === 'student') {
      const queryId = (student_id || username || '').trim();
      if (!queryId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, roll number, or name is required.',
        });
      }

      // Look up student in MongoDB Atlas
      const student = await Student.findOne({
        $or: [
          { student_id: { $regex: `^${queryId}$`, $options: 'i' } },
          { name: { $regex: queryId, $options: 'i' } },
          { email: { $regex: `^${queryId}$`, $options: 'i' } },
        ],
      }).lean();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student "${queryId}" was not found in the campus database.`,
        });
      }

      const user: AuthUser = {
        id: student._id?.toString() || student.student_id,
        name: student.name,
        role: 'student',
        student_id: student.student_id,
        email: student.email,
        department: student.department,
      };

      const token = generateToken(user);
      return res.json({
        success: true,
        message: `Student "${student.name}" authenticated successfully.`,
        token,
        user,
        student,
      });
    }

    // 4. TRAINING & PLACEMENT OFFICER (TPO) AUTHENTICATION
    if (role === 'tpo') {
      const tpoEmail = (email || username || 'tpo@edupulse.edu').trim();
      const user: AuthUser = {
        id: 'tpo_officer_1',
        name: 'Prof. Vikram Malhotra',
        role: 'tpo',
        email: tpoEmail,
        department: 'Corporate Relations & Career Advisory Cell',
      };

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Training & Placement Officer authenticated successfully.',
        token,
        user,
      });
    }
  } catch (err: any) {
    console.error('Auth login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication processing failed on server.',
      error: err.message,
    });
  }
});

// GET /api/auth/me - Retrieve currently authenticated user profile
router.get('/me', requireAuth, (req: Request, res: Response) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

export default router;
