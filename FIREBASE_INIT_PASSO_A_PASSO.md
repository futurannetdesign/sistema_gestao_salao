# 🔥 Firebase Init - Passo a Passo Completo

## ✅ O que foi corrigido

Removi o placeholder `seu-projeto-firebase` do arquivo `.firebaserc`. Agora você pode inicializar o Firebase corretamente.

## 🚀 Execute o comando:

```bash
firebase init hosting
```

## 📝 Responda às perguntas na seguinte ordem:

### 1. "Are you ready to proceed? (Y/n)"
**Digite:** `Y` e pressione Enter

---

### 2. "Please select an option:"
**Use as setas do teclado** para escolher uma das opções:

- **"Use an existing project"** - Se você já tem um projeto Firebase
- **"Create a new project"** - Se você quer criar um novo projeto
- **"Add Firebase to an existing Google Cloud Platform project"** - Se você tem um projeto no GCP

**Depois de selecionar, pressione Enter**

---

### 3. Se escolheu "Use an existing project":

**Use as setas** para selecionar o projeto da lista e pressione Enter.

---

### 4. Se escolheu "Create a new project":

1. **"What would you like to call your project?"**
   - Digite um nome (ex: `sistema-gestao-salao`)
   - Pressione Enter
   - Aguarde a criação do projeto

2. **"What would you like to call your project alias?"**
   - Digite: `default` (ou deixe em branco e pressione Enter)

---

### 5. "What do you want to use as your public directory?"
**Digite:** `dist/sistema-gestao-salao` e pressione Enter

---

### 6. "Configure as a single-page app (rewrite all urls to /index.html)?"
**Digite:** `Y` (Yes) e pressione Enter

---

### 7. "Set up automatic builds and deploys with GitHub?"
**Digite:** `N` (No) e pressione Enter

---

### 8. "File dist/sistema-gestao-salao/index.html already exists. Overwrite?"
**Digite:** `N` (No) e pressione Enter

---

## ✅ Pronto!

Após responder todas as perguntas, o Firebase vai:
- ✅ Atualizar o `.firebaserc` com o Project ID correto
- ✅ Atualizar o `firebase.json` (se necessário)
- ✅ Configurar tudo automaticamente

## 🚀 Depois da inicialização

Você pode fazer o deploy:

```bash
npm run deploy:firebase
```

Ou:

```bash
npm run build
firebase deploy --only hosting
```

## ⚠️ Se tiver problemas

### Erro: "Project not found"
- Verifique se você está logado: `firebase login`
- Verifique se tem permissão no projeto

### Erro: "Permission denied"
- Acesse o Firebase Console
- Verifique se sua conta tem acesso ao projeto

### Erro: "Directory not found"
- Execute primeiro: `npm run build`
- Isso cria o diretório `dist/sistema-gestao-salao`

## 📝 Resumo

1. Execute: `firebase init hosting`
2. Responda `Y` para prosseguir
3. Escolha ou crie um projeto
4. Configure o diretório: `dist/sistema-gestao-salao`
5. Configure como SPA: `Y`
6. Não configure GitHub: `N`
7. Não sobrescreva index.html: `N`
8. Pronto! ✅

