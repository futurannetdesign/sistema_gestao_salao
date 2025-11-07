# ⚡ Deploy Rápido da Edge Function - Hash de Senhas

## 🚀 Método Mais Simples: Via Painel do Supabase (Recomendado)

**Não precisa instalar nada!** Crie a Edge Function diretamente no painel:

### 1. Acessar Edge Functions

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create a new function**

### 2. Criar Função

1. **Nome da função:** `hash-password`
2. **Template:** Escolha "Blank"
3. Clique em **Create function**

### 3. Colar o Código

1. Abra o arquivo `CODIGO_EDGE_FUNCTION.txt` neste projeto
2. Copie TODO o código
3. Cole no editor da Edge Function
4. Clique em **Deploy**

### 4. Pronto!

A função está deployada e pronta para uso!

---

## 🔧 Método Alternativo: Usar npx (Sem Instalar)

Se preferir usar a CLI via npx:

### 1. Fazer Login

```bash
npx supabase login
```

Isso abrirá o navegador para autenticação.

### 2. Linkar ao Projeto

```bash
# Substitua 'gmkijzjxfhndcpaiizsc' pelo seu project-ref
npx supabase link --project-ref gmkijzjxfhndcpaiizsc
```

**Como encontrar o project-ref:**
- Acesse o painel do Supabase
- Vá em **Settings** > **General**
- O **Reference ID** é o project-ref
- Ou pegue da URL: `https://gmkijzjxfhndcpaiizsc.supabase.co` → `gmkijzjxfhndcpaiizsc`

### 3. Deploy da Função

```bash
npx supabase functions deploy hash-password
```

### 4. Verificar Deploy

1. Acesse o painel do Supabase
2. Vá em **Edge Functions**
3. Verifique se `hash-password` está listada

## ✅ Pronto!

A Edge Function está deployada e pronta para uso. O sistema automaticamente usará hash de senhas.

## 🧪 Testar

1. Faça login com um usuário que tem senha em texto plano
2. O sistema automaticamente migrará a senha para hash
3. Faça logout e login novamente para verificar

## 📚 Documentação Completa

- `DEPLOY_EDGE_FUNCTION.md` - Guia completo de deploy
- `INSTALAR_SUPABASE_CLI_WINDOWS.md` - Guia de instalação no Windows
- `GUIA_IMPLEMENTACAO_HASH.md` - Guia completo de implementação

