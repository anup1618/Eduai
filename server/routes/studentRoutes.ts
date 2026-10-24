import { Router, Request, Response } from 'express';
import * as XLSX from 'xlsx';
import Student from '../models/Student';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET all students (Protected by Role Scoping)
// - Admin: Can access all students
// - Faculty: Can access campus/department students
// - Student: Can ONLY access their own student record
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { department, search } = req.query;
    const filter: Record<string, any> = {};

    // Strict Role Scoping:
    // If student, they can NEVER query other students' data!
    if (req.user?.role === 'student') {
      filter.student_id = req.user.student_id;
    } else {
      if (department && department !== 'All') {
        filter.department = department;
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim();
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { student_id: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ];
      }
    }

    const students = await Student.find(filter).lean();
    return res.json({
      success: true,
      count: students.length,
      data: students,
      scope: req.user?.role,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch students from MongoDB',
      error: error.message,
    });
  }
});

// GET single student by student_id
// - If student role, they can ONLY access their own ID
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const requestedId = req.params.id.trim();

    if (
      req.user?.role === 'student' &&
      requestedId.toUpperCase() !== req.user.student_id?.toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Students are restricted from viewing other students records.',
      });
    }

    const student = await Student.findOne({ student_id: requestedId }).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${requestedId} not found`,
      });
    }
    return res.json({ success: true, data: student });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving student',
      error: error.message,
    });
  }
});

// POST /api/students/upload - Secure Backend Spreadsheet Ingestion (Admin Only)
// Parses Excel (.xlsx, .xls) or CSV on backend, validates, and persists to MongoDB Atlas
router.post('/upload', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { fileName, fileData, format, conflictMode = 'merge' } = req.body;

    if (!fileData) {
      return res.status(400).json({
        success: false,
        message: 'No spreadsheet file data provided in request body.',
      });
    }

    let workbook: XLSX.WorkBook;
    if (format === 'csv' || (!fileName?.endsWith('.xlsx') && !fileName?.endsWith('.xls') && typeof fileData === 'string' && fileData.includes(','))) {
      workbook = XLSX.read(fileData, { type: 'string' });
    } else {
      // Base64 encoded array buffer
      const buffer = Buffer.from(fileData, 'base64');
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet contains no sheets or valid data.',
      });
    }

    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (rawRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet has 0 data rows.',
      });
    }

    let validCount = 0;
    let newStudentsAdded = 0;
    let updatedStudents = 0;
    const errors: any[] = [];
    const bulkOps: any[] = [];

    // Process and validate rows securely on the server
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const sId = (row['student_id'] || row['Student ID'] || row['Roll No'])?.toString().trim().toUpperCase();

      if (!sId) {
        errors.push({ row: i + 2, message: 'Missing student_id identifier' });
        continue;
      }

      const parseNum = (v: any, min: number, max: number) => {
        if (v === '' || v === null || v === undefined) return null;
        const n = parseFloat(v);
        if (isNaN(n) || n < min || n > max) return null;
        return n;
      };

      const parseCount = (v: any) => {
        if (v === '' || v === null || v === undefined) return 0;
        const n = parseInt(v, 10);
        return isNaN(n) || n < 0 ? 0 : n;
      };

      const name = (row['name'] || row['Name'] || `Student ${sId}`).toString().trim();
      const department = (row['department'] || row['Department'] || 'Computer Science').toString().trim();
      const academic_year = (row['academic_year'] || row['Year'] || '3rd Year').toString().trim();
      const semester = (row['semester'] || row['Semester'] || 'Sem 6').toString().trim();
      const email = (row['email'] || row['Email'] || `${sId.toLowerCase()}@edupulse.edu`).toString().trim();

      const studentDoc: Record<string, any> = {
        student_id: sId,
        name,
        department,
        academic_year,
        semester,
        email,
        academic: {
          cgpa: parseNum(row['cgpa'], 0, 10),
          internal_marks: parseNum(row['internal_marks'], 0, 100),
          backlogs: parseCount(row['backlogs']),
        },
        attendance: {
          overall_attendance: parseNum(row['overall_attendance'], 0, 100),
        },
        lms: {
          lms_logins: parseNum(row['lms_logins'], 0, 1000),
          assignment_completion: parseNum(row['assignment_completion'], 0, 100),
        },
        engagement: {
          events_participated: parseCount(row['events_participated']),
          club_participation: parseCount(row['club_participation']),
          hackathons: parseCount(row['hackathons']),
          certifications: parseCount(row['certifications']),
        },
        placement: {
          aptitude_score: parseNum(row['aptitude_score'], 0, 100),
          coding_score: parseNum(row['coding_score'], 0, 100),
          mock_interview_score: parseNum(row['mock_interview_score'], 0, 100),
        },
        skills: {
          technical_skill_score: parseNum(row['technical_skill_score'], 0, 100),
          soft_skill_score: parseNum(row['soft_skill_score'], 0, 100),
        },
        feedback: {
          student_satisfaction: parseNum(row['student_satisfaction'], 1, 5),
          faculty_feedback: row['faculty_feedback'] ? String(row['faculty_feedback']).trim() : null,
        },
        data_quality: {
          available_fields: 10,
          total_fields: 13,
          missing_fields: [],
          data_completeness_percentage: 80,
          has_minimum_evidence: true,
        },
      };

      bulkOps.push({
        updateOne: {
          filter: { student_id: sId },
          update: { $set: studentDoc },
          upsert: true,
        },
      });

      validCount++;
    }

    if (bulkOps.length > 0) {
      const result = await Student.bulkWrite(bulkOps);
      newStudentsAdded = result.upsertedCount;
      updatedStudents = result.modifiedCount;
      console.log(`[Audit] Admin (${req.user?.email || 'admin'}) securely ingested ${validCount} student records.`);
    }

    const currentTotal = await Student.countDocuments();

    return res.json({
      success: true,
      message: `Spreadsheet processed securely on backend: ${newStudentsAdded} new students created, ${updatedStudents} updated.`,
      result: {
        totalRows: rawRows.length,
        validRows: validCount,
        newStudentsAdded,
        updatedStudents,
        totalInDatabase: currentTotal,
        errors,
      },
    });
  } catch (error: any) {
    console.error('Error processing spreadsheet on backend:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process spreadsheet file on server',
      error: error.message,
    });
  }
});

// POST create or upsert single student (Admin & Faculty Only)
router.post('/', requireAuth, requireRole(['admin', 'faculty']), async (req: Request, res: Response) => {
  try {
    const studentData = req.body;
    if (!studentData.student_id || !studentData.name) {
      return res.status(400).json({
        success: false,
        message: 'student_id and name are required fields',
      });
    }

    const updated = await Student.findOneAndUpdate(
      { student_id: studentData.student_id },
      studentData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Student saved successfully',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save student',
      error: error.message,
    });
  }
});

// POST bulk upsert students (Admin & Faculty Only)
router.post('/bulk', requireAuth, requireRole(['admin', 'faculty']), async (req: Request, res: Response) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain a non-empty array of students',
      });
    }

    const bulkOps = students.map((s) => ({
      updateOne: {
        filter: { student_id: s.student_id },
        update: { $set: s },
        upsert: true,
      },
    }));

    const result = await Student.bulkWrite(bulkOps);

    return res.json({
      success: true,
      message: `Bulk upsert completed: ${result.upsertedCount} inserted, ${result.modifiedCount} modified`,
      result: {
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      },
    });
  } catch (error: any) {
    console.error('Error in bulk student save:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk upsert students',
      error: error.message,
    });
  }
});

// PUT update student by student_id (Admin & Faculty Only)
router.put('/:id', requireAuth, requireRole(['admin', 'faculty']), async (req: Request, res: Response) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { student_id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found`,
      });
    }

    return res.json({
      success: true,
      message: 'Student updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
});

// DELETE student by student_id (Admin Only)
router.delete('/:id', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const deleted = await Student.findOneAndDelete({ student_id: req.params.id });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found`,
      });
    }

    return res.json({
      success: true,
      message: `Student ${req.params.id} deleted successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
});

export default router;
