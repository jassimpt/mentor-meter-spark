"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStore } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!tokenStore.isLoggedIn()) {
        setAuthenticated(false);
        return;
      }

      try {
        // Verify the token is still valid by hitting the profile endpoint
        await api.get("/api/users/me");
        setAuthenticated(true);
      } catch {
        tokenStore.clear();
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated === false) {
      router.push("/auth");
    }
  }, [authenticated, router]);

  if (authenticated === null || authenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
