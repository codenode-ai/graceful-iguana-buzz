import { Button } from "@/shared/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center dark:bg-gray-900">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">Acesso restrito</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Voce nao possui permissao para acessar este recurso. Fale com o administrador da empresa se acredita que isso e um equivoco.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate(from, { replace: true })}>Voltar</Button>
          <Button variant="outline" onClick={() => navigate("/", { replace: true })}>
            Ir para o dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
