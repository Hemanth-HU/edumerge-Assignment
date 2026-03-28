/**
 * Global App Context
 * Manages role-based state and triggers UI updates across components
 */

"use client";

import React, { createContext, useState, useCallback, useContext } from "react";
import { UserRole } from "@/app/types";

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const defaultValue: AppContextType = {
  currentRole: "Admin",
  setCurrentRole: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
};

export const AppContext = createContext<AppContextType>(defaultValue);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("Admin");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{ currentRole, setCurrentRole, refreshTrigger, triggerRefresh }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
