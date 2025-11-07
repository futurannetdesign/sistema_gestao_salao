# 🔐 Guia de Implementação de Hash de Senhas

## ✅ O que foi implementado

### 1. Edge Function do Supabase
- ✅ `supabase/functions/hash-password/index.ts` - Função para hash e verificação de senhas
- ✅ Usa bcrypt para hash de senhas
- ✅ Seguro e executado no servidor

### 2. Serviço de Senhas
- ✅ `PasswordService` - Serviço Angular para interagir com a Edge Function
- ✅ Métodos: `hashPassword()`, `verifyPassword()`, `isPlainText()`

### 3. AuthService Atualizado
- ✅ Detecta senhas em texto plano automaticamente
- ✅ Migra senhas para hash no primeiro login
- ✅ Verifica senhas hasheadas usando bcrypt

### 4. Componente de Migração
- ✅ `MigrarSenhasComponent` - Interface para migrar senhas em massa
- ✅ Mostra usuários com senha em texto plano
- ✅ Permite migrar todas as senhas de uma vez

## 🚀 Como Implementar

### Passo 1: Deploy da Edge Function

1. **Instalar Supabase CLI:**
   
   ⚠️ **IMPORTANTE:** O Supabase CLI não pode ser instalado via `npm install -g` no Windows.
   
   **Opções:**
   - **Scoop:** `scoop install supabase` (recomendado)
   - **Chocolatey:** `choco install supabase`
   - **Download Manual:** Baixar de https://github.com/supabase/cli/releases
   - **npx:** `npx supabase` (sem instalar)
   
   Consulte `INSTALAR_SUPABASE_CLI_WINDOWS.md` para instruções detalhadas.

2. **Fazer login:**
```bash
supabase login
# ou
npx supabase login
```

3. **Linkar ao projeto:**
```bash
supabase link --project-ref seu-project-ref
# ou
npx supabase link --project-ref seu-project-ref
```
   - O `project-ref` está na URL do seu projeto Supabase
   - Exemplo: `https://gmkijzjxfhndcpaiizsc.supabase.co` → `gmkijzjxfhndcpaiizsc`

4. **Deploy da função:**
```bash
supabase functions deploy hash-password
# ou
npx supabase functions deploy hash-password
```

### Passo 2: Configurar Permissões da Edge Function

No painel do Supabase:

1. Vá em **Edge Functions** > **hash-password**
2. Configure as permissões:
   - Permitir chamadas anônimas (ou configure autenticação)
   - Adicione a chave anônima nas variáveis de ambiente

### Passo 3: Testar a Implementação

1. **Teste de Login:**
   - Faça login com um usuário que tem senha em texto plano
   - O sistema automaticamente migrará a senha para hash
   - Faça logout e login novamente para verificar

2. **Teste de Migração:**
   - Acesse **Administração** > **Migrar Senhas**
   - Veja quantos usuários têm senha em texto plano
   - Clique em **Migrar Todas as Senhas**

### Passo 4: Verificar Migração

1. **Verificar no banco:**
```sql
-- Ver usuários com senha hasheada (começam com $2a$, $2b$ ou $2y$)
SELECT id, nome, email, 
       CASE 
         WHEN senha_hash LIKE '$2%' THEN 'Hash'
         ELSE 'Texto Plano'
       END as tipo_senha
FROM usuarios;
```

2. **Verificar via interface:**
   - Acesse **Administração** > **Migrar Senhas**
   - Deve mostrar "Todas as senhas estão hasheadas"

## 🔒 Segurança

### ✅ Melhorias Implementadas

1. **Hash de Senhas com bcrypt**
   - Senhas são hasheadas com bcrypt (10 rounds)
   - Hash é feito no servidor (Edge Function)
   - Nunca expõe senhas em texto plano

2. **Migração Automática**
   - Senhas em texto plano são migradas automaticamente no primeiro login
   - Não requer intervenção manual
   - Transparente para o usuário

3. **Verificação Segura**
   - Senhas são verificadas usando bcrypt.compare
   - Comparação é feita no servidor
   - Protegido contra timing attacks

### ⚠️ Ainda Necessário

1. **Rate Limiting**
   - Implementar limite de tentativas de login
   - Bloquear IPs após múltiplas tentativas

2. **Recuperação de Senha**
   - Sistema de reset via email
   - Tokens temporários

3. **2FA (Opcional)**
   - Autenticação de dois fatores
   - Mais segurança para contas admin

## 📋 Checklist de Implementação

- [ ] Deploy da Edge Function `hash-password`
- [ ] Configurar permissões da Edge Function
- [ ] Testar hash de senha
- [ ] Testar verificação de senha
- [ ] Testar login com senha em texto plano (migração automática)
- [ ] Migrar todas as senhas existentes
- [ ] Verificar que todas as senhas estão hasheadas
- [ ] Testar login com senhas hasheadas
- [ ] Remover senhas em texto plano do banco
- [ ] Documentar processo para novos usuários

## 🐛 Troubleshooting

### Erro: "Function not found"

**Solução:** Verifique se a Edge Function foi deployada corretamente:
```bash
supabase functions list
```

### Erro: "Permission denied"

**Solução:** Configure as permissões da Edge Function no painel do Supabase.

### Erro: "bcrypt module not found"

**Solução:** A Edge Function usa Deno, que tem bcrypt nativo. Verifique se o import está correto.

### Senhas não estão sendo migradas

**Solução:** 
1. Verifique se a Edge Function está funcionando
2. Verifique os logs no Supabase Dashboard
3. Use o componente de migração manual

## 📚 Documentação Adicional

- `SEGURANCA.md` - Guia completo de segurança
- `README_SEGURANCA.md` - Guia rápido
- `RESUMO_SEGURANCA_IMPLEMENTADA.md` - Resumo das melhorias

## ⚠️ IMPORTANTE

1. **Nunca commite senhas em texto plano**
2. **Sempre use hash de senhas em produção**
3. **Teste a migração antes de colocar em produção**
4. **Mantenha backups antes de migrar senhas**

