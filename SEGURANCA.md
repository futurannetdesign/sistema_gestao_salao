# 🔒 Guia de Segurança do Sistema

## ⚠️ IMPORTANTE: Configurações de Segurança

### 1. Variáveis de Ambiente

**NUNCA commite chaves do Supabase no GitHub!**

#### Configuração Local (Desenvolvimento)

1. Copie o arquivo de exemplo:
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

2. Edite `src/environments/environment.ts` e adicione suas credenciais:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'SUA_URL_DO_SUPABASE',
  supabaseKey: 'SUA_CHAVE_ANON_KEY'
};
```

3. O arquivo `environment.ts` está no `.gitignore` e não será commitado.

#### Configuração de Produção (Vercel)

1. No painel do Vercel, vá em **Settings** > **Environment Variables**
2. Adicione as variáveis:
   - `SUPABASE_URL` = URL do seu projeto Supabase
   - `SUPABASE_KEY` = Chave anônima do Supabase

3. Ou edite `src/environments/environment.prod.ts` diretamente (não recomendado)

### 2. Segurança de Senhas

#### ⚠️ Estado Atual

O sistema atual usa **senhas em texto plano** apenas para desenvolvimento. **NÃO é seguro para produção!**

#### ✅ Melhorias Necessárias para Produção

1. **Implementar Hash de Senhas (bcrypt)**
   - Use Supabase Edge Functions para hash de senhas
   - Ou implemente no backend antes de salvar
   - NUNCA armazene senhas em texto plano

2. **Usar Autenticação Nativa do Supabase (Recomendado)**
   - Migre para Supabase Auth
   - Mais seguro e gerenciado
   - Suporta recuperação de senha, 2FA, etc.

3. **Implementar Rate Limiting**
   - Limite tentativas de login
   - Bloqueie IPs após múltiplas tentativas falhas

4. **Adicionar 2FA (Autenticação de Dois Fatores)**
   - Use Supabase Auth que já suporta 2FA
   - Ou implemente manualmente

### 3. Auditoria de Usuários

O sistema já registra todas as ações com:
- ✅ **usuario_id** - Identifica qual usuário fez a ação
- ✅ **acao** - Tipo de ação (criar, editar, excluir, etc.)
- ✅ **tabela** - Tabela afetada
- ✅ **registro_id** - ID do registro afetado
- ✅ **dados_anteriores** - Estado antes da alteração
- ✅ **dados_novos** - Estado após a alteração
- ✅ **ip_address** - IP do usuário
- ✅ **user_agent** - Navegador usado
- ✅ **created_at** - Data e hora da ação

#### Como Funciona

Todas as ações são registradas automaticamente via `AuditoriaService`:
- Cada ação inclui o `usuario_id` do usuário logado
- Permite rastrear exatamente o que cada usuário fez
- Histórico completo de alterações

### 4. Criação Segura de Usuários

#### ⚠️ NÃO Use o Script de Migração com Senhas

O arquivo `database/migration_add_usuario_admin.sql` contém senhas em texto plano apenas para desenvolvimento.

#### ✅ Processo Seguro para Produção

1. **Criar usuários via interface do sistema:**
   - Acesse como Admin
   - Crie usuários via interface
   - Senhas serão hasheadas automaticamente

2. **Ou use Edge Function do Supabase:**
   - Crie uma Edge Function para criar usuários
   - Hash de senha é feito no servidor
   - Mais seguro

3. **Ou use Supabase Auth:**
   - Migre para autenticação nativa do Supabase
   - Usuários se cadastram ou são criados via Admin API
   - Senhas são gerenciadas pelo Supabase

### 5. Checklist de Segurança para Deploy

- [ ] Remover chaves do Supabase dos arquivos commitados
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Implementar hash de senhas (bcrypt)
- [ ] Remover senhas em texto plano do banco
- [ ] Configurar CORS no Supabase
- [ ] Habilitar HTTPS (automático no Vercel)
- [ ] Implementar rate limiting para login
- [ ] Configurar recuperação de senha
- [ ] Testar auditoria de usuários
- [ ] Verificar logs de segurança

### 6. Recomendações Adicionais

1. **Backup Regular**
   - Configure backups automáticos no Supabase
   - Mantenha backups offline

2. **Monitoramento**
   - Configure alertas para tentativas de login suspeitas
   - Monitore logs de auditoria regularmente

3. **Atualizações**
   - Mantenha dependências atualizadas
   - Aplique patches de segurança

4. **Política de Senhas**
   - Exija senhas fortes (mínimo 8 caracteres, maiúsculas, números)
   - Force troca de senha periódica
   - Bloqueie senhas comuns

5. **Sessões**
   - Implemente timeout de sessão
   - Force logout após inatividade
   - Limite sessões simultâneas

## 📝 Notas Importantes

- ⚠️ O sistema atual é **adequado para desenvolvimento**, mas **NÃO para produção** sem melhorias de segurança
- ✅ A auditoria já está implementada e funcionando
- ✅ As permissões já estão implementadas
- ⚠️ **Implemente hash de senhas antes de colocar em produção**
- ⚠️ **Nunca commite chaves ou senhas no GitHub**

## 🚀 Próximos Passos

1. Implementar hash de senhas (bcrypt via Edge Function)
2. Migrar para Supabase Auth (recomendado)
3. Implementar rate limiting
4. Adicionar recuperação de senha
5. Configurar 2FA (opcional)

