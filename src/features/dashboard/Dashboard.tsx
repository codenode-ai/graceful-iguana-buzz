import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users, FileText, CheckSquare, ArrowRight, Building2, UserCog } from "lucide-react";
import { employees } from "@/shared/lib/mockData";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserRole } from "@/shared/providers/AuthProvider";

const roleLabel: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  employee: "Colaborador",
  superadmin: "Superadmin",
};

const planLabel: Record<string, string> = {
  free: "Gratuito",
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

const quickLinks = (
  role: UserRole
): { to: string; text: string; roles: UserRole[] }[] => [
  { to: "/employees", text: "Gerenciar funcionarios", roles: ["admin", "manager", "superadmin"] },
  { to: "/questionnaires", text: "Gerenciar questionarios", roles: ["admin", "manager", "superadmin"] },
  { to: "/sociogram", text: "Ver sociograma", roles: ["admin", "superadmin"] },
  { to: "/reports", text: "Gerar relatorios", roles: ["admin", "superadmin"] },
  { to: "/admin-saas", text: "Painel SaaS", roles: ["superadmin"] },
].filter((link) => link.roles.includes(role));

const Dashboard = () => {
  const { user, profile, company } = useAuth();
  const role: UserRole = profile?.role ?? "employee";

  const metadataCards = [
    {
      title: "Usuario",
      icon: UserCog,
      value: user?.email ?? "-",
      description: `Papel: ${profile?.role ? roleLabel[profile.role] : "Sem papel"}`,
    },
    {
      title: "Empresa",
      icon: Building2,
      value: company?.name ?? "Sem empresa",
      description: `Plano: ${company?.plan ? planLabel[company.plan] ?? company.plan : "sem plano"}`,
    },
  ];

  const metrics = {
    employees: employees.length,
    questionnairesSent: 12,
    responsesReceived: 10,
  };

  const links = quickLinks(role);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {metadataCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
        <h2 className="mb-4 text-2xl font-semibold">Atalhos rapidos</h2>
        {links.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nenhuma acao administrativa disponivel para o seu papel. Aguarde convites ou novas tarefas.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {links.map((link) => (
              <Card key={link.to} className="transition-shadow hover:shadow-lg">
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
