# 🔥 Configurar Projeto Firebase - Passo a Passo

## ⚠️ Problema Atual

O arquivo `.firebaserc` ainda tem o placeholder `seu-projeto-firebase`. Você precisa:

1. **Criar um projeto no Firebase** (se ainda não tiver)
2. **Configurar o `.firebaserc`** com o Project ID correto

## 🚀 Opção 1: Usar `firebase init hosting` (Recomendado)

Este comando vai configurar tudo automaticamente:

### Passo 1: Executar o comando

```bash
firebase init hosting
```

### Passo 2: Responder às perguntas

1. **"Are you ready to proceed? (Y/n)"**
   - Digite: `Y`
   - Pressione Enter

2. **"Please select an option:"**
   - Use as setas para selecionar:
     - **"Use an existing project"** (se já tiver um projeto)
     - **"Create a new project"** (se não tiver)
   - Pressione Enter

3. **Se escolheu "Use an existing project":**
   - Selecione o projeto da lista
   - Pressione Enter

4. **Se escolheu "Create a new project":**
   - Digite o nome do projeto (ex: `sistema-gestao-salao`)
   - Pressione Enter
   - Aguarde a criação do projeto

5. **"What do you want to use as your public directory?"**
   - Digite: `dist/sistema-gestao-salao`
   - Pressione Enter

6. **"Configure as a single-page app (rewrite all urls to /index.html)?"**
   - Digite: `Y` (Yes)
   - Pressione Enter

7. **"Set up automatic builds and deploys with GitHub?"**
   - Digite: `N` (No) - você pode configurar depois
   - Pressione Enter

8. **"File dist/sistema-gestao-salao/index.html already exists. Overwrite?"**
   - Digite: `N` (No) - não sobrescrever
   - Pressione Enter

### Pronto!

O Firebase vai atualizar automaticamente o `.firebaserc` com o Project ID correto.

---

## 🎯 Opção 2: Configurar Manualmente

Se preferir configurar manualmente:

### Passo 1: Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Digite o nome do projeto (ex: `sistema-gestao-salao`)
4. Clique em **"Continuar"** ou **"Continue"**
5. (Opcional) Desabilite o Google Analytics se não quiser
6. Clique em **"Criar projeto"** ou **"Create project"**
7. Aguarde a criação
8. Clique em **"Continuar"** ou **"Continue"**

### Passo 2: Obter o Project ID

1. No Firebase Console, vá em **Configurações do projeto** (ícone de engrenagem)
2. Na seção **"Seus projetos"**, você verá o **Project ID**
3. Copie o Project ID (ex: `sistema-gestao-salao-12345`)

### Passo 3: Atualizar `.firebaserc`

Edite o arquivo `.firebaserc` e substitua `seu-projeto-firebase` pelo Project ID que você copiou:

```json
{
  "projects": {
    "default": "seu-project-id-aqui"
  }
}
```

**Exemplo:**
```json
{
  "projects": {
    "default": "sistema-gestao-salao-12345"
  }
}
```

### Passo 4: Verificar

```bash
firebase use
```

Isso deve mostrar o projeto configurado.

---

## ✅ Após Configurar

Depois de configurar o projeto, você pode fazer o deploy:

```bash
npm run deploy:firebase
```

Ou:

```bash
npm run build
firebase deploy --only hosting
```

---

## 🔍 Verificar Projetos Disponíveis

Para ver todos os projetos Firebase disponíveis:

```bash
firebase projects:list
```

---

## 🔄 Trocar de Projeto

Se precisar trocar de projeto:

```bash
firebase use
```

Ou:

```bash
firebase use seu-project-id
```

---

## ⚠️ Troubleshooting

### Erro: "Project not found"

**Solução:** Verifique se o Project ID está correto no `.firebaserc`

### Erro: "Permission denied"

**Solução:** Verifique se você tem permissão no projeto Firebase:
1. Acesse o Firebase Console
2. Vá em **Configurações do projeto** > **Usuários e permissões**
3. Verifique se sua conta está listada

### Erro: "Project already exists"

**Solução:** Use um nome diferente para o projeto ou use um projeto existente.

---

## 📝 Resumo Rápido

1. Execute: `firebase init hosting`
2. Escolha ou crie um projeto
3. Configure o diretório: `dist/sistema-gestao-salao`
4. Configure como SPA: `Y`
5. Pronto! O `.firebaserc` será atualizado automaticamente

