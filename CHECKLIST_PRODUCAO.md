# ✅ Checklist de Produção - Sistema de Gestão para Salão

## 🚨 CRÍTICO - ANTES DE ENTREGAR AO CLIENTE

### 1. Segurança - Chaves e Credenciais

#### ⚠️ PROBLEMA CRÍTICO: Chaves Expostas
- [ ] **REMOVER** as chaves do Supabase dos arquivos `environment.ts` e `environment.prod.ts`
- [ ] **VERIFICAR** se as chaves não estão no histórico do Git
- [ ] **CRIAR** arquivos de exemplo vazios para o cliente
- [ ] **INSTRUIR** o cliente a adicionar suas próprias chaves

**Ação Necessária:**
```bash
# 1. Remover chaves dos arquivos
# Editar src/environments/environment.ts e environment.prod.ts
# Substituir as chaves por placeholders

# 2. Verificar histórico do Git
git log --all --full-history -- src/environments/environment.ts
git log --all --full-history -- src/environments/environment.prod.ts

# 3. Se necessário, remover do histórico (CUIDADO!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/environments/environment.ts src/environments/environment.prod.ts" \
  --prune-empty --tag-name-filter cat -- --all
```

#### ⚠️ PROBLEMA CRÍTICO: Senhas Padrão
- [ ] **ALTERAR** senhas padrão (admin123, func123) no Supabase Auth
- [ ] **REMOVER** ou **ATUALIZAR** o arquivo `CREDENCIAIS_ACESSO.md`
- [ ] **INSTRUIR** o cliente a criar novas senhas seguras

**Ação Necessária:**
1. Acesse Supabase Dashboard > Authentication > Users
2. Altere as senhas dos usuários padrão
3. Ou delete os usuários padrão e crie novos

### 2. Logs de Debug

#### ⚠️ PROBLEMA: Muitos Logs em Produção
- [ ] **REMOVER** ou **DESABILITAR** logs de debug em produção
- [ ] **VERIFICAR** se há `console.log` com dados sensíveis
- [ ] **IMPLEMENTAR** sistema de logging adequado (opcional)

**Arquivos com muitos logs:**
- `src/app/services/password-update.service.ts` - Muitos console.log
- Verificar outros arquivos para console.log desnecessários

### 3. Configuração de Produção

#### ✅ Verificações Necessárias
- [ ] **VERIFICAR** se `environment.prod.ts` está configurado corretamente
- [ ] **VERIFICAR** se o build de produção está funcionando
- [ ] **VERIFICAR** se o deploy no Firebase está correto
- [ ] **TESTAR** todas as funcionalidades em produção

### 4. Documentação para o Cliente

#### ✅ Documentação Necessária
- [ ] **CRIAR** manual do usuário básico
- [ ] **CRIAR** guia de instalação e configuração
- [ ] **CRIAR** guia de primeiro acesso
- [ ] **ATUALIZAR** README.md com informações do cliente
- [ ] **REMOVER** documentação técnica desnecessária

### 5. Funcionalidades Principais

#### ✅ Verificar Funcionalidades
- [ ] **LOGIN** - Funcionando corretamente
- [ ] **CLIENTES** - CRUD completo funcionando
- [ ] **SERVIÇOS** - CRUD completo funcionando
- [ ] **AGENDAMENTOS** - CRUD completo funcionando
- [ ] **FINANCEIRO** - Contas a Receber, Contas a Pagar, Caixa
- [ ] **ESTOQUE** - CRUD completo funcionando
- [ ] **FORNECEDORES** - CRUD completo funcionando
- [ ] **USUÁRIOS** - CRUD completo funcionando
- [ ] **PERMISSÕES** - Sistema de permissões funcionando
- [ ] **AUDITORIA** - Registro de ações funcionando
- [ ] **WHATSAPP** - Links funcionando (se implementado)

### 6. Segurança e Autenticação

#### ✅ Verificações de Segurança
- [ ] **SUPABASE AUTH** - Configurado e funcionando
- [ ] **ALTERAÇÃO DE SENHAS** - Funcionando corretamente
- [ ] **PERMISSÕES** - Sistema de permissões funcionando
- [ ] **AUDITORIA** - Registro de ações funcionando
- [ ] **CORS** - Configurado corretamente no Supabase
- [ ] **RLS (Row Level Security)** - Verificar se está configurado (opcional)

### 7. Performance

#### ✅ Verificações de Performance
- [ ] **BUILD** - Build de produção otimizado
- [ ] **CARREGAMENTO** - Páginas carregam rapidamente
- [ ] **IMAGENS** - Imagens otimizadas (se houver)
- [ ] **CACHE** - Cache configurado corretamente no Firebase

### 8. Testes

#### ✅ Testes Necessários
- [ ] **TESTE COMPLETO** - Todas as funcionalidades testadas
- [ ] **TESTE DE LOGIN** - Login com diferentes usuários
- [ ] **TESTE DE PERMISSÕES** - Verificar permissões de funcionários
- [ ] **TESTE DE ALTERAÇÃO DE SENHA** - Funcionando corretamente
- [ ] **TESTE EM DIFERENTES NAVEGADORES** - Chrome, Firefox, Edge
- [ ] **TESTE RESPONSIVO** - Funcionando em mobile

### 9. Backup e Recuperação

#### ✅ Backup
- [ ] **BACKUP DO BANCO** - Instruir cliente sobre backup do Supabase
- [ ] **BACKUP DO CÓDIGO** - Código versionado no Git
- [ ] **DOCUMENTAÇÃO** - Documentar processo de backup

### 10. Suporte e Manutenção

#### ✅ Documentação de Suporte
- [ ] **MANUAL DO USUÁRIO** - Criar manual básico
- [ ] **FAQ** - Criar FAQ com perguntas comuns
- [ ] **CONTATO** - Informações de contato para suporte
- [ ] **CHANGELOG** - Documentar versão e mudanças

---

## 📋 Checklist Rápido

### Antes de Entregar:
1. [ ] Remover chaves do Supabase dos arquivos
2. [ ] Alterar senhas padrão
3. [ ] Remover logs de debug desnecessários
4. [ ] Testar todas as funcionalidades
5. [ ] Criar documentação para o cliente
6. [ ] Verificar segurança
7. [ ] Verificar performance
8. [ ] Fazer backup

---

## 🔒 Segurança - Prioridade MÁXIMA

### ⚠️ AÇÕES URGENTES:

1. **REMOVER CHAVES DOS ARQUIVOS**
   - Editar `src/environments/environment.ts`
   - Editar `src/environments/environment.prod.ts`
   - Substituir chaves por placeholders

2. **ALTERAR SENHAS PADRÃO**
   - Acessar Supabase Dashboard
   - Alterar senhas dos usuários padrão
   - Ou deletar e criar novos usuários

3. **VERIFICAR HISTÓRICO DO GIT**
   - Verificar se as chaves não estão no histórico
   - Se estiverem, remover do histórico (cuidado!)

---

## 📝 Notas Importantes

- **NUNCA** commite chaves ou senhas no Git
- **SEMPRE** use variáveis de ambiente em produção
- **SEMPRE** altere senhas padrão antes de entregar
- **SEMPRE** teste todas as funcionalidades antes de entregar
- **SEMPRE** crie documentação para o cliente

---

## 🎯 Próximos Passos

1. Executar todas as ações do checklist
2. Testar o sistema completamente
3. Criar documentação para o cliente
4. Preparar entrega final

