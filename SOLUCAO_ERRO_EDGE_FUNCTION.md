# 🔧 Solução: Erro "Edge Function returned a non-2xx status code"

## ⚠️ Problema

Você está recebendo o erro:
```
Erro ao salvar usuário: Erro ao fazer hash da senha: Edge Function returned a non-2xx status code
```

Isso significa que a **Edge Function `hash-password` não está deployada** no Supabase.

## ✅ Solução Rápida (5 minutos)

### Método 1: Via Painel do Supabase (Mais Fácil)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione seu projeto

2. **Criar a Edge Function:**
   - No menu lateral, clique em **Edge Functions**
   - Clique em **Create a new function**
   - **Nome da função:** `hash-password`
   - **Template:** Escolha "Blank" ou "Hello World"
   - Clique em **Create function**

3. **Colar o Código:**
   - Abra o arquivo `CODIGO_EDGE_FUNCTION.txt` neste projeto
   - Copie **TODO o código** (linhas 4 a 56)
   - Cole no editor da Edge Function (substitua o código padrão)
   - Clique em **Deploy** (botão no canto superior direito)

4. **Verificar:**
   - A função deve aparecer na lista de Edge Functions
   - Status deve estar como "Active"

5. **Testar:**
   - Volte ao sistema e tente alterar uma senha novamente
   - O erro deve desaparecer!

---

## 📋 Código da Edge Function

Se você não encontrar o arquivo `CODIGO_EDGE_FUNCTION.txt`, copie este código:

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

---

## 🔍 Verificar se Está Funcionando

Após fazer o deploy:

1. **No Supabase Dashboard:**
   - Vá em **Edge Functions**
   - Verifique se `hash-password` está listada
   - Clique na função para ver os logs

2. **No Sistema:**
   - Tente alterar uma senha
   - Se funcionar, você verá o popup de sucesso
   - Se ainda der erro, verifique os logs no console do navegador (F12)

---

## 🆘 Ainda com Problemas?

Se ainda estiver com erro após fazer o deploy:

1. **Verifique os Logs:**
   - No Supabase Dashboard > Edge Functions > hash-password > Logs
   - Veja se há algum erro específico

2. **Verifique as Permissões:**
   - A Edge Function deve estar acessível publicamente
   - Verifique se não há restrições de CORS

3. **Teste Manualmente:**
   - No Supabase Dashboard > Edge Functions > hash-password
   - Clique em "Invoke function"
   - Envie: `{ "senha": "teste123" }`
   - Deve retornar um hash

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `DEPLOY_EDGE_FUNCTION_RAPIDO.md` - Guia rápido de deploy
- `DEPLOY_EDGE_FUNCTION.md` - Guia completo com CLI

---

## ✅ Pronto!

Após fazer o deploy da Edge Function, o sistema funcionará normalmente e você poderá alterar senhas sem problemas!

