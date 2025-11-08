# 🚀 Guia Passo a Passo: Deploy da Edge Function hash-password

## ⚠️ IMPORTANTE

Você está vendo esta mensagem porque a Edge Function `hash-password` não está deployada no Supabase. **Siga estes passos para resolver:**

---

## 📋 Passo 1: Acessar o Supabase Dashboard

1. Abra seu navegador
2. Acesse: **https://supabase.com/dashboard**
3. Faça login na sua conta
4. Selecione o projeto do sistema de gestão

---

## 📋 Passo 2: Navegar até Edge Functions

1. No menu lateral esquerdo, procure por **"Edge Functions"**
2. Clique em **"Edge Functions"**
3. Você verá uma lista de funções (pode estar vazia)

---

## 📋 Passo 3: Criar Nova Função

1. Clique no botão **"Create a new function"** ou **"New Function"**
2. Uma janela/modal aparecerá

---

## 📋 Passo 4: Configurar a Função

1. **Nome da função:** Digite exatamente: `hash-password`
   - ⚠️ O nome DEVE ser exatamente `hash-password` (com hífen)
   - ⚠️ NÃO use espaços ou outros caracteres

2. **Template:** Escolha **"Blank"** ou **"Hello World"**
   - Qualquer template serve, pois vamos substituir o código

3. Clique em **"Create function"** ou **"Deploy"**

---

## 📋 Passo 5: Copiar o Código

1. Abra o arquivo `CODIGO_EDGE_FUNCTION.txt` neste projeto
2. **Copie TODO o código** (desde a linha 4 até o final)
3. Ou copie este código abaixo:

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

## 📋 Passo 6: Colar o Código

1. No editor da Edge Function (que abriu após criar)
2. **Selecione TODO o código padrão** (Ctrl+A)
3. **Delete o código padrão**
4. **Cole o código que você copiou** (Ctrl+V)
5. Verifique se o código foi colado corretamente

---

## 📋 Passo 7: Fazer Deploy

1. Procure o botão **"Deploy"** ou **"Save"** no canto superior direito
2. Clique em **"Deploy"**
3. Aguarde alguns segundos enquanto a função é deployada
4. Você verá uma mensagem de sucesso quando terminar

---

## 📋 Passo 8: Verificar

1. A função `hash-password` deve aparecer na lista de Edge Functions
2. O status deve estar como **"Active"** ou **"Deployed"**
3. Se houver algum erro, ele aparecerá em vermelho

---

## 📋 Passo 9: Testar

1. Volte ao sistema de gestão
2. Tente alterar uma senha novamente
3. O erro deve desaparecer!
4. Você verá o popup de sucesso ✅

---

## 🆘 Problemas Comuns

### Erro: "Function name already exists"
- **Solução:** A função já existe. Vá em Edge Functions, clique na função `hash-password` e edite o código.

### Erro: "Deployment failed"
- **Solução:** Verifique se copiou o código completo. Certifique-se de que não há erros de sintaxe.

### Erro: "Module not found"
- **Solução:** Certifique-se de que as importações estão corretas. O código acima está correto.

### A função não aparece na lista
- **Solução:** Recarregue a página (F5) e verifique novamente.

---

## ✅ Pronto!

Após fazer o deploy, o sistema funcionará normalmente e você poderá:
- ✅ Alterar senhas de usuários
- ✅ Criar novos usuários com senhas seguras
- ✅ As senhas serão hasheadas automaticamente

---

## 📸 Imagens de Referência

Se precisar de ajuda visual:
1. Acesse: https://supabase.com/docs/guides/functions
2. Ou consulte: `DEPLOY_EDGE_FUNCTION_RAPIDO.md`

---

## 🔗 Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Documentação Edge Functions:** https://supabase.com/docs/guides/functions
- **Troubleshooting:** Consulte `SOLUCAO_ERRO_EDGE_FUNCTION.md`

---

**Tempo estimado:** 5 minutos  
**Dificuldade:** Fácil  
**Resultado:** Sistema funcionando perfeitamente! 🎉

