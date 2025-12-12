"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import Dashboard from "@/components/admin/Dashboard";

export default function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // DISABLED: Auth check completely disabled - JWT AuthProvider handles this
    console.log("🔑 Admin: Auth check completely disabled");
    setIsAuthenticated(true);
    setAuthLoading(false);
  }, []);

  // checkAuthentication function removed - using JWT AuthProvider instead

  const handleLogout = async () => {
    // DISABLED: Use localStorage clear instead of cookie-based logout
    console.log("🔑 Admin: Logout disabled - clear localStorage instead");
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 mb-6">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                <span className="text-cyan-400">⚡</span>
                <span className="text-white">Streamline</span>
                <span className="text-green-400">AI</span>
              </h1>
              <span className="text-gray-400">|</span>
              <h2 className="text-xl text-white">Admin Dashboard</h2>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 pb-6">
        <Dashboard />
      </div>
    </div>
  );
}
