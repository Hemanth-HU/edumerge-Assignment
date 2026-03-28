/**
 * Admission Confirmation Component
 * CRITICAL FUNCTION: Generates unique admission numbers and confirms admissions
 *
 * Rules implemented:
 * 1. Fee must be PAID for confirmation
 * 2. Admission number is immutable and unique
 * 3. Format: INST/YEAR/COURSE/PROGRAM/QUOTA/NUMBER
 * 4. Generated only once at confirmation
 */

"use client";

import { useState } from "react";
import {
  getAdmissions,
  updateAdmission,
  updateApplicant,
  getAdmissionById,
  getApplicantById,
} from "@/app/services/database";
import {
  canConfirmAdmission,
  generateAdmissionNumber,
  isAdmissionNumberUnique,
} from "@/app/utils/business-logic";
import { Admission, Applicant } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

export function AdmissionConfirmationComponent() {
  const { triggerRefresh, refreshTrigger } = useAppContext();
  const [expandedAdmissionId, setExpandedAdmissionId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<
    Record<string, "Paid" | "Pending">
  >({});

  // Get admissions directly from global state - no local state needed
  const admissions = getAdmissions();

  const handleMarkFeePaid = (admissionId: string) => {
    setSelectedFeeStatus((prev) => ({
      ...prev,
      [admissionId]: "Paid",
    }));
  };

  const handleConfirmAdmission = (admissionId: string) => {
    try {
      const admission = getAdmissionById(admissionId);
      if (!admission) {
        setMessage("Admission record not found");
        return;
      }

      // Update fee status if marked as paid
      let updatedAdmission = { ...admission };
      if (selectedFeeStatus[admissionId] === "Paid") {
        updatedAdmission.feeStatus = "Paid";
      }

      // CRITICAL: Check if fee is paid - required for confirmation
      const confirmationCheck = canConfirmAdmission(updatedAdmission);
      if (!confirmationCheck.canConfirm) {
        setMessage(`❌ ${confirmationCheck.reason}`);
        return;
      }

      // Generate unique admission number (immutable, generated only once)
      const admissionNumber = generateAdmissionNumber(updatedAdmission);

      // Verify uniqueness
      if (!isAdmissionNumberUnique(admissionNumber, admissions)) {
        setMessage(`❌ Admission number already exists (collision detected)`);
        return;
      }

      // Update admission with confirmation details
      const confirmedAdmission = updateAdmission(admissionId, {
        admissionNumber, // Set once, never changes
        status: "Confirmed",
        confirmationDate: new Date(),
        feeStatus: "Paid",
      });

      if (!confirmedAdmission) {
        setMessage("Failed to confirm admission");
        return;
      }

      // Update applicant status
      if (admission.applicantId !== `gov_allot_${Date.now()}`) {
        const applicant = getApplicantById(admission.applicantId);
        if (applicant) {
          updateApplicant(admission.applicantId, {
            applicationStatus: "Confirmed",
          });
        }
      }

      setMessage(
        `✅ Admission confirmed! Admission Number: ${admissionNumber}`,
      );
      setExpandedAdmissionId(null);
      setSelectedFeeStatus((prev) => {
        const updated = { ...prev };
        delete updated[admissionId];
        return updated;
      });
      triggerRefresh();
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("Error confirming admission");
    }
  };

  // Filter admissions that can be confirmed (status = Allocated, fee = Paid or can be marked paid)
  const confirmableAdmissions = admissions.filter(
    (a) => a.status === "Allocated",
  );
  const confirmedAdmissions = admissions.filter(
    (a) => a.status === "Confirmed",
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-4">Admission Confirmation</h2>
        <p className="text-sm text-gray-600 mb-4">
          Confirm allocations and generate unique admission numbers (Fee payment
          required)
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* PENDING CONFIRMATIONS */}
        {confirmableAdmissions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-blue-900">
              Pending Confirmation ({confirmableAdmissions.length})
            </h3>

            <div className="space-y-3">
              {confirmableAdmissions.map((admission) => (
                <div
                  key={admission.id}
                  className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">
                        {admission.programName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quota:{" "}
                        <span className="font-medium">{admission.quota}</span> |
                        Course:{" "}
                        <span className="font-medium">
                          {admission.courseType}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Date:{" "}
                        {new Date(admission.admissionDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          admission.feeStatus === "Paid" ||
                          selectedFeeStatus[admission.id] === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Fee:{" "}
                        {selectedFeeStatus[admission.id]
                          ? "Paid"
                          : admission.feeStatus}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() =>
                      setExpandedAdmissionId(
                        expandedAdmissionId === admission.id
                          ? null
                          : admission.id,
                      )
                    }
                    className="text-blue-600 hover:underline text-sm mt-2"
                  >
                    {expandedAdmissionId === admission.id
                      ? "Hide Details"
                      : "Show Details"}
                  </button>

                  {expandedAdmissionId === admission.id && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Admission ID</p>
                          <p className="font-mono text-sm">{admission.id}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">
                            Current Fee Status
                          </p>
                          <p className="font-medium">{admission.feeStatus}</p>
                        </div>

                        {admission.feeStatus === "Pending" && (
                          <button
                            onClick={() => handleMarkFeePaid(admission.id)}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-medium text-sm"
                          >
                            Mark Fee as Paid
                          </button>
                        )}

                        {(admission.feeStatus === "Paid" ||
                          selectedFeeStatus[admission.id] === "Paid") && (
                          <div className="p-3 bg-green-100 rounded border border-green-300">
                            <p className="text-sm text-green-700 font-medium">
                              ✓ Fee requirement met - ready for confirmation
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => handleConfirmAdmission(admission.id)}
                          disabled={
                            admission.feeStatus === "Pending" &&
                            selectedFeeStatus[admission.id] !== "Paid"
                          }
                          className={`w-full py-2 px-4 rounded-md transition font-medium text-white ${
                            admission.feeStatus === "Pending" &&
                            selectedFeeStatus[admission.id] !== "Paid"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Generate Admission Number & Confirm
                        </button>

                        <div className="p-3 bg-gray-100 rounded text-xs">
                          <p className="font-mono">
                            Admission Format: INST/2026/{admission.courseType}/
                            {admission.programName
                              .substring(0, 4)
                              .toUpperCase()}
                            /{admission.quota}/####
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIRMED ADMISSIONS */}
        {confirmedAdmissions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 text-green-900">
              Confirmed Admissions ({confirmedAdmissions.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead className="bg-green-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Program
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Quota
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Admission Number
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Fee
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Confirmed Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedAdmissions.map((admission) => (
                    <tr key={admission.id} className="hover:bg-green-50">
                      <td className="border border-gray-300 px-3 py-2">
                        {admission.programName}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {admission.quota}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="font-mono bg-green-50 px-2 py-1 rounded text-xs">
                          {admission.admissionNumber}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          {admission.feeStatus}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {admission.confirmationDate
                          ? new Date(
                              admission.confirmationDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {confirmableAdmissions.length === 0 &&
          confirmedAdmissions.length === 0 && (
            <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
              No admissions to process
            </div>
          )}
      </div>
    </div>
  );
}
