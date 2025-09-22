import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { createDefaultCompany } from "@/shared/lib/companyUtils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/components/ui/use-toast";

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile, loading, createProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && profile?.company_id) {
      navigate("/", { replace: true });
    }
  }, [loading, profile?.company_id, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando informacoes...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateCompany = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!companyName.trim()) {
      toast({
        title: "Informe um nome",
        description: "Escolha um nome para a sua empresa antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const company = await createDefaultCompany(companyName.trim());
      await createProfile(user.id, company.id, "admin");
      await refreshProfile();

      toast({
        title: "Empresa criada",
        description: "Seu perfil foi associado como admin. Redirecionando para o dashboard...",
      });

      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "Nao foi possivel criar a empresa",
        description: error?.message || "Revise as informacoes e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Vamos configurar sua empresa</CardTitle>
          <CardDescription>
            Crie uma nova empresa para continuar usando a plataforma. Se voce recebeu um convite, aguarde o fluxo de convites que sera adicionado em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                placeholder="Minha Empresa LTDA"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar empresa"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOnboarding;
