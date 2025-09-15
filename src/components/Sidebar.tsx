import { NavLink } from "react-router-dom";
import { Home, Users, FileText, Share2, BarChart2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/employees", label: "Funcionárias", icon: Users },
  { href: "/questionnaires", label: "Questionários", icon: FileText },
  { href: "/sociogram", label: "Sociograma", icon: Share2 },
  { href: "/reports", label: "Relatórios", icon: BarChart2 },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-col hidden md:flex">
      <div className="p-6 flex items-center space-x-2 border-b">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Socium</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => (
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