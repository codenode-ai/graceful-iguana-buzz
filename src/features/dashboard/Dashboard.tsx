import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users, FileText, CheckSquare, ArrowRight } from "lucide-react";
import { employees } from "@/shared/lib/mockData";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserRole } from "@/shared/providers/AuthProvider";

const quickLinks = (
  role: UserRole
): { to: string; text: string; roles: UserRole[] }[] => [
  { to: "/employees", text: "Gerenciar funcionarios", roles: ["admin", "manager", "superadmin"] },
  { to: "/questionnaires", text: "Gerenciar questionarios", roles: ["admin", "manager", "superadmin"] },
  { to: "/sociogram", text: "Ver sociograma", roles: ["admin", "superadmin"] },
  { to: "/reports", text: "Gerar relatorios", roles: ["admin", "superadmin"] },
].filter((link) => link.roles.includes(role));

const Dashboard = () => {
  const { profile } = useAuth();
  const role: UserRole = profile?.role ?? "employee";

  const metrics = {
    employees: employees.length,
    questionnairesSent: 12,
    responsesReceived: 10,
  };

  const links = quickLinks(role);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de funcionarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.employees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questionarios enviados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.questionnairesSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas recebidas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responsesReceived}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Atalhos rapidos</h2>
        {links.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nenhuma acao administrativa disponivel para o seu papel. Aguarde convites ou novas tarefas.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {links.map((link) => (
              <Card key={link.to} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Link to={link.to} className="flex items-center justify-between">
                    <span className="text-lg font-medium">{link.text}</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
