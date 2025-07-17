import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Download, Wand2, Save, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatMarkdownText } from "@/lib/textUtils";

export default function OralArgumentCoach() {
  const [caseDetails, setCaseDetails] = useState({
    caseName: "",
    caseNumber: "",
  });
  const [argumentsText, setArgumentsText] = useState("");
  const [practiceMode, setPracticeMode] = useState("");
  const [coachingResults, setCoachingResults] = useState<any>(null);
  const { toast } = useToast();

  const coachMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/oral-argument/coach", {
        caseDetails,
        argumentsText,
        practiceMode,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCoachingResults(data);
      toast({
        title: "Success",
        description: "Oral argument coaching completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to provide oral argument coaching",
        variant: "destructive",
      });
    },
  });

  const handleStartCoaching = () => {
    if (!caseDetails.caseName || !caseDetails.caseNumber) {
      toast({
        title: "Error",
        description: "Please fill in case name and case number",
        variant: "destructive",
      });
      return;
    }

    if (!argumentsText.trim()) {
      toast({
        title: "Error",
        description: "Please provide the arguments to be presented",
        variant: "destructive",
      });
      return;
    }

    if (!practiceMode) {
      toast({
        title: "Error",
        description: "Please select a practice mode",
        variant: "destructive",
      });
      return;
    }

    coachMutation.mutate();
  };

  const handleExportGuide = () => {
    toast({
      title: "Info",
      description: "Export functionality will be implemented",
    });
  };

  const handleSaveSession = () => {
    toast({
      title: "Info",
      description: "Session save functionality will be implemented",
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Oral Argument Coach</h2>
        <p className="text-slate-400">Practice and receive feedback on oral arguments</p>
      </div>

      {/* Case Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="caseName">Case Name</Label>
              <Input
                id="caseName"
                value={caseDetails.caseName}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, caseName: e.target.value }))}
                placeholder="Smith v. Johnson"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={caseDetails.caseNumber}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, caseNumber: e.target.value }))}
                placeholder="CV-2024-0001"
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arguments and Practice Mode */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Practice Session Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="arguments">Arguments to be Presented</Label>
            <Textarea
              id="arguments"
              value={argumentsText}
              onChange={(e) => setArgumentsText(e.target.value)}
              placeholder="Outline the key arguments, legal theories, and points you plan to present..."
              className="bg-slate-700 border-slate-600 min-h-32"
            />
          </div>
          <div>
            <Label htmlFor="practiceMode">Practice Mode</Label>
            <Select value={practiceMode} onValueChange={setPracticeMode}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="Select practice mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opening-statement">Opening Statement</SelectItem>
                <SelectItem value="closing-argument">Closing Argument</SelectItem>
                <SelectItem value="motion-hearing">Motion Hearing</SelectItem>
                <SelectItem value="appellate-argument">Appellate Argument</SelectItem>
                <SelectItem value="questioning-prep">Question Preparation</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleStartCoaching}
          disabled={coachMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {coachMutation.isPending ? (
            <LoadingSpinner className="h-4 w-4 mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Start Coaching
        </Button>
        <Button 
          onClick={handleSaveSession}
          variant="outline" 
          className="bg-slate-700 hover:bg-slate-600"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Session
        </Button>
      </div>

      {/* Coaching Results */}
      {coachingResults && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Coaching Feedback
              </CardTitle>
              <Button 
                onClick={handleExportGuide}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Guide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-6 text-sm leading-relaxed">
              <div className="whitespace-pre-wrap">
                {formatMarkdownText(coachingResults.coaching)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
