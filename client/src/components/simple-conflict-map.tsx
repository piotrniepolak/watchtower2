import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";
import conflictMapImage from "@assets/image_1749061330097.png";

export default function SimpleConflictMap() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Global Conflict Severity Map
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Current conflict severity levels across global regions
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-600">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* World Map */}
          <div className="lg:col-span-3">
            <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden">
              <img 
                src={conflictMapImage} 
                alt="Global Conflict Severity Heat Map" 
                className="w-full h-auto object-contain rounded-lg"
                style={{ maxHeight: '500px' }}
              />
              
              {/* Real-time indicator */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm p-2 text-xs">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend Panel */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Severity Legend</h4>
              <div className="space-y-3">
                <div className="flex items-center p-2 rounded-lg bg-slate-50">
                  <div className="w-6 h-6 rounded mr-3" style={{ backgroundColor: '#7f1d1d' }}></div>
                  <div>
                    <div className="font-medium text-sm">Critical</div>
                    <div className="text-xs text-slate-600">Active warfare, high casualties</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-slate-50">
                  <div className="w-6 h-6 rounded mr-3" style={{ backgroundColor: '#dc2626' }}></div>
                  <div>
                    <div className="font-medium text-sm">High</div>
                    <div className="text-xs text-slate-600">Ongoing conflicts, regular violence</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-slate-50">
                  <div className="w-6 h-6 rounded mr-3" style={{ backgroundColor: '#ea580c' }}></div>
                  <div>
                    <div className="font-medium text-sm">Medium</div>
                    <div className="text-xs text-slate-600">Periodic tensions, limited violence</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-slate-50">
                  <div className="w-6 h-6 rounded mr-3" style={{ backgroundColor: '#eab308' }}></div>
                  <div>
                    <div className="font-medium text-sm">Low</div>
                    <div className="text-xs text-slate-600">Political tensions, protests</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-slate-50">
                  <div className="w-6 h-6 rounded mr-3" style={{ backgroundColor: '#9ca3af' }}></div>
                  <div>
                    <div className="font-medium text-sm">None</div>
                    <div className="text-xs text-slate-600">Stable, no active conflicts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2">Data Sources</h5>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Armed Conflict Location & Event Data (ACLED)</div>
                <div>• Uppsala Conflict Data Program (UCDP)</div>
                <div>• Crisis Group Risk Tracker</div>
                <div>• Real-time news monitoring</div>
              </div>
            </div>

            <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg">
              <div className="font-medium mb-1">Methodology</div>
              <div>Severity levels are determined by conflict intensity, casualty rates, duration, and geographic spread. Updated every 6 hours using multiple verified sources.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}