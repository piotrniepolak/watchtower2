import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Conflicts() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Global Conflicts
          </h2>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-600">
                Detailed conflict analysis page coming soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}