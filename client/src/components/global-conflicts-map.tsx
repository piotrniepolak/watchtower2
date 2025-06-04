import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import conflictsMapImage from "@assets/image_1749060296092.png";

export default function GlobalConflictsMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Global Conflicts Heat Map
        </CardTitle>
        <p className="text-sm text-slate-600">
          Geographic visualization of conflict intensity and distribution worldwide
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative w-full">
          <img
            src={conflictsMapImage}
            alt="Global Conflicts Heat Map showing conflict intensity by region"
            className="w-full h-auto object-contain rounded-lg"
            style={{ maxHeight: '400px' }}
          />
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>High Intensity Conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Medium Intensity Conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Low Intensity / Tensions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>No Active Conflicts</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 mt-2">
            Map shows regional conflict intensity based on ongoing armed conflicts, territorial disputes, and security situations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}