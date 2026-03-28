"use client";

import { useState } from "react";
import { AppProvider } from "@/app/services/app-context";
import { Navigation } from "@/app/components/Navigation";
import { MasterSetupPage } from "@/app/components/MasterSetup/MasterSetupPage";
import { ApplicantForm } from "@/app/components/Applicants/ApplicantForm";
import { AdmissionAllocationComponent } from "@/app/components/Admission/AdmissionAllocation";
import { AdmissionConfirmationComponent } from "@/app/components/Admission/AdmissionConfirmation";
import { DashboardComponent } from "@/app/dashboard/Dashboard";

function HomeContent() {
  const [currentSection, setCurrentSection] = useState<string>("dashboard");

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardComponent />;
      case "master-setup":
        return <MasterSetupPage />;
      case "applicants":
        return <ApplicantForm />;
      case "allocation":
        return <AdmissionAllocationComponent />;
      case "confirmation":
        return <AdmissionConfirmationComponent />;
      default:
        return <DashboardComponent />;
    }
  };

  return (
    <>
      <Navigation
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      <main className="bg-gray-50 min-h-screen py-6">
        <div className="max-w-7xl mx-auto">{renderSection()}</div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
