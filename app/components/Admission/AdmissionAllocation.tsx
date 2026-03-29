/**
 * Admission Allocation Component
 * Implements two flows: Government Allotment and Management Allotment
 * CRITICAL: Implements seat matrix logic for allocation validation
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GovernmentAllotmentSchema,
  ManagementAllotmentSchema,
} from "@/app/utils/schemas";
import {
  getPrograms,
  getProgramById,
  updateProgram,
  getApplicants,
  getApplicantById,
  createAdmission,
  updateApplicant,
  getAdmissions,
} from "@/app/services/database";
import {
  canAllocateSeat,
  allocateSeat,
  generateAdmissionNumber,
} from "@/app/utils/business-logic";
import { Program, Applicant, Admission } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

export function AdmissionAllocationComponent() {
  const { triggerRefresh, refreshTrigger } = useAppContext();
  const [allocationMode, setAllocationMode] = useState<
    "government" | "management"
  >("government");
  const [programs] = useState<Program[]>(getPrograms());
  const [applicants] = useState<Applicant[]>(getApplicants());
  const [message, setMessage] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Get admissions directly from global state - no local state needed
  const admissions = getAdmissions();

  // ============ GOVERNMENT ALLOTMENT FORM ============

  const governmentForm = useForm({
    resolver: zodResolver(GovernmentAllotmentSchema),
  });

  const onGovernmentSubmit = governmentForm.handleSubmit((data) => {
    try {
      const program = getProgramById(data.programId);
      if (!program) {
        setMessage("Program not found");
        return;
      }

      // CRITICAL: Check seat availability before allocation
      if (!canAllocateSeat(program, data.quota)) {
        setMessage(
          `❌ No available seats in ${data.quota} quota for ${program.name}`,
        );
        return;
      }

      // Allocate seat using business logic
      const allocationResult = allocateSeat(program, data.quota);
      if (!allocationResult.success) {
        setMessage(`❌ ${allocationResult.message}`);
        return;
      }

      // Update program with new seat allocation
      updateProgram(program.id, program);

      // Create admission record for government flow
      createAdmission({
        applicantId: `gov_allot_${Date.now()}`,
        programId: program.id,
        programName: program.name,
        courseType: program.courseType,
        quota: data.quota,
        admissionNumber: `PENDING_${data.allotmentNumber}`,
        admissionDate: new Date(),
        feeStatus: "Pending",
        status: "Allocated",
      });

      setMessage(
        `✅ Seat allocated successfully for ${data.quota} quota in ${program.name}. Allotment: ${data.allotmentNumber}`,
      );
      governmentForm.reset();
      triggerRefresh();
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("Error processing allotment");
    }
  });

  // ============ MANAGEMENT ALLOTMENT FORM ============

  const managementForm = useForm({
    resolver: zodResolver(ManagementAllotmentSchema),
  });

  const onManagementSubmit = managementForm.handleSubmit((data) => {
    console.log("FORM DATA:", data);
    try {
      const applicant = getApplicantById(data.applicantId);
      const program = getProgramById(data.programId);

      if (!applicant || !program) {
        setMessage("Applicant or Program not found");
        return;
      }

      if (!canAllocateSeat(program, "Management")) {
        setMessage(`❌ No management quota seats available`);
        return;
      }

      allocateSeat(program, "Management");
      updateProgram(program.id, program);

      createAdmission({
        applicantId: applicant.id,
        programId: program.id,
        programName: program.name,
        courseType: program.courseType,
        quota: "Management",
        admissionNumber: `PENDING_${applicant.id}`,
        admissionDate: new Date(),
        feeStatus: applicant.feeStatus,
        status: "Allocated",
      });

      updateApplicant(applicant.id, {
        applicationStatus: "Allocated",
      });

      setMessage("✅ Management seat allocated successfully!");
      managementForm.reset();
      triggerRefresh();
    } catch (error) {
      console.error(error);
      setMessage("❌ Error processing management allocation");
    }
  });

  console.log("FORM ERRORS:", managementForm.formState.errors);

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-4">Admission Allocation</h2>

        {/* Mode Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setAllocationMode("government")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              allocationMode === "government"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Government Allotment
          </button>
          <button
            onClick={() => setAllocationMode("management")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              allocationMode === "management"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Management Allocation
          </button>
        </div>

        {/* GOVERNMENT ALLOTMENT FLOW */}
        {allocationMode === "government" && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              Government Allotment
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Enter allotment number and select quota. System validates seat
              availability before allocation.
            </p>

            <form onSubmit={onGovernmentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allotment Number *
                  </label>
                  <input
                    {...governmentForm.register("allotmentNumber")}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., KCET-2026-001234"
                  />
                  {governmentForm.formState.errors.allotmentNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(
                        governmentForm.formState.errors.allotmentNumber.message,
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program *
                  </label>
                  <select
                    {...governmentForm.register("programId")}
                    onChange={(e) => {
                      const prog = getProgramById(e.target.value);
                      setSelectedProgram(prog || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                  {governmentForm.formState.errors.programId && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(
                        governmentForm.formState.errors.programId.message,
                      )}
                    </p>
                  )}
                </div>
              </div>

              {selectedProgram && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quota Type *
                  </label>
                  <select
                    {...governmentForm.register("quota")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Quota</option>
                    <option value="KCET">KCET</option>
                    <option value="COMEDK">COMEDK</option>
                  </select>
                  {governmentForm.formState.errors.quota && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(governmentForm.formState.errors.quota.message)}
                    </p>
                  )}

                  {/* Show Available Seats */}
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p className="text-sm text-gray-600">
                      KCET Available:{" "}
                      {selectedProgram.quotas.KCET -
                        (selectedProgram.filledSeats.KCET || 0)}{" "}
                      seats
                    </p>
                    <p className="text-sm text-gray-600">
                      COMEDK Available:{" "}
                      {selectedProgram.quotas.COMEDK -
                        (selectedProgram.filledSeats.COMEDK || 0)}{" "}
                      seats
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium"
              >
                Allocate Seat
              </button>
            </form>
          </div>
        )}

        {/* MANAGEMENT ALLOTMENT FLOW */}
        {allocationMode === "management" && (
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-4">
              Management Allocation
            </h3>
            <p className="text-sm text-purple-700 mb-4">
              Select an applicant and allocate a management quota seat. Fee
              status is maintained.
            </p>

            <form onSubmit={onManagementSubmit} className="space-y-4">
              <input
                type="hidden"
                value="Management"
                {...managementForm.register("quota")}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicant *
                  </label>
                  <select
                    {...managementForm.register("applicantId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Applicant</option>
                    {applicants
                      .filter(
                        (a) =>
                          a.quotaType === "Management" &&
                          a.applicationStatus === "Applied",
                      )
                      .map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.name} - {app.email}
                        </option>
                      ))}
                  </select>
                  {managementForm.formState.errors.applicantId && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(
                        managementForm.formState.errors.applicantId.message,
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program *
                  </label>
                  <select
                    {...managementForm.register("programId")}
                    onChange={(e) => {
                      const prog = getProgramById(e.target.value);
                      setSelectedProgram(prog || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                  {managementForm.formState.errors.programId && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(
                        managementForm.formState.errors.programId.message,
                      )}
                    </p>
                  )}
                </div>
              </div>

              {selectedProgram && (
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm text-gray-600 font-medium">
                    Management Seats Available:{" "}
                    <span className="text-lg font-bold text-purple-600">
                      {selectedProgram.quotas.Management -
                        (selectedProgram.filledSeats.Management || 0)}
                    </span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition font-medium"
              >
                Allocate Management Seat
              </button>
            </form>
          </div>
        )}
        {/* Feedback Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Allocations List */}
      {admissions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">
            Recent Allocations ({admissions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Program
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Quota
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Status
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Fee Status
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {admissions.slice(-10).map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {adm.programName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {adm.quota}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          adm.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          adm.feeStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {adm.feeStatus}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {new Date(adm.admissionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
