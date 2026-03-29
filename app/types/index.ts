// ============ MASTER SETUP TYPES ============

export interface Institution {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  createdAt: Date;
}

export interface Campus {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  location: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  campusId: string;
  name: string;
  code: string;
  head: string;
  createdAt: Date;
}

export interface CourseType {
  id: string;
  value: "UG" | "PG";
  label: string;
}

export interface EntryType {
  id: string;
  value: "Regular" | "Lateral";
  label: string;
}

export interface AdmissionMode {
  id: string;
  value: "Government" | "Management";
  label: string;
}

// ============ QUOTA TYPES ============

export interface QuotaDefinition {
  name: string;
  seats: number;
}

export interface QuotaStatus {
  name: string;
  allocated: number;
  available: number;
  filled: number;
}

// ============ PROGRAM TYPES ============

export interface Program {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  courseType: "UG" | "PG"; // UG or PG
  totalIntake: number;
  quotas: {
    [key: string]: number; // e.g., { KCET: 50, COMEDK: 30, MANAGEMENT: 20 }
  };
  filledSeats: {
    [key: string]: number; // Tracks actual filled seats per quota
  };
  createdAt: Date;
}

// ============ ACADEMIC YEAR TYPES ============

export interface AcademicYear {
  id: string;
  year: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// ============ APPLICANT TYPES ============

export type DocumentStatus = "Pending" | "Submitted" | "Verified";
export type FeeStatus = "Pending" | "Paid";
export type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Rejected"
  | "Allocated"
  | "Confirmed";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string; 
  entryType: "Regular" | "Lateral";
  quotaType: string;
  programApplied: string;
  marks: number;
  documentStatus: DocumentStatus;
  feeStatus: FeeStatus;
  applicationStatus: ApplicationStatus;
  appliedDate: Date;
  lastModified: Date;
}

// ============ ADMISSION TYPES ============

export interface Seat {
  id: string;
  programId: string;
  quotaName: string;
  applicantId?: string;
  status: "Available" | "Allocated" | "Locked" | "Confirmed";
  allotmentNumber?: string;
  createdAt: Date;
}

export interface Admission {
  id: string;
  applicantId: string;
  programId: string;
  programName: string;
  courseType: "UG" | "PG";
  quota: string;
  admissionNumber: string;
  admissionDate: Date;
  feeStatus: FeeStatus;
  status: "Allocated" | "Confirmed";
  confirmationDate?: Date;
  createdAt: Date;
}

export interface AllotmentRequest {
  id: string;
  allotmentNumber: string;
  quota: string; // KCET, COMEDK
  programId: string;
  seatId: string;
  status: "Pending" | "Allocated" | "Confirmed";
  createdAt: Date;
}

// ============ DASHBOARD TYPES ============

export interface DashboardStats {
  totalIntake: number;
  totalAdmitted: number;
  totalPending: number;
  totalRejected: number;
  quotaStatus: {
    [key: string]: QuotaStatus;
  };
  pendingDocuments: Applicant[];
  pendingFees: Applicant[];
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

// ============ ROLE TYPES ============

export type UserRole = "Admin" | "AdmissionOfficer" | "Management";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SeatAllocationResult {
  success: boolean;
  seatId?: string;
  message: string;
  error?: string;
}
