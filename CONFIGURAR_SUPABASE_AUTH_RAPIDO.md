# 🚀 Configurar Supabase Auth - Guia Rápido

## ✅ O que foi feito

O sistema foi migrado para usar **Supabase Auth** ao invés de gerenciar senhas manualmente. Agora você precisa:

1. **Criar usuários no Supabase Auth**
2. **Criar Edge Functions** (opcional, mas recomendado)

---

## 📋 Passo 1: Criar Usuários no Supabase Auth

### Método Mais Simples: Via Dashboard

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Authentication > Users
4. **Clique em:** "Add user" > "Create new user"
5. **Preencha:**
   - **Email:** `admin@salao.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (marcar)
6. **Clique em:** "Create user"
7. **Repita para o funcionário:**
   - **Email:** `funcionario@salao.com`
   - **Password:** `func123`
   - **Auto Confirm User:** ✅ (marcar)

### Verificar se os usuários existem na tabela `usuarios`

1. No Supabase Dashboard, vá em **Table Editor** > **usuarios**
2. Verifique se os usuários existem com os emails corretos
3. Se não existirem, crie manualmente ou use o sistema para criar

---

## 📋 Passo 2: Criar Edge Functions (Opcional mas Recomendado)

### Edge Function 1: `create-user` (Para criar usuários)

1. **No Supabase Dashboard:**
   - Vá em **Edge Functions**
   - Clique em **Create a new function**
   - **Nome:** `create-user`
   - **Template:** Blank

2. **Copie o código:**
   - Abra o arquivo `EDGE_FUNCTION_CREATE_USER.txt`
   - Copie TODO o código
   - Cole no editor da Edge Function

3. **Configurar Service Role Key:**
   - No Supabase Dashboard, vá em **Settings** > **API**
   - Copie a **Service Role Key** (mantenha secreta!)
   - Na Edge Function, vá em **Settings** > **Secrets**
   - Adicione:
     - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
     - **Value:** Cole a Service Role Key
   - Adicione também:
     - **Name:** `SUPABASE_URL`
     - **Value:** Cole a URL do seu projeto (ex: `https://xxxxx.supabase.co`)

4. **Deploy:**
   - Clique em **Deploy**

### Edge Function 2: `update-user-password` (Para alterar senhas)

1. **No Supabase Dashboard:**
   - Vá em **Edge Functions**
   - Clique em **Create a new function**
   - **Nome:** `update-user-password`
   - **Template:** Blank

2. **Copie o código:**
   - Abra o arquivo `EDGE_FUNCTION_UPDATE_PASSWORD.txt`
   - Copie TODO o código
   - Cole no editor da Edge Function

3. **Configurar Service Role Key:**
   - Mesmo processo da função anterior
   - Adicione os mesmos secrets: `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_URL`

4. **Deploy:**
   - Clique em **Deploy**

---

## ✅ Testar

1. **Login:**
   - Acesse o sistema
   - Faça login com: `admin@salao.com` / `admin123`
   - Deve funcionar!

2. **Criar Usuário:**
   - Vá em **Administração** > **Usuários** > **Novo Usuário**
   - Se a Edge Function `create-user` estiver deployada, funcionará automaticamente
   - Se não, você verá um aviso para criar manualmente no Supabase Auth

3. **Alterar Senha:**
   - Vá em **Administração** > **Migrar Senhas**
   - Clique em **Alterar Senha** em um usuário
   - Se a Edge Function `update-user-password` estiver deployada, funcionará automaticamente
   - Se não, você verá um aviso

---

## 🔧 Configuração de Secrets nas Edge Functions

Para que as Edge Functions funcionem, você precisa configurar os **Secrets**:

1. **No Supabase Dashboard:**
   - Vá em **Edge Functions** > Selecione a função
   - Clique em **Settings** > **Secrets**
   - Adicione:

### Secret 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** URL do seu projeto (ex: `https://xxxxx.supabase.co`)
- **Como encontrar:** Settings > API > Project URL

### Secret 2: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Service Role Key (a chave secreta)
- **Como encontrar:** Settings > API > Service Role Key
- ⚠️ **IMPORTANTE:** Mantenha esta chave secreta! Nunca compartilhe!

---

## 📝 Notas Importantes

1. **Service Role Key:**
   - Esta chave tem permissões de administrador
   - Use APENAS em Edge Functions (nunca no cliente)
   - Mantenha secreta!

2. **Tabela `usuarios`:**
   - Continua sendo usada para permissões e dados adicionais
   - O email deve ser o mesmo no Supabase Auth e na tabela `usuarios`

3. **Sem Edge Functions:**
   - O sistema ainda funciona, mas você precisará criar usuários manualmente no Supabase Auth
   - Alterar senhas precisará ser feito via recuperação de senha do Supabase Auth

---

## ✅ Pronto!

Após configurar:
- ✅ Login funciona com Supabase Auth
- ✅ Usuários podem ser criados (se Edge Function estiver deployada)
- ✅ Senhas podem ser alteradas (se Edge Function estiver deployada)
- ✅ Mais seguro (hash automático, rate limiting, etc.)

---

## 🆘 Problemas?

Se algo não funcionar:
1. Verifique se os usuários existem no Supabase Auth
2. Verifique se os secrets estão configurados nas Edge Functions
3. Verifique os logs das Edge Functions no Supabase Dashboard
4. Consulte `MIGRACAO_SUPABASE_AUTH.md` para mais detalhes

