# 🚀 Deploy Alternativo da Edge Function - Via Painel do Supabase

## ⚡ Método 1: Usar npx (Mais Simples)

O `npx` permite usar o Supabase CLI sem instalar. Execute os comandos abaixo:

### 1. Fazer Login

```powershell
npx supabase login
```

Quando perguntar "Ok to proceed? (y)", digite `y` e pressione Enter.

### 2. Linkar ao Projeto

```powershell
# Use o project-ref do seu Supabase (gmkijzjxfhndcpaiizsc)
npx supabase link --project-ref gmkijzjxfhndcpaiizsc
```

### 3. Deploy da Função

```powershell
npx supabase functions deploy hash-password
```

## 🖥️ Método 2: Criar Edge Function Diretamente no Painel do Supabase

Se preferir não usar a CLI, você pode criar a Edge Function diretamente no painel:

### Passo 1: Acessar Edge Functions

1. Acesse o painel do Supabase
2. Vá em **Edge Functions** no menu lateral
3. Clique em **Create a new function**

### Passo 2: Criar Função

1. **Nome da função:** `hash-password`
2. **Template:** Escolha "Blank" ou "Hello World"
3. Clique em **Create function**

### Passo 3: Colar o Código

Cole o código abaixo na função:

```typescript
// Supabase Edge Function para hash de senhas usando bcrypt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Importar bcrypt para Deno
import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { senha, hash: hashFornecido } = await req.json();

    // Se hash for fornecido, verificar senha
    if (hashFornecido) {
      const isValid = await compare(senha, hashFornecido);
      return new Response(
        JSON.stringify({ valid: isValid }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Se não, fazer hash da senha
    const hashedPassword = await hash(senha);

    return new Response(
      JSON.stringify({ hash: hashedPassword }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### Passo 4: Salvar e Deploy

1. Clique em **Save**
2. A função será deployada automaticamente

## ✅ Verificar Funcionamento

### Teste via Painel do Supabase

1. Vá em **Edge Functions** > **hash-password**
2. Clique em **Invoke function**
3. Teste com:
   ```json
   {
     "senha": "teste123"
   }
   ```
4. Deve retornar um hash

## 🔧 Configurar Permissões

1. Vá em **Edge Functions** > **hash-password** > **Settings**
2. Configure:
   - **Invoke URL:** Público (ou configure autenticação)
   - **Secrets:** Não necessário para esta função

## 📝 Notas

- A Edge Function será executada no servidor do Supabase
- Não precisa instalar nada localmente
- O código usa bcrypt nativo do Deno
- CORS já está configurado

## 🧪 Testar no Sistema

Após o deploy:

1. Faça login com um usuário que tem senha em texto plano
2. O sistema automaticamente migrará a senha para hash
3. Faça logout e login novamente para verificar

