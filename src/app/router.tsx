import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import NotFound from "../features/auth/NotFound";
import Login from "../features/auth/Login";
import Dashboard from "../features/dashboard/Dashboard";
import Employees from "../features/employees/Employees";
import Questionnaires from "../features/questionnaires/Questionnaires";
import Sociogram from "../features/sociogram/Sociogram";
import Reports from "../features/reports/Reports";
import QuestionnaireForm from "../features/questionnaires/QuestionnaireForm";
import Layout from "../features/shared/components/Layout";

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/questionnaire/:employeeId" element={<QuestionnaireForm />} />
      
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/questionnaires" element={<Questionnaires />} />
        <Route path="/sociogram" element={<Sociogram />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);