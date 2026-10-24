import express, { Request, Response } from 'express';
import Problem from '../models/Problem';
import { DEMO_PROBLEMS, ProblemRequest } from '../../src/data/portalData';
import { isDbConnected } from '../config/db';

const router = express.Router();

// In-memory fallback if MongoDB is offline or disconnected
let memoryProblems: ProblemRequest[] = [...DEMO_PROBLEMS];

// GET /api/problems - List all problem requests
router.get('/', async (req: Request, res: Response) => {
  try {
    const { faculty, roll } = req.query;

    if (isDbConnected()) {
      const query: Record<string, any> = {};
      if (faculty && typeof faculty === 'string') {
        query.faculty = { $regex: new RegExp(faculty, 'i') };
      }
      if (roll && typeof roll === 'string') {
        query.roll = roll;
      }

      const count = await Problem.countDocuments();
      if (count === 0) {
        await Problem.insertMany(DEMO_PROBLEMS);
      }

      const problems = await Problem.find(query).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: problems.length,
        data: problems,
      });
    }

    // Offline / in-memory fallback
    let filtered = [...memoryProblems];
    if (faculty && typeof faculty === 'string') {
      const fLower = faculty.toLowerCase();
      filtered = filtered.filter(p => p.faculty.toLowerCase().includes(fLower));
    }
    if (roll && typeof roll === 'string') {
      filtered = filtered.filter(p => p.roll === roll);
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    console.error('[API /api/problems GET] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/problems - Submit a new student problem request
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      student,
      roll,
      subject,
      topic,
      faculty,
      description,
      category = 'Academic Doubt',
      priority = 'Medium',
      status = 'Pending',
      submitted = new Date().toISOString().split('T')[0],
      reply = '',
      next_step = '',
    } = req.body;

    if (!student || !subject || !description || !faculty) {
      return res.status(400).json({
        success: false,
        error: 'student, subject, faculty, and description are required',
      });
    }

    const generatedId = id || `REQ-${String(Date.now()).slice(-4)}`;
    const newProblem: ProblemRequest = {
      id: generatedId,
      student,
      roll: roll || 'N/A',
      subject,
      topic: topic || 'General Query',
      faculty,
      description,
      category,
      priority,
      status,
      submitted,
      reply,
      next_step,
    };

    // Update memory
    memoryProblems = [newProblem, ...memoryProblems.filter(p => p.id !== newProblem.id)];

    if (isDbConnected()) {
      const created = await Problem.findOneAndUpdate(
        { id: newProblem.id },
        newProblem,
        { upsert: true, new: true }
      );
      return res.status(201).json({
        success: true,
        data: created,
      });
    }

    return res.status(201).json({
      success: true,
      data: newProblem,
    });
  } catch (error: any) {
    console.error('[API /api/problems POST] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/problems/:id/reply - Faculty reply to a problem request
router.put('/:id/reply', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply, next_step = '' } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        error: 'Reply text is required',
      });
    }

    // Update memory
    const existingIdx = memoryProblems.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      memoryProblems[existingIdx] = {
        ...memoryProblems[existingIdx],
        reply,
        next_step,
        status: 'Resolved',
      };
    }

    if (isDbConnected()) {
      const updated = await Problem.findOneAndUpdate(
        { id },
        {
          $set: {
            reply,
            next_step,
            status: 'Resolved',
          },
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: `Problem ${id} not found` });
      }

      return res.json({ success: true, data: updated });
    }

    const found = memoryProblems.find(p => p.id === id);
    if (!found) {
      return res.status(404).json({ success: false, error: `Problem ${id} not found` });
    }

    return res.json({ success: true, data: found });
  } catch (error: any) {
    console.error('[API /api/problems/:id/reply] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
