import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Microscope, FileText, Upload, Download, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function EvidenceAnalyzer() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [analysisType, setAnalysisType] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
  });

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
        description: "Evidence documents uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload evidence documents",
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      let documentIds = selectedDocuments;
      
      if (selectedFiles.length > 0) {
        const uploadedDocs = await uploadMutation.mutateAsync(selectedFiles);
        documentIds = [...documentIds, ...uploadedDocs.map((doc: any) => doc.id)];
      }
      
      const response = await apiRequest("POST", "/api/evidence/analyze", {
        documentIds,
        analysisType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "Success",
        description: "Evidence analysis completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to analyze evidence",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleDocumentSelect = (documentId: number, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleAnalyze = () => {
    if (selectedDocuments.length === 0 && selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!analysisType) {
      toast({
        title: "Error",
        description: "Please select an analysis type",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate();
  };

  const handleExportAnalysis = () => {
    toast({
      title: "Info",
      description: "Analysis export functionality will be implemented",
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Evidence Analyzer</h2>
        <p className="text-slate-400">Review and categorize evidence documents</p>
      </div>

      {/* Evidence Upload */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Evidence Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="mb-2">Upload new evidence documents</p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="evidence-upload"
            />
            <Label htmlFor="evidence-upload">
              <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 border-blue-600">
                Choose Files
              </Button>
            </Label>
            {selectedFiles.length > 0 && (
              <div className="mt-3 text-left">
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

          {/* Existing Documents */}
          {documents.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Or select from existing documents:</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={(checked) => handleDocumentSelect(doc.id, checked)}
                    />
                    <Label htmlFor={`doc-${doc.id}`} className="text-sm truncate">
                      {doc.fileName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Options */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            Analysis Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="Select analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admissibility">Admissibility Assessment</SelectItem>
                <SelectItem value="relevance">Relevance Analysis</SelectItem>
                <SelectItem value="authentication">Authentication Review</SelectItem>
                <SelectItem value="chain-of-custody">Chain of Custody Analysis</SelectItem>
                <SelectItem value="probative-value">Probative Value Assessment</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 mt-4"
          >
            {analyzeMutation.isPending ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            Analyze Evidence
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evidence Analysis Results</CardTitle>
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
                {analysisResults.analysis}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
