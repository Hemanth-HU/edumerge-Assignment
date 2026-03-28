/**
 * Dashboard Component
 * Displays key metrics and visualizations for admission management
 * Uses Recharts for data visualization
 */

"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getPrograms, getApplicants } from "@/app/services/database";
import { getProgramStats } from "@/app/utils/business-logic";
import { Program, Applicant } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

export function DashboardComponent() {
  const { refreshTrigger } = useAppContext();
  const [programs, setPrograms] = useState<Program[]>(getPrograms());
  const [applicants, setApplicants] = useState<Applicant[]>(getApplicants());

  useEffect(() => {
    setPrograms(getPrograms());
    setApplicants(getApplicants());
  }, [refreshTrigger]);

  // ============ CALCULATE DASHBOARD STATS ============

  let totalIntake = 0;
  let totalAdmitted = 0;
  const quotaStats: Record<
    string,
    { quota: string; total: number; filled: number }
  > = {};

  programs.forEach((prog) => {
    totalIntake += prog.totalIntake;

    Object.entries(prog.quotas).forEach(([quotaName, totalSeats]) => {
      const filledSeats = prog.filledSeats[quotaName] || 0;

      if (!quotaStats[quotaName]) {
        quotaStats[quotaName] = { quota: quotaName, total: 0, filled: 0 };
      }

      quotaStats[quotaName].total += totalSeats;
      quotaStats[quotaName].filled += filledSeats;
      totalAdmitted += filledSeats;
    });
  });

  // ============ PREPARE CHART DATA ============

  // 1. Quota-wise breakdown (Pie Chart)
  const quotaPieData = Object.values(quotaStats).map((stat) => ({
    name: stat.quota,
    value: stat.total,
    filled: stat.filled,
  }));

  // 2. Intake vs Admitted (Bar Chart)
  const intakeData = [
    {
      name: "Seats",
      Intake: totalIntake,
      Admitted: totalAdmitted,
      Remaining: totalIntake - totalAdmitted,
    },
  ];

  // 3. Program-wise seat status (Bar Chart)
  const programData = programs.map((prog) => {
    const totalFilled = Object.values(prog.filledSeats).reduce(
      (sum, val) => sum + val,
      0,
    );
    return {
      name: prog.code,
      Intake: prog.totalIntake,
      Filled: totalFilled,
      Available: prog.totalIntake - totalFilled,
    };
  });

  // 4. Document Status Distribution
  const docStatus = applicants.reduce(
    (acc, app) => {
      const status = app.documentStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const docStatusData = Object.entries(docStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // 5. Fee Status Distribution
  const feeStatus = applicants.reduce(
    (acc, app) => {
      const status = app.feeStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const feeStatusData = Object.entries(feeStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // 6. Quota-wise filled seats (Bar Chart)
  const quotaFilledData = Object.values(quotaStats).map((stat) => ({
    quota: stat.quota,
    filled: stat.filled,
    available: stat.total - stat.filled,
  }));

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Get applicants with pending documents and fees
  const pendingDocApplicants = applicants.filter(
    (a) => a.documentStatus === "Pending",
  );
  const pendingFeeApplicants = applicants.filter(
    (a) => a.feeStatus === "Pending",
  );

  return (
    <div className="space-y-6 p-6 bg-white">
      <div>
        <h2 className="text-3xl font-bold mb-6">Admission Dashboard</h2>

        {/* KEY METRICS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Total Intake</p>
            <p className="text-3xl font-bold text-blue-600">{totalIntake}</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Admitted</p>
            <p className="text-3xl font-bold text-green-600">{totalAdmitted}</p>
            <p className="text-xs text-gray-600 mt-1">
              {((totalAdmitted / totalIntake) * 100 || 0).toFixed(1)}% filled
            </p>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Remaining</p>
            <p className="text-3xl font-bold text-orange-600">
              {totalIntake - totalAdmitted}
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Total Programs</p>
            <p className="text-3xl font-bold text-purple-600">
              {programs.length}
            </p>
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Total Intake vs Admitted */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Intake vs Admission</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={intakeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Intake" fill="#3B82F6" />
                <Bar dataKey="Admitted" fill="#10B981" />
                <Bar dataKey="Remaining" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quota Distribution (Pie Chart) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Quota Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quotaPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quotaPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Quota-wise Filled Seats */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Quota-wise Seat Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quotaFilledData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quota" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="filled" fill="#10B981" name="Filled" />
                <Bar dataKey="available" fill="#E5E7EB" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Document Status */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">
              Document Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={docStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {docStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHARTS ROW 3 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Program-wise Seats */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Program-wise Seat Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={50} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Intake" fill="#3B82F6" />
                <Bar dataKey="Filled" fill="#10B981" />
                <Bar dataKey="Available" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fee Status */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Fee Payment Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feeStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PENDING LISTS */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pending Documents */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-bold text-lg mb-3 text-red-900">
              Pending Document Verification ({pendingDocApplicants.length})
            </h3>
            <div className="max-h-48 overflow-y-auto">
              {pendingDocApplicants.length > 0 ? (
                <ul className="space-y-2">
                  {pendingDocApplicants.slice(0, 5).map((app) => (
                    <li
                      key={app.id}
                      className="text-sm p-2 bg-white rounded border border-red-100"
                    >
                      <p className="font-medium">{app.name}</p>
                      <p className="text-xs text-gray-600">
                        {app.programApplied}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">All documents verified!</p>
              )}
            </div>
          </div>

          {/* Pending Fees */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-lg mb-3 text-yellow-900">
              Pending Fee Collection ({pendingFeeApplicants.length})
            </h3>
            <div className="max-h-48 overflow-y-auto">
              {pendingFeeApplicants.length > 0 ? (
                <ul className="space-y-2">
                  {pendingFeeApplicants.slice(0, 5).map((app) => (
                    <li
                      key={app.id}
                      className="text-sm p-2 bg-white rounded border border-yellow-100"
                    >
                      <p className="font-medium">{app.name}</p>
                      <p className="text-xs text-gray-600">
                        {app.programApplied}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">All fees collected!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
