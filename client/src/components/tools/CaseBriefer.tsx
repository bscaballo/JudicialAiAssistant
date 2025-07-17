import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, Wand2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatMarkdownText } from "@/lib/textUtils";
import { DraftManager } from "@/components/DraftManager";

export default function CaseBriefer() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caseDetails, setCaseDetails] = useState({
    caseName: "",
    caseNumber: "",
    court: "",
    dateFiled: "",
  });
  const [generatedBrief, setGeneratedBrief] = useState<any>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("document", file);
        const response = await apiRequest("POST", "/api/documents/upload", formData);
        return response.json();
      });
      return Promise.all(uploadPromises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const generateBriefMutation = useMutation({
    mutationFn: async () => {
      const uploadedDocs = await uploadMutation.mutateAsync(selectedFiles);
      const documentIds = uploadedDocs.map((doc: any) => doc.id);
      
      const response = await apiRequest("POST", "/api/case-briefer/generate", {
        documentIds,
        caseDetails,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedBrief(data);
      toast({
        title: "Success",
        description: "Case brief generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate case brief",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleChooseFiles = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleGenerateBrief = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document",
        variant: "destructive",
      });
      return;
    }

    if (!caseDetails.caseName || !caseDetails.caseNumber) {
      toast({
        title: "Error",
        description: "Please fill in case name and case number",
        variant: "destructive",
      });
      return;
    }

    generateBriefMutation.mutate();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast({
      title: "Info",
      description: "PDF export functionality will be implemented",
    });
  };

  const handleLoadDraft = (draft: { formData: Record<string, any>; partialOutput?: Record<string, any> }) => {
    const { formData, partialOutput } = draft;
    
    // Load form data
    if (formData.caseDetails) {
      setCaseDetails(formData.caseDetails);
    }
    if (formData.selectedFiles) {
      // Note: File objects can't be fully restored from drafts, so we'll show file names
      setSelectedFiles(formData.selectedFiles);
    }
    
    // Load partial output
    if (partialOutput) {
      setGeneratedBrief(partialOutput);
    }
  };

  const getCurrentFormData = () => ({
    caseDetails,
    selectedFiles: selectedFiles.map(file => ({ name: file.name, size: file.size, type: file.type })),
  });

  const getCurrentOutput = () => generatedBrief ? { brief: generatedBrief } : undefined;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Case Briefer</h2>
        <p className="text-slate-400">Upload and analyze legal documents for comprehensive case summaries</p>
      </div>

      {/* File Upload Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg mb-2">Select legal documents to upload</p>
            <p className="text-slate-400 mb-4">PDF, DOC, DOCX, TXT files supported (Max 10MB each)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button 
              onClick={handleChooseFiles}
              variant="outline" 
              className="bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              Choose Files
            </Button>
            {selectedFiles.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm text-slate-400 mb-2">Selected files:</p>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Details Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent>
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
            <div>
              <Label htmlFor="court">Court</Label>
              <Input
                id="court"
                value={caseDetails.court}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, court: e.target.value }))}
                placeholder="Division II District Court"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="dateFiled">Date Filed</Label>
              <Input
                id="dateFiled"
                type="date"
                value={caseDetails.dateFiled}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, dateFiled: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleGenerateBrief}
          disabled={generateBriefMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateBriefMutation.isPending ? (
            <LoadingSpinner className="h-4 w-4 mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Generate Brief
        </Button>
        <DraftManager
          toolType="case-briefer"
          currentFormData={getCurrentFormData()}
          currentOutput={getCurrentOutput()}
          onLoadDraft={handleLoadDraft}
        />
      </div>

      {/* Generated Brief Preview */}
      {generatedBrief && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Brief</CardTitle>
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
                {formatMarkdownText(generatedBrief.summary)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
