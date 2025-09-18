import { supabase } from "./supabase";

export const createDefaultCompany = async (companyName: string) => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  console.log("Tentando criar empresa:", companyName, "para usuário", user.id);

  const { data, error } = await supabase
    .from("companies")
    .insert([{ name: companyName, created_by: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar empresa:", error);
    throw error;
  }

  console.log("Empresa criada com sucesso:", data);
  return data;
};
