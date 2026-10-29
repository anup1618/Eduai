import { Department } from './student';

export type PlacementTier = 'Super Dream' | 'Dream' | 'Standard' | 'Mass';
export type DriveStatus = 'Upcoming' | 'Active' | 'Application Open' | 'Completed';
export type CandidateDriveStatus = 'Applied' | 'Shortlisted' | 'Technical Round' | 'HR Round' | 'Offer Extended' | 'Rejected';

export interface PlacementDrive {
  id: string;
  company: string;
  logoBadge: string;
  badgeBg: string;
  tier: PlacementTier;
  role: string;
  ctc: number; // in LPA (e.g., 28.5)
  stipend?: string;
  type: 'Full-Time' | 'Internship + PPO' | 'Internship';
  location: string;
  eligibleDepts: Department[];
  minCgpa: number;
  maxBacklogs: number;
  minCodingScore: number;
  minAptitudeScore: number;
  deadline: string;
  driveDate: string;
  status: DriveStatus;
  rounds: string[];
  registeredStudentsCount: number;
  shortlistedCount: number;
  selectedCount: number;
  description: string;
}

export interface PlacementTrainingProgram {
  id: string;
  title: string;
  trainer: string;
  category: 'Coding & DSA' | 'Aptitude & Logic' | 'Mock Interviews' | 'System Design' | 'Soft Skills';
  duration: string;
  status: 'Ongoing' | 'Upcoming' | 'Completed';
  enrolledCount: number;
  attendanceRate: number;
  nextSession: string;
  targetAudience: string;
  progressPct: number;
}

export interface PlacementOffer {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: Department;
  company: string;
  role: string;
  ctc: number; // LPA
  offerType: PlacementTier;
  verificationStatus: 'Verified' | 'Pending Review' | 'Flagged';
  offerDate: string;
  acceptanceStatus: 'Accepted' | 'Declined' | 'Decision Pending';
}

export interface ResumeVerificationItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: Department;
  cgpa: number;
  version: string;
  submittedDate: string;
  status: 'Approved' | 'Needs Revision' | 'Pending Review';
  atsScore: number; // 0-100
  skills: string[];
  notes?: string;
}

export type OpportunityType =
  | 'Campus Placement Drive'
  | 'Elite Summer Internship'
  | 'Pre-Placement Fast-track Bootcamp'
  | 'Dean TPO Corporate Referral'
  | 'Industry Hackathon & Research Sponsorship';

export type AllocationStatus =
  | 'Invited'
  | 'Directly Nominated'
  | 'Shortlisted'
  | 'Assessment Scheduled'
  | 'Offer Extended';

export interface OpportunityOption {
  id: string;
  title: string;
  companyOrPartner: string;
  type: OpportunityType;
  tier?: PlacementTier;
  ctcOrStipend: string;
  minCgpa: number;
  maxBacklogs: number;
  minCodingScore: number;
  minAptitudeScore: number;
  eligibleDepts: Department[];
  deadline: string;
  badgeBg: string;
  description: string;
}

export interface StudentOpportunityAllocation {
  id: string;
  studentId: string;
  studentName: string;
  department: Department;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: OpportunityType;
  companyOrPartner: string;
  ctcOrStipend?: string;
  tier?: PlacementTier;
  status: AllocationStatus;
  allocatedDate: string;
  allocatedBy: string;
  tpoNote?: string;
  matchedCriteria: string[];
}

export interface OpportunityMatchResult {
  opportunity: OpportunityOption;
  matchScore: number; // 0 - 100
  isEligible: boolean;
  matchReasons: string[];
  gapWarnings: string[];
}

export interface TPOOfficerProfile {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  avatar_initials: string;
  season: string;
}

export type TPOPage =
  | 'dashboard'
  | 'talent'
  | 'drives'
  | 'readiness'
  | 'screening'
  | 'training'
  | 'offers'
  | 'resumes'
  | 'profile';

