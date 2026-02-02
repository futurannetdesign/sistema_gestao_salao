// Setup básico para Deno (Supabase Edge Functions)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log("--- Nova Requisição Recebida ---");
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action, email, password, userId, userData } = body;
    console.log(`Ação: ${action} | Email: ${email}`);

    let data, error;

    if (action === 'create_user') {
      console.log("Iniciando criação no Auth...");
      if (!email || !password) throw new Error("Email e Senha são obrigatórios para criação.");
      
      const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: userData
      });

      if (createError) {
        console.error("Erro ao criar Auth User:", createError);
        throw createError;
      }

      console.log("SUCESSO: Auth User criado:", user.user.id);

      // Inserir na tabela public.usuarios (Admin bypass RLS)
      console.log("Iniciando inserção na tabela public.usuarios...");
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('usuarios')
        .insert([{
          auth_id: user.user.id,
          email: email,
          nome: userData?.nome || 'Usuário',
          perfil: userData?.perfil || 'funcionario',
          ativo: true,
          salao_id: userData?.salao_id
        }])
        .select()
        .single();

      if (dbError) {
        console.error("Erro ao criar registro no banco:", dbError);
        throw new Error(`Auth criado, mas erro no banco: ${dbError.message}`);
      }

      console.log("SUCESSO: Registro no banco criado.");
      data = { user: user.user, dbUser };
      error = null;
    } 
    
    else if (action === 'update_password') {
      console.log("Iniciando atualização de senha...");
      if (!password) throw new Error("Nova senha é obrigatória.");
      
      let targetUserId = userId;
      if (!targetUserId && email) {
        console.log("Buscando ID por email...");
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
    
    else if (action === 'delete_user') {
        console.log("Iniciando exclusão de usuário...");
        let targetUserId = userId;
        if (!targetUserId && email) {
            const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
            const found = listUsers.users.find((u: any) => u.email === email);
            if (found) targetUserId = found.id;
        }

        if (!targetUserId) {
            console.log("Usuário não encontrado no Auth.");
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
      throw new Error("Ação inválida.");
    }

    if (error) {
      console.error("Erro interno do Supabase Admin:", error);
      throw error;
    }

    console.log("Operação finalizada com sucesso.");
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error("DEBUG - Erro Capturado na Edge Function:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
