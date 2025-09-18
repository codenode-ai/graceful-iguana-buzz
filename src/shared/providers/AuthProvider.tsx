import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";

export type UserRole = "admin" | "manager" | "employee" | "superadmin";

export interface Profile {
  user_id: string;
  company_id: string | null;
  role: UserRole;
  full_name: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  status: "trial" | "active" | "suspended";
  plan: "free" | "starter" | "growth" | "enterprise";
  billing_email: string | null;
  stripe_customer_id: string | null;
  metadata: Record<string, unknown> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithMagicLink: (email: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  createProfile: (userId: string, companyId: string, role?: UserRole) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, company_id, role, full_name, invited_by, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile) ?? null;
}

async function fetchCompany(companyId: string): Promise<Company | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, status, plan, billing_email, stripe_customer_id, metadata, created_by, created_at, updated_at")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Company) ?? null;
}

const supabaseNotConfigured = async () => {
  throw new Error("Supabase client is not initialized");
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setInitializing(false);
      return () => {
        isMounted = false;
      };
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
          setInitializing(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
          setInitializing(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      if (!nextSession) {
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["company"] });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const user = session?.user ?? null;

  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user && !!supabase,
    staleTime: 1000 * 60,
  });

  const {
    data: company,
    isLoading: companyLoading,
  } = useQuery({
    queryKey: ["company", profile?.company_id],
    queryFn: () => fetchCompany(profile!.company_id!),
    enabled: !!profile?.company_id && !!supabase,
    staleTime: 1000 * 60,
  });

  const loading = initializing || profileLoading || (!!profile?.company_id && companyLoading);

  const signIn = useCallback<AuthContextValue["signIn"]>(async (email, password) => {
    if (!supabase) {
      return supabaseNotConfigured();
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    return data;
  }, []);

  const signInWithMagicLink = useCallback<AuthContextValue["signInWithMagicLink"]>(async (email) => {
    if (!supabase) {
      return supabaseNotConfigured();
    }

    const { data, error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      throw error;
    }

    return data;
  }, []);

  const signUp = useCallback<AuthContextValue["signUp"]>(async (email, password) => {
    if (!supabase) {
      return supabaseNotConfigured();
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        if ("status" in error && (error as any).status === 429) {
          throw new Error(
            "Muitas tentativas de criacao de conta. Por favor, aguarde alguns minutos antes de tentar novamente."
          );
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      if (error?.message?.includes("Failed to fetch")) {
        throw new Error("Erro de conexao. Verifique sua internet e tente novamente.");
      }
      throw error;
    }
  }, []);

  const signOut = useCallback<AuthContextValue["signOut"]>(async () => {
    if (!supabase) {
      return supabaseNotConfigured();
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    queryClient.removeQueries({ queryKey: ["profile"] });
    queryClient.removeQueries({ queryKey: ["company"] });
  }, [queryClient]);

  const createProfile = useCallback<AuthContextValue["createProfile"]>(
    async (userId, companyId, role = "admin") => {
      if (!supabase) {
        return supabaseNotConfigured();
      }

      const { data: existing, error: existingError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existing) {
        const { data, error } = await supabase
          .from("profiles")
          .update({ company_id: companyId, role })
          .eq("user_id", userId)
          .select();

        if (error) {
          throw error;
        }

        await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        await queryClient.invalidateQueries({ queryKey: ["company", companyId] });
        return data;
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert({ user_id: userId, company_id: companyId, role })
        .select();

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      await queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      return data;
    },
    [queryClient]
  );

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    if (profile?.company_id) {
      await queryClient.invalidateQueries({ queryKey: ["company", profile.company_id] });
    }
  }, [profile?.company_id, queryClient, user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile: profile ?? null,
      company: company ?? null,
      loading,
      signIn,
      signInWithMagicLink,
      signUp,
      signOut,
      createProfile,
      refreshProfile,
    }),
    [company, createProfile, loading, profile, refreshProfile, session, signIn, signInWithMagicLink, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
