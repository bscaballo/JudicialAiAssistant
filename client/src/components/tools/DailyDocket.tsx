import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Gavel, Link, RefreshCw, Unlink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, addDays, subDays } from "date-fns";

export default function DailyDocket() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    scheduledTime: "",
    type: "",
    title: "",
    description: "",
  });
  const { toast } = useToast();

  const { data: docketEntries = [] } = useQuery({
    queryKey: ["/api/docket/entries", selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/docket/entries?date=${selectedDate.toISOString().split('T')[0]}`);
      return response.json();
    },
  });

  // Google Calendar integration
  const { data: googleCalendarStatus } = useQuery({
    queryKey: ["/api/google-calendar/status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/google-calendar/status");
      return response.json();
    },
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/google-calendar/events", selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      const response = await apiRequest("GET", `/api/google-calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      return response.json();
    },
    enabled: googleCalendarStatus?.connected === true,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      const response = await apiRequest("POST", "/api/docket/entries", entryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docket/entries"] });
      setIsAddingEntry(false);
      setNewEntry({ scheduledTime: "", type: "", title: "", description: "" });
      toast({
        title: "Success",
        description: "Docket entry added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add docket entry",
        variant: "destructive",
      });
    },
  });

  const connectCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/google-calendar/auth-url");
      const { authUrl } = await response.json();
      
      // Open Google Calendar authorization in a new window
      const authWindow = window.open(authUrl, 'google-calendar-auth', 'width=600,height=600');
      
      // Wait for the authorization to complete
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Refresh the calendar status
            queryClient.invalidateQueries({ queryKey: ["/api/google-calendar/status"] });
            resolve(true);
          }
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Google Calendar connected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive",
      });
    },
  });

  const syncCalendarMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      const response = await apiRequest("POST", "/api/google-calendar/sync", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/google-calendar/events"] });
      toast({
        title: "Success",
        description: "Calendar events synced successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync calendar events",
        variant: "destructive",
      });
    },
  });

  const disconnectCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/google-calendar/disconnect");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/google-calendar/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/google-calendar/events"] });
      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    },
  });

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days)));
  };

  const handleAddEntry = () => {
    if (!newEntry.scheduledTime || !newEntry.type || !newEntry.title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      ...newEntry,
      scheduledTime: new Date(`${selectedDate.toISOString().split('T')[0]}T${newEntry.scheduledTime}`).toISOString(),
    };

    addEntryMutation.mutate(entryData);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hearing": return "bg-blue-600";
      case "motion": return "bg-green-600";
      case "trial": return "bg-purple-600";
      case "calendar": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hearing": return <Calendar className="h-4 w-4" />;
      case "motion": return <Gavel className="h-4 w-4" />;
      case "trial": return <Gavel className="h-4 w-4" />;
      case "calendar": return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Merge docket entries and calendar events
  const mergedEntries = [
    ...docketEntries.map((entry: any) => ({
      ...entry,
      source: 'docket',
      scheduledTime: entry.scheduledTime
    })),
    ...calendarEvents.map((event: any) => ({
      id: `cal-${event.id}`,
      title: event.summary || event.title,
      description: event.description,
      scheduledTime: event.start?.dateTime || event.startTime,
      type: 'calendar',
      source: 'calendar',
      location: event.location
    }))
  ];

  const sortedEntries = mergedEntries.sort((a, b) => 
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Daily Docket</h2>
        <p className="text-slate-400">Manage court schedules and case proceedings</p>
      </div>

      {/* Date Navigation */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateChange(-1)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-xl font-semibold">
                {format(selectedDate, "EEEE - MMMM d, yyyy")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateChange(1)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="bg-slate-700 border-slate-600"
              />
              {googleCalendarStatus?.connected && (
                <Button
                  variant="outline"
                  onClick={() => syncCalendarMutation.mutate()}
                  disabled={syncCalendarMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Calendar
                </Button>
              )}
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Add Docket Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="scheduledTime">Scheduled Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={newEntry.scheduledTime}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newEntry.type} onValueChange={(value) => setNewEntry(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hearing">Hearing</SelectItem>
                          <SelectItem value="motion">Motion</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Case name or proceeding title"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newEntry.description}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the proceeding"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Button 
                      onClick={handleAddEntry}
                      disabled={addEntryMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Add Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar Integration */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${googleCalendarStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {googleCalendarStatus?.connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {googleCalendarStatus?.connected ? (
                <Button
                  variant="outline"
                  onClick={() => disconnectCalendarMutation.mutate()}
                  disabled={disconnectCalendarMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={() => connectCalendarMutation.mutate()}
                  disabled={connectCalendarMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </Button>
              )}
            </div>
          </div>
          {googleCalendarStatus?.connected && (
            <div className="mt-4 text-sm text-slate-400">
              <p>Calendar events will be displayed alongside your docket entries.</p>
              <p>Last sync: {calendarEvents.length > 0 ? 'Now' : 'Never'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Total Cases</h4>
              <Gavel className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{docketEntries.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Hearings</h4>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">
              {docketEntries.filter((entry: any) => entry.type === 'hearing').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Motions</h4>
              <Gavel className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">
              {docketEntries.filter((entry: any) => entry.type === 'motion').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Calendar Events</h4>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{calendarEvents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Docket Items */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>No entries scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEntries.map((entry: any) => (
                <div key={entry.id} className="border-b border-slate-700 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-20 text-center">
                      <p className="font-bold text-lg">
                        {format(new Date(entry.scheduledTime), "h:mm")}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(entry.scheduledTime), "a")}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className={`${entry.source === 'calendar' ? 'bg-purple-900/30 border border-purple-700' : 'bg-slate-700'} rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{entry.title}</h4>
                            {entry.source === 'calendar' && (
                              <Badge variant="outline" className="text-purple-300 border-purple-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                Google Calendar
                              </Badge>
                            )}
                          </div>
                          <Badge className={`${getTypeColor(entry.type)} text-white`}>
                            {getTypeIcon(entry.type)}
                            <span className="ml-1 capitalize">{entry.type === 'calendar' ? 'Event' : entry.type}</span>
                          </Badge>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-slate-400">{entry.description}</p>
                        )}
                        {entry.location && (
                          <p className="text-xs text-slate-500 mt-1">📍 {entry.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
