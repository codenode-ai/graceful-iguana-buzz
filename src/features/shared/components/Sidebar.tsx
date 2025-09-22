import type { UserRole } from "@/shared/providers/AuthProvider";
import { NavLink } from "react-router-dom";
import { Home, Users, FileText, Share2, BarChart2, Building2, User, BriefcaseBusiness } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SidebarProps {
  user: { email?: string | null } | null;
  profile: { role: UserRole } | null;
  company: { name: string; plan?: string | null } | null;
}

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

const navItems = [
  { href: "/", label: "Dashboard", icon: Home, roles: ["admin", "manager", "employee", "superadmin"] },
  { href: "/employees", label: "Funcionarios", icon: Users, roles: ["admin", "manager", "superadmin"] },
  { href: "/questionnaires", label: "Questionarios", icon: FileText, roles: ["admin", "manager", "superadmin"] },
  { href: "/sociogram", label: "Sociograma", icon: Share2, roles: ["admin", "superadmin"] },
  { href: "/reports", label: "Relatorios", icon: BarChart2, roles: ["admin", "superadmin"] },
  { href: "/admin-saas", label: "Painel SaaS", icon: Building2, roles: ["superadmin"] },
];

const Sidebar = ({ user, profile, company }: SidebarProps) => {
  const role = profile?.role ?? "employee";
  const filtered = navItems.filter((item) => item.roles.includes(role));

  const email = user?.email ?? "Usuario";
  const companyName = company?.name ?? "Sem empresa";
  const plan = company?.plan ? planLabel[company.plan] ?? company.plan : "Sem plano";
  const roleText = roleLabel[role];

  return (
    <aside className="hidden w-72 flex-col bg-white shadow-md dark:bg-gray-900 md:flex">
      <div className="flex items-center space-x-2 border-b p-6">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Socium</h1>
      </div>

      <div className="space-y-3 border-b p-4 text-sm">
        <div className="rounded-lg border bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/60">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span>Usuario</span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Papel: {roleText}</p>
        </div>

        <div className="rounded-lg border bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/60">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <BriefcaseBusiness className="h-4 w-4" />
            <span>Empresa</span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{companyName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Plano atual: {plan}</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filtered.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800",
                    isActive && "bg-primary text-white hover:bg-primary/90"
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
