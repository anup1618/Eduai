import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UnifiedStudent } from '../types/student';
import { ScoreWeights } from '../types/scoring';
import { AcademicRiskThresholds, PlacementRiskThresholds } from '../types/risk';
import { FilterState, INITIAL_FILTERS } from '../types/filter';
import { InterventionItem, InterventionStatus } from '../types/intervention';
import { INITIAL_STUDENTS } from '../data/initialStudents';
import {
  getStudentPortalData,
  StudentPortalProfile,
  FEATURED_DEMO_FACULTY,
  ProblemRequest,
  DEMO_PROBLEMS,
} from '../data/portalData';
import { DEFAULT_WEIGHTS } from '../engine/scoringEngine';
import { DEFAULT_ACADEMIC_THRESHOLDS } from '../engine/academicRiskEngine';
import { DEFAULT_PLACEMENT_THRESHOLDS } from '../engine/placementRiskEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { assignStudentSegment } from '../engine/segmentationEngine';
import { mergeValidatedRecords, DatasetCategory, MergeResult, IngestionResult } from '../engine/dataValidator';
import api, { DatabaseHealth, AuthUserProfile, getAuthToken, setAuthToken } from '../services/api';

export type DbConnectionStatus = 'connected' | 'offline' | 'checking';

interface CampusDataContextType {
  students: UnifiedStudent[];
  filteredStudents: UnifiedStudent[];
  interventions: InterventionItem[];
  weights: ScoreWeights;
  academicThresholds: AcademicRiskThresholds;
  placementThresholds: PlacementRiskThresholds;
  filters: FilterState;
  setFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  selectedStudent: UnifiedStudent | null;
  setSelectedStudent: (student: UnifiedStudent | null) => void;
  loggedInStudent: UnifiedStudent | null;
  setLoggedInStudent: (student: UnifiedStudent | null) => void;
  loggedInFacultyIdx: number;
  setLoggedInFacultyIdx: (idx: number) => void;
  currentStudentProfile: StudentPortalProfile;
  selectStudentForPortal: (studentOrId: UnifiedStudent | string) => void;
  addIntervention: (item: {
    student_id: string;
    student_name: string;
    department: string;
    category: any;
    title: string;
    description: string;
    faculty_assigned: string;
    target_date: string;
  }) => void;
  updateInterventionStatus: (id: string, status: InterventionStatus, followUpNote?: string) => void;
  updateWeights: (newWeights: ScoreWeights) => void;
  updateAcademicThresholds: (newThresholds: AcademicRiskThresholds) => void;
  updatePlacementThresholds: (newThresholds: PlacementRiskThresholds) => void;
  mergeDataRecords: (category: DatasetCategory, records: Record<string, any>[], mode?: 'merge' | 'overwrite' | 'preserve') => Promise<IngestionResult>;
  resetToDemoData: () => void;
  // Problem Requests (Real-time student-to-faculty tickets)
  problemRequests: ProblemRequest[];
  addProblemRequest: (req: ProblemRequest) => Promise<ProblemRequest>;
  replyProblemRequest: (id: string, reply: string, next_step?: string) => Promise<void>;
  updateProblemStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => void;
  refreshProblems: () => Promise<void>;
  // Authentication & Role Scoping
  currentUser: AuthUserProfile | null;
  setCurrentUser: (user: AuthUserProfile | null) => void;
  loginUser: (creds: {
    role: 'admin' | 'faculty' | 'student' | 'tpo';
    username?: string;
    email?: string;
    password?: string;
    student_id?: string;
  }) => Promise<any>;
  logoutUser: () => void;
  uploadSpreadsheetToBackend: (payload: {
    fileName: string;
    fileData: string;
    format: 'xlsx' | 'csv';
    conflictMode?: 'merge' | 'overwrite' | 'preserve';
  }) => Promise<any>;
  // MongoDB database sync integration
  dbStatus: DbConnectionStatus;
  dbHealth: DatabaseHealth | null;
  isSyncing: boolean;
  refreshFromDatabase: () => Promise<boolean>;
  seedToDatabase: () => Promise<boolean>;
}

const CampusDataContext = createContext<CampusDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'edupulse_students_v1',
  INTERVENTIONS: 'edupulse_interventions_v1',
  WEIGHTS: 'edupulse_weights_v1',
  ACAD_THRESH: 'edupulse_acad_thresh_v1',
  PLACE_THRESH: 'edupulse_place_thresh_v1',
  PROBLEMS: 'edupulse_problems_v2',
};

export const CampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial defaults
  const [students, setStudents] = useState<UnifiedStudent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved students:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [interventions, setInterventions] = useState<InterventionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INTERVENTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved interventions:', e);
    }
    // Extract pre-seeded interventions from initial students
    const initialList: InterventionItem[] = [];
    INITIAL_STUDENTS.forEach(s => {
      s.interventions.forEach(h => {
        initialList.push({
          id: h.id,
          student_id: s.student_id,
          student_name: s.name,
          department: s.department,
          category: h.category as any,
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
    return initialList;
  });

  const [weights, setWeights] = useState<ScoreWeights>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_WEIGHTS;
  });

  const [academicThresholds, setAcademicThresholds] = useState<AcademicRiskThresholds>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACAD_THRESH);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ACADEMIC_THRESHOLDS;
  });

  const [placementThresholds, setPlacementThresholds] = useState<PlacementRiskThresholds>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLACE_THRESH);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PLACEMENT_THRESHOLDS;
  });

  const [filters, setFiltersState] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedStudent, setSelectedStudent] = useState<UnifiedStudent | null>(null);

  const [loggedInStudent, setLoggedInStudent] = useState<UnifiedStudent | null>(() => {
    try {
      const saved = localStorage.getItem('edupulse_logged_in_student_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_STUDENTS[0];
  });

  const [loggedInFacultyIdx, setLoggedInFacultyIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('edupulse_logged_in_faculty_v1');
      if (saved !== null) return Number(saved);
    } catch (e) {}
    return 0;
  });

  // Problem Requests state (shared in real-time across Student and Faculty portals)
  const [problemRequests, setProblemRequests] = useState<ProblemRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROBLEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved problems:', e);
    }
    return DEMO_PROBLEMS;
  });

  // Save problems to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(problemRequests));
    } catch (e) {}
  }, [problemRequests]);

  // Fetch problem requests from backend if available
  const refreshProblems = async () => {
    try {
      const res = await api.getProblems();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        // Merge without losing locally added pending tickets
        setProblemRequests(prev => {
          const remoteMap = new Map(res.data.map(p => [p.id, p]));
          const merged = [...res.data];
          for (const localP of prev) {
            if (!remoteMap.has(localP.id)) {
              merged.push(localP);
            }
          }
          return merged;
        });
      }
    } catch (e) {
      // Offline fallback: keep existing localStorage state
    }
  };

  useEffect(() => {
    refreshProblems();
  }, []);

  const addProblemRequest = async (newReq: ProblemRequest): Promise<ProblemRequest> => {
    setProblemRequests(prev => [newReq, ...prev.filter(p => p.id !== newReq.id)]);
    try {
      await api.createProblem(newReq);
    } catch (e) {
      // Saved in state and localStorage regardless
    }
    return newReq;
  };

  const replyProblemRequest = async (id: string, reply: string, next_step?: string): Promise<void> => {
    setProblemRequests(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, reply, next_step: next_step || '', status: 'Resolved' as const }
          : r
      )
    );
    try {
      await api.replyProblem(id, { reply, next_step });
    } catch (e) {
      // Saved in state and localStorage regardless
    }
  };

  const updateProblemStatus = (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
    setProblemRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
  };

  // Current authenticated user (Admin, Faculty, Student)
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('edupulse_current_user_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('edupulse_current_user_v1', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('edupulse_current_user_v1');
      }
    } catch (e) {}
  }, [currentUser]);

  // MongoDB connection & sync state
  const [dbStatus, setDbStatus] = useState<DbConnectionStatus>('checking');
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync / fetch from MongoDB (Auth-aware)
  const refreshFromDatabase = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      // Ensure we have an active auth token. If not, auto-authenticate as admin.
      if (!getAuthToken()) {
        try {
          const authRes = await api.login({ role: 'admin', email: 'admin@edupulse.edu', password: 'admin@123' });
          if (authRes?.user) {
            setCurrentUser(authRes.user);
          }
        } catch (authErr) {
          console.warn('[EduPulse] Auto-auth failed:', authErr);
        }
      }

      const healthRes = await api.checkHealth();
      setDbHealth(healthRes.database);
      if (healthRes.database?.isConnected) {
        setDbStatus('connected');
        const dbStudents = await api.getStudents();
        if (dbStudents && dbStudents.length > 0) {
          setStudents(dbStudents);
        }
        const dbInterventions = await api.getInterventions();
        if (dbInterventions && dbInterventions.length > 0) {
          setInterventions(dbInterventions);
        }
        const dbSettings = await api.getSettings();
        if (dbSettings) {
          if (dbSettings.weights) setWeights(dbSettings.weights);
          if (dbSettings.academicThresholds) setAcademicThresholds(dbSettings.academicThresholds);
          if (dbSettings.placementThresholds) setPlacementThresholds(dbSettings.placementThresholds);
        }
        setIsSyncing(false);
        return true;
      } else {
        setDbStatus('offline');
        setIsSyncing(false);
        return false;
      }
    } catch (e) {
      // Server not running or proxy not responding, fallback gracefully to client localStorage
      setDbStatus('offline');
      setIsSyncing(false);
      return false;
    }
  };

  const loginUser = async (creds: {
    role: 'admin' | 'faculty' | 'student' | 'tpo';
    username?: string;
    email?: string;
    password?: string;
    student_id?: string;
  }) => {
    try {
      const res = await api.login(creds);
      if (res.user) {
        setCurrentUser(res.user);
        if (res.user.role === 'student' && res.student) {
          setLoggedInStudent(res.student);
          setSelectedStudent(res.student);
          setStudents([res.student]);
        } else {
          await refreshFromDatabase();
        }
      }
      return res;
    } catch (apiError: any) {
      console.warn('[EduPulse Auth] API authentication unavailable, activating client fallback:', apiError.message);

      // 1. ADMIN FALLBACK
      if (creds.role === 'admin') {
        const user: AuthUserProfile = {
          id: 'admin_root_1',
          name: 'Dean of Academic Affairs',
          role: 'admin',
          email: creds.email || 'admin@edupulse.edu',
          department: 'Institutional Governance',
        };
        setAuthToken('mock_admin_token_demo');
        setCurrentUser(user);
        return {
          success: true,
          token: 'mock_admin_token_demo',
          user,
        };
      }

      // 2. FACULTY FALLBACK
      if (creds.role === 'faculty') {
        const q = (creds.username || creds.email || '').trim().toLowerCase();
        const matchedFaculty = FEATURED_DEMO_FACULTY.find(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q) ||
            f.department.toLowerCase().includes(q)
        ) || FEATURED_DEMO_FACULTY[0];

        const user: AuthUserProfile = {
          id: matchedFaculty.id,
          name: matchedFaculty.name,
          role: 'faculty',
          email: matchedFaculty.email,
          department: matchedFaculty.department,
        };
        setAuthToken('mock_faculty_token_demo');
        setCurrentUser(user);
        return {
          success: true,
          token: 'mock_faculty_token_demo',
          user,
        };
      }

      // 3. TPO FALLBACK
      if (creds.role === 'tpo') {
        const user: AuthUserProfile = {
          id: 'tpo_officer_1',
          name: 'Prof. Vikram Malhotra',
          role: 'tpo',
          email: creds.email || 'tpo@edupulse.edu',
          department: 'Corporate Relations & Placement Cell',
        };
        setAuthToken('mock_tpo_token_demo');
        setCurrentUser(user);
        return {
          success: true,
          token: 'mock_tpo_token_demo',
          user,
        };
      }

      // 4. STUDENT FALLBACK
      if (creds.role === 'student') {
        const q = (creds.student_id || creds.username || '').trim().toLowerCase();

        let matchedStudent = students.find(
          (s) =>
            s.student_id.toLowerCase() === q ||
            s.name.toLowerCase().includes(q) ||
            (s.email && s.email.toLowerCase() === q)
        );

        if (!matchedStudent) {
          matchedStudent = INITIAL_STUDENTS.find(
            (s) =>
              s.student_id.toLowerCase() === q ||
              s.name.toLowerCase().includes(q) ||
              (s.email && s.email.toLowerCase() === q)
          );
        }

        // Support aliases like 'arjun', 'anup', 'stu001'
        if (!matchedStudent && (q.includes('arjun') || q.includes('anup') || q === 'stu001')) {
          matchedStudent = students[0] || INITIAL_STUDENTS[0];
        }

        if (matchedStudent) {
          const user: AuthUserProfile = {
            id: matchedStudent.student_id,
            name: matchedStudent.name,
            role: 'student',
            student_id: matchedStudent.student_id,
            email: matchedStudent.email,
            department: matchedStudent.department,
          };
          setAuthToken('mock_student_token_demo');
          setCurrentUser(user);
          setLoggedInStudent(matchedStudent);
          setSelectedStudent(matchedStudent);
          setStudents([matchedStudent]);
          return {
            success: true,
            token: 'mock_student_token_demo',
            user,
            student: matchedStudent,
          };
        }

        throw new Error(`Student "${creds.student_id || creds.username}" was not found in our campus database.`);
      }

      throw apiError;
    }
  };

  const logoutUser = () => {
    api.logout();
    setCurrentUser(null);
    localStorage.removeItem('edupulse_current_user_v1');
  };

  const uploadSpreadsheetToBackend = async (payload: {
    fileName: string;
    fileData: string;
    format: 'xlsx' | 'csv';
    conflictMode?: 'merge' | 'overwrite' | 'preserve';
  }) => {
    const res = await api.uploadSpreadsheetFile(payload);
    await refreshFromDatabase();
    return res;
  };

  const seedToDatabase = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      await api.seedDatabase();
      await refreshFromDatabase();
      setIsSyncing(false);
      return true;
    } catch (e) {
      console.error('[EduPulse] Failed to seed database:', e);
      setIsSyncing(false);
      return false;
    }
  };

  // Initial check on mount
  useEffect(() => {
    refreshFromDatabase();
  }, []);

  useEffect(() => {
    try {
      if (loggedInStudent) {
        localStorage.setItem('edupulse_logged_in_student_v1', JSON.stringify(loggedInStudent));
      }
    } catch (e) {}
  }, [loggedInStudent]);

  useEffect(() => {
    try {
      localStorage.setItem('edupulse_logged_in_faculty_v1', String(loggedInFacultyIdx));
    } catch (e) {}
  }, [loggedInFacultyIdx]);


  const selectStudentForPortal = (studentOrId: UnifiedStudent | string) => {
    if (typeof studentOrId === 'object' && studentOrId !== null) {
      setLoggedInStudent(studentOrId);
      setSelectedStudent(studentOrId);
    } else if (typeof studentOrId === 'string') {
      const q = studentOrId.trim().toLowerCase();
      const found = students.find(s =>
        s.student_id.toLowerCase() === q ||
        s.email.toLowerCase() === q ||
        s.name.toLowerCase() === q ||
        s.name.toLowerCase().includes(q)
      );
      if (found) {
        setLoggedInStudent(found);
        setSelectedStudent(found);
      }
    }
  };

  const currentStudentProfile = useMemo(() => {
    return getStudentPortalData(loggedInStudent || students[0] || INITIAL_STUDENTS[0]);
  }, [loggedInStudent, students]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(interventions));
    } catch (e) {}
  }, [interventions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
    } catch (e) {}
  }, [weights]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACAD_THRESH, JSON.stringify(academicThresholds));
    } catch (e) {}
  }, [academicThresholds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLACE_THRESH, JSON.stringify(placementThresholds));
    } catch (e) {}
  }, [placementThresholds]);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(INITIAL_FILTERS);
  };

  // Compute filtered students dynamically
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 1. Department filter
      if (filters.department !== 'All' && student.department !== filters.department) {
        return false;
      }
      // 2. Academic Year filter
      if (filters.academic_year !== 'All' && student.academic_year !== filters.academic_year) {
        return false;
      }
      // 3. Semester filter
      if (filters.semester !== 'All' && student.semester !== filters.semester) {
        return false;
      }
      // 4. Academic Risk filter
      if (filters.academic_risk !== 'All') {
        const risk = evaluateAcademicRisk(student, academicThresholds);
        if (risk.risk_level !== filters.academic_risk) return false;
      }
      // 5. Placement Risk filter
      if (filters.placement_risk !== 'All') {
        const risk = evaluatePlacementRisk(student, placementThresholds);
        if (risk.risk_level !== filters.placement_risk) return false;
      }
      // 6. Segment filter
      if (filters.segment !== 'All') {
        const seg = assignStudentSegment(student);
        if (seg.segment !== filters.segment) return false;
      }
      // 7. Search query filter
      if (filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesId = student.student_id.toLowerCase().includes(query);
        const matchesDept = student.department.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesDept) return false;
      }

      return true;
    });
  }, [students, filters, academicThresholds, placementThresholds]);

  // Actions
  const addIntervention = (item: {
    student_id: string;
    student_name: string;
    department: string;
    category: any;
    title: string;
    description: string;
    faculty_assigned: string;
    target_date: string;
  }) => {
    const newId = `INT-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newIntervention: InterventionItem = {
      id: newId,
      student_id: item.student_id,
      student_name: item.student_name,
      department: item.department,
      category: item.category,
      title: item.title,
      description: item.description,
      faculty_assigned: item.faculty_assigned,
      target_date: item.target_date,
      status: 'Planned',
      created_at: today,
      updated_at: today,
      notes: [],
    };

    setInterventions(prev => [newIntervention, ...prev]);

    // Also update student's own intervention record
    setStudents(prev =>
      prev.map(s => {
        if (s.student_id === item.student_id) {
          return {
            ...s,
            interventions: [
              ...s.interventions,
              {
                id: newId,
                category: item.category,
                description: item.description,
                faculty_assigned: item.faculty_assigned,
                target_date: item.target_date,
                status: 'Planned',
                created_at: today,
                follow_up_notes: [],
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const updateInterventionStatus = (id: string, status: InterventionStatus, followUpNote?: string) => {
    const today = new Date().toISOString().split('T')[0];

    setInterventions(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updatedNotes = [...item.notes];
          if (followUpNote && followUpNote.trim()) {
            updatedNotes.push({
              id: `NOTE-${Date.now()}`,
              author: item.faculty_assigned || 'Faculty Advisor',
              note: followUpNote.trim(),
              created_at: today,
            });
          }
          return {
            ...item,
            status,
            updated_at: today,
            notes: updatedNotes,
          };
        }
        return item;
      })
    );
  };

  const updateWeights = (newWeights: ScoreWeights) => {
    setWeights(newWeights);
  };

  const updateAcademicThresholds = (newThresholds: AcademicRiskThresholds) => {
    setAcademicThresholds(newThresholds);
  };

  const updatePlacementThresholds = (newThresholds: PlacementRiskThresholds) => {
    setPlacementThresholds(newThresholds);
  };

  const mergeDataRecords = async (
    category: DatasetCategory,
    records: Record<string, any>[],
    mode: 'merge' | 'overwrite' | 'preserve' = 'merge'
  ): Promise<IngestionResult> => {
    const result = mergeValidatedRecords(students, category, records, mode);
    setStudents(result.mergedStudents);

    let dbSync: IngestionResult['dbSync'];
    try {
      const syncRes = await api.bulkUpsertStudents(result.mergedStudents);
      if (syncRes && syncRes.success) {
        dbSync = {
          success: true,
          upserted: syncRes.result?.upserted ?? result.newStudentsAdded,
          modified: syncRes.result?.modified ?? result.updatedStudents,
        };
        // Refresh health to reflect new counts
        const health = await api.checkHealth().catch(() => null);
        if (health?.database) {
          setDbHealth(health.database);
          setDbStatus('connected');
        }
      } else {
        dbSync = {
          success: false,
          upserted: 0,
          modified: 0,
          error: syncRes?.message || 'Bulk upsert returned unsuccessful status',
        };
      }
    } catch (err: any) {
      console.warn('[EduPulse] MongoDB sync on merge had an issue:', err.message);
      dbSync = {
        success: false,
        upserted: 0,
        modified: 0,
        error: err.message || 'Could not connect to MongoDB server',
      };
    }

    return {
      ...result,
      dbSync,
    };
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.INTERVENTIONS);
    localStorage.removeItem(STORAGE_KEYS.WEIGHTS);
    localStorage.removeItem(STORAGE_KEYS.ACAD_THRESH);
    localStorage.removeItem(STORAGE_KEYS.PLACE_THRESH);

    setStudents(INITIAL_STUDENTS);
    setWeights(DEFAULT_WEIGHTS);
    setAcademicThresholds(DEFAULT_ACADEMIC_THRESHOLDS);
    setPlacementThresholds(DEFAULT_PLACEMENT_THRESHOLDS);
    setFiltersState(INITIAL_FILTERS);

    const initialList: InterventionItem[] = [];
    INITIAL_STUDENTS.forEach(s => {
      s.interventions.forEach(h => {
        initialList.push({
          id: h.id,
          student_id: s.student_id,
          student_name: s.name,
          department: s.department,
          category: h.category as any,
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
    setInterventions(initialList);
    setProblemRequests(DEMO_PROBLEMS);
    try {
      localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(DEMO_PROBLEMS));
    } catch (e) {}
  };

  return (
    <CampusDataContext.Provider
      value={{
        students,
        filteredStudents,
        interventions,
        weights,
        academicThresholds,
        placementThresholds,
        filters,
        setFilters,
        resetFilters,
        selectedStudent,
        setSelectedStudent,
        loggedInStudent,
        setLoggedInStudent,
        loggedInFacultyIdx,
        setLoggedInFacultyIdx,
        currentStudentProfile,
        selectStudentForPortal,
        addIntervention,
        updateInterventionStatus,
        updateWeights,
        updateAcademicThresholds,
        updatePlacementThresholds,
        mergeDataRecords,
        resetToDemoData,
        problemRequests,
        addProblemRequest,
        replyProblemRequest,
        updateProblemStatus,
        refreshProblems,
        currentUser,
        setCurrentUser,
        loginUser,
        logoutUser,
        uploadSpreadsheetToBackend,
        dbStatus,
        dbHealth,
        isSyncing,
        refreshFromDatabase,
        seedToDatabase,
      }}
    >
      {children}
    </CampusDataContext.Provider>
  );
};

export const useCampusData = () => {
  const context = useContext(CampusDataContext);
  if (!context) {
    throw new Error('useCampusData must be used within a CampusDataProvider');
  }
  return context;
};

export const useCurrentStudent = (): StudentPortalProfile => {
  const context = useCampusData();
  return context.currentStudentProfile;
};
