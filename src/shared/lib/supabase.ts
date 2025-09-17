// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Lê variáveis de ambiente definidas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL e Anon Key não foram definidas no arquivo .env. ' +
    'A aplicação rodará com dados mockados, mas os recursos do Supabase não funcionarão.'
  )
}

/**
 * Exporta o cliente do Supabase.
 * - Se as variáveis estiverem definidas, cria o cliente normalmente.
 * - Se não estiverem, exporta `null` para evitar erros de runtime.
 * - O schema customizado `sociometria` é usado para separar as tabelas do projeto.
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'sociometria',
      },
    })
  : null
