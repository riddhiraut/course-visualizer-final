/**
 * Core domain types and interfaces for the UGA Degree Progress & Visualization System.
 */

export type DepartmentCode = 'CSCI' | 'MATH' | 'STAT' | 'MARK' | 'FINA' | 'MGMT' | 'MIST' | 'RMIN' | string;

export type CourseGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' | 'IP' | 'CR';

export const GRADE_POINTS: Record<CourseGrade, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D': 1.0,
  'F': 0.0,
  'IP': 0.0, // In Progress (not calculated in GPA yet)
  'CR': 0.0, // Credit only (AP/IB/Transfer)
};

export interface CourseRecord {
  grade?: CourseGrade;
  term?: string;
  completedAt?: string;
  isTransfer?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  myid: string;
  ugaId: string; // 811-xx-xxxx
  email: string;
  degreePrograms: string[]; // e.g. ["B.S. in Computer Science", "B.S. in Data Science"]
  catalogYear: string;
  expectedGraduation: string;
  advisorName: string;
  completedCourses: Record<string, CourseRecord>; // courseCode -> record
  electiveSelections: Record<string, string[]>; // programName -> array of chosen course codes
  notes: string;
  lastUpdated: string;
}

export interface ValidationResult {
  valid: boolean;
  code: string;
  title?: string;
  credits?: number;
  reason: string;
  missingPrereqs?: string[];
  alreadyUsedBy?: string;
}

export interface CrossProgramOverlap {
  courseCode: string;
  courseTitle: string;
  credits: number;
  programs: string[];
}

export interface ProgramAuditProgress {
  programName: string;
  degreeType: 'Major' | 'Minor' | 'Certificate';
  requiredCoursesTotal: number;
  requiredCoursesCompleted: number;
  electivesTotal: number;
  electivesCompleted: number;
  creditsCompleted: number;
  creditsTotal: number;
  percentComplete: number;
  isComplete: boolean;
}

export interface OverallAuditReport {
  student: StudentProfile;
  programs: ProgramAuditProgress[];
  totalCreditsEarned: number;
  gpa: number;
  overallPercentComplete: number;
  sharedCourses: CrossProgramOverlap[];
  creditsSavedByDoubleDipping: number;
  unlockedNextSemester: string[];
  longestPrerequisiteChain: string[];
}
