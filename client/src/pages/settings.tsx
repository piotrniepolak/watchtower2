import { useQuery } from "@tanstack/react-query";
import UserSettings from "@/components/user-settings";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function Settings() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600 mt-2">
                Manage your account settings and preferences
              </p>
            </div>
            <UserSettings />
          </div>
        </main>
      </div>
    </div>
  );
}