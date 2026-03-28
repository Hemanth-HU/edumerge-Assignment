/**
 * Program Management Component
 * Allows admin to create programs with quota distribution
 * IMPORTANT: Implements quota validation - total quota must equal intake
 */

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProgramSchema } from "@/app/utils/schemas";
import {
  createProgram,
  getPrograms,
  getDepartmentById,
} from "@/app/services/database";
import { Program, Department } from "@/app/types";
import { validateQuotaDistribution } from "@/app/utils/business-logic";
import { useAppContext } from "@/app/services/app-context";

interface ProgramFormProps {
  departments: Department[];
}

export function ProgramForm({ departments }: ProgramFormProps) {
  const { triggerRefresh, refreshTrigger } = useAppContext();
  const [message, setMessage] = useState("");

  // Get programs directly from global state - no local state needed
  const programs = getPrograms();
  const [quotaError, setQuotaError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ProgramSchema),
    defaultValues: {
      departmentId: "",
      name: "",
      code: "",
      courseType: "UG",
      totalIntake: 0,
      quotas: {
        KCET: 0,
        COMEDK: 0,
        Management: 0,
      },
    },
  });

  const intake = watch("totalIntake");
  const quotas = watch("quotas");

  useEffect(() => {
    validateQuotas(quotas);
  }, [intake, quotas]);

  // Real-time quota validation
  const validateQuotas = (currentQuotas: Record<string, number>) => {
    const totalQuota = Object.values(currentQuotas).reduce(
      (sum, val) => sum + val,
      0,
    );

    if (totalQuota !== (intake || 0)) {
      setQuotaError(
        `Total quota (${totalQuota}) must equal intake (${intake || 0})`,
      );
      return false;
    }

    setQuotaError("");
    return true;
  };

  const handleQuotaChange = (quota: string, value: number) => {
    const newQuotas = { ...quotas, [quota]: value };
    setValue("quotas", newQuotas, { shouldValidate: true, shouldDirty: true });

    validateQuotas(newQuotas);
  };

  const onSubmit = handleSubmit(
    (data) => {
      console.log("✅ FORM SUBMITTED", data);

      try {
        // 🔹 Step 1: Validate quotas (UI check)
        if (!validateQuotas(data.quotas)) {
          console.log("❌ Quota validation failed");
          return;
        }

        // 🔹 Step 2: Business validation
        const validation = validateQuotaDistribution(
          data.totalIntake,
          data.quotas,
        );

        if (!validation.isValid) {
          console.log("❌ Business validation failed:", validation.message);
          setMessage(validation.message);
          return;
        }

        // 🔹 Step 3: Create program
        console.log("📦 Creating program...");
        createProgram({ ...data });

        console.log("✅ Program created");

        // 🔹 Step 4: Reset UI
        setMessage("Program created successfully!");
        reset();
        setValue("quotas", { KCET: 0, COMEDK: 0, Management: 0 });
        setQuotaError("");

        // 🔹 Step 5: Refresh UI
        triggerRefresh();

        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error("🔥 Error creating program:", error);
        setMessage("Error creating program");
      }
    },

    // 🔴 THIS IS CRITICAL (you were missing this)
    (errors) => {
      console.log("❌ VALIDATION ERRORS:", errors);
      setMessage("Please fix form errors before submitting");
    },
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-4">Program Setup</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                {...register("departmentId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.departmentId.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Name *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Computer Science"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Code *
              </label>
              <input
                {...register("code")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CSE"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.code.message)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Type *
              </label>
              <select
                {...register("courseType")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="UG">Under Graduate</option>
                <option value="PG">Post Graduate</option>
              </select>
              {errors.courseType && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.courseType.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Intake *
              </label>
              <input
                {...register("totalIntake", { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
                onChange={(e) =>
                  setValue("totalIntake", parseInt(e.target.value) || 0)
                }
              />
              {errors.totalIntake && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.totalIntake.message)}
                </p>
              )}
            </div>
          </div>

          {/* QUOTA DISTRIBUTION SECTION - CRITICAL FOR ALLOCATION LOGIC */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">
              Quota Distribution ({intake || 0} seats total)
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Total quota seats MUST equal total intake. This ensures proper
              seat allocation.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {["KCET", "COMEDK", "Management"].map((quota) => (
                <div key={quota}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {quota}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quotas?.[quota] ?? 0}
                    onChange={(e) =>
                      handleQuotaChange(quota, parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            {quotaError && (
              <div className="mt-3 p-2 bg-red-100 text-red-700 rounded text-sm border border-red-300">
                {quotaError}
              </div>
            )}
            <div className="mt-3 text-sm font-semibold text-gray-700">
              Total Quota Seats:{" "}
              <span
                className={
                  Object.values(quotas).reduce((a, b) => a + b, 0) ===
                  (intake || 0)
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {Object.values(quotas).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!!quotaError}
            className={`w-full py-2 px-4 rounded-md transition font-medium text-white ${
              quotaError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Create Program
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

      {/* Display Programs */}
      {programs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Configured Programs</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Program
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Code
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Type
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Total Intake
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Quotas
                  </th>
                </tr>
              </thead>
              <tbody>
                {programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {prog.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {prog.code}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {prog.courseType}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {prog.totalIntake}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Object.entries(prog.quotas)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(", ")}
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
