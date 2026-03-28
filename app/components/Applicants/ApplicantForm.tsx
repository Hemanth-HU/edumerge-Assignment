/**
 * Applicant Management Component
 * Allows creation and management of applicant records
 * Max 15 fields as per requirements
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApplicantSchema } from "@/app/utils/schemas";
import {
  createApplicant,
  getApplicants,
  getPrograms,
} from "@/app/services/database";
import { Applicant, Program } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

export function ApplicantForm() {
  const { triggerRefresh, refreshTrigger } = useAppContext();
  const [programs] = useState<Program[]>(getPrograms());
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Get applicants directly from global state - no local state needed
  const applicants = getApplicants();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ApplicantSchema),
  });

  const onSubmit = handleSubmit((data) => {
    try {
      createApplicant({
        ...data,
        applicationStatus: "Applied",
      });

      setMessage("Applicant created successfully!");
      reset();
      triggerRefresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error creating applicant");
    }
  });

  const getFilteredApplicants = () => {
    if (filterStatus === "All") return applicants;
    return applicants.filter((a) => a.applicationStatus === filterStatus);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      {/* Application Form */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Applicant Registration</h2>
        <p className="text-sm text-gray-600 mb-4">
          Register new applicants for admission (15 core fields)
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Rajesh Kumar"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rajesh@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                {...register("phone")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.phone.message)}
                </p>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register("category")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.category.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Type *
              </label>
              <select
                {...register("entryType")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral Entry</option>
              </select>
              {errors.entryType && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.entryType.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quota Type *
              </label>
              <select
                {...register("quotaType")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Quota</option>
                <option value="KCET">KCET</option>
                <option value="COMEDK">COMEDK</option>
                <option value="Management">Management</option>
              </select>
              {errors.quotaType && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.quotaType.message)}
                </p>
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Applied *
              </label>
              <select
                {...register("programApplied")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Program</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.name}>
                    {prog.name} ({prog.code})
                  </option>
                ))}
              </select>
              {errors.programApplied && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.programApplied.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entrance Marks *
              </label>
              <input
                {...register("marks", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 850"
              />
              {errors.marks && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.marks.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Status *
              </label>
              <select
                {...register("documentStatus")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
              </select>
              {errors.documentStatus && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.documentStatus.message)}
                </p>
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Status *
              </label>
              <select
                {...register("feeStatus")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              {errors.feeStatus && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.feeStatus.message)}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium"
          >
            Register Applicant
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Applicants List */}
      {applicants.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Registered Applicants ({applicants.length})
            </h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Allocated">Allocated</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Email
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Program
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Quota
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center">
                    Marks
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Documents
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Fee
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredApplicants().map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {app.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {app.email}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {app.programApplied}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {app.quotaType}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {app.marks}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          app.documentStatus === "Verified"
                            ? "bg-green-100 text-green-700"
                            : app.documentStatus === "Submitted"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {app.documentStatus}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          app.feeStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {app.feeStatus}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {app.applicationStatus}
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
