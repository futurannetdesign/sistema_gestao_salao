// ⚠️ IMPORTANTE: Este é um arquivo de exemplo
// Copie este arquivo para environment.prod.ts e preencha com suas credenciais reais
// NUNCA commite o arquivo environment.prod.ts com credenciais reais!

export const environment = {
  production: true,
  supabaseUrl: 'SUA_URL_DO_SUPABASE_AQUI',
  supabaseKey: 'SUA_CHAVE_ANON_KEY_DO_SUPABASE_AQUI',
  supabaseServiceRoleKey: 'SUA_SERVICE_ROLE_KEY_DO_SUPABASE_AQUI' // ⚠️ IMPORTANTE: Mantenha secreta! Use apenas para atualizar senhas
};

