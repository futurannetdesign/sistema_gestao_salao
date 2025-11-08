# 🚀 Guia Rápido: Configurar Supabase Auth

## ✅ O que foi feito

O sistema foi migrado para usar **Supabase Auth**. Agora você precisa criar os usuários no Supabase Auth.

---

## 📋 Passo 1: Criar Usuários no Supabase Auth (OBRIGATÓRIO)

### Via Dashboard (Mais Simples)

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Authentication > Users
4. **Clique em:** "Add user" > "Create new user"

### Criar Administrador

- **Email:** `admin@salao.com`
- **Password:** `admin123`
- **Auto Confirm User:** ✅ (marcar)
- **Clique em:** "Create user"

### Criar Funcionário

- **Email:** `funcionario@salao.com`
- **Password:** `func123`
- **Auto Confirm User:** ✅ (marcar)
- **Clique em:** "Create user"

---

## 📋 Passo 2: Criar Usuários na Tabela usuarios (SQL)

1. **No Supabase Dashboard:**
   - Vá em **SQL Editor**
   - Clique em **New query**

2. **Execute este SQL:**

```sql
-- Criar usuário administrador na tabela usuarios
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Administrador', 'admin@salao.com', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET nome = 'Administrador',
    perfil = 'admin',
    ativo = true;

-- Criar usuário funcionário na tabela usuarios
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Funcionário', 'funcionario@salao.com', 'funcionario', true)
ON CONFLICT (email) DO UPDATE
SET nome = 'Funcionário',
    perfil = 'funcionario',
    ativo = true;
```

3. **Clique em:** "Run" ou "Execute"

---

## ✅ Pronto!

Agora você pode fazer login:
- **Email:** `admin@salao.com` | **Senha:** `admin123`
- **Email:** `funcionario@salao.com` | **Senha:** `func123`

---

## 📋 Para Criar Novos Usuários

### 1. Criar no Supabase Auth

1. **Supabase Dashboard** > **Authentication** > **Users** > **Add user**
2. Preencha email e senha
3. Marque "Auto Confirm User"
4. Crie o usuário

### 2. Criar na Tabela usuarios

**Opção A: Via Interface do Sistema**
- Vá em **Administração** > **Usuários** > **Novo Usuário**
- Preencha os dados
- O sistema criará na tabela `usuarios`
- Você verá uma mensagem lembrando de criar no Supabase Auth

**Opção B: Via SQL**

```sql
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Nome do Usuário', 'email@exemplo.com', 'funcionario', true)
ON CONFLICT (email) DO UPDATE
SET nome = 'Nome do Usuário',
    perfil = 'funcionario',
    ativo = true;
```

---

## 🔧 Alterar Senhas

### Via Supabase Dashboard (Recomendado)

1. **Supabase Dashboard** > **Authentication** > **Users**
2. **Clique no usuário** que deseja alterar a senha
3. **Clique em:** "Reset password"
4. **Envie o email de recuperação** ou defina uma nova senha diretamente

### Via Sistema (Se Edge Function estiver deployada)

1. **Administração** > **Migrar Senhas**
2. **Clique em:** "Alterar Senha" no usuário
3. **Digite a nova senha**
4. Se a Edge Function `update-user-password` estiver deployada, funcionará automaticamente
5. Se não, você verá instruções para usar o Dashboard

---

## ⚠️ IMPORTANTE

1. **O email deve ser o mesmo** no Supabase Auth e na tabela `usuarios`
2. **Crie primeiro no Supabase Auth**, depois na tabela `usuarios` (ou vice-versa)
3. **A ordem não importa**, mas ambos devem existir
4. **Sem criar no Supabase Auth**, o login não funcionará

---

## ✅ Vantagens do Supabase Auth

- ✅ **Mais seguro:** Hash bcrypt automático
- ✅ **Recuperação de senha:** Já implementado
- ✅ **2FA:** Suporte nativo
- ✅ **Rate limiting:** Automático
- ✅ **Sessões:** Gerenciadas automaticamente
- ✅ **Sem Edge Functions:** Para hash de senhas (não precisa mais)

---

## 🆘 Problemas?

Se o login não funcionar:

1. **Verifique se o usuário existe no Supabase Auth:**
   - Authentication > Users
   - Verifique se o email está correto

2. **Verifique se o usuário existe na tabela usuarios:**
   - Table Editor > usuarios
   - Verifique se o email está correto

3. **Verifique se o email é o mesmo** em ambos os lugares

4. **Teste o login** novamente

---

## 📚 Documentação

- `CRIAR_USUARIOS_SUPABASE_AUTH.md` - Guia detalhado
- `MIGRACAO_SUPABASE_AUTH.md` - Documentação completa
- `database/migration_usuarios_supabase_auth.sql` - Script SQL

