# 🪟 Guia de Instalação do Supabase CLI no Windows

## ⚠️ Problema

O Supabase CLI **NÃO pode ser instalado globalmente via npm** no Windows. Use uma das alternativas abaixo.

## ✅ Soluções

### Opção 1: Usar Scoop (Recomendado)

**Scoop** é um gerenciador de pacotes para Windows.

#### 1.1 Instalar Scoop

Abra o PowerShell e execute:

```powershell
# Permitir execução de scripts
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Instalar Scoop
irm get.scoop.sh | iex
```

#### 1.2 Instalar Supabase CLI

```powershell
# Adicionar bucket do Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# Instalar Supabase CLI
scoop install supabase
```

#### 1.3 Verificar Instalação

```powershell
supabase --version
```

### Opção 2: Usar Chocolatey

**Chocolatey** é outro gerenciador de pacotes para Windows.

#### 2.1 Instalar Chocolatey

Abra o PowerShell **como Administrador** e execute:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### 2.2 Instalar Supabase CLI

```powershell
choco install supabase
```

#### 2.3 Verificar Instalação

```powershell
supabase --version
```

### Opção 3: Download Manual

#### 3.1 Baixar Binário

1. Acesse: https://github.com/supabase/cli/releases
2. Procure pela versão mais recente
3. Baixe `supabase_windows_amd64.zip` (ou `supabase_windows_arm64.zip` para ARM)

#### 3.2 Extrair e Configurar

1. Extraia o arquivo ZIP
2. Copie o executável `supabase.exe` para uma pasta (ex: `C:\supabase\`)
3. Adicione a pasta ao PATH do sistema:
   - Abra **Configurações do Sistema** > **Variáveis de Ambiente**
   - Edite a variável **Path**
   - Adicione o caminho da pasta (ex: `C:\supabase\`)

#### 3.3 Verificar Instalação

Abra um novo PowerShell e execute:

```powershell
supabase --version
```

### Opção 4: Usar npx (Sem Instalar)

Você pode usar o Supabase CLI via `npx` sem instalar globalmente:

```bash
# Login
npx supabase login

# Linkar ao projeto
npx supabase link --project-ref seu-project-ref

# Deploy da função
npx supabase functions deploy hash-password
```

**Vantagem:** Não precisa instalar nada
**Desvantagem:** Mais lento (baixa a cada execução)

### Opção 5: Usar Docker (Alternativa)

Se você tem Docker instalado:

```bash
# Login
docker run --rm -it supabase/cli:latest supabase login

# Linkar ao projeto
docker run --rm -it -v ${PWD}:/workspace -w /workspace supabase/cli:latest supabase link --project-ref seu-project-ref

# Deploy da função
docker run --rm -it -v ${PWD}:/workspace -w /workspace supabase/cli:latest supabase functions deploy hash-password
```

## 🚀 Após Instalar

### 1. Fazer Login

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### 2. Linkar ao Projeto

```bash
# Obter o project-ref do seu projeto Supabase
# Está na URL: https://seu-project-ref.supabase.co
supabase link --project-ref seu-project-ref
```

**Como encontrar o project-ref:**
- Acesse o painel do Supabase
- Vá em **Settings** > **General**
- O **Reference ID** é o project-ref

### 3. Deploy da Edge Function

```bash
# Navegar para a pasta do projeto
cd H:\sistema_gestao_salao

# Deploy da função hash-password
supabase functions deploy hash-password
```

## ✅ Verificar Deploy

1. Acesse o painel do Supabase
2. Vá em **Edge Functions**
3. Verifique se `hash-password` está listada
4. Clique para ver os logs

## 🐛 Troubleshooting

### Erro: "supabase: command not found"

**Solução:** Verifique se o Supabase CLI está no PATH:
```powershell
# Verificar PATH
$env:Path

# Testar com caminho completo
C:\caminho\para\supabase.exe --version
```

### Erro: "Permission denied"

**Solução:** Execute o PowerShell como Administrador.

### Erro: "Scoop not found"

**Solução:** Instale o Scoop primeiro (veja Opção 1).

### Erro: "Chocolatey not found"

**Solução:** Instale o Chocolatey primeiro (veja Opção 2).

## 📚 Documentação Adicional

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Scoop Docs](https://scoop.sh/)
- [Chocolatey Docs](https://chocolatey.org/)
- `DEPLOY_EDGE_FUNCTION.md` - Guia de deploy da Edge Function

## 💡 Recomendação

Para Windows, recomendo usar **Scoop** (Opção 1) ou **npx** (Opção 4) se não quiser instalar nada.

