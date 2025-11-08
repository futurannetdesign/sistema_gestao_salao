# 🔐 Configurar Service Role Key para Alterar Senhas

## ⚠️ IMPORTANTE - Segurança

A **Service Role Key** tem permissões de administrador no Supabase. Ela será usada no cliente para atualizar senhas. 

**⚠️ ATENÇÃO:** Em produção, considere usar Edge Functions ao invés de expor a Service Role Key no cliente. Mas para facilitar, vamos usar diretamente.

---

## 📋 Passo 1: Obter a Service Role Key

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Settings > API
4. **Copie a Service Role Key** (a chave longa que começa com `eyJ...`)
   - ⚠️ **MANTENHA SECRETA!** Nunca compartilhe ou commite no Git!

---

## 📋 Passo 2: Adicionar no Environment

### Para Desenvolvimento (environment.ts)

1. **Abra o arquivo:** `src/environments/environment.ts`
2. **Adicione a Service Role Key:**

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://xxxxx.supabase.co',
  supabaseKey: 'sua-anon-key-aqui',
  supabaseServiceRoleKey: 'sua-service-role-key-aqui' // ⚠️ MANTENHA SECRETA!
};
```

### Para Produção (environment.prod.ts)

1. **Abra o arquivo:** `src/environments/environment.prod.ts`
2. **Adicione a Service Role Key:**

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://xxxxx.supabase.co',
  supabaseKey: 'sua-anon-key-aqui',
  supabaseServiceRoleKey: 'sua-service-role-key-aqui' // ⚠️ MANTENHA SECRETA!
};
```

---

## ✅ Pronto!

Agora a alteração de senhas funcionará automaticamente:

1. **Vá em:** Administração > Usuários
2. **Clique em:** "Editar" em um usuário
3. **Preencha a nova senha**
4. **Clique em:** "Atualizar Usuário"
5. **A senha será atualizada no Supabase Auth automaticamente!** ✅

---

## 🧪 Testar

1. **Edite um usuário** e altere a senha
2. **Faça logout**
3. **Faça login com a nova senha**
4. **Deve funcionar!** ✅

---

## ⚠️ Segurança em Produção

Para produção, você pode:

1. **Usar variáveis de ambiente** no servidor (não expor no código)
2. **Ou usar Edge Functions** (mais seguro, mas requer deploy)
3. **Ou usar variáveis de ambiente do Firebase Hosting** (se estiver usando Firebase)

### Usar Variáveis de Ambiente no Firebase Hosting

Se estiver usando Firebase Hosting, você pode usar variáveis de ambiente:

1. **No Firebase Console:**
   - Vá em **Hosting** > **Configurações**
   - Adicione variáveis de ambiente

2. **No código:**
   - Use `process.env.SUPABASE_SERVICE_ROLE_KEY` (mas isso não funciona no Angular compilado)

**Nota:** Angular compila tudo no cliente, então a Service Role Key estará visível no código JavaScript. Para máxima segurança, use Edge Functions.

---

## 🆘 Problemas?

Se a alteração de senha não funcionar:

1. **Verifique se a Service Role Key está correta:**
   - Deve começar com `eyJ...`
   - Deve ter mais de 200 caracteres

2. **Verifique se está no environment correto:**
   - `environment.ts` para desenvolvimento
   - `environment.prod.ts` para produção

3. **Verifique o console do navegador:**
   - Veja se há erros relacionados à API

4. **Teste a API manualmente:**
   - Use Postman ou curl para testar a API do Supabase

---

## ✅ Pronto!

Após configurar a Service Role Key, a alteração de senhas funcionará perfeitamente!

