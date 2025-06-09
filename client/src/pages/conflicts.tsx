import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Conflict } from "@shared/schema";

export default function Conflicts() {
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const getSeverityBadge = (severity: string) => {
    const colors = {
      Critical: "bg-red-100 text-red-800 border-red-200",
      High: "bg-orange-100 text-orange-800 border-orange-200", 
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[severity as keyof typeof colors] || colors.Medium;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: "bg-red-100 text-red-800 border-red-200",
      Escalating: "bg-orange-100 text-orange-800 border-orange-200",
      Monitoring: "bg-blue-100 text-blue-800 border-blue-200", 
      "De-escalating": "bg-green-100 text-green-800 border-green-200"
    };
    return colors[status as keyof typeof colors] || colors.Monitoring;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-slate-900">Global Conflicts</h1>
          </div>
          <p className="text-slate-600 mt-2">Real-time monitoring of active conflicts worldwide</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Conflicts ({Array.isArray(conflicts) ? conflicts.length : 0})</span>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(conflicts) && conflicts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conflict</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflicts.map((conflict: Conflict) => (
                    <TableRow key={conflict.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium text-slate-900">{conflict.name}</div>
                        {conflict.description && (
                          <div className="text-sm text-slate-600 mt-1 max-w-md truncate">
                            {conflict.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-900">{conflict.region}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(conflict.status)} border`}>
                          {conflict.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getSeverityBadge(conflict.severity)} border`}>
                          {conflict.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-700">{conflict.duration}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 text-sm">
                          {formatDistanceToNow(new Date(conflict.lastUpdated), { addSuffix: true })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No conflicts data available</h3>
                <p className="text-slate-600">Conflict data is currently being updated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}