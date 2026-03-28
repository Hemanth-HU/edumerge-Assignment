/**
 * Master Setup Page
 * Consolidates all master data configuration
 */

"use client";

import { useState } from "react";
import { InstitutionForm } from "./InstitutionForm";
import { ProgramForm } from "./ProgramForm";
import {
  getInstitutions,
  getCampuses,
  getDepartments,
  getPrograms,
  createCampus,
  createDepartment,
  getAcademicYears,
  createAcademicYear,
} from "@/app/services/database";
import { Department, Campus, AcademicYear } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

export function MasterSetupPage() {
  const { triggerRefresh, refreshTrigger } = useAppContext();
  const [activeTab, setActiveTab] = useState<
    "institution" | "campus" | "department" | "program" | "year"
  >("institution");
  const [message, setMessage] = useState("");

  // Get data directly from global state - no local state needed
  const departments = getDepartments();
  const campuses = getCampuses();
  const academicYears = getAcademicYears();

  // ============ CAMPUS MANAGEMENT ============

  const [campusForm, setCampusForm] = useState({
    institutionId: "",
    name: "",
    code: "",
    location: "",
  });

  const handleCreateCampus = () => {
    if (
      !campusForm.institutionId ||
      !campusForm.name ||
      !campusForm.code ||
      !campusForm.location
    ) {
      setMessage("All campus fields are required");
      return;
    }
    try {
      createCampus({
        institutionId: campusForm.institutionId,
        name: campusForm.name,
        code: campusForm.code,
        location: campusForm.location,
      });
      setCampusForm({ institutionId: "", name: "", code: "", location: "" });
      setMessage("Campus created successfully!");
      triggerRefresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error creating campus");
    }
  };

  // ============ DEPARTMENT MANAGEMENT ============

  const [departmentForm, setDepartmentForm] = useState({
    campusId: "",
    name: "",
    code: "",
    head: "",
  });

  const handleCreateDepartment = () => {
    if (
      !departmentForm.campusId ||
      !departmentForm.name ||
      !departmentForm.code ||
      !departmentForm.head
    ) {
      setMessage("All department fields are required");
      return;
    }
    try {
      createDepartment(departmentForm);
      setDepartmentForm({ campusId: "", name: "", code: "", head: "" });
      setMessage("Department created successfully!");
      triggerRefresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error creating department");
    }
  };

  // ============ ACADEMIC YEAR MANAGEMENT ============

  const [yearForm, setYearForm] = useState({
    year: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const handleCreateYear = () => {
    if (!yearForm.year || !yearForm.startDate || !yearForm.endDate) {
      setMessage("All year fields are required");
      return;
    }
    try {
      createAcademicYear({
        year: yearForm.year,
        startDate: new Date(yearForm.startDate),
        endDate: new Date(yearForm.endDate),
        isActive: yearForm.isActive,
      });
      setYearForm({
        year: new Date().getFullYear().toString(),
        startDate: "",
        endDate: "",
        isActive: true,
      });
      setMessage("Academic year created successfully!");
      triggerRefresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error creating academic year");
    }
  };

  const institutions = getInstitutions();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: "institution" as const, label: "🏛️ Institution" },
            { id: "campus" as const, label: "🏫 Campus" },
            { id: "department" as const, label: "📚 Department" },
            { id: "program" as const, label: "📖 Program" },
            { id: "year" as const, label: "📅 Academic Year" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Institution Tab */}
          {activeTab === "institution" && <InstitutionForm />}

          {/* Campus Tab */}
          {activeTab === "campus" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Campus Setup</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution *
                    </label>
                    <select
                      value={campusForm.institutionId}
                      onChange={(e) =>
                        setCampusForm({
                          ...campusForm,
                          institutionId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Institution</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Campus Name"
                      value={campusForm.name}
                      onChange={(e) =>
                        setCampusForm({ ...campusForm, name: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Code"
                      value={campusForm.code}
                      onChange={(e) =>
                        setCampusForm({ ...campusForm, code: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={campusForm.location}
                      onChange={(e) =>
                        setCampusForm({
                          ...campusForm,
                          location: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleCreateCampus}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    Create Campus
                  </button>
                </div>

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

              {campuses.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    Configured Campuses
                  </h3>
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
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {campuses.map((camp) => (
                          <tr key={camp.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                              {camp.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {camp.code}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {camp.location}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Department Tab */}
          {activeTab === "department" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Department Setup</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus *
                    </label>
                    <select
                      value={departmentForm.campusId}
                      onChange={(e) =>
                        setDepartmentForm({
                          ...departmentForm,
                          campusId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Campus</option>
                      {campuses.map((camp) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Department Name"
                      value={departmentForm.name}
                      onChange={(e) =>
                        setDepartmentForm({
                          ...departmentForm,
                          name: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Code"
                      value={departmentForm.code}
                      onChange={(e) =>
                        setDepartmentForm({
                          ...departmentForm,
                          code: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Head Name"
                      value={departmentForm.head}
                      onChange={(e) =>
                        setDepartmentForm({
                          ...departmentForm,
                          head: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleCreateDepartment}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    Create Department
                  </button>
                </div>

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

              {departments.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    Configured Departments
                  </h3>
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
                            Head
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept) => (
                          <tr key={dept.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                              {dept.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {dept.code}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {dept.head}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Program Tab */}
          {activeTab === "program" && <ProgramForm departments={departments} />}

          {/* Academic Year Tab */}
          {activeTab === "year" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Academic Year Setup</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Year (e.g., 2026-2027)"
                      value={yearForm.year}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, year: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={yearForm.startDate}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, startDate: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      placeholder="End Date"
                      value={yearForm.endDate}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, endDate: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={yearForm.isActive}
                        onChange={(e) =>
                          setYearForm({
                            ...yearForm,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Set as Active
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleCreateYear}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    Create Academic Year
                  </button>
                </div>

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

              {academicYears.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Academic Years</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Year
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Start
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            End
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {academicYears.map((year) => (
                          <tr key={year.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                              {year.year}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {new Date(year.startDate).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {new Date(year.endDate).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  year.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {year.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
