import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import CaseBriefer from "@/components/tools/CaseBriefer";
import LegalResearch from "@/components/tools/LegalResearch";
import CaseLawExplorer from "@/components/tools/CaseLawExplorer";
import EvidenceAnalyzer from "@/components/tools/EvidenceAnalyzer";
import OrderDrafter from "@/components/tools/OrderDrafter";
import JuryInstructionDrafter from "@/components/tools/JuryInstructionDrafter";
import DailyDocket from "@/components/tools/DailyDocket";
import OralArgumentCoach from "@/components/tools/OralArgumentCoach";
import ActivityHistory from "@/components/tools/ActivityHistory";
import { CaseDocuments } from "@/components/tools/CaseDocuments";
import { ActiveTab } from "@/types";
import { Case } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} />;
      case "case-briefer":
        return <CaseBriefer selectedCase={selectedCase} />;
      case "legal-research":
        return <LegalResearch selectedCase={selectedCase} />;
      case "case-law-explorer":
        return <CaseLawExplorer selectedCase={selectedCase} />;
      case "evidence-analyzer":
        return <EvidenceAnalyzer selectedCase={selectedCase} />;
      case "order-drafter":
        return <OrderDrafter selectedCase={selectedCase} />;
      case "jury-instruction-drafter":
        return <JuryInstructionDrafter selectedCase={selectedCase} />;
      case "daily-docket":
        return <DailyDocket selectedCase={selectedCase} />;
      case "oral-argument-coach":
        return <OralArgumentCoach selectedCase={selectedCase} />;
      case "activity-history":
        return <ActivityHistory selectedCase={selectedCase} />;
      case "case-documents":
        return <CaseDocuments selectedCase={selectedCase} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
