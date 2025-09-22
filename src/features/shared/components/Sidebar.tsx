import { NavLink } from "react-router-dom";
import { Home, Users, FileText, Share2, BarChart2, Building2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserRole } from "@/shared/providers/AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home, roles: ["admin", "manager", "employee", "superadmin"] },
  { href: "/employees", label: "Funcionarios", icon: Users, roles: ["admin", "manager", "superadmin"] },
  { href: "/questionnaires", label: "Questionarios", icon: FileText, roles: ["admin", "manager", "superadmin"] },
  { href: "/sociogram", label: "Sociograma", icon: Share2, roles: ["admin", "superadmin"] },
  { href: "/reports", label: "Relatorios", icon: BarChart2, roles: ["admin", "superadmin"] },
  { href: "/admin-saas", label: "Painel SaaS", icon: Building2, roles: ["superadmin"] },
];

const Sidebar = () => {
  const { profile } = useAuth();
  const role = profile?.role ?? "employee";

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-col hidden md:flex">
      <div className="p-6 flex items-center space-x-2 border-b">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Socium</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {filtered.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-3 my-1 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                    isActive && "bg-primary text-white hover:bg-primary/90 dark:hover:bg-primary/90"
                  )
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
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
