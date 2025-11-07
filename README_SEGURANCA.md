# 🔒 Configuração de Segurança - Guia Rápido

## ⚠️ ANTES DE FAZER COMMIT NO GITHUB

### 1. Remover Chaves do Supabase

Os arquivos `environment.ts` e `environment.prod.ts` estão no `.gitignore`, mas se você já os commitou:

```bash
# Remover do histórico do Git (CUIDADO!)
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts

# Criar arquivos de exemplo
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts

# Editar e adicionar suas credenciais (não commitar)
```

### 2. Configurar Variáveis de Ambiente

#### Desenvolvimento Local:
1. Copie `environment.example.ts` para `environment.ts`
2. Adicione suas credenciais do Supabase
3. O arquivo não será commitado (está no .gitignore)

#### Produção (Vercel):
1. No painel do Vercel, adicione variáveis de ambiente
2. Ou edite `environment.prod.ts` diretamente (não recomendado)

## 🔐 Segurança de Senhas

### ⚠️ Estado Atual: NÃO SEGURO PARA PRODUÇÃO

O sistema atual usa senhas em texto plano. Para produção:

1. **Implemente hash de senhas (bcrypt)**
2. **Ou migre para Supabase Auth** (recomendado)
3. **Nunca use senhas em texto plano em produção**

Consulte `SEGURANCA.md` para instruções detalhadas.

## 📋 Checklist Antes do Deploy

- [ ] Remover chaves do Supabase dos arquivos commitados
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Implementar hash de senhas
- [ ] Testar login com senhas hasheadas
- [ ] Verificar auditoria de usuários
- [ ] Configurar CORS no Supabase
- [ ] Testar todas as funcionalidades

## 📚 Documentação Completa

Consulte `SEGURANCA.md` para documentação completa sobre segurança.

