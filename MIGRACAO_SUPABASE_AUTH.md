# 🔐 Migração para Supabase Auth

## ✅ O que foi implementado

O sistema foi migrado para usar **Supabase Auth** ao invés de gerenciar senhas manualmente. Isso é mais seguro e não requer Edge Functions para hash de senhas.

## 🔄 Mudanças Implementadas

### 1. AuthService Atualizado
- ✅ Usa `supabase.auth.signInWithPassword()` para login
- ✅ Usa `supabase.auth.signOut()` para logout
- ✅ Verifica sessão automaticamente
- ✅ Sincroniza com tabela `usuarios` para permissões

### 2. Sistema de Login
- ✅ Login agora usa Supabase Auth
- ✅ Senhas são gerenciadas automaticamente pelo Supabase
- ✅ Mais seguro (hash bcrypt automático)
- ✅ Suporta recuperação de senha

### 3. Criação de Usuários
- ⚠️ Requer Edge Function ou Service Role Key
- ✅ Usuários são criados no Supabase Auth
- ✅ Registro na tabela `usuarios` para permissões

### 4. Alteração de Senhas
- ⚠️ Requer Edge Function `update-user-password`
- ✅ Ou usar recuperação de senha do Supabase Auth

## 🚀 Próximos Passos

### 1. Criar Usuários no Supabase Auth

Você tem duas opções:

#### Opção A: Via Supabase Dashboard (Mais Fácil)

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** > **Users**
3. Clique em **Add user** > **Create new user**
4. Preencha:
   - **Email:** email do usuário
   - **Password:** senha do usuário
   - **Auto Confirm User:** ✅ (marcar)
5. Clique em **Create user**

#### Opção B: Via Edge Function (Recomendado para Produção)

Crie uma Edge Function `create-user` que usa Service Role Key:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, nome, perfil } = await req.json();

    // Criar cliente com service role (tem permissões de admin)
    const supabaseAdmin = createClient(
      Deno.env.get("https://gmkijzjxfhndcpaiizsc.supabase.co") ?? "",
      Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdta2lqemp4ZmhuZGNwYWlpenNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU5MDksImV4cCI6MjA3ODAzMTkwOX0.6RPWBDUc-HaOANLzlbdPsihJ8417YSq9RnBm4IFgIew") ?? ""
    );

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) throw authError;

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
```

### 2. Criar Edge Function para Alterar Senhas

Crie uma Edge Function `update-user-password`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, newPassword } = await req.json();

    // Criar cliente com service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar usuário por email
    const { data: users, error: findError } = await supabaseAdmin.auth.admin.listUsers();
    if (findError) throw findError;

    const user = users.users.find(u => u.email === email);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Atualizar senha
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: "Senha atualizada com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
```

## 📋 Migrar Usuários Existentes

Se você já tem usuários na tabela `usuarios`:

1. **Criar usuários no Supabase Auth:**
   - Via Dashboard (mais fácil)
   - Ou via Edge Function

2. **Manter tabela `usuarios`:**
   - A tabela `usuarios` continua sendo usada para:
     - Permissões
     - Dados adicionais (nome, perfil, etc.)
   - O email deve ser o mesmo em ambos os lugares

## ✅ Vantagens do Supabase Auth

- ✅ **Mais seguro:** Hash bcrypt automático
- ✅ **Recuperação de senha:** Já implementado
- ✅ **2FA:** Suporte nativo
- ✅ **Rate limiting:** Automático
- ✅ **Sessões:** Gerenciadas automaticamente
- ✅ **Sem Edge Functions:** Para hash de senhas (não precisa mais)

## 🔧 Configuração Necessária

1. **Service Role Key:**
   - Vá em Supabase Dashboard > Settings > API
   - Copie a **Service Role Key** (mantenha secreta!)
   - Use apenas em Edge Functions (nunca no cliente)

2. **Criar Edge Functions:**
   - `create-user` - Para criar usuários
   - `update-user-password` - Para alterar senhas

## 📚 Documentação

- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Admin API:** https://supabase.com/docs/reference/javascript/auth-admin

