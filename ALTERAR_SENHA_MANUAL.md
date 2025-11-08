# 🔐 Como Alterar Senhas no Supabase Auth (Sem Edge Functions)

## ⚠️ IMPORTANTE

O Supabase Auth não permite alterar senhas de outros usuários diretamente do cliente JavaScript por questões de segurança. Você precisa alterar manualmente no Supabase Dashboard.

---

## 📋 Como Alterar Senha de um Usuário

### Método 1: Via Supabase Dashboard (Recomendado)

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Authentication > Users
4. **Procure o usuário** pelo email
5. **Clique no usuário** para abrir os detalhes
6. **Clique nos três pontos (...)** no canto superior direito
7. **Clique em:** "Reset password"
8. **Defina a nova senha** diretamente ou envie email de recuperação

### Método 2: Via SQL (Alternativo)

Se você quiser criar uma função SQL para facilitar, execute este SQL no Supabase SQL Editor:

```sql
-- Função para atualizar senha via SQL (requer extensão)
-- Nota: Isso não atualiza diretamente no Supabase Auth
-- Você ainda precisa usar o Dashboard ou API REST

-- Por enquanto, use o Dashboard para alterar senhas
```

**⚠️ Nota:** Não é possível alterar senhas no Supabase Auth diretamente via SQL. Use o Dashboard.

---

## ✅ Processo Recomendado

### Quando Editar um Usuário e Alterar a Senha:

1. **No sistema:**
   - Vá em **Administração** > **Usuários**
   - Clique em **Editar** no usuário
   - Preencha a nova senha
   - Clique em **Atualizar Usuário**
   - O sistema mostrará instruções para alterar no Supabase Dashboard

2. **No Supabase Dashboard:**
   - Vá em **Authentication** > **Users**
   - Selecione o usuário pelo email
   - Clique em **"..."** > **"Reset password"**
   - Defina a nova senha (a mesma que você digitou no sistema)
   - Salve

3. **Teste:**
   - Faça logout
   - Faça login com a nova senha
   - Deve funcionar!

---

## 🔧 Alternativa: Usar Recuperação de Senha

O sistema também pode enviar um email de recuperação de senha:

1. **No sistema:**
   - Edite o usuário e altere a senha
   - O sistema enviará um email de recuperação para o usuário
   - O usuário precisará clicar no link do email para definir a nova senha

2. **O usuário:**
   - Recebe o email
   - Clica no link
   - Define a nova senha
   - Faz login

---

## 📝 Resumo

**Para alterar senhas sem Edge Functions:**

1. ✅ **Edite o usuário no sistema** (atualiza dados na tabela `usuarios`)
2. ✅ **Altere a senha no Supabase Dashboard** (Authentication > Users > Reset password)
3. ✅ **Use a mesma senha** que você digitou no sistema
4. ✅ **Teste fazendo login** com a nova senha

---

## ⚠️ Limitação

- **Não é possível** alterar senhas automaticamente sem Edge Functions
- **É necessário** alterar manualmente no Supabase Dashboard
- **Ou usar** recuperação de senha (envia email para o usuário)

---

## ✅ Vantagens desta Abordagem

- ✅ **Mais simples:** Não precisa criar Edge Functions
- ✅ **Mais seguro:** Senhas são alteradas diretamente no Supabase Auth
- ✅ **Funciona imediatamente:** Sem configuração adicional
- ✅ **Controle total:** Você vê exatamente o que está sendo alterado

