/**
 * Zod Validation Schemas
 * Defines validation rules for all forms and data structures
 */

import { z } from "zod";

// ============ MASTER SETUP SCHEMAS ============

export const InstitutionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Institution name is required").max(200),
  code: z.string().min(1, "Code is required").max(20),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

export const CampusSchema = z.object({
  id: z.string().optional(),
  institutionId: z.string().min(1, "Institution is required"),
  name: z.string().min(1, "Campus name is required").max(200),
  code: z.string().min(1, "Code is required").max(20),
  location: z.string().min(1, "Location is required"),
});

export const DepartmentSchema = z.object({
  id: z.string().optional(),
  campusId: z.string().min(1, "Campus is required"),
  name: z.string().min(1, "Department name is required").max(200),
  code: z.string().min(1, "Code is required").max(20),
  head: z.string().min(1, "Department head name is required"),
});

// ============ PROGRAM SCHEMA ============

export const ProgramSchema = z
  .object({
    id: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    name: z.string().min(1, "Program name is required"),
    code: z.string().min(1, "Program code is required"),
    courseType: z.enum(["UG", "PG"]),
    totalIntake: z.number().int().min(1, "Total intake must be at least 1"),
    quotas: z.record(z.string(), z.number().int().min(0)),
    filledSeats: z.record(z.string(), z.number().int().min(0)).optional(),
  })
  .refine(
    (data) => {
      // Validate that total quota seats equal total intake
      const totalQuota = Object.values(data.quotas).reduce(
        (sum, seats) => sum + seats,
        0,
      );
      return totalQuota === data.totalIntake;
    },
    {
      message: "Total quota seats must equal the program intake",
      path: ["quotas"],
    },
  );

// ============ APPLICANT SCHEMA ============

export const ApplicantSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  category: z.string().min(1, "Category is required"),
  entryType: z.enum(["Regular", "Lateral"]),
  quotaType: z.string().min(1, "Quota type is required"),
  programApplied: z.string().min(1, "Program is required"),
  marks: z
    .number()
    .min(0, "Marks cannot be negative")
    .max(1000, "Marks cannot exceed 1000"),
  documentStatus: z.enum(["Pending", "Submitted", "Verified"]),
  feeStatus: z.enum(["Pending", "Paid"]),
});

export type ApplicantFormData = z.infer<typeof ApplicantSchema>;

// ============ ADMISSION ALLOCATION SCHEMAS ============

export const GovernmentAllotmentSchema = z.object({
  allotmentNumber: z
    .string()
    .min(1, "Allotment number is required")
    .regex(/^[A-Z0-9-]+$/, "Invalid allotment number format"),
  quota: z.enum(["KCET", "COMEDK"]),
  programId: z.string().min(1, "Program is required"),
});

export const ManagementAllotmentSchema = z.object({
  applicantId: z.string().min(1, "Applicant is required"),
  programId: z.string().min(1, "Program is required"),
  quota: z.literal("Management"),
});

// ============ ADMISSION CONFIRMATION SCHEMA ============

export const AdmissionConfirmationSchema = z.object({
  admissionId: z.string().min(1, "Admission is required"),
  feeStatus: z.enum(["Pending", "Paid"]),
});

type AdmissionConfirmationData = z.infer<typeof AdmissionConfirmationSchema>;

// ============ SEAT ALLOCATION SCHEMA ============

export const SeatAllocationSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  quotaName: z.string().min(1, "Quota is required"),
  applicantId: z.string().optional(),
});

export type ApplicantFormDataType = z.infer<typeof ApplicantSchema>;
export type ProgramFormData = z.infer<typeof ProgramSchema>;
export type GovernmentAllotmentData = z.infer<typeof GovernmentAllotmentSchema>;
export type ManagementAllotmentData = z.infer<typeof ManagementAllotmentSchema>;
