import { Department, AcademicYear, Semester } from './student';
import { RiskLevel } from './risk';
import { SegmentType } from './segmentation';

export interface FilterState {
  department: Department | 'All';
  academic_year: AcademicYear | 'All';
  semester: Semester | 'All';
  academic_risk: RiskLevel | 'All';
  placement_risk: RiskLevel | 'All';
  segment: SegmentType | 'All';
  searchQuery: string;
}

export const INITIAL_FILTERS: FilterState = {
  department: 'All',
  academic_year: 'All',
  semester: 'All',
  academic_risk: 'All',
  placement_risk: 'All',
  segment: 'All',
  searchQuery: '',
};
