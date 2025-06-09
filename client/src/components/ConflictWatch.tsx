import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Calendar, MapPin, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Updated interface to match the API response format
interface Conflict {
  id: string;
  country: string;
  activeSince: string;   // ISO date
  fatalitiesYTD: number;
}

export default function ConflictWatch() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from the correct conflicts endpoint
  const { data: conflicts = [], isLoading, error } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
    retry: 3,
  });

  // Filter conflicts based on search query
  const filteredConflicts = useMemo(() => {
    if (!searchQuery.trim()) return conflicts;
    
    return conflicts.filter((conflict) =>
      conflict.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conflicts, searchQuery]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to calculate days since conflict started
  const getDaysSince = (dateString: string) => {
    try {
      const startDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Helper function to get fatalities color
  const getFatalitiesColor = (fatalities: number) => {
    return fatalities > 10000 ? "text-red-600 font-bold" : "text-slate-900 font-semibold";
  };

  // Helper function to get severity based on fatalities
  const getSeverityBadge = (fatalities: number) => {
    if (fatalities > 50000) {
      return <Badge variant="destructive" className="text-xs">Critical</Badge>;
    } else if (fatalities > 10000) {
      return <Badge variant="destructive" className="text-xs bg-orange-600">High</Badge>;
    } else if (fatalities > 1000) {
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Failed to load conflict data</span>
              </div>
              <p className="text-red-600 text-sm mt-2">
                Please check your connection and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">ConflictWatch</h1>
                <p className="text-slate-600 text-sm">
                  Monitoring active global conflicts and casualty data
                </p>
              </div>
              
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by country name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                {filteredConflicts.length} active conflict{filteredConflicts.length !== 1 ? 's' : ''} found
              </span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {filteredConflicts.length === 0 ? (
            <Card className="bg-white shadow-md">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No conflicts found
                </h3>
                <p className="text-slate-600">
                  {searchQuery 
                    ? `No conflicts match "${searchQuery}". Try adjusting your search.`
                    : "No active conflicts are currently being tracked."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Responsive Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredConflicts.map((conflict) => (
                <Card
                  key={conflict.id}
                  className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CardTitle className="text-lg font-semibold text-slate-900 truncate leading-tight">
                            {conflict.country}
                          </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{conflict.country}</p>
                        </TooltipContent>
                      </Tooltip>
                      {getSeverityBadge(conflict.fatalitiesYTD)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Fatalities - Prominently displayed */}
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Fatalities YTD</div>
                      <div className={`text-2xl font-bold ${getFatalitiesColor(conflict.fatalitiesYTD)}`}>
                        {conflict.fatalitiesYTD.toLocaleString()}
                      </div>
                    </div>

                    {/* Active Since */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-600">Active since</div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-medium text-slate-900 truncate">
                              {formatDate(conflict.activeSince)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Started on {formatDate(conflict.activeSince)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-600">Duration</div>
                        <div className="font-medium text-slate-900">
                          {getDaysSince(conflict.activeSince)} days
                        </div>
                      </div>
                    </div>

                    {/* Conflict ID */}
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-600">Region ID</div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-medium text-slate-900 truncate">
                              {conflict.id}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Conflict identifier: {conflict.id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}