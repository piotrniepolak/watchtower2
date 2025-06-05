import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { useState } from "react";
import { MiniGeopoliticalLoader } from "@/components/geopolitical-loader";
import FlagIcon from "@/components/flag-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Globe, TrendingUp as TrendingUpIcon } from "lucide-react";
import type { Conflict } from "@shared/schema";

interface TimelineEvent {
  id: string;
  conflictId: number;
  conflictName: string;
  date: Date;
  title: string;
  description: string;
  type: "start" | "escalation" | "ceasefire" | "resolution" | "milestone";
  severity: "Low" | "Medium" | "High" | "Critical";
  region: string;
  parties: string[];
  casualties?: number;
  economicImpact?: string;
}

interface FilterOptions {
  region: string;
  severity: string;
  type: string;
  timeRange: string;
}

export default function ConflictTimeline() {
  const [filters, setFilters] = useState<FilterOptions>({
    region: "all",
    severity: "all",
    type: "all",
    timeRange: "1year"
  });
  
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsEvent, setDetailsEvent] = useState<TimelineEvent | null>(null);

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ['/api/conflicts'],
    refetchInterval: 30000,
  });

  // Generate timeline events from conflict data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    conflicts.forEach(conflict => {
      // Start event
      events.push({
        id: `${conflict.id}-start`,
        conflictId: conflict.id,
        conflictName: conflict.name,
        date: new Date(conflict.startDate),
        title: `${conflict.name} Begins`,
        description: conflict.description || "Conflict initiated",
        type: "start",
        severity: conflict.severity as any,
        region: conflict.region,
        parties: conflict.parties || [],
        economicImpact: "Regional markets affected"
      });

      // Recent update event (if within last 30 days)
      const daysSinceUpdate = Math.floor((Date.now() - new Date(conflict.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate <= 30) {
        events.push({
          id: `${conflict.id}-update`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date(conflict.lastUpdated),
          title: `${conflict.name} Update`,
          description: `Recent developments in ${conflict.region}`,
          type: conflict.severity === "Critical" ? "escalation" : "milestone",
          severity: conflict.severity as any,
          region: conflict.region,
          parties: conflict.parties || []
        });
      }

      // Add real major events based on actual conflict history
      if (conflict.name === "Ukraine-Russia Conflict") {
        events.push({
          id: `${conflict.id}-kharkiv`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2022-09-06"),
          title: "Kharkiv Counteroffensive Success",
          description: "Ukrainian forces liberate significant territory in Kharkiv region",
          type: "milestone",
          severity: "High",
          region: conflict.region,
          parties: conflict.parties || [],
          casualties: 2000,
          economicImpact: "Defense stocks surge 8-12%"
        });
        
        events.push({
          id: `${conflict.id}-crimea-bridge`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2022-10-08"),
          title: "Crimean Bridge Attack",
          description: "Strategic bridge connecting Russia to Crimea damaged in explosion",
          type: "escalation",
          severity: "Critical",
          region: conflict.region,
          parties: conflict.parties || [],
          economicImpact: "Oil prices spike 3%, defense contractors up 5%"
        });
      }
      
      if (conflict.name === "Israel-Palestine Conflict") {
        events.push({
          id: `${conflict.id}-operation-swords`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2023-10-07"),
          title: "Operation Al-Aqsa Flood",
          description: "Hamas launches large-scale attack on Israel, triggering major escalation",
          type: "escalation",
          severity: "Critical",
          region: conflict.region,
          parties: conflict.parties || [],
          casualties: 15000,
          economicImpact: "Defense stocks rally, oil markets volatile"
        });
      }
      
      if (conflict.name === "Iran-Israel Tensions") {
        events.push({
          id: `${conflict.id}-april-strikes`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2024-04-13"),
          title: "Iranian Missile Strike on Israel",
          description: "Iran launches direct missile and drone attack on Israeli territory",
          type: "escalation",
          severity: "Critical",
          region: conflict.region,
          parties: conflict.parties || [],
          economicImpact: "Defense stocks surge 15%, oil up 5%"
        });
      }

      if (conflict.name === "Myanmar Civil War") {
        events.push({
          id: `${conflict.id}-operation-1027`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2023-10-27"),
          title: "Operation 1027 Begins",
          description: "Three Brothers Alliance launches coordinated offensive against military junta",
          type: "escalation",
          severity: "High",
          region: conflict.region,
          parties: conflict.parties || [],
          casualties: 3000,
          economicImpact: "Regional defense spending increases"
        });
      }

      if (conflict.name === "Sudan Civil War") {
        events.push({
          id: `${conflict.id}-rsf-offensive`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2023-04-15"),
          title: "RSF-SAF Conflict Erupts",
          description: "Rapid Support Forces clash with Sudanese Armed Forces in Khartoum",
          type: "escalation",
          severity: "Critical",
          region: conflict.region,
          parties: conflict.parties || [],
          casualties: 12000,
          economicImpact: "Oil markets disrupted, humanitarian crisis"
        });
      }

      if (conflict.name === "South China Sea Tensions") {
        events.push({
          id: `${conflict.id}-scarborough-incident`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date("2024-08-19"),
          title: "Scarborough Shoal Confrontation",
          description: "Chinese and Philippine vessels collide near disputed waters",
          type: "escalation",
          severity: "Medium",
          region: conflict.region,
          parties: conflict.parties || [],
          economicImpact: "Regional trade routes affected"
        });
      }
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = generateTimelineEvents();

  // Apply filters
  const filteredEvents = timelineEvents.filter(event => {
    if (filters.region !== "all" && event.region !== filters.region) return false;
    if (filters.severity !== "all" && event.severity !== filters.severity) return false;
    if (filters.type !== "all" && event.type !== filters.type) return false;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filters.timeRange) {
      case "1month": return daysDiff <= 30;
      case "3months": return daysDiff <= 90;
      case "6months": return daysDiff <= 180;
      case "1year": return daysDiff <= 365;
      case "all": return true;
      default: return true;
    }
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "start": return <Users className="h-4 w-4" />;
      case "escalation": return <TrendingUp className="h-4 w-4" />;
      case "ceasefire": return <Clock className="h-4 w-4" />;
      case "resolution": return <Calendar className="h-4 w-4" />;
      case "milestone": return <MapPin className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "start": return "bg-blue-100 text-blue-800 border-blue-200";
      case "escalation": return "bg-red-100 text-red-800 border-red-200";
      case "ceasefire": return "bg-green-100 text-green-800 border-green-200";
      case "resolution": return "bg-purple-100 text-purple-800 border-purple-200";
      case "milestone": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getUniqueRegions = () => {
    const regionSet = new Set(conflicts.map(c => c.region));
    const regions = Array.from(regionSet);
    return regions.sort();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Conflict Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Region</label>
              <select 
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="all">All Regions</option>
                {getUniqueRegions().map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Severity</label>
              <select 
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Event Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="all">All Types</option>
                <option value="start">Conflict Start</option>
                <option value="escalation">Escalation</option>
                <option value="ceasefire">Ceasefire</option>
                <option value="resolution">Resolution</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Time Range</label>
              <select 
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <MiniGeopoliticalLoader type="intelligence" />
                <p className="text-slate-600 dark:text-slate-400 mt-4">
                  No events found for the selected filters
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                      event.type === "escalation" ? "bg-red-500 border-red-600" :
                      event.type === "start" ? "bg-blue-500 border-blue-600" :
                      event.type === "ceasefire" ? "bg-green-500 border-green-600" :
                      event.type === "resolution" ? "bg-purple-500 border-purple-600" :
                      "bg-yellow-500 border-yellow-600"
                    }`}></div>
                    
                    {/* Event card */}
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedEvent?.id === event.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <h3 className="font-semibold text-sm">{event.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(event.severity) as any}>
                              {event.severity}
                            </Badge>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{event.region}</span>
                          </div>
                          
                          {event.parties.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <div className="flex items-center gap-1">
                                {event.parties.slice(0, 3).map(party => (
                                  <FlagIcon key={party} countryCode={party} size="sm" />
                                ))}
                                {event.parties.length > 3 && (
                                  <span className="text-xs text-slate-500">+{event.parties.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm">{event.description}</p>
                          
                          {selectedEvent?.id === event.id && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                              {event.casualties && (
                                <div className="flex items-center gap-2 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="text-xs">Est. {event.casualties.toLocaleString()} casualties</span>
                                </div>
                              )}
                              
                              {event.economicImpact && (
                                <div className="flex items-center gap-2 text-blue-600">
                                  <TrendingUp className="h-3 w-3" />
                                  <span className="text-xs">{event.economicImpact}</span>
                                </div>
                              )}
                              
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailsEvent(event);
                                    setDetailsModalOpen(true);
                                  }}
                                >
                                  View Details
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open('/analysis', '_self');
                                  }}
                                >
                                  Market Impact
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {filteredEvents.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Events</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredEvents.filter(e => e.type === "escalation").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Escalations</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredEvents.filter(e => e.type === "ceasefire").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Ceasefires</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEvents.filter(e => e.type === "start").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">New Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {detailsEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {detailsEvent && (
            <div className="space-y-6">
              {/* Event Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(detailsEvent.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">Region:</span>
                    <span>{detailsEvent.region}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">Severity:</span>
                    <Badge variant={getSeverityColor(detailsEvent.severity) as any}>
                      {detailsEvent.severity}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(detailsEvent.type)}`}>
                      {detailsEvent.type}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {detailsEvent.parties.length > 0 && (
                    <div>
                      <span className="font-medium block mb-2">Involved Parties:</span>
                      <div className="flex flex-wrap gap-2">
                        {detailsEvent.parties.map(party => (
                          <div key={party} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            <FlagIcon countryCode={party} size="sm" />
                            <span className="text-xs">{party}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {detailsEvent.casualties && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Estimated Casualties:</span>
                      <span className="text-red-600">{detailsEvent.casualties.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {detailsEvent.economicImpact && (
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Economic Impact:</span>
                      <span className="text-blue-600">{detailsEvent.economicImpact}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Event Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {detailsEvent.description}
                </p>
              </div>
              
              {/* Detailed Analysis Based on Conflict */}
              <div>
                <h3 className="font-semibold mb-3">Detailed Analysis</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                  {detailsEvent.conflictName === "Ukraine-Russia Conflict" && (
                    <div className="space-y-2">
                      <p><strong>Background:</strong> The conflict began on February 24, 2022, when Russia launched a full-scale invasion of Ukraine, escalating tensions that had been building since 2014.</p>
                      <p><strong>Key Developments:</strong> Major battles in Kyiv, Kharkiv, Mariupol, and ongoing fighting in eastern regions. International sanctions imposed on Russia.</p>
                      <p><strong>Global Impact:</strong> Significant disruption to global food and energy supplies, refugee crisis with over 6 million displaced persons.</p>
                    </div>
                  )}
                  
                  {detailsEvent.conflictName === "Israel-Palestine Conflict" && (
                    <div className="space-y-2">
                      <p><strong>Background:</strong> Long-standing territorial and political conflict with roots dating back to the mid-20th century.</p>
                      <p><strong>Recent Escalation:</strong> October 7, 2023 Hamas attack led to unprecedented escalation with ongoing military operations in Gaza.</p>
                      <p><strong>Regional Impact:</strong> Heightened tensions across the Middle East, affecting regional stability and oil markets.</p>
                    </div>
                  )}
                  
                  {detailsEvent.conflictName === "Iran-Israel Tensions" && (
                    <div className="space-y-2">
                      <p><strong>Background:</strong> Proxy conflicts and direct confrontations between Iran and Israel over regional influence and nuclear programs.</p>
                      <p><strong>Strategic Implications:</strong> Potential for wider Middle East conflict involving regional powers and international allies.</p>
                      <p><strong>Market Effects:</strong> Oil price volatility, defense spending increases across the region.</p>
                    </div>
                  )}
                  
                  {(detailsEvent.conflictName === "Myanmar Civil War" || 
                    detailsEvent.conflictName === "Sudan Civil War" || 
                    detailsEvent.conflictName === "South China Sea Tensions") && (
                    <div className="space-y-2">
                      <p><strong>Regional Significance:</strong> This conflict represents broader patterns of regional instability and international power competition.</p>
                      <p><strong>Humanitarian Impact:</strong> Significant civilian displacement and humanitarian needs requiring international attention.</p>
                      <p><strong>Strategic Considerations:</strong> Implications for regional security architecture and international trade routes.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* External Resources */}
              <div>
                <h3 className="font-semibold mb-3">Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      const searchQuery = encodeURIComponent(`${detailsEvent.conflictName} current news`);
                      window.open(`https://news.google.com/search?q=${searchQuery}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Latest News
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      window.open('/analysis', '_self');
                    }}
                  >
                    <TrendingUpIcon className="h-4 w-4 mr-2" />
                    Market Analysis
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      window.open('/conflicts', '_self');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Conflict Overview
                  </Button>
                </div>
              </div>
              
              {/* Timeline Context */}
              <div>
                <h3 className="font-semibold mb-3">Timeline Context</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This event occurred on <strong>{formatDate(detailsEvent.date)}</strong> as part of the ongoing {detailsEvent.conflictName}. 
                    The event had {detailsEvent.severity.toLowerCase()} severity impact and resulted in significant {detailsEvent.type === 'escalation' ? 'escalation' : 'developments'} 
                    in the conflict dynamics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}