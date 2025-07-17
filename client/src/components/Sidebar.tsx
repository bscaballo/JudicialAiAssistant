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
  LogOut,
  LayoutDashboard,
  Plus,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveTab } from "@/types";
import { User, Case } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  selectedCase?: Case | null;
  setSelectedCase: (caseItem: Case | null) => void;
}

const NAVIGATION_ITEMS = [
  { id: "dashboard" as ActiveTab, name: "Dashboard", icon: LayoutDashboard },
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

export default function Sidebar({ activeTab, setActiveTab, user, selectedCase, setSelectedCase }: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingCase, setIsAddingCase] = useState(false);
  const [manualCaseForm, setManualCaseForm] = useState({
    caseName: "",
    caseNumber: "",
    court: "",
    dateFiled: "",
    status: "active"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeAddCaseTab, setActiveAddCaseTab] = useState("manual");

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Fetch cases for the current user
  const { data: cases = [] } = useQuery({
    queryKey: ['/api/cases'],
    enabled: !!user,
  });

  // Create case mutation
  const createCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      return await apiRequest('/api/cases', {
        method: 'POST',
        body: JSON.stringify(caseData),
      });
    },
    onSuccess: (newCase) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cases'] });
      setSelectedCase(newCase);
      setIsAddingCase(false);
      setManualCaseForm({
        caseName: "",
        caseNumber: "",
        court: "",
        dateFiled: "",
        status: "active"
      });
      setSelectedFile(null);
      toast({
        title: "Case Created",
        description: "New case has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Extract case info from pleading mutation
  const extractCaseInfoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/extract-case-info', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract case information');
      }
      
      return response.json();
    },
    onSuccess: (extractedInfo) => {
      setManualCaseForm({
        caseName: extractedInfo.caseName || "",
        caseNumber: extractedInfo.caseNumber || "",
        court: extractedInfo.court || "",
        dateFiled: extractedInfo.dateFiled || "",
        status: "active"
      });
      toast({
        title: "Case Information Extracted",
        description: "Case details have been automatically filled.",
      });
    },
    onError: (error) => {
      console.error('Error extracting case info:', error);
      toast({
        title: "Error",
        description: "Failed to extract case information. Please fill manually.",
        variant: "destructive",
      });
    },
  });

  const handleCaseSelect = (caseId: string) => {
    if (caseId === "add-case") {
      setIsAddingCase(true);
    } else {
      const caseItem = cases.find((c: Case) => c.id.toString() === caseId);
      setSelectedCase(caseItem || null);
    }
  };

  const handleManualCaseSubmit = () => {
    if (!manualCaseForm.caseName || !manualCaseForm.caseNumber) {
      toast({
        title: "Error",
        description: "Case name and case number are required.",
        variant: "destructive",
      });
      return;
    }
    
    createCaseMutation.mutate(manualCaseForm);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      extractCaseInfoMutation.mutate(file);
    }
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

      {/* Case Selector */}
      <div className="p-4 border-b border-slate-700">
        <Label htmlFor="case-selector" className="text-sm font-medium text-slate-200 mb-2 block">
          Active Case
        </Label>
        <Select 
          value={selectedCase?.id?.toString() || ""} 
          onValueChange={handleCaseSelect}
        >
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
            <SelectValue placeholder="Select a case">
              {selectedCase ? (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="truncate">{selectedCase.caseName}</span>
                </div>
              ) : (
                "No case selected"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {cases.map((caseItem: Case) => (
              <SelectItem key={caseItem.id} value={caseItem.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{caseItem.caseName}</span>
                  <span className="text-xs text-slate-500">{caseItem.caseNumber}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="add-case">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add New Case</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Case Dialog */}
      <Dialog open={isAddingCase} onOpenChange={setIsAddingCase}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Add New Case</DialogTitle>
          </DialogHeader>
          <Tabs value={activeAddCaseTab} onValueChange={setActiveAddCaseTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="manual" className="text-slate-200">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload" className="text-slate-200">Upload Pleading</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div>
                <Label htmlFor="caseName" className="text-slate-200">Case Name *</Label>
                <Input
                  id="caseName"
                  value={manualCaseForm.caseName}
                  onChange={(e) => setManualCaseForm(prev => ({ ...prev, caseName: e.target.value }))}
                  placeholder="e.g., Smith v. Jones"
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="caseNumber" className="text-slate-200">Case Number *</Label>
                <Input
                  id="caseNumber"
                  value={manualCaseForm.caseNumber}
                  onChange={(e) => setManualCaseForm(prev => ({ ...prev, caseNumber: e.target.value }))}
                  placeholder="e.g., 2024-CV-001"
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="court" className="text-slate-200">Court</Label>
                <Input
                  id="court"
                  value={manualCaseForm.court}
                  onChange={(e) => setManualCaseForm(prev => ({ ...prev, court: e.target.value }))}
                  placeholder="e.g., Superior Court"
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="dateFiled" className="text-slate-200">Date Filed</Label>
                <Input
                  id="dateFiled"
                  type="date"
                  value={manualCaseForm.dateFiled}
                  onChange={(e) => setManualCaseForm(prev => ({ ...prev, dateFiled: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
              
              <Button 
                onClick={handleManualCaseSubmit}
                disabled={createCaseMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createCaseMutation.isPending ? "Creating..." : "Create Case"}
              </Button>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div>
                <Label htmlFor="pleading-upload" className="text-slate-200">Upload Initial Pleading</Label>
                <Input
                  id="pleading-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
                {selectedFile && (
                  <p className="text-sm text-slate-400 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              {extractCaseInfoMutation.isPending && (
                <div className="text-center py-4">
                  <p className="text-sm text-blue-400">Extracting case information...</p>
                </div>
              )}
              
              {(manualCaseForm.caseName || manualCaseForm.caseNumber) && (
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                    <p className="text-sm text-green-300 font-medium">
                      ✓ Case information extracted successfully!
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      Review and edit the details below, then click "Create Case" to save.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="extracted-caseName" className="text-slate-200">Case Name *</Label>
                    <Input
                      id="extracted-caseName"
                      value={manualCaseForm.caseName}
                      onChange={(e) => setManualCaseForm(prev => ({ ...prev, caseName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                      placeholder="Case name is required"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="extracted-caseNumber" className="text-slate-200">Case Number *</Label>
                    <Input
                      id="extracted-caseNumber"
                      value={manualCaseForm.caseNumber}
                      onChange={(e) => setManualCaseForm(prev => ({ ...prev, caseNumber: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                      placeholder="Case number is required"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="extracted-court" className="text-slate-200">Court</Label>
                    <Input
                      id="extracted-court"
                      value={manualCaseForm.court}
                      onChange={(e) => setManualCaseForm(prev => ({ ...prev, court: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                      placeholder="e.g., Superior Court"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="extracted-dateFiled" className="text-slate-200">Date Filed</Label>
                    <Input
                      id="extracted-dateFiled"
                      type="date"
                      value={manualCaseForm.dateFiled}
                      onChange={(e) => setManualCaseForm(prev => ({ ...prev, dateFiled: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleManualCaseSubmit}
                    disabled={createCaseMutation.isPending || !manualCaseForm.caseName || !manualCaseForm.caseNumber}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {createCaseMutation.isPending ? "Creating Case..." : "Create Case"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
