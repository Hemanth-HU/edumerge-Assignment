/**
 * Navigation Component with Role-based View Switching
 * Implements role-based UI for Admin, Admission Officer, and Management
 */

"use client";

import { useState } from "react";
import { UserRole } from "@/app/types";
import { useAppContext } from "@/app/services/app-context";

interface NavItem {
  id: string;
  label: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "📊 Dashboard",
    roles: ["Admin", "AdmissionOfficer", "Management"],
  },
  { id: "master-setup", label: "⚙️ Master Setup", roles: ["Admin"] },
  {
    id: "applicants",
    label: "👥 Applicants",
    roles: ["Admin", "AdmissionOfficer"],
  },
  {
    id: "allocation",
    label: "🎯 Allocation",
    roles: ["Admin", "AdmissionOfficer"],
  },
  {
    id: "confirmation",
    label: "✅ Confirmation",
    roles: ["Admin", "AdmissionOfficer"],
  },
];

interface NavComponentProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function Navigation({
  currentSection,
  onSectionChange,
}: NavComponentProps) {
  const { currentRole, setCurrentRole } = useAppContext();

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(currentRole),
  );

  return (
    <nav className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">🎓</div>
            <div>
              <h1 className="text-xl font-bold">AdmissionHub</h1>
              <p className="text-xs text-blue-100">
                College Admission Management System
              </p>
            </div>
          </div>

          {/* Role Selector */}
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-blue-100 block mb-1">
                Current Role:
              </label>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-400 transition font-medium text-sm"
              >
                <option value="Admin">👤 Admin</option>
                <option value="AdmissionOfficer">📋 Admission Officer</option>
                <option value="Management">👁️ Management (View-only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex gap-1 px-6 py-2 border-t border-blue-500 overflow-x-auto">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`px-4 py-2 rounded-t-md whitespace-nowrap transition font-medium text-sm ${
                currentSection === item.id
                  ? "bg-white text-blue-600"
                  : "text-blue-100 hover:bg-blue-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
