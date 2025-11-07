# Edge Function: Hash de Senhas

Esta Edge Function do Supabase é usada para hash e verificação de senhas usando bcrypt.

## Deploy

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-ref

# Deploy da função
supabase functions deploy hash-password
```

## Uso

### Hash de Senha

```typescript
const response = await fetch('https://seu-projeto.supabase.co/functions/v1/hash-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    senha: 'senha123'
  })
});

const { hash } = await response.json();
```

### Verificar Senha

```typescript
const response = await fetch('https://seu-projeto.supabase.co/functions/v1/hash-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    senha: 'senha123',
    hash: 'hash_armazenado'
  })
});

const { valid } = await response.json();
```

