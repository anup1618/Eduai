import { Router, Request, Response } from 'express';
import Intervention from '../models/Intervention';
import Student from '../models/Student';

const router = Router();

// GET all interventions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { student_id, status } = req.query;
    const filter: Record<string, any> = {};

    if (student_id) filter.student_id = student_id;
    if (status && status !== 'All') filter.status = status;

    const interventions = await Intervention.find(filter).sort({ created_at: -1 }).lean();
    return res.json({
      success: true,
      count: interventions.length,
      data: interventions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interventions',
      error: error.message,
    });
  }
});

// POST create intervention
router.post('/', async (req: Request, res: Response) => {
  try {
    const item = req.body;
    if (!item.student_id || !item.category || !item.description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required intervention fields (student_id, category, description)',
      });
    }

    const id = item.id || `INT-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newIntervention = await Intervention.create({
      id,
      student_id: item.student_id,
      student_name: item.student_name,
      department: item.department,
      category: item.category,
      title: item.title || `${item.category} for ${item.student_name}`,
      description: item.description,
      faculty_assigned: item.faculty_assigned,
      target_date: item.target_date,
      status: item.status || 'Planned',
      created_at: item.created_at || today,
      updated_at: item.updated_at || today,
      notes: item.notes || [],
      outcome_notes: item.outcome_notes || '',
    });

    // Also append intervention to student document if student exists
    await Student.updateOne(
      { student_id: item.student_id },
      {
        $push: {
          interventions: {
            id,
            category: item.category,
            description: item.description,
            faculty_assigned: item.faculty_assigned,
            target_date: item.target_date,
            status: item.status || 'Planned',
            created_at: item.created_at || today,
            follow_up_notes: [],
          },
        },
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Intervention created successfully',
      data: newIntervention,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create intervention',
      error: error.message,
    });
  }
});

// PUT update intervention status or notes
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, followUpNote, notes, outcome_notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const existing = await Intervention.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Intervention ${req.params.id} not found`,
      });
    }

    if (status) existing.status = status;
    if (outcome_notes !== undefined) existing.outcome_notes = outcome_notes;
    if (notes) existing.notes = notes;
    if (followUpNote && typeof followUpNote === 'string' && followUpNote.trim()) {
      existing.notes.push({
        id: `NOTE-${Date.now()}`,
        author: existing.faculty_assigned || 'Faculty Advisor',
        note: followUpNote.trim(),
        created_at: today,
      });
    }
    existing.updated_at = today;

    await existing.save();

    // Also update student's nested intervention record
    if (status) {
      await Student.updateOne(
        { student_id: existing.student_id, 'interventions.id': existing.id },
        {
          $set: {
            'interventions.$.status': status,
          },
        }
      );
    }

    return res.json({
      success: true,
      message: 'Intervention updated',
      data: existing,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update intervention',
      error: error.message,
    });
  }
});

// DELETE intervention
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await Intervention.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Intervention ${req.params.id} not found`,
      });
    }

    // Pull from student interventions array
    await Student.updateOne(
      { student_id: deleted.student_id },
      { $pull: { interventions: { id: deleted.id } } }
    );

    return res.json({
      success: true,
      message: `Intervention ${req.params.id} deleted successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete intervention',
      error: error.message,
    });
  }
});

export default router;
