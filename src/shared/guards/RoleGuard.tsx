import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserRole } from "@/shared/providers/AuthProvider";

interface RoleGuardProps {
  allow: UserRole[];
}

const RoleGuard = ({ allow }: RoleGuardProps) => {
  const location = useLocation();
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando autorizacao...</span>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/onboarding/company" replace state={{ from: location }} />;
  }

  if (profile.role === 'superadmin') {
    return <Outlet />;
  }

  if (!allow.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RoleGuard;
