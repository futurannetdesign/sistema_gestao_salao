# 🔐 Credenciais de Acesso - Sistema de Gestão

## 👤 Administrador

**Email:** `admin@salao.com`  
**Senha:** `admin123`

**Perfil:** Administrador (acesso total)

---

## 👤 Funcionário

**Email:** `funcionario@salao.com`  
**Senha:** `func123`

**Perfil:** Funcionário (acesso limitado conforme permissões)

---

## ⚠️ IMPORTANTE - Segurança

### ⚠️ ALTERE AS SENHAS APÓS O PRIMEIRO LOGIN!

As senhas padrão são apenas para desenvolvimento e testes. Em produção:

1. **Faça login como Administrador**
2. **Acesse Configurações** (se disponível)
3. **Altere a senha do administrador**
4. **Crie novos usuários com senhas seguras**
5. **Configure permissões adequadas para funcionários**

### 🔒 Senhas Seguras

Use senhas que contenham:
- ✅ Mínimo de 8 caracteres
- ✅ Letras maiúsculas e minúsculas
- ✅ Números
- ✅ Caracteres especiais (!@#$%^&*)

**Exemplo de senha segura:** `Admin@2024!`

---

## 📝 Notas

- As senhas são armazenadas com hash bcrypt (após primeiro login)
- O sistema migra automaticamente senhas em texto plano para hash
- Consulte `SEGURANCA.md` para mais informações sobre segurança

---

## 🚀 URL do Sistema

**Firebase Hosting:** https://sistemagestaosalao.web.app

---

## 🔄 Como Alterar Senhas

### Via Sistema (quando implementado):

1. Faça login
2. Acesse **Configurações** > **Alterar Senha**
3. Digite a senha atual
4. Digite a nova senha
5. Confirme a nova senha
6. Salve

### Via Banco de Dados (apenas para administradores):

Execute no Supabase SQL Editor:

```sql
-- Alterar senha do admin (substitua 'nova_senha_segura' pela senha desejada)
-- A senha será hasheada automaticamente no próximo login
UPDATE usuarios 
SET senha_hash = 'nova_senha_segura' 
WHERE email = 'admin@salao.com';
```

⚠️ **ATENÇÃO:** Se o sistema já estiver usando hash de senhas, você precisará usar a Edge Function `hash-password` para gerar o hash antes de atualizar.

---

## 📚 Documentação Relacionada

- `SEGURANCA.md` - Guia completo de segurança
- `GUIA_IMPLEMENTACAO_HASH.md` - Implementação de hash de senhas
- `database/migration_add_usuario_admin.sql` - Script de criação de usuários

