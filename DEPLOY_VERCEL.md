# 🚀 Guia de Deploy no Vercel

## Pré-requisitos

1. Conta no Vercel (gratuita)
2. Conta no Supabase (gratuita)
3. Repositório Git (GitHub, GitLab ou Bitbucket)

## Passo 1: Preparar o Projeto

### 1.1 Verificar arquivos de configuração

Certifique-se de que os seguintes arquivos existem:

- `package.json` - Dependências do projeto
- `angular.json` - Configuração do Angular
- `tsconfig.json` - Configuração do TypeScript
- `src/environments/environment.ts` - Variáveis de ambiente (desenvolvimento)
- `src/environments/environment.prod.ts` - Variáveis de ambiente (produção)

### 1.2 Criar arquivo de ambiente de produção

Crie o arquivo `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'SUA_URL_DO_SUPABASE',
  supabaseKey: 'SUA_CHAVE_DO_SUPABASE'
};
```

**⚠️ IMPORTANTE:** Substitua pelos valores reais do seu projeto Supabase.

## Passo 2: Configurar Build para Produção

### 2.1 Verificar angular.json

O arquivo `angular.json` deve ter a configuração de build:

```json
{
  "projects": {
    "sistema-gestao-salao": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/sistema-gestao-salao",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"]
          }
        }
      }
    }
  }
}
```

### 2.2 Criar vercel.json (opcional)

Crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/sistema-gestao-salao"
      }
      }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Passo 3: Configurar Variáveis de Ambiente no Vercel

1. Acesse o painel do Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as variáveis:
   - `SUPABASE_URL` = URL do seu projeto Supabase
   - `SUPABASE_KEY` = Chave anônima do Supabase

**Nota:** No Vercel, você pode usar variáveis de ambiente, mas como estamos usando Angular, é melhor configurar diretamente no `environment.prod.ts` ou usar um script de build.

## Passo 4: Deploy no Vercel

### Opção 1: Via CLI do Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Opção 2: Via GitHub (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em **Add New Project**
4. Importe seu repositório
5. Configure:
   - **Framework Preset:** Angular
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/sistema-gestao-salao`
6. Adicione as variáveis de ambiente
7. Clique em **Deploy**

## Passo 5: Configurar Banco de Dados

### 5.1 Executar Scripts SQL

No Supabase SQL Editor, execute na seguinte ordem:

1. `database/schema.sql` - Estrutura completa do banco
2. `database/auditoria.sql` - Tabela de auditoria
3. `database/permissoes.sql` - Tabela e permissões padrão
4. `database/migration_add_fornecedores.sql` - Se já tiver dados
5. `database/migration_add_usuario_admin.sql` - Usuários iniciais

### 5.2 Criar Usuário Administrador

Execute no Supabase SQL Editor:

```sql
-- Criar usuário administrador
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
VALUES ('Administrador', 'admin@salao.com', 'admin123', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

**⚠️ IMPORTANTE:** Altere a senha após o primeiro login!

## Passo 6: Verificações Pós-Deploy

### 6.1 Testar Funcionalidades

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Clientes: criar, editar, excluir
- [ ] Serviços: criar, editar, excluir
- [ ] Agendamentos: criar, editar, visualizar
- [ ] Financeiro: contas a receber/pagar, caixa
- [ ] Estoque: produtos e fornecedores
- [ ] Permissões: gerenciar permissões de funcionários
- [ ] Configurações: salvar logo e nome do salão

### 6.2 Verificar Permissões

1. Faça login como **Admin**
2. Acesse **Permissões**
3. Configure as permissões para **Funcionário**
4. Faça logout e login como **Funcionário**
5. Verifique se apenas as funcionalidades permitidas aparecem

## Passo 7: Configurações de Segurança

### 7.1 Atualizar Senhas

Após o primeiro deploy:

1. Altere a senha do administrador
2. Crie usuários funcionários com senhas seguras
3. Configure permissões adequadas

### 7.2 Configurar CORS no Supabase

No painel do Supabase:

1. Vá em **Settings** > **API**
2. Adicione a URL do Vercel em **Allowed Origins**
3. Exemplo: `https://seu-projeto.vercel.app`

## Problemas Comuns

### Erro: "Cannot find module"

**Solução:** Verifique se todas as dependências estão no `package.json` e execute `npm install` localmente antes do deploy.

### Erro: "Environment variables not found"

**Solução:** Configure as variáveis de ambiente no Vercel ou use `environment.prod.ts` com valores hardcoded (não recomendado para produção).

### Erro: "Build failed"

**Solução:** 
1. Verifique os logs de build no Vercel
2. Teste o build localmente: `npm run build`
3. Verifique se há erros de TypeScript: `npm run build --prod`

### Erro: "404 Not Found" ao navegar

**Solução:** Configure o `vercel.json` com redirects para `index.html` (SPA routing).

## Checklist Final

- [ ] Build local funciona: `npm run build`
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e populado
- [ ] Usuário admin criado
- [ ] Permissões configuradas
- [ ] CORS configurado no Supabase
- [ ] Deploy realizado com sucesso
- [ ] Testes funcionais realizados
- [ ] Senhas alteradas após primeiro login

## Suporte

Em caso de problemas:

1. Verifique os logs no Vercel Dashboard
2. Verifique os logs no Supabase Dashboard
3. Teste localmente com `npm start`
4. Verifique o console do navegador (F12)

