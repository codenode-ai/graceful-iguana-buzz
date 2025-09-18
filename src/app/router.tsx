import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
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

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const ProtectedRoute = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/questionnaires" element={<Questionnaires />} />
          <Route path="/sociogram" element={<Sociogram />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="/questionnaire/:employeeId" element={<QuestionnaireForm />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
