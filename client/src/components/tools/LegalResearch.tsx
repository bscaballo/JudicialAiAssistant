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

export default function LegalResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    jurisdiction: "",
    courtLevel: "",
    dateFrom: "",
    dateTo: "",
  });
  const [searchResults, setSearchResults] = useState<any>(null);
  const { toast } = useToast();

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
      toast({
        title: "Success",
        description: "Legal research completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to perform legal research",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
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

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Legal Research</h2>
        <p className="text-slate-400">Search legal databases and find relevant precedents</p>
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
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Select value={filters.jurisdiction} onValueChange={(value) => setFilters(prev => ({ ...prev, jurisdiction: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Jurisdictions</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="courtLevel">Court Level</Label>
              <Select value={filters.courtLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, courtLevel: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="All Courts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courts</SelectItem>
                  <SelectItem value="supreme">Supreme Court</SelectItem>
                  <SelectItem value="appeals">Appeals Court</SelectItem>
                  <SelectItem value="district">District Court</SelectItem>
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
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Search Results
              </CardTitle>
              <Button 
                onClick={handleExportCitations}
                variant="outline"
                className="bg-slate-700 hover:bg-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Citations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-6 text-sm leading-relaxed">
              <div className="whitespace-pre-wrap">
                {searchResults.results}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
