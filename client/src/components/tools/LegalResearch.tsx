import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, BookOpen, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { formatMarkdownText } from "@/lib/textUtils";
import { DraftManager } from "@/components/DraftManager";

export default function LegalResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    jurisdiction: "all",
    courtLevel: "all",
    state: "",
    federalCircuit: "",
    dateFrom: "",
    dateTo: "",
  });
  const [searchResults, setSearchResults] = useState<any>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const searchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/legal-research/search", {
        query: searchQuery,
        filters,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      const caseCount = data.courtListenerResults?.count || 0;
      toast({
        title: "Success",
        description: `Legal research completed with ${caseCount} cases found`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message?.includes("Unauthorized") 
        ? "Please log in to perform legal research"
        : "Failed to perform legal research";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "Please log in to perform legal research",
        variant: "destructive",
      });
      return;
    }

    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate();
  };

  const handleExportCitations = () => {
    toast({
      title: "Info",
      description: "Citation export functionality will be implemented",
    });
  };

  const handleLoadDraft = (draft: { formData: Record<string, any>; partialOutput?: Record<string, any> }) => {
    const { formData, partialOutput } = draft;
    
    if (formData.searchQuery) setSearchQuery(formData.searchQuery);
    if (formData.filters) setFilters(formData.filters);
    if (partialOutput) setSearchResults(partialOutput);
  };

  const getCurrentFormData = () => ({
    searchQuery,
    filters,
  });

  const getCurrentOutput = () => searchResults ? { research: searchResults } : undefined;



  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Legal Research</h2>
        <p className="text-slate-400">Search legal databases and find relevant precedents</p>
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-300">
            <span className="font-semibold">Enhanced Search:</span> Now supports specific state and federal circuit filtering. Search NM Supreme Court, 10th Circuit Court of Appeals, and more.
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Legal Databases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal precedents, statutes, or case law..."
                className="bg-slate-700 border-slate-600 text-lg"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {searchMutation.isPending ? (
                <LoadingSpinner className="h-4 w-4 mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
            <DraftManager
              toolType="legal-research"
              currentFormData={getCurrentFormData()}
              currentOutput={getCurrentOutput()}
              onLoadDraft={handleLoadDraft}
            />
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Select value={filters.jurisdiction} onValueChange={(value) => setFilters(prev => ({ ...prev, jurisdiction: value, state: "", federalCircuit: "" }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filters.jurisdiction === "state" && (
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nm">New Mexico</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                    <SelectItem value="az">Arizona</SelectItem>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="fl">Florida</SelectItem>
                    <SelectItem value="co">Colorado</SelectItem>
                    <SelectItem value="nv">Nevada</SelectItem>
                    <SelectItem value="ut">Utah</SelectItem>
                    <SelectItem value="ok">Oklahoma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {filters.jurisdiction === "federal" && (
              <div>
                <Label htmlFor="federalCircuit">Federal Circuit</Label>
                <Select value={filters.federalCircuit} onValueChange={(value) => setFilters(prev => ({ ...prev, federalCircuit: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="All Circuits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Circuits</SelectItem>
                    <SelectItem value="1st">1st Circuit</SelectItem>
                    <SelectItem value="2nd">2nd Circuit</SelectItem>
                    <SelectItem value="3rd">3rd Circuit</SelectItem>
                    <SelectItem value="4th">4th Circuit</SelectItem>
                    <SelectItem value="5th">5th Circuit</SelectItem>
                    <SelectItem value="6th">6th Circuit</SelectItem>
                    <SelectItem value="7th">7th Circuit</SelectItem>
                    <SelectItem value="8th">8th Circuit</SelectItem>
                    <SelectItem value="9th">9th Circuit</SelectItem>
                    <SelectItem value="10th">10th Circuit (NM, CO, WY, UT, KS, OK)</SelectItem>
                    <SelectItem value="11th">11th Circuit</SelectItem>
                    <SelectItem value="dc">D.C. Circuit</SelectItem>
                    <SelectItem value="federal">Federal Circuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="courtLevel">Court Level</Label>
              <Select value={filters.courtLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, courtLevel: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="All Courts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  <SelectItem value="supreme">
                    {filters.jurisdiction === "federal" ? "Supreme Court of the US" : 
                     filters.jurisdiction === "state" && filters.state ? `${filters.state.toUpperCase()} Supreme Court` : 
                     "Supreme Court"}
                  </SelectItem>
                  <SelectItem value="appeals">
                    {filters.jurisdiction === "federal" ? "Court of Appeals" : 
                     filters.jurisdiction === "state" && filters.state ? `${filters.state.toUpperCase()} Appellate Courts` : 
                     "Appeals Court"}
                  </SelectItem>
                  {filters.jurisdiction === "state" && (
                    <SelectItem value="trial">Trial Courts</SelectItem>
                  )}
                  {filters.jurisdiction === "federal" && (
                    <SelectItem value="district">District Court</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* CourtListener Cases */}
          {searchResults.courtListenerResults && searchResults.courtListenerResults.results.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Found Cases ({searchResults.courtListenerResults.count} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.courtListenerResults.results.slice(0, 5).map((case_: any, index: number) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-300">{case_.caseName}</h4>
                          <p className="text-sm text-slate-400">
                            {case_.citation} • {case_.court} • {case_.dateFiled}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(case_.url, '_blank')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-300">{case_.snippet}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Legal Research Analysis
                </CardTitle>
                <Button 
                  onClick={handleExportCitations}
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-6 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap">
                  {formatMarkdownText(searchResults.results)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grounding Sources */}
          {searchResults.groundingMetadata && searchResults.groundingMetadata.groundingChunks && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Additional Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchResults.groundingMetadata.groundingChunks.map((chunk: any, index: number) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-3">
                      <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        {chunk.web.title}
                      </a>
                      <p className="text-xs text-slate-400 mt-1">{chunk.web.uri}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
