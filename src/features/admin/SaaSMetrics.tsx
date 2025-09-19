import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { supabase } from "@/shared/lib/supabase";
import { Loader2 } from "lucide-react";

interface SaaSCompany {
  id: string;
  name: string;
  status: "trial" | "active" | "suspended";
  plan: "free" | "starter" | "growth" | "enterprise";
  employees_count: number;
  responses_count: number;
}

interface OverviewMetrics {
  companies_total: number;
  active_companies: number;
  trial_companies: number;
  suspended_companies: number;
  employees_total: number;
  responses_total: number;
}

const statusLabel: Record<SaaSCompany["status"], string> = {
  trial: "Em trial",
  active: "Ativa",
  suspended: "Suspensa",
};

const planLabel: Record<SaaSCompany["plan"], string> = {
  free: "Gratuito",
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

const fetchOverview = async (): Promise<OverviewMetrics | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_saas_overview");
  if (error) throw error;
  return data?.[0] ?? null;
};

const fetchCompanies = async (): Promise<SaaSCompany[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("company_metrics").select("*");
  if (error) throw error;
  return (data as SaaSCompany[]) ?? [];
};

const SaaSMetrics = () => {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ["saas-overview"],
    queryFn: fetchOverview,
    staleTime: 1000 * 30,
  });

  const { data: companies, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ["saas-companies"],
    queryFn: fetchCompanies,
    staleTime: 1000 * 30,
  });

  const isLoading = overviewLoading || companiesLoading;
  const error = overviewError ?? companiesError;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Nao foi possivel carregar os dados. Verifique as policies do Supabase e tente novamente.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Empresas totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.companies_total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Empresas ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.active_companies ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Usuarios totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.employees_total ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Funcionarios</TableHead>
                <TableHead className="text-right">Respostas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        company.status === "active"
                          ? "default"
                          : company.status === "trial"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {statusLabel[company.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{planLabel[company.plan]}</TableCell>
                  <TableCell className="text-right">{company.employees_count}</TableCell>
                  <TableCell className="text-right">{company.responses_count}</TableCell>
                </TableRow>
              ))}
              {companies?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma empresa cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaaSMetrics;
