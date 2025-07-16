import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  FileText, 
  Search, 
  BookOpen, 
  Microscope, 
  Users, 
  Calendar, 
  Mic, 
  Briefcase,
  ExternalLink,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

const ACTIVITY_ICONS = {
  "case-briefer": { icon: Briefcase, color: "bg-blue-500" },
  "legal-research": { icon: Search, color: "bg-green-500" },
  "case-law-explorer": { icon: BookOpen, color: "bg-purple-500" },
  "evidence-analyzer": { icon: Microscope, color: "bg-yellow-500" },
  "order-drafter": { icon: FileText, color: "bg-orange-500" },
  "jury-instruction-drafter": { icon: Users, color: "bg-pink-500" },
  "daily-docket": { icon: Calendar, color: "bg-indigo-500" },
  "oral-argument-coach": { icon: Mic, color: "bg-red-500" },
};

export default function ActivityHistory() {
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { toast } = useToast();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/activity-history", filterType],
    queryFn: async () => {
      const url = filterType && filterType !== "all"
        ? `/api/activity-history?type=${filterType}`
        : "/api/activity-history";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  const handleExportActivity = (activity: any) => {
    toast({
      title: "Info",
      description: "Activity export functionality will be implemented",
    });
  };

  const handleViewDetails = (activity: any) => {
    toast({
      title: "Info",
      description: "Detail view functionality will be implemented",
    });
  };

  const getActivityIcon = (type: string) => {
    const config = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS];
    if (!config) return { icon: History, color: "bg-gray-500" };
    return config;
  };

  const filteredActivities = activities.filter((activity: any) => {
    const activityDate = new Date(activity.createdAt);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    if (fromDate && activityDate < fromDate) return false;
    if (toDate && activityDate > toDate) return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading activity history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Activity History</h2>
        <p className="text-slate-400">Track all user activities and generated documents</p>
      </div>

      {/* Filter Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="case-briefer">Case Briefer</SelectItem>
                  <SelectItem value="legal-research">Legal Research</SelectItem>
                  <SelectItem value="case-law-explorer">Case Law Explorer</SelectItem>
                  <SelectItem value="evidence-analyzer">Evidence Analyzer</SelectItem>
                  <SelectItem value="order-drafter">Order Drafter</SelectItem>
                  <SelectItem value="jury-instruction-drafter">Jury Instructions</SelectItem>
                  <SelectItem value="daily-docket">Daily Docket</SelectItem>
                  <SelectItem value="oral-argument-coach">Oral Argument Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-700 border-slate-600"
                placeholder="From date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-700 border-slate-600"
                placeholder="To date"
              />
            </div>
            <div>
              <Button 
                onClick={() => {
                  setFilterType("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                variant="outline"
                className="w-full bg-slate-700 hover:bg-slate-600"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No activities found</p>
              <p className="text-slate-500 text-sm">
                {(filterType && filterType !== "all") || dateFrom || dateTo 
                  ? "Try adjusting your filters"
                  : "Start using the judicial tools to see your activity history"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity: any) => {
                const { icon: Icon, color } = getActivityIcon(activity.type);
                return (
                  <div 
                    key={activity.id} 
                    className="border-l-4 border-slate-600 pl-4 pb-6 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{activity.title}</h4>
                          <Badge 
                            variant="outline" 
                            className="mt-1 text-xs capitalize"
                          >
                            {activity.type.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                          {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(activity)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportActivity(activity)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Activity Summary */}
                    <div className="bg-slate-900 rounded-lg p-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2 text-slate-300">Input:</h5>
                          <div className="text-slate-400 text-xs">
                            {typeof activity.input === 'object' 
                              ? Object.keys(activity.input).map(key => (
                                  <p key={key}>
                                    <span className="font-medium">{key}:</span> {
                                      typeof activity.input[key] === 'string' 
                                        ? activity.input[key].substring(0, 50) + '...'
                                        : JSON.stringify(activity.input[key])
                                    }
                                  </p>
                                ))
                              : activity.input
                            }
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2 text-slate-300">Output:</h5>
                          <div className="text-slate-400 text-xs">
                            {typeof activity.output === 'object' 
                              ? Object.keys(activity.output).slice(0, 2).map(key => (
                                  <p key={key}>
                                    <span className="font-medium">{key}:</span> {
                                      typeof activity.output[key] === 'string' 
                                        ? activity.output[key].substring(0, 50) + '...'
                                        : JSON.stringify(activity.output[key])
                                    }
                                  </p>
                                ))
                              : activity.output
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
