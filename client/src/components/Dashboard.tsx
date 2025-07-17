import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  Calendar,
  FileText,
  Search,
  BookOpen,
  Microscope,
  Users,
  Mic,
  History,
  Briefcase,
  Gavel,
  Clock,
  MapPin,
  ChevronRight,
  Plus
} from "lucide-react";
import { Case, GoogleCalendarEvent } from "@shared/schema";
import { ActiveTab } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  upcomingEvents: number;
}

const TOOL_CARDS = [
  {
    id: "case-briefer" as ActiveTab,
    title: "Case Briefer",
    description: "Generate comprehensive case briefs from legal documents",
    icon: Briefcase,
    color: "bg-blue-500"
  },
  {
    id: "legal-research" as ActiveTab,
    title: "Legal Research",
    description: "Research case law, statutes, and legal precedents",
    icon: Search,
    color: "bg-green-500"
  },
  {
    id: "case-law-explorer" as ActiveTab,
    title: "Case Law Explorer",
    description: "Explore historical cases and legal principles",
    icon: BookOpen,
    color: "bg-purple-500"
  },
  {
    id: "evidence-analyzer" as ActiveTab,
    title: "Evidence Analyzer",
    description: "Analyze and organize case evidence",
    icon: Microscope,
    color: "bg-orange-500"
  },
  {
    id: "order-drafter" as ActiveTab,
    title: "Order Drafter",
    description: "Draft legal orders and court documents",
    icon: FileText,
    color: "bg-red-500"
  },
  {
    id: "jury-instruction-drafter" as ActiveTab,
    title: "Jury Instructions",
    description: "Generate jury instruction documents",
    icon: Users,
    color: "bg-indigo-500"
  },
  {
    id: "daily-docket" as ActiveTab,
    title: "Daily Docket",
    description: "Manage daily court schedules and proceedings",
    icon: Calendar,
    color: "bg-teal-500"
  },
  {
    id: "oral-argument-coach" as ActiveTab,
    title: "Argument Coach",
    description: "Practice and improve oral arguments",
    icon: Mic,
    color: "bg-pink-500"
  }
];

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { user } = useAuth();
  
  // Fetch cases
  const { data: cases = [], isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ['/api/cases'],
    enabled: !!user
  });

  // Fetch Google Calendar connection status
  const { data: calendarStatus } = useQuery<{ connected: boolean }>({
    queryKey: ['/api/google-calendar/status'],
    enabled: !!user
  });

  // Fetch Google Calendar events
  const { data: calendarEvents = [], isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ['/api/google-calendar/events'],
    enabled: !!user && calendarStatus?.connected,
    retry: false
  });

  const stats: DashboardStats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'active').length,
    pendingCases: cases.filter(c => c.status === 'pending').length,
    upcomingEvents: calendarEvents.filter(event => {
      const eventTime = event.start?.dateTime || event.start?.date;
      return eventTime && new Date(eventTime) > new Date();
    }).length
  };

  const upcomingEvents = calendarEvents
    .filter(event => {
      const eventTime = event.start?.dateTime || event.start?.date;
      return eventTime && new Date(eventTime) > new Date();
    })
    .sort((a, b) => {
      const aTime = a.start?.dateTime || a.start?.date || '';
      const bTime = b.start?.dateTime || b.start?.date || '';
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    })
    .slice(0, 5);

  const recentCases = cases
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const formatDateTime = (dateString: string) => {
    if (!dateString) {
      return { date: 'No date', time: 'No time' };
    }
    const date = new Date(dateString);
    // Check if it's an all-day event (date only, no time)
    if (dateString.length === 10) {
      return {
        date: date.toLocaleDateString(),
        time: 'All day'
      };
    }
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Gavel className="h-8 w-8 text-blue-500" />
            Judicial Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Welcome back, {user?.firstName || user?.email}. Here's your overview.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Cases</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.totalCases}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.activeCases}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending Cases</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.pendingCases}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.upcomingEvents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Cases */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Cases</CardTitle>
            <CardDescription className="text-slate-400">
              Your most recently updated cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentCases.length > 0 ? (
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <div 
                    key={caseItem.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => {
                      // Future: Navigate to case detail page
                      console.log('Navigate to case:', caseItem.id);
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">{caseItem.caseName}</p>
                      <p className="text-sm text-slate-400">{caseItem.caseNumber}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={caseItem.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {caseItem.status}
                        </Badge>
                        {caseItem.court && (
                          <span className="text-xs text-slate-500">{caseItem.court}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-400 hover:text-blue-300"
                  onClick={() => {
                    // Future: Navigate to cases page
                    console.log('View all cases');
                  }}
                >
                  View All Cases
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No cases yet</p>
                <Button 
                  size="sm"
                  onClick={() => {
                    // Future: Navigate to create case
                    console.log('Create new case');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Case
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Calendar Events */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Upcoming Events</CardTitle>
            <CardDescription className="text-slate-400">
              Your calendar schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!calendarStatus?.connected ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Google Calendar not connected</p>
                <Button 
                  size="sm"
                  onClick={() => setActiveTab('daily-docket')}
                >
                  Connect Calendar
                </Button>
              </div>
            ) : eventsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const eventTime = event.start?.dateTime || event.start?.date || '';
                  const { date, time } = formatDateTime(eventTime);
                  return (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Calendar className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-100">{event.summary || 'Untitled Event'}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {date} at {time}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-400 hover:text-blue-300"
                  onClick={() => setActiveTab('daily-docket')}
                >
                  View Full Calendar
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Tools Grid */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">AI Legal Tools</CardTitle>
          <CardDescription className="text-slate-400">
            Access your specialized legal AI assistants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOL_CARDS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="group p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-all duration-200 border border-slate-600 hover:border-slate-500"
                  onClick={() => setActiveTab(tool.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${tool.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 group-hover:text-white transition-colors">
                        {tool.title}
                      </h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Quick Actions</CardTitle>
          <CardDescription className="text-slate-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setActiveTab('case-briefer')}
            >
              <Briefcase className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Brief a New Case</p>
                <p className="text-sm text-slate-400">Upload documents and generate brief</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setActiveTab('legal-research')}
            >
              <Search className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Research Legal Issue</p>
                <p className="text-sm text-slate-400">Find relevant case law and statutes</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setActiveTab('activity-history')}
            >
              <History className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">View Recent Work</p>
                <p className="text-sm text-slate-400">Access your activity history</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}