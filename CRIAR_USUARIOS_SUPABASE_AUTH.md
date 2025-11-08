# 👥 Criar Usuários no Supabase Auth

## ✅ Método Recomendado: Via Dashboard (Mais Simples)

### Passo 1: Criar Usuário Administrador

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Authentication > Users
4. **Clique em:** "Add user" > "Create new user"
5. **Preencha:**
   - **Email:** `admin@salao.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (marcar)
6. **Clique em:** "Create user"

### Passo 2: Criar Usuário Funcionário

1. **Ainda em:** Authentication > Users
2. **Clique em:** "Add user" > "Create new user"
3. **Preencha:**
   - **Email:** `funcionario@salao.com`
   - **Password:** `func123`
   - **Auto Confirm User:** ✅ (marcar)
4. **Clique em:** "Create user"

### Passo 3: Verificar/Criar na Tabela usuarios

1. **No Supabase Dashboard:**
   - Vá em **Table Editor** > **usuarios**
   - Verifique se os usuários existem com os emails corretos

2. **Se não existirem, execute este SQL no SQL Editor:**

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

## ✅ Pronto!

Agora você pode fazer login:
- **Email:** `admin@salao.com` | **Senha:** `admin123`
- **Email:** `funcionario@salao.com` | **Senha:** `func123`

## 📋 Para Criar Novos Usuários

### Via Dashboard (Recomendado)

1. **Supabase Dashboard** > **Authentication** > **Users** > **Add user**
2. Preencha email e senha
3. Marque "Auto Confirm User"
4. Crie o usuário

5. **Depois, crie na tabela usuarios:**
   - Vá em **Table Editor** > **usuarios**
   - Clique em **Insert row**
   - Preencha:
     - **nome:** Nome do usuário
     - **email:** Mesmo email usado no Supabase Auth
     - **perfil:** `admin` ou `funcionario`
     - **ativo:** `true`

### Via SQL (Alternativo)

Execute no SQL Editor:

```sql
-- Criar usuário na tabela usuarios
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Nome do Usuário', 'email@exemplo.com', 'funcionario', true)
ON CONFLICT (email) DO UPDATE
SET nome = 'Nome do Usuário',
    perfil = 'funcionario',
    ativo = true;
```

**Depois, crie o usuário no Supabase Auth Dashboard:**
- Authentication > Users > Add user
- Email: `email@exemplo.com`
- Password: `senha123`
- Auto Confirm User: ✅

## ⚠️ IMPORTANTE

1. **O email deve ser o mesmo** no Supabase Auth e na tabela `usuarios`
2. **Crie primeiro no Supabase Auth**, depois na tabela `usuarios`
3. **Ou crie na tabela `usuarios` primeiro**, depois no Supabase Auth
4. **A ordem não importa**, mas ambos devem existir

## 🔧 Alterar Senhas

Para alterar senhas de usuários:

1. **Via Supabase Dashboard:**
   - Authentication > Users
   - Clique no usuário
   - Clique em "Reset password"
   - Envie o email de recuperação

2. **Ou use a Edge Function `update-user-password`** (se deployada)

## ✅ Vantagens desta Abordagem

- ✅ **Mais simples:** Não precisa de Edge Functions para criar usuários
- ✅ **Mais direto:** Cria diretamente no Supabase Auth
- ✅ **Mais seguro:** Supabase gerencia tudo automaticamente
- ✅ **Funciona imediatamente:** Sem configuração adicional

