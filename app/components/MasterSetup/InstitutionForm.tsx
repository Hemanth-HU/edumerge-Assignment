/**
 * Institution Management Component
 * Allows admin to create and manage institution details
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InstitutionSchema } from "@/app/utils/schemas";
import { createInstitution, getInstitutions } from "@/app/services/database";
import { Institution } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

export function InstitutionForm() {
  const { triggerRefresh, refreshTrigger } = useAppContext();
  const [message, setMessage] = useState("");

  // Get institutions directly from global state - no local state needed
  const institutions = getInstitutions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(InstitutionSchema),
  });

  const onSubmit = handleSubmit((data) => {
    try {
      createInstitution(data);
      setMessage("Institution created successfully!");
      reset();
      triggerRefresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error creating institution");
    }
  });

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-4">Institution Setup</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution Name *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Delhi Institute of Technology"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution Code *
              </label>
              <input
                {...register("code")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DIT"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.code.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                {...register("city")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Delhi"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.city.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                {...register("state")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Delhi"
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.state.message)}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium"
          >
            Create Institution
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

      {/* Display Created Institutions */}
      {institutions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Configured Institutions</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Code
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    City
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    State
                  </th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {inst.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {inst.code}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {inst.city}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {inst.state}
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
