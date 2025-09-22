import type { UserRole } from "@/shared/providers/AuthProvider";
import type { useAuth } from "@/shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

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

type AuthContextValue = ReturnType<typeof useAuth>;

interface HeaderProps {
  auth: AuthContextValue;
}

const Header = ({ auth }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login", { replace: true });
  };

  const email = auth.user?.email ?? "Usuario";
  const role = auth.profile?.role ? roleLabel[auth.profile.role] : "Sem papel";
  const companyName = auth.company?.name ?? "Sem empresa";
  const planRaw = auth.company?.plan ?? "sem plano";
  const plan = typeof planRaw === "string" ? planLabel[planRaw] ?? planRaw : "sem plano";

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-1">
        <p className="font-medium text-gray-900 dark:text-gray-100">{email}</p>
        <div className="flex flex-wrap gap-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Papel: {role}</span>
          <span>Empresa: {companyName}</span>
          <span>Plano: {plan}</span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  );
};

export default Header;
