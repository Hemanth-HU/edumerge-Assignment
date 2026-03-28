/**
 * Mock Database Service
 * Uses in-memory state management to simulate database operations
 * In production, this would connect to a real database
 */

import {
  Institution,
  Campus,
  Department,
  Program,
  AcademicYear,
  Applicant,
  Admission,
  AllotmentRequest,
  CourseType,
  EntryType,
  AdmissionMode,
} from "@/app/types";

// ============ GLOBAL STATE ============

interface AppState {
  institutions: Institution[];
  campuses: Campus[];
  departments: Department[];
  programs: Program[];
  academicYears: AcademicYear[];
  applicants: Applicant[];
  admissions: Admission[];
  allotmentRequests: AllotmentRequest[];
  courseTypes: CourseType[];
  entryTypes: EntryType[];
  admissionModes: AdmissionMode[];
}

// Utility: generate unique IDs for in-memory rows
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Initialize with empty state
let appState: AppState = {
  institutions: [],
  campuses: [],
  departments: [],
  programs: [],
  academicYears: [],
  applicants: [],
  admissions: [],
  allotmentRequests: [],
  courseTypes: [
    { id: "1", value: "UG", label: "Under Graduate" },
    { id: "2", value: "PG", label: "Post Graduate" },
  ],
  entryTypes: [
    { id: "1", value: "Regular", label: "Regular" },
    { id: "2", value: "Lateral", label: "Lateral Entry" },
  ],
  admissionModes: [
    { id: "1", value: "Government", label: "Government Quota" },
    { id: "2", value: "Management", label: "Management Quota" },
  ],
};

// ============ INSTITUTION OPERATIONS ============

export function createInstitution(
  data: Omit<Institution, "id" | "createdAt">,
): Institution {
  const institution: Institution = {
    ...data,
    id: generateId("inst"),
    createdAt: new Date(),
  };
  appState.institutions.push(institution);
  return institution;
}

export function getInstitutions(): Institution[] {
  return appState.institutions;
}

export function getInstitutionById(id: string): Institution | undefined {
  return appState.institutions.find((i) => i.id === id);
}

// ============ CAMPUS OPERATIONS ============

export function createCampus(data: Omit<Campus, "id" | "createdAt">): Campus {
  const campus: Campus = {
    ...data,
    id: generateId("campus"),
    createdAt: new Date(),
  };
  appState.campuses.push(campus);
  return campus;
}

export function getCampuses(): Campus[] {
  return appState.campuses;
}

export function getCampusesByInstitution(institutionId: string): Campus[] {
  return appState.campuses.filter((c) => c.institutionId === institutionId);
}

// ============ DEPARTMENT OPERATIONS ============

export function createDepartment(
  data: Omit<Department, "id" | "createdAt">,
): Department {
  const department: Department = {
    ...data,
    id: generateId("dept"),
    createdAt: new Date(),
  };
  appState.departments.push(department);
  return department;
}

export function getDepartments(): Department[] {
  return appState.departments;
}

export function getDepartmentsByCampus(campusId: string): Department[] {
  return appState.departments.filter((d) => d.campusId === campusId);
}

export function getDepartmentById(id: string): Department | undefined {
  return appState.departments.find((d) => d.id === id);
}

// ============ PROGRAM OPERATIONS ============

export function createProgram(
  data: Omit<Program, "id" | "createdAt" | "filledSeats">,
): Program {
  // Initialize filledSeats with 0 for each quota
  const filledSeats: Record<string, number> = {};
  Object.keys(data.quotas).forEach((quota) => {
    filledSeats[quota] = 0;
  });

  const program: Program = {
    ...data,
    id: generateId("prog"),
    filledSeats,
    createdAt: new Date(),
  };
  appState.programs.push(program);
  return program;
}

export function getPrograms(): Program[] {
  return appState.programs;
}

export function getProgramById(id: string): Program | undefined {
  return appState.programs.find((p) => p.id === id);
}

export function getProgramsByDepartment(departmentId: string): Program[] {
  return appState.programs.filter((p) => p.departmentId === departmentId);
}

export function updateProgram(
  id: string,
  updates: Partial<Program>,
): Program | undefined {
  const index = appState.programs.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  appState.programs[index] = { ...appState.programs[index], ...updates };
  return appState.programs[index];
}

// ============ ACADEMIC YEAR OPERATIONS ============

export function createAcademicYear(
  data: Omit<AcademicYear, "id" | "createdAt">,
): AcademicYear {
  const academicYear: AcademicYear = {
    ...data,
    id: generateId("year"),
    createdAt: new Date(),
  };
  appState.academicYears.push(academicYear);
  return academicYear;
}

export function getAcademicYears(): AcademicYear[] {
  return appState.academicYears;
}

export function getActiveAcademicYear(): AcademicYear | undefined {
  return appState.academicYears.find((y) => y.isActive);
}

// ============ APPLICANT OPERATIONS ============

export function createApplicant(
  data: Omit<Applicant, "id" | "appliedDate" | "lastModified">,
): Applicant {
  const applicant: Applicant = {
    ...data,
    id: generateId("app"),
    appliedDate: new Date(),
    lastModified: new Date(),
  };
  appState.applicants.push(applicant);
  return applicant;
}

export function getApplicants(): Applicant[] {
  return appState.applicants;
}

export function getApplicantById(id: string): Applicant | undefined {
  return appState.applicants.find((a) => a.id === id);
}

export function updateApplicant(
  id: string,
  updates: Partial<Applicant>,
): Applicant | undefined {
  const index = appState.applicants.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  appState.applicants[index] = {
    ...appState.applicants[index],
    ...updates,
    lastModified: new Date(),
  };
  return appState.applicants[index];
}

export function getApplicantsByProgram(programName: string): Applicant[] {
  return appState.applicants.filter((a) => a.programApplied === programName);
}

export function getApplicantsByStatus(status: string): Applicant[] {
  return appState.applicants.filter((a) => a.applicationStatus === status);
}

// ============ ADMISSION OPERATIONS ============

export function createAdmission(
  data: Omit<Admission, "id" | "createdAt">,
): Admission {
  const admission: Admission = {
    ...data,
    id: generateId("adm"),
    createdAt: new Date(),
  };
  appState.admissions.push(admission);
  return admission;
}

export function getAdmissions(): Admission[] {
  return appState.admissions;
}

export function getAdmissionById(id: string): Admission | undefined {
  return appState.admissions.find((a) => a.id === id);
}

export function getAdmissionsByApplicant(applicantId: string): Admission[] {
  return appState.admissions.filter((a) => a.applicantId === applicantId);
}

export function getAdmissionsByProgram(programId: string): Admission[] {
  return appState.admissions.filter((a) => a.programId === programId);
}

export function updateAdmission(
  id: string,
  updates: Partial<Admission>,
): Admission | undefined {
  const index = appState.admissions.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  appState.admissions[index] = { ...appState.admissions[index], ...updates };
  return appState.admissions[index];
}

export function getAdmissionByNumber(
  admissionNumber: string,
): Admission | undefined {
  return appState.admissions.find((a) => a.admissionNumber === admissionNumber);
}

// ============ ALLOTMENT OPERATIONS ============

export function createAllotmentRequest(
  data: Omit<AllotmentRequest, "id" | "createdAt">,
): AllotmentRequest {
  const allotment: AllotmentRequest = {
    ...data,
    id: `allot_${Date.now()}`,
    createdAt: new Date(),
  };
  appState.allotmentRequests.push(allotment);
  return allotment;
}

export function getAllotmentRequests(): AllotmentRequest[] {
  return appState.allotmentRequests;
}

export function getAllotmentRequestById(
  id: string,
): AllotmentRequest | undefined {
  return appState.allotmentRequests.find((a) => a.id === id);
}

export function updateAllotmentRequest(
  id: string,
  updates: Partial<AllotmentRequest>,
): AllotmentRequest | undefined {
  const index = appState.allotmentRequests.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  appState.allotmentRequests[index] = {
    ...appState.allotmentRequests[index],
    ...updates,
  };
  return appState.allotmentRequests[index];
}

// ============ STATIC DATA OPERATIONS ============

export function getAllCourseTypes(): CourseType[] {
  return appState.courseTypes;
}

export function getAllEntryTypes(): EntryType[] {
  return appState.entryTypes;
}

export function getAllAdmissionModes(): AdmissionMode[] {
  return appState.admissionModes;
}

// ============ DASHBOARD STATS ============

export function getDashboardStats() {
  const activeYear = getActiveAcademicYear();
  const programs = getPrograms();

  let totalIntake = 0;
  let totalAdmitted = 0;

  programs.forEach((prog) => {
    totalIntake += prog.totalIntake;
    Object.values(prog.filledSeats).forEach((filled) => {
      totalAdmitted += filled;
    });
  });

  const applicantsWithPendingDocs = getApplicants().filter(
    (a) => a.documentStatus === "Pending",
  );
  const applicantsWithPendingFees = getApplicants().filter(
    (a) => a.feeStatus === "Pending",
  );

  return {
    totalIntake,
    totalAdmitted,
    totalPending: applicantsWithPendingDocs.length,
    totalRejected: getApplicantsByStatus("Rejected").length,
    activeAcademicYear: activeYear?.year || "N/A",
    programCount: programs.length,
    applicantCount: getApplicants().length,
    applicantsWithPendingDocs,
    applicantsWithPendingFees,
  };
}

// ============ RESET STATE (FOR TESTING) ============

export function resetState(): void {
  appState = {
    institutions: [],
    campuses: [],
    departments: [],
    programs: [],
    academicYears: [],
    applicants: [],
    admissions: [],
    allotmentRequests: [],
    courseTypes: appState.courseTypes,
    entryTypes: appState.entryTypes,
    admissionModes: appState.admissionModes,
  };
}

// ============ GET FULL STATE (FOR DEBUGGING) ============

export function getFullState(): AppState {
  return appState;
}
