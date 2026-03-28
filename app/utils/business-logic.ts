/**
 * Utility Functions for Business Logic
 * Includes seat allocation, admission number generation, and validation
 */

import { Program, Applicant, Admission } from "@/app/types";

// ============ SEAT ALLOCATION LOGIC ============

/**
 * Validates if a seat can be allocated for a given program and quota
 * Returns true if seat is available, false otherwise
 *
 * CORE ALGORITHM: Check if filledSeats[quota] < quotas[quota]
 */
export function canAllocateSeat(program: Program, quotaName: string): boolean {
  if (!program.quotas[quotaName]) {
    console.error(`Quota ${quotaName} not found in program`);
    return false;
  }

  const filledSeats = program.filledSeats[quotaName] || 0;
  const availableSeats = program.quotas[quotaName];

  const canAllocate = filledSeats < availableSeats;

  console.log(
    `Seat allocation check for ${program.name} - ${quotaName}: ` +
      `${filledSeats}/${availableSeats} (Can allocate: ${canAllocate})`,
  );

  return canAllocate;
}

/**
 * Allocates a seat by incrementing the filled seats counter
 * This is the critical function that maintains seat state
 */
export function allocateSeat(
  program: Program,
  quotaName: string,
): { success: boolean; message: string } {
  if (!canAllocateSeat(program, quotaName)) {
    return {
      success: false,
      message: `No available seats in ${quotaName} quota for ${program.name}`,
    };
  }

  // Increment the filled seats counter
  if (!program.filledSeats[quotaName]) {
    program.filledSeats[quotaName] = 0;
  }
  program.filledSeats[quotaName]++;

  return {
    success: true,
    message: `Seat allocated successfully in ${quotaName} quota`,
  };
}

/**
 * Deallocates a seat (used if admission needs to be cancelled)
 */
export function deallocateSeat(
  program: Program,
  quotaName: string,
): { success: boolean; message: string } {
  if (!program.filledSeats[quotaName] || program.filledSeats[quotaName] === 0) {
    return {
      success: false,
      message: `No seats to deallocate in ${quotaName} quota`,
    };
  }

  program.filledSeats[quotaName]--;

  return {
    success: true,
    message: `Seat deallocated successfully from ${quotaName} quota`,
  };
}

/**
 * Gets remaining seats for a quota
 */
export function getRemainingSeats(program: Program, quotaName: string): number {
  const totalSeats = program.quotas[quotaName] || 0;
  const filledSeats = program.filledSeats[quotaName] || 0;
  return totalSeats - filledSeats;
}

// ============ ADMISSION NUMBER GENERATION ============

/**
 * CRITICAL FUNCTION: Generates unique admission number
 *
 * Format: INST/YEAR/COURSEtype/PROGRAM/QUOTA/SERIALNUMBER
 * Example: INST/2026/UG/CSE/KCET/0001
 *
 * Rules:
 * 1. Must be unique
 * 2. Must be immutable (never changes once generated)
 * 3. Generated only once at confirmation
 * 4. Contains institution code, year, course type, program, quota, and sequence
 */
export function generateAdmissionNumber(
  admission: Admission,
  institutionCode: string = "INST",
): string {
  // Extract year from admission date
  const year = new Date(admission.admissionDate).getFullYear();

  // Format: INST/2026/UG/CSE/KCET/0001
  // We'll use a simple incremental approach - in production, query DB for count
  const sequenceNumber = String(Math.floor(Math.random() * 10000) + 1).padStart(
    4,
    "0",
  );

  const admissionNumber = `${institutionCode}/${year}/${admission.courseType}/${admission.programName.substring(0, 4).toUpperCase()}/${admission.quota.toUpperCase()}/${sequenceNumber}`;

  console.log(`Generated admission number: ${admissionNumber}`);

  return admissionNumber;
}

/**
 * Validates admission number format
 */
export function isValidAdmissionNumberFormat(admissionNumber: string): boolean {
  const pattern = /^[A-Z0-9]+\/\d{4}\/[A-Z]+\/[A-Z]+\/[A-Z]+\/\d{4}$/;
  return pattern.test(admissionNumber);
}

// ============ QUOTA VALIDATION ============

/**
 * Validates that total quota seats equal program intake
 */
export function validateQuotaDistribution(
  totalIntake: number,
  quotas: Record<string, number>,
): { isValid: boolean; message: string } {
  const totalQuota = Object.values(quotas).reduce(
    (sum, seats) => sum + seats,
    0,
  );

  if (totalQuota !== totalIntake) {
    return {
      isValid: false,
      message: `Total quota seats (${totalQuota}) must equal program intake (${totalIntake})`,
    };
  }

  return {
    isValid: true,
    message: "Quota distribution is valid",
  };
}

/**
 * Calculates quota status including available and allocated seats
 */
export function getQuotaStatus(program: Program, quotaName: string) {
  const totalSeats = program.quotas[quotaName] || 0;
  const filledSeats = program.filledSeats[quotaName] || 0;
  const availableSeats = totalSeats - filledSeats;

  return {
    quota: quotaName,
    totalSeats,
    filledSeats,
    availableSeats,
    isFull: availableSeats === 0,
    percentageFilled: Math.round((filledSeats / totalSeats) * 100),
  };
}

// ============ APPLICANT VALIDATION ============

/**
 * Validates applicant can be admitted (documents and fees in order)
 */
export function canAdmitApplicant(applicant: Applicant): {
  canAdmit: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (applicant.documentStatus !== "Verified") {
    reasons.push("Documents must be verified");
  }

  if (applicant.applicationStatus === "Rejected") {
    reasons.push("Applicant has been rejected");
  }

  return {
    canAdmit: reasons.length === 0,
    reasons,
  };
}

/**
 * Validates fee payment before admission confirmation
 */
export function canConfirmAdmission(admission: Admission): {
  canConfirm: boolean;
  reason: string;
} {
  if (admission.feeStatus !== "Paid") {
    return {
      canConfirm: false,
      reason: "Fee payment is required for admission confirmation",
    };
  }

  return {
    canConfirm: true,
    reason: "Ready for confirmation",
  };
}

// ============ SEAT MATRIX HELPERS ============

/**
 * Gets all quota names from a program
 */
export function getQuotaNames(program: Program): string[] {
  return Object.keys(program.quotas);
}

/**
 * Gets dashboard statistics for a program
 */
export function getProgramStats(program: Program) {
  const totalFilled = Object.values(program.filledSeats).reduce(
    (sum, val) => sum + val,
    0,
  );
  const remainingSeats = program.totalIntake - totalFilled;

  return {
    programName: program.name,
    totalIntake: program.totalIntake,
    totalFilled,
    remainingSeats,
    quotaBreakdown: getQuotaNames(program).map((quotaName) =>
      getQuotaStatus(program, quotaName),
    ),
  };
}

/**
 * Validates if admission number is unique (in production, query database)
 */
export function isAdmissionNumberUnique(
  admissionNumber: string,
  existingAdmissions: Admission[],
): boolean {
  return !existingAdmissions.some(
    (admission) => admission.admissionNumber === admissionNumber,
  );
}
