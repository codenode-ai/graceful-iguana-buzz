import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase"; // ajuste o caminho se seu client estiver em outro lugar

export type Employee = {
  id: string;
  full_name: string;
  language: string;
  notes: string | null;
  company_id: string;
  created_at?: string;
};

type NewEmployee = {
  full_name: string;
  language: string;
  notes?: string;
};

type UseEmployees = {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  addEmployee: (payload: NewEmployee) => Promise<void>;
};

export function useEmployees(companyId: string | null | undefined): UseEmployees {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // proteção simples para evitar queries sem companyId
  const activeCompanyId = useMemo(() => companyId?.trim() || null, [companyId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!activeCompanyId) {
        setEmployees([]);
        setLoading(false);
        setError("companyId inválido");
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, language, notes, company_id, created_at")
        .eq("company_id", activeCompanyId)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setEmployees([]);
      } else {
        setEmployees((data ?? []) as Employee[]);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [activeCompanyId]);

  const addEmployee = async (payload: NewEmployee) => {
    if (!activeCompanyId) throw new Error("companyId inválido");

    const insertBody = {
      full_name: payload.full_name,
      language: payload.language,
      notes: payload.notes ?? null,
      company_id: activeCompanyId,
    };

    const { data, error } = await supabase
      .from("employees")
      .insert(insertBody)
      .select("id, full_name, language, notes, company_id, created_at")
      .single();

    if (error) throw new Error(error.message);

    setEmployees((prev) => [...prev, data as Employee]);
  };

  return { employees, loading, error, addEmployee };
}
