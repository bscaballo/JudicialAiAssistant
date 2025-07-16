import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import CaseBriefer from "@/components/tools/CaseBriefer";
import LegalResearch from "@/components/tools/LegalResearch";
import CaseLawExplorer from "@/components/tools/CaseLawExplorer";
import EvidenceAnalyzer from "@/components/tools/EvidenceAnalyzer";
import OrderDrafter from "@/components/tools/OrderDrafter";
import JuryInstructionDrafter from "@/components/tools/JuryInstructionDrafter";
import DailyDocket from "@/components/tools/DailyDocket";
import OralArgumentCoach from "@/components/tools/OralArgumentCoach";
import ActivityHistory from "@/components/tools/ActivityHistory";
import { ActiveTab } from "@/types";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("case-briefer");

  const renderContent = () => {
    switch (activeTab) {
      case "case-briefer":
        return <CaseBriefer />;
      case "legal-research":
        return <LegalResearch />;
      case "case-law-explorer":
        return <CaseLawExplorer />;
      case "evidence-analyzer":
        return <EvidenceAnalyzer />;
      case "order-drafter":
        return <OrderDrafter />;
      case "jury-instruction-drafter":
        return <JuryInstructionDrafter />;
      case "daily-docket":
        return <DailyDocket />;
      case "oral-argument-coach":
        return <OralArgumentCoach />;
      case "activity-history":
        return <ActivityHistory />;
      default:
        return <CaseBriefer />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
