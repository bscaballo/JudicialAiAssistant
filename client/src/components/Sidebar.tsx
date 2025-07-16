import { 
  Briefcase, 
  Search, 
  BookOpen, 
  Microscope, 
  FileText, 
  Users, 
  Calendar, 
  Mic, 
  History, 
  Gavel,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActiveTab } from "@/types";
import { User } from "@shared/schema";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
}

const NAVIGATION_ITEMS = [
  { id: "case-briefer" as ActiveTab, name: "Case Briefer", icon: Briefcase },
  { id: "legal-research" as ActiveTab, name: "Legal Research", icon: Search },
  { id: "case-law-explorer" as ActiveTab, name: "Case Law Explorer", icon: BookOpen },
  { id: "evidence-analyzer" as ActiveTab, name: "Evidence Analyzer", icon: Microscope },
  { id: "order-drafter" as ActiveTab, name: "Order Drafter", icon: FileText },
  { id: "jury-instruction-drafter" as ActiveTab, name: "Jury Instructions", icon: Users },
  { id: "daily-docket" as ActiveTab, name: "Daily Docket", icon: Calendar },
  { id: "oral-argument-coach" as ActiveTab, name: "Argument Coach", icon: Mic },
  { id: "activity-history" as ActiveTab, name: "Activity History", icon: History },
];

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Gavel className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-lg font-serif font-bold">Judicial AI</h1>
            <p className="text-xs text-slate-400">Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-blue-500 text-white">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email
              }
            </p>
            <p className="text-xs text-slate-400">Division II District Court</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
