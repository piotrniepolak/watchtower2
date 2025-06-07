import UserSettings from "@/components/user-settings";
import Navigation from "@/components/navigation";

export default function Settings() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          <UserSettings />
        </div>
      </div>
    </div>
  );
}