import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatMarkdownText } from "@/lib/textUtils";
import { DraftManager } from "@/components/DraftManager";

export default function CaseLawExplorer() {
  const [topic, setTopic] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [explorationResults, setExplorationResults] = useState<any>(null);
  const { toast } = useToast();

  const exploreMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/case-law/explore", {
        topic,
        jurisdiction,
        dateRange,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setExplorationResults(data);
      toast({
        title: "Success",
        description: "Case law exploration completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to explore case law",
        variant: "destructive",
      });
    },
  });

  const handleExplore = () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic to explore",
        variant: "destructive",
      });
      return;
    }

    exploreMutation.mutate();
  };

  const handleExportAnalysis = () => {
    toast({
      title: "Info",
      description: "Analysis export functionality will be implemented",
    });
  };

  const handleLoadDraft = (draft: { formData: Record<string, any>; partialOutput?: Record<string, any> }) => {
    const { formData, partialOutput } = draft;
    
    if (formData.topic) setTopic(formData.topic);
    if (formData.jurisdiction) setJurisdiction(formData.jurisdiction);
    if (formData.dateRange) setDateRange(formData.dateRange);
    if (partialOutput) setExplorationResults(partialOutput);
  };

  const getCurrentFormData = () => ({
    topic,
    jurisdiction,
    dateRange,
  });

  const getCurrentOutput = () => explorationResults ? { exploration: explorationResults } : undefined;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Case Law Explorer</h2>
        <p className="text-slate-400">Browse and analyze case law by topic and jurisdiction</p>
      </div>

      {/* Exploration Interface */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Case Law Exploration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Legal Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Contract Law, Criminal Procedure, Civil Rights"
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Select Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleExplore}
              disabled={exploreMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {exploreMutation.isPending ? (
                <LoadingSpinner className="h-4 w-4 mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Explore Case Law
            </Button>
            <DraftManager
              toolType="case-law-explorer"
              currentFormData={getCurrentFormData()}
              currentOutput={getCurrentOutput()}
              onLoadDraft={handleLoadDraft}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exploration Results */}
      {explorationResults && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Case Law Analysis</CardTitle>
              <Button 
                onClick={handleExportAnalysis}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-6 text-sm leading-relaxed">
              <div className="whitespace-pre-wrap">
                {formatMarkdownText(explorationResults.analysis)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
