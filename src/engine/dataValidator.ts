import { UnifiedStudent, Department, AcademicYear, Semester } from '../types/student';

export type DatasetCategory =
  | 'academic'
  | 'attendance'
  | 'lms'
  | 'engagement'
  | 'placement'
  | 'skills'
  | 'feedback'
  | 'identity';

export interface ValidationError {
  row: number;
  student_id: string;
  field: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  duplicateIds: string[];
  parsedRecords: Record<string, any>[];
  missingRequiredFields: string[];
}

export interface MergeResult {
  totalExisting: number;
  updatedStudents: number;
  newStudentsAdded: number;
  unmatchedRows: string[];
  conflictCount: number;
  mergedStudents: UnifiedStudent[];
}

/**
 * Standard schemas for each data category
 */
export const CATEGORY_SCHEMAS: Record<DatasetCategory, { name: string; requiredFields: string[]; sampleHeaders: string[] }> = {
  identity: {
    name: 'Student Identity',
    requiredFields: ['student_id', 'name', 'department'],
    sampleHeaders: ['student_id', 'name', 'department', 'academic_year', 'semester', 'email'],
  },
  academic: {
    name: 'Academic Records',
    requiredFields: ['student_id'],
    sampleHeaders: ['student_id', 'cgpa', 'internal_marks', 'backlogs'],
  },
  attendance: {
    name: 'Attendance Telemetry',
    requiredFields: ['student_id', 'overall_attendance'],
    sampleHeaders: ['student_id', 'overall_attendance'],
  },
  lms: {
    name: 'LMS Engagement Logs',
    requiredFields: ['student_id'],
    sampleHeaders: ['student_id', 'lms_logins', 'assignment_completion'],
  },
  engagement: {
    name: 'Co-curricular & Certifications',
    requiredFields: ['student_id'],
    sampleHeaders: ['student_id', 'events_participated', 'club_participation', 'hackathons', 'certifications'],
  },
  placement: {
    name: 'Placement Diagnostic Assessments',
    requiredFields: ['student_id'],
    sampleHeaders: ['student_id', 'aptitude_score', 'coding_score', 'mock_interview_score', 'placement_preparation_participation'],
  },
  skills: {
    name: 'Skill Matrix Assessment',
    requiredFields: ['student_id'],
    sampleHeaders: ['student_id', 'technical_skill_score', 'soft_skill_score'],
  },
  feedback: {
    name: 'Student & Faculty Feedback',
    requiredFields: ['student_id'],
    sampleHeaders: ['student_id', 'student_satisfaction', 'faculty_feedback'],
  },
};

/**
 * Parse raw CSV string into rows and header columns
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawTokens = lines[i].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = rawTokens[idx] ?? '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Validate parsed rows against institutional rules and ranges
 */
export function validateDataset(
  category: DatasetCategory,
  headers: string[],
  rows: Record<string, string>[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const duplicateIds: string[] = [];
  const seenIds = new Set<string>();
  const parsedRecords: Record<string, any>[] = [];

  const schema = CATEGORY_SCHEMAS[category];
  const missingRequired = schema.requiredFields.filter(req => !headers.includes(req));

  rows.forEach((row, index) => {
    const rowNum = index + 2; // account for 1-based index and header
    const rawId = row['student_id']?.trim().toUpperCase();

    if (!rawId) {
      errors.push({
        row: rowNum,
        student_id: 'UNKNOWN',
        field: 'student_id',
        value: '',
        message: 'Missing student ID identifier.',
        severity: 'error',
      });
      return;
    }

    if (seenIds.has(rawId)) {
      duplicateIds.push(rawId);
      errors.push({
        row: rowNum,
        student_id: rawId,
        field: 'student_id',
        value: rawId,
        message: `Duplicate student ID "${rawId}" detected in uploaded dataset.`,
        severity: 'warning',
      });
    } else {
      seenIds.add(rawId);
    }

    const cleanedRecord: Record<string, any> = { student_id: rawId };
    let hasFatalError = false;

    // Field-specific range and type validations
    for (const [key, rawVal] of Object.entries(row)) {
      if (key === 'student_id') continue;
      const valStr = rawVal.trim();

      // Empty values treated as null (NOT zero!)
      if (valStr === '' || valStr.toLowerCase() === 'null' || valStr.toLowerCase() === 'na' || valStr.toLowerCase() === 'n/a') {
        cleanedRecord[key] = null;
        continue;
      }

      // 1. CGPA Range 0.0 - 10.0
      if (key === 'cgpa') {
        const num = parseFloat(valStr);
        if (isNaN(num) || num < 0 || num > 10) {
          errors.push({
            row: rowNum,
            student_id: rawId,
            field: 'cgpa',
            value: valStr,
            message: `Invalid CGPA value (${valStr}). Must be a decimal between 0.00 and 10.00.`,
            severity: 'error',
          });
          hasFatalError = true;
        } else {
          cleanedRecord[key] = num;
        }
      }
      // 2. Percentage Metrics 0 - 100
      else if (
        [
          'internal_marks',
          'overall_attendance',
          'assignment_completion',
          'aptitude_score',
          'coding_score',
          'mock_interview_score',
          'technical_skill_score',
          'soft_skill_score',
        ].includes(key)
      ) {
        const num = parseFloat(valStr);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push({
            row: rowNum,
            student_id: rawId,
            field: key,
            value: valStr,
            message: `Invalid percentage score for ${key} (${valStr}). Must be between 0 and 100.`,
            severity: 'error',
          });
          hasFatalError = true;
        } else {
          cleanedRecord[key] = num;
        }
      }
      // 3. Integer counts >= 0
      else if (['backlogs', 'lms_logins', 'events_participated', 'club_participation', 'hackathons', 'certifications'].includes(key)) {
        const num = parseInt(valStr, 10);
        if (isNaN(num) || num < 0) {
          errors.push({
            row: rowNum,
            student_id: rawId,
            field: key,
            value: valStr,
            message: `Invalid count value for ${key} (${valStr}). Must be a non-negative integer.`,
            severity: 'error',
          });
          hasFatalError = true;
        } else {
          cleanedRecord[key] = num;
        }
      }
      // 4. Student Satisfaction 1 - 5
      else if (key === 'student_satisfaction') {
        const num = parseFloat(valStr);
        if (isNaN(num) || num < 1 || num > 5) {
          errors.push({
            row: rowNum,
            student_id: rawId,
            field: key,
            value: valStr,
            message: `Satisfaction rating must be on a 1.0 to 5.0 scale. Found: ${valStr}`,
            severity: 'error',
          });
          hasFatalError = true;
        } else {
          cleanedRecord[key] = num;
        }
      }
      // 5. Booleans
      else if (key === 'placement_preparation_participation') {
        const lower = valStr.toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(lower)) cleanedRecord[key] = true;
        else if (['false', '0', 'no', 'n'].includes(lower)) cleanedRecord[key] = false;
        else cleanedRecord[key] = null;
      }
      // Standard string values
      else {
        cleanedRecord[key] = valStr;
      }
    }

    if (!hasFatalError) {
      parsedRecords.push(cleanedRecord);
    }
  });

  return {
    totalRows: rows.length,
    validRows: parsedRecords.length,
    invalidRows: rows.length - parsedRecords.length,
    errors,
    duplicateIds: Array.from(new Set(duplicateIds)),
    parsedRecords,
    missingRequiredFields: missingRequired,
  };
}

/**
 * Re-computes data quality fields for a unified student profile
 */
export function recalculateStudentDataQuality(student: UnifiedStudent): void {
  const fieldsToCheck = [
    student.academic.cgpa,
    student.academic.internal_marks,
    student.academic.backlogs,
    student.attendance.overall_attendance,
    student.lms.lms_logins,
    student.lms.assignment_completion,
    student.engagement.events_participated,
    student.placement.aptitude_score,
    student.placement.coding_score,
    student.placement.mock_interview_score,
    student.skills.technical_skill_score,
    student.skills.soft_skill_score,
    student.feedback.student_satisfaction,
  ];

  const missingLabels: string[] = [];
  if (student.academic.cgpa === null) missingLabels.push('Academic CGPA');
  if (student.attendance.overall_attendance === null) missingLabels.push('Attendance');
  if (student.lms.assignment_completion === null) missingLabels.push('LMS Assignments');
  if (student.placement.aptitude_score === null) missingLabels.push('Placement Aptitude');
  if (student.placement.coding_score === null) missingLabels.push('Placement Coding');
  if (student.skills.technical_skill_score === null) missingLabels.push('Technical Skills');

  const availableCount = fieldsToCheck.filter(f => f !== null).length;
  const totalCount = fieldsToCheck.length;
  const completeness = Math.round((availableCount / totalCount) * 100);

  student.data_quality = {
    available_fields: availableCount,
    total_fields: totalCount,
    missing_fields: missingLabels,
    data_completeness_percentage: completeness,
    has_minimum_evidence: completeness >= 50,
  };
}

/**
 * Merges validated category records into current existing students
 */
export function mergeValidatedRecords(
  existingStudents: UnifiedStudent[],
  category: DatasetCategory,
  validatedRecords: Record<string, any>[],
  conflictResolution: 'merge' | 'overwrite' | 'preserve' = 'merge'
): MergeResult {
  const studentMap = new Map<string, UnifiedStudent>();
  existingStudents.forEach(s => studentMap.set(s.student_id.toUpperCase(), JSON.parse(JSON.stringify(s))));

  let updatedCount = 0;
  let newAddedCount = 0;
  const unmatchedRows: string[] = [];
  let conflictCount = 0;

  validatedRecords.forEach(record => {
    const sId = record.student_id.toUpperCase();
    const existing = studentMap.get(sId);

    if (existing) {
      let modified = false;

      // Update specific category fields
      if (category === 'academic') {
        if (record.cgpa !== undefined && (conflictResolution === 'overwrite' || existing.academic.cgpa === null)) {
          if (existing.academic.cgpa !== null && existing.academic.cgpa !== record.cgpa) conflictCount++;
          existing.academic.cgpa = record.cgpa;
          modified = true;
        }
        if (record.internal_marks !== undefined && (conflictResolution === 'overwrite' || existing.academic.internal_marks === null)) {
          existing.academic.internal_marks = record.internal_marks;
          modified = true;
        }
        if (record.backlogs !== undefined && (conflictResolution === 'overwrite' || existing.academic.backlogs === null)) {
          existing.academic.backlogs = record.backlogs;
          modified = true;
        }
      } else if (category === 'attendance') {
        if (record.overall_attendance !== undefined) {
          if (existing.attendance.overall_attendance !== null && existing.attendance.overall_attendance !== record.overall_attendance) conflictCount++;
          if (conflictResolution === 'overwrite' || existing.attendance.overall_attendance === null) {
            existing.attendance.overall_attendance = record.overall_attendance;
            modified = true;
          }
        }
      } else if (category === 'lms') {
        if (record.lms_logins !== undefined && (conflictResolution === 'overwrite' || existing.lms.lms_logins === null)) {
          existing.lms.lms_logins = record.lms_logins;
          modified = true;
        }
        if (record.assignment_completion !== undefined && (conflictResolution === 'overwrite' || existing.lms.assignment_completion === null)) {
          existing.lms.assignment_completion = record.assignment_completion;
          modified = true;
        }
      } else if (category === 'placement') {
        if (record.aptitude_score !== undefined) existing.placement.aptitude_score = record.aptitude_score;
        if (record.coding_score !== undefined) existing.placement.coding_score = record.coding_score;
        if (record.mock_interview_score !== undefined) existing.placement.mock_interview_score = record.mock_interview_score;
        if (record.placement_preparation_participation !== undefined) existing.placement.placement_preparation_participation = record.placement_preparation_participation;
        modified = true;
      } else if (category === 'skills') {
        if (record.technical_skill_score !== undefined) existing.skills.technical_skill_score = record.technical_skill_score;
        if (record.soft_skill_score !== undefined) existing.skills.soft_skill_score = record.soft_skill_score;
        modified = true;
      } else if (category === 'feedback') {
        if (record.student_satisfaction !== undefined) existing.feedback.student_satisfaction = record.student_satisfaction;
        if (record.faculty_feedback !== undefined) existing.feedback.faculty_feedback = record.faculty_feedback;
        modified = true;
      }

      if (modified) {
        recalculateStudentDataQuality(existing);
        updatedCount++;
      }
    } else {
      // Record has no matching existing student
      if (category === 'identity') {
        // We can create a new student skeleton if identity data provided
        const newStudent: UnifiedStudent = {
          student_id: sId,
          name: record.name || `Student ${sId}`,
          department: (record.department as Department) || 'Computer Science',
          academic_year: (record.academic_year as AcademicYear) || '3rd Year',
          semester: (record.semester as Semester) || 'Sem 6',
          email: record.email || `${sId.toLowerCase()}@university.edu`,
          academic: { cgpa: null, internal_marks: null, backlogs: 0 },
          attendance: { overall_attendance: null },
          lms: { lms_logins: null, assignment_completion: null },
          engagement: { events_participated: 0, club_participation: 0, hackathons: 0, certifications: 0 },
          placement: { aptitude_score: null, coding_score: null, mock_interview_score: null, placement_preparation_participation: null },
          skills: { technical_skill_score: null, soft_skill_score: null },
          feedback: { student_satisfaction: null, faculty_feedback: null },
          data_quality: {
            available_fields: 0,
            total_fields: 13,
            missing_fields: ['Identity registered, metrics pending'],
            data_completeness_percentage: 15,
            has_minimum_evidence: false,
          },
          interventions: [],
        };
        recalculateStudentDataQuality(newStudent);
        studentMap.set(sId, newStudent);
        newAddedCount++;
      } else {
        unmatchedRows.push(sId);
      }
    }
  });

  return {
    totalExisting: existingStudents.length,
    updatedStudents: updatedCount,
    newStudentsAdded: newAddedCount,
    unmatchedRows,
    conflictCount,
    mergedStudents: Array.from(studentMap.values()),
  };
}
