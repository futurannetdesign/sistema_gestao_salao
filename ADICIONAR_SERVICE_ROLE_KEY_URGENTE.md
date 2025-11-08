# ⚠️ URGENTE: Adicionar Service Role Key

## 🚨 Problema

A alteração de senhas não está funcionando porque a **Service Role Key** não está configurada nos arquivos de environment.

---

## ✅ Solução Rápida (2 minutos)

### Passo 1: Obter Service Role Key

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em:** Settings > API
4. **Copie a Service Role Key** (a chave longa que começa com `eyJ...`)
   - ⚠️ **MANTENHA SECRETA!**

### Passo 2: Adicionar no environment.ts

1. **Abra o arquivo:** `src/environments/environment.ts`
2. **Adicione a linha `supabaseServiceRoleKey`:**

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://gmkijzjxfhndcpaiizsc.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdta2lqemp4ZmhuZGNwYWlpenNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU5MDksImV4cCI6MjA3ODAzMTkwOX0.6RPWBDUc-HaOANLzlbdPsihJ8417YSq9RnBm4IFgIew',
  supabaseServiceRoleKey: 'COLE_A_SERVICE_ROLE_KEY_AQUI' // ⚠️ MANTENHA SECRETA!
};
```

### Passo 3: Adicionar no environment.prod.ts

1. **Abra o arquivo:** `src/environments/environment.prod.ts`
2. **Adicione a mesma linha:**

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://gmkijzjxfhndcpaiizsc.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdta2lqemp4ZmhuZGNwYWlpenNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU5MDksImV4cCI6MjA3ODAzMTkwOX0.6RPWBDUc-HaOANLzlbdPsihJ8417YSq9RnBm4IFgIew',
  supabaseServiceRoleKey: 'COLE_A_SERVICE_ROLE_KEY_AQUI' // ⚠️ MANTENHA SECRETA!
};
```

### Passo 4: Rebuild e Deploy

```bash
npm run build
firebase deploy --only hosting
```

---

## ✅ Pronto!

Após adicionar a Service Role Key, a alteração de senhas funcionará automaticamente!

---

## 🧪 Testar

1. **Edite um usuário** e altere a senha
2. **Abra o console do navegador** (F12) para ver os logs
3. **Faça logout**
4. **Faça login com a nova senha**
5. **Deve funcionar!** ✅

---

## 🆘 Ainda não funciona?

1. **Verifique o console do navegador** (F12) para ver os erros
2. **Verifique se a Service Role Key está correta:**
   - Deve começar com `eyJ...`
   - Deve ter mais de 200 caracteres
3. **Verifique se está no arquivo correto:**
   - `environment.ts` para desenvolvimento
   - `environment.prod.ts` para produção (Firebase Hosting)

