# 🔧 Solução Definitiva para MIME Type no Vercel

## ⚠️ Problema

Os arquivos JavaScript estão sendo servidos com MIME type `text/html` em vez de `application/javascript`, causando erro:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
```

## ✅ Solução Aplicada

O `vercel.json` foi configurado com `routes` que servem arquivos estáticos antes do fallback para `index.html`:

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
      "src": "/(.*\\.js)",
      "dest": "/$1",
      "headers": {
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/(.*\\.css)",
      "dest": "/$1",
      "headers": {
        "Content-Type": "text/css; charset=utf-8"
      }
    },
    {
      "src": "/(.*\\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|json))",
      "dest": "/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🔍 Diagnóstico

Se o problema persistir, verifique:

### 1. **Verificar se os arquivos JS existem no build**

No painel do Vercel:
1. Vá em **Deployments** > Seu deploy
2. Clique em **Browse** para ver os arquivos do build
3. Verifique se os arquivos `.js` estão presentes na raiz do diretório

### 2. **Verificar o outputPath do Angular**

O `angular.json` deve ter:
```json
"outputPath": "dist/sistema-gestao-salao"
```

E o `vercel.json` deve apontar para o mesmo diretório:
```json
"distDir": "dist/sistema-gestao-salao"
```

### 3. **Verificar no Network do navegador**

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Recarregue a página
4. Procure pelos arquivos `.js` (runtime, polyfills, main)
5. Verifique:
   - **Status:** Deve ser `200` (não `404` ou `200` com HTML)
   - **Type:** Deve ser `script` (não `document`)
   - **Content-Type:** Deve ser `application/javascript` (não `text/html`)

## 🚀 Solução Alternativa (Se ainda não funcionar)

Se o problema persistir, tente esta configuração alternativa:

### Opção 1: Mudar outputPath para "dist"

1. **Alterar `angular.json`:**
```json
"outputPath": "dist"
```

2. **Alterar `vercel.json`:**
```json
"distDir": "dist"
```

### Opção 2: Usar configuração do painel do Vercel

1. Remover `builds` do `vercel.json`
2. Configurar no painel do Vercel:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/sistema-gestao-salao`
   - **Install Command:** `npm install`

### Opção 3: Usar _redirects file

Criar arquivo `dist/sistema-gestao-salao/_redirects`:
```
/*    /index.html   200
```

E adicionar ao `angular.json` em `assets`:
```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  {
    "glob": "_redirects",
    "input": ".",
    "output": "/"
  }
]
```

## 📝 Próximos Passos

1. **Commit e Push:**
```bash
git add vercel.json
git commit -m "Fix: Configuração definitiva de routes para arquivos estáticos"
git push
```

2. **Aguardar Deploy:**
   - O Vercel fará o rebuild automaticamente
   - Aguarde a conclusão do deploy

3. **Testar:**
   - Limpe o cache do navegador (Ctrl + Shift + Delete)
   - Ou use uma janela anônima (Ctrl + Shift + N)
   - Acesse a URL do deploy

4. **Verificar:**
   - Abra DevTools (F12)
   - Vá na aba Network
   - Verifique se os arquivos JS estão sendo carregados com `Content-Type: application/javascript`

## ⚠️ Notas Importantes

- **Cache:** Sempre limpe o cache do navegador após um novo deploy
- **Ordem das Routes:** Arquivos estáticos devem vir ANTES do fallback para `index.html`
- **Headers:** Os headers MIME type são essenciais para o funcionamento correto

## 🔄 Se ainda não funcionar

1. Verifique os logs do Vercel no painel
2. Verifique se os arquivos JS existem no diretório de build
3. Tente uma das soluções alternativas acima
4. Considere usar Netlify ou outro serviço de deploy como alternativa

