import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Download, Wand2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function JuryInstructionDrafter() {
  const [caseDetails, setCaseDetails] = useState({
    caseName: "",
    caseNumber: "",
  });
  const [charges, setCharges] = useState("");
  const [specificPoints, setSpecificPoints] = useState("");
  const [generatedInstructions, setGeneratedInstructions] = useState<any>(null);
  const { toast } = useToast();

  const generateInstructionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/jury-instructions/generate", {
        caseDetails,
        charges,
        specificPoints,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedInstructions(data);
      toast({
        title: "Success",
        description: "Jury instructions generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate jury instructions",
        variant: "destructive",
      });
    },
  });

  const handleGenerateInstructions = () => {
    if (!caseDetails.caseName || !caseDetails.caseNumber) {
      toast({
        title: "Error",
        description: "Please fill in case name and case number",
        variant: "destructive",
      });
      return;
    }

    if (!charges.trim()) {
      toast({
        title: "Error",
        description: "Please provide the charges",
        variant: "destructive",
      });
      return;
    }

    generateInstructionsMutation.mutate();
  };

  const handleExportPDF = () => {
    toast({
      title: "Info",
      description: "PDF export functionality will be implemented",
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Info",
      description: "Draft save functionality will be implemented",
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Jury Instruction Drafter</h2>
        <p className="text-slate-400">Create comprehensive jury instructions for court proceedings</p>
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
                placeholder="State v. Defendant"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={caseDetails.caseNumber}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, caseNumber: e.target.value }))}
                placeholder="CR-2024-0001"
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Instruction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="charges">Charges</Label>
            <Textarea
              id="charges"
              value={charges}
              onChange={(e) => setCharges(e.target.value)}
              placeholder="List all charges that the jury must consider..."
              className="bg-slate-700 border-slate-600 min-h-24"
            />
          </div>
          <div>
            <Label htmlFor="specificPoints">Specific Points to Cover</Label>
            <Textarea
              id="specificPoints"
              value={specificPoints}
              onChange={(e) => setSpecificPoints(e.target.value)}
              placeholder="Any specific legal points, definitions, or considerations for this case..."
              className="bg-slate-700 border-slate-600 min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleGenerateInstructions}
          disabled={generateInstructionsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateInstructionsMutation.isPending ? (
            <LoadingSpinner className="h-4 w-4 mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Generate Instructions
        </Button>
        <Button 
          onClick={handleSaveDraft}
          variant="outline" 
          className="bg-slate-700 hover:bg-slate-600"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {/* Generated Instructions Preview */}
      {generatedInstructions && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Generated Jury Instructions
              </CardTitle>
              <Button 
                onClick={handleExportPDF}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-6 text-sm leading-relaxed">
              <div className="font-serif whitespace-pre-wrap">
                {generatedInstructions.instructions}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
