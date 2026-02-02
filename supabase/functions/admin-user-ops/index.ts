// Setup básico para Deno (Supabase Edge Functions)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Criar cliente Supabase com PRIVILÉGIOS DE ADMIN
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Ler dados da requisição
    const body = await req.json();
    const { action, email, password, userId, userData } = body;

    // 3. Roteamento de Ações
    let data, error;

    // AÇÃO: CRIAR USUÁRIO NOVO
    if (action === 'create_user') {
      if (!email || !password) throw new Error("Email e Senha são obrigatórios para criação.");
      
      const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: userData
      });
      data = user;
      error = createError;
    } 
    
    // AÇÃO: ATUALIZAR SENHA
    else if (action === 'update_password') {
      if (!password) throw new Error("Nova senha é obrigatória.");
      
      let targetUserId = userId;
      if (!targetUserId && email) {
        const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
        const found = listUsers.users.find((u: any) => u.email === email);
        if (found) targetUserId = found.id;
      }

      if (!targetUserId) throw new Error("Usuário não encontrado para atualizar senha.");

      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        { password: password }
      );
      data = updatedUser;
      error = updateError;
    } 
    
    // AÇÃO: DELETAR USUÁRIO
    else if (action === 'delete_user') {
        let targetUserId = userId;
        if (!targetUserId && email) {
            const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
            const found = listUsers.users.find((u: any) => u.email === email);
            if (found) targetUserId = found.id;
        }

        if (!targetUserId) {
            return new Response(JSON.stringify({ success: true, message: "Usuário não existia no Auth." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const { data: delUser, error: delError } = await supabaseAdmin.auth.admin.deleteUser(
            targetUserId
        );
        data = delUser;
        error = delError;
    }
    
    else {
      throw new Error("Ação inválida. Use 'create_user' ou 'update_password'.");
    }

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
