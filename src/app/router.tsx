import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import NotFound from "../features/auth/NotFound";
import Login from "../features/auth/Login";
import Dashboard from "../features/dashboard/Dashboard";
import Employees from "../features/employees/Employees";
import Questionnaires from "../features/questionnaires/Questionnaires";
import Sociogram from "../features/sociogram/Sociogram";
import Reports from "../features/reports/Reports";
import QuestionnaireForm from "../features/questionnaires/QuestionnaireForm";
import Layout from "../features/shared/components/Layout";
import { useAuth } from "@/shared/hooks/useAuth";
import CompanyOnboarding from "../features/auth/CompanyOnboarding";
import RoleGuard from "@/shared/guards/RoleGuard";
import Unauthorized from "../features/auth/Unauthorized";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";
import SaaSMetrics from "../features/admin/SaaSMetrics";

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const ProtectedRoute = () => {
  const location = useLocation();
  const { loading, user, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const needsCompany = !profile?.company_id && profile?.role !== 'superadmin';
  if ((!profile || needsCompany) && location.pathname !== "/onboarding/company") {
    return <Navigate to="/onboarding/company" replace />;
  }

  return <Outlet />;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding/company" element={<CompanyOnboarding />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route element={<RoleGuard allow={["admin", "manager", "superadmin"]} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/questionnaires" element={<Questionnaires />} />
          </Route>

          <Route element={<RoleGuard allow={["admin", "superadmin"]} />}>
            <Route path="/sociogram" element={<Sociogram />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route element={<RoleGuard allow={["superadmin"]} />}>
            <Route path="/admin-saas" element={<SaaSMetrics />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allow={["admin", "manager", "employee", "superadmin"]} />}>
          <Route path="/questionnaire/:employeeId" element={<QuestionnaireForm />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);