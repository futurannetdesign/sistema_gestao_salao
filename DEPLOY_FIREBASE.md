# 🔥 Guia de Deploy no Firebase Hosting

## 📋 Pré-requisitos

1. Conta no Google (para acessar Firebase)
2. Node.js instalado
3. Projeto Angular configurado

## 🚀 Passo 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

Ou use `npx` sem instalar:
```bash
npx firebase-tools
```

## 🔐 Passo 2: Fazer Login no Firebase

```bash
firebase login
```

Isso abrirá o navegador para autenticação.

## 📦 Passo 3: Inicializar Firebase no Projeto

```bash
firebase init hosting
```

**Durante a inicialização, responda:**

1. **"What do you want to use as your public directory?"**
   - Digite: `dist/sistema-gestao-salao`

2. **"Configure as a single-page app (rewrite all urls to /index.html)?"**
   - Digite: `Yes` (Y)

3. **"Set up automatic builds and deploys with GitHub?"**
   - Digite: `No` (N) - você pode configurar depois se quiser

4. **"File dist/sistema-gestao-salao/index.html already exists. Overwrite?"**
   - Digite: `No` (N) - não sobrescrever

## 🎯 Passo 4: Configurar Projeto Firebase

Se você ainda não tem um projeto Firebase:

1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Siga as instruções para criar o projeto
4. Anote o **Project ID** do projeto

### Atualizar .firebaserc

Edite o arquivo `.firebaserc` e substitua `seu-projeto-firebase` pelo **Project ID** do seu projeto:

```json
{
  "projects": {
    "default": "seu-project-id-aqui"
  }
}
```

## 🏗️ Passo 5: Build do Projeto Angular

```bash
npm run build
```

Isso criará os arquivos de produção em `dist/sistema-gestao-salao`.

## 🚀 Passo 6: Deploy no Firebase

```bash
firebase deploy --only hosting
```

Ou simplesmente:
```bash
firebase deploy
```

## ✅ Passo 7: Verificar Deploy

Após o deploy, você receberá uma URL como:
```
https://seu-projeto.firebaseapp.com
```

Acesse a URL para verificar se está funcionando.

## 🔄 Deploy Automático (Opcional)

### Opção 1: GitHub Actions

Crie o arquivo `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: seu-project-id
```

### Opção 2: Configurar no Firebase Console

1. Acesse o Firebase Console
2. Vá em **Hosting** > **Get started**
3. Siga as instruções para conectar com GitHub

## 📝 Comandos Úteis

### Ver status do projeto
```bash
firebase projects:list
```

### Ver informações do projeto atual
```bash
firebase use
```

### Trocar de projeto
```bash
firebase use seu-project-id
```

### Deploy apenas para preview
```bash
firebase hosting:channel:deploy preview
```

### Ver histórico de deploys
```bash
firebase hosting:clone
```

### Remover deploy
```bash
firebase hosting:disable
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

Se precisar de variáveis de ambiente diferentes para produção:

1. Crie um arquivo `.env.production`:
```
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_chave_aqui
```

2. Use no build:
```bash
npm run build -- --configuration production
```

### Domínio Personalizado

1. No Firebase Console, vá em **Hosting**
2. Clique em **Adicionar domínio personalizado**
3. Siga as instruções para configurar DNS

## ⚠️ Troubleshooting

### Erro: "Firebase project not found"

**Solução:** Verifique se o Project ID no `.firebaserc` está correto.

### Erro: "Permission denied"

**Solução:** Verifique se você está logado:
```bash
firebase login
```

### Erro: "Build failed"

**Solução:** Verifique se o build local funciona:
```bash
npm run build
```

### Arquivos não atualizam

**Solução:** Limpe o cache do navegador ou use uma janela anônima.

## 📚 Documentação Adicional

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## ✅ Checklist de Deploy

- [ ] Firebase CLI instalado
- [ ] Login no Firebase realizado
- [ ] Projeto Firebase criado
- [ ] `.firebaserc` configurado com Project ID correto
- [ ] `firebase.json` configurado
- [ ] Build do Angular executado com sucesso
- [ ] Deploy realizado
- [ ] URL do deploy testada
- [ ] Aplicação funcionando corretamente

## 🎉 Pronto!

Seu sistema está deployado no Firebase Hosting! 🚀

