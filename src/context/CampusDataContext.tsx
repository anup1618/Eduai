import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UnifiedStudent } from '../types/student';
import { ScoreWeights } from '../types/scoring';
import { AcademicRiskThresholds, PlacementRiskThresholds } from '../types/risk';
import { FilterState, INITIAL_FILTERS } from '../types/filter';
import { InterventionItem, InterventionStatus } from '../types/intervention';
import { INITIAL_STUDENTS } from '../data/initialStudents';
import { DEFAULT_WEIGHTS } from '../engine/scoringEngine';
import { DEFAULT_ACADEMIC_THRESHOLDS } from '../engine/academicRiskEngine';
import { DEFAULT_PLACEMENT_THRESHOLDS } from '../engine/placementRiskEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { assignStudentSegment } from '../engine/segmentationEngine';
import { mergeValidatedRecords, DatasetCategory, MergeResult } from '../engine/dataValidator';

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
  mergeDataRecords: (category: DatasetCategory, records: Record<string, any>[], mode?: 'merge' | 'overwrite' | 'preserve') => MergeResult;
  resetToDemoData: () => void;
}

const CampusDataContext = createContext<CampusDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'edupulse_students_v1',
  INTERVENTIONS: 'edupulse_interventions_v1',
  WEIGHTS: 'edupulse_weights_v1',
  ACAD_THRESH: 'edupulse_acad_thresh_v1',
  PLACE_THRESH: 'edupulse_place_thresh_v1',
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

  const mergeDataRecords = (
    category: DatasetCategory,
    records: Record<string, any>[],
    mode: 'merge' | 'overwrite' | 'preserve' = 'merge'
  ): MergeResult => {
    const result = mergeValidatedRecords(students, category, records, mode);
    setStudents(result.mergedStudents);
    return result;
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
        addIntervention,
        updateInterventionStatus,
        updateWeights,
        updateAcademicThresholds,
        updatePlacementThresholds,
        mergeDataRecords,
        resetToDemoData,
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
