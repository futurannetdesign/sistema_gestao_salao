# 🚀 Deploy da Edge Function update-user-password

## ⚠️ IMPORTANTE

Para que a alteração de senhas funcione corretamente, você precisa fazer o deploy da Edge Function `update-user-password`.

---

## 📋 Passo 1: Criar a Edge Function

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Edge Functions
4. **Clique em:** "Create a new function"
5. **Nome da função:** `update-user-password` (exatamente assim)
6. **Template:** Escolha "Blank"
7. **Clique em:** "Create function"

---

## 📋 Passo 2: Colar o Código

1. **Abra o arquivo:** `EDGE_FUNCTION_UPDATE_PASSWORD.txt`
2. **Copie TODO o código**
3. **Cole no editor da Edge Function** (substitua o código padrão)

**Ou copie este código:**

```typescript
// Edge Function para atualizar senha de usuários no Supabase Auth
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

    if (!email || !newPassword) {
      throw new Error("Email e nova senha são obrigatórios");
    }

    // Criar cliente com service role (tem permissões de admin)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar usuário por email
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = usersData.users.find(u => u.email === email);
    if (!user) {
      throw new Error("Usuário não encontrado no Supabase Auth");
    }

    // Atualizar senha
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Senha atualizada com sucesso" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      }
    );
  }
});
```

---

## 📋 Passo 3: Configurar Secrets

1. **No Supabase Dashboard:**
   - Vá em **Settings** > **API**
   - Copie a **Service Role Key** (mantenha secreta!)
   - Copie a **Project URL** (ex: `https://xxxxx.supabase.co`)

2. **Na Edge Function:**
   - Clique em **Settings** > **Secrets**
   - Adicione:

### Secret 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** Cole a Project URL

### Secret 2: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Cole a Service Role Key

3. **Clique em:** "Save" ou "Add"

---

## 📋 Passo 4: Fazer Deploy

1. **Clique em:** "Deploy" (botão no canto superior direito)
2. **Aguarde alguns segundos**
3. **Você verá:** "Successfully updated edge function"

---

## ✅ Pronto!

Agora a alteração de senhas funcionará corretamente:

1. **Vá em:** Administração > Usuários
2. **Clique em:** "Editar" em um usuário
3. **Preencha a nova senha**
4. **Clique em:** "Atualizar Usuário"
5. **A senha será atualizada no Supabase Auth!** ✅

---

## 🧪 Testar

1. **Edite um usuário** e altere a senha
2. **Faça logout**
3. **Faça login com a nova senha**
4. **Deve funcionar!** ✅

---

## 🆘 Problemas?

Se ainda não funcionar:

1. **Verifique se a Edge Function está deployada:**
   - Edge Functions > `update-user-password` deve aparecer na lista
   - Status deve estar como "Active"

2. **Verifique os Secrets:**
   - Settings > Secrets
   - Deve ter `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

3. **Verifique os Logs:**
   - Edge Functions > `update-user-password` > Logs
   - Veja se há erros

4. **Teste a função manualmente:**
   - Edge Functions > `update-user-password` > Test
   - Envie: `{ "email": "admin@salao.com", "newPassword": "novaSenha123" }`
   - Deve retornar sucesso

---

## ✅ Pronto!

Após fazer o deploy, a alteração de senhas funcionará perfeitamente!

