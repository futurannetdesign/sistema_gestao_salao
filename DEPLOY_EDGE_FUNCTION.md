# 🚀 Guia de Deploy da Edge Function - Hash de Senhas

## 📋 Pré-requisitos

1. Supabase CLI instalado
2. Projeto Supabase criado
3. Acesso ao projeto no Supabase

## 🔧 Passo 1: Instalar Supabase CLI

### Opção 1: Usar Scoop (Recomendado para Windows)

```powershell
# Instalar Scoop (se não tiver)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Opção 2: Usar Chocolatey

```powershell
# Instalar Chocolatey (se não tiver)
# Execute no PowerShell como Administrador:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Supabase CLI
choco install supabase
```

### Opção 3: Download Manual

1. Acesse: https://github.com/supabase/cli/releases
2. Baixe o arquivo `supabase_windows_amd64.zip`
3. Extraia e adicione ao PATH do sistema

### Opção 4: Usar npx (sem instalar globalmente)

```bash
# Usar npx para executar comandos
npx supabase login
npx supabase link --project-ref seu-project-ref
npx supabase functions deploy hash-password
```

### Opção 5: Usar Docker (Alternativa)

```bash
# Executar via Docker
docker run --rm supabase/cli:latest supabase login
docker run --rm supabase/cli:latest supabase link --project-ref seu-project-ref
docker run --rm supabase/cli:latest supabase functions deploy hash-password
```

## 🔐 Passo 2: Fazer Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

## 🔗 Passo 3: Linkar ao Projeto

```bash
# Obter o project-ref do seu projeto Supabase
# Está na URL: https://seu-project-ref.supabase.co
supabase link --project-ref seu-project-ref
```

**Como encontrar o project-ref:**
- Acesse o painel do Supabase
- Vá em **Settings** > **General**
- O **Reference ID** é o project-ref

## 📦 Passo 4: Deploy da Edge Function

```bash
# Navegar para a pasta do projeto
cd H:\sistema_gestao_salao

# Deploy da função hash-password
supabase functions deploy hash-password
```

## ✅ Passo 5: Verificar Deploy

1. Acesse o painel do Supabase
2. Vá em **Edge Functions**
3. Verifique se `hash-password` está listada
4. Clique para ver os logs

## 🧪 Passo 6: Testar a Função

### Teste de Hash

```bash
curl -X POST \
  'https://seu-project-ref.supabase.co/functions/v1/hash-password' \
  -H 'Authorization: Bearer SUA_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"senha": "teste123"}'
```

### Teste de Verificação

```bash
curl -X POST \
  'https://seu-project-ref.supabase.co/functions/v1/hash-password' \
  -H 'Authorization: Bearer SUA_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"senha": "teste123", "hash": "$2a$10$hash_aqui"}'
```

## 🔒 Passo 7: Configurar Permissões

No painel do Supabase:

1. Vá em **Edge Functions** > **hash-password**
2. Configure as permissões:
   - **Invoke URL:** Público (ou configure autenticação)
   - **Secrets:** Adicione variáveis de ambiente se necessário

## ⚠️ Troubleshooting

### Erro: "Function not found"

**Solução:** Verifique se o deploy foi bem-sucedido:
```bash
supabase functions list
```

### Erro: "Permission denied"

**Solução:** Verifique as permissões da Edge Function no painel do Supabase.

### Erro: "bcrypt module not found"

**Solução:** A Edge Function usa Deno que tem bcrypt nativo. Verifique se o import está correto.

### Erro: "CORS"

**Solução:** Configure CORS no Supabase ou adicione headers CORS na Edge Function.

## 📝 Notas Importantes

1. **A Edge Function é executada no servidor** - mais seguro que fazer hash no cliente
2. **Use HTTPS** - sempre use HTTPS para chamadas da Edge Function
3. **Rate Limiting** - Configure rate limiting no Supabase para proteger a função
4. **Logs** - Monitore os logs da Edge Function no painel do Supabase

## 🔄 Atualizar a Função

Para atualizar a Edge Function após mudanças:

```bash
supabase functions deploy hash-password
```

## 📚 Documentação Adicional

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno bcrypt](https://deno.land/x/bcrypt)
- `GUIA_IMPLEMENTACAO_HASH.md` - Guia completo de implementação

