import ConflictTimeline from "@/components/conflict-timeline";

export default function TimelinePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Conflict Timeline
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Track the chronological progression of global conflicts with interactive timeline visualization. 
          Filter by region, severity, and event type to analyze conflict patterns and key milestones.
        </p>
      </div>
      
      <ConflictTimeline />
    </div>
  );
}