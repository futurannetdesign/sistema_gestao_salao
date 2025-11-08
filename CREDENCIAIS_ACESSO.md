# 🔐 Credenciais de Acesso - Sistema de Gestão

## ⚠️ IMPORTANTE - Segurança

### 🔒 Senhas Padrão Foram Alteradas

As senhas padrão foram alteradas por questões de segurança. Para acessar o sistema:

1. **Entre em contato com o administrador** para obter as credenciais de acesso
2. **Ou acesse o Supabase Dashboard** > Authentication > Users para gerenciar usuários
3. **Crie novos usuários** com senhas seguras através do sistema

### 🔒 Senhas Seguras

Use senhas que contenham:
- ✅ Mínimo de 8 caracteres
- ✅ Letras maiúsculas e minúsculas
- ✅ Números
- ✅ Caracteres especiais (!@#$%^&*)

**Exemplo de senha segura:** `Admin@2024!`

### 📝 Gerenciamento de Usuários

1. **Faça login como Administrador**
2. **Acesse Administração** > **Usuários**
3. **Crie novos usuários** com senhas seguras
4. **Configure permissões adequadas** para funcionários

---

## 📝 Notas

- O sistema usa **Supabase Auth** para autenticação segura
- As senhas são armazenadas com hash seguro pelo Supabase
- Consulte `SEGURANCA.md` para mais informações sobre segurança

---

## 🚀 URL do Sistema

**Firebase Hosting:** https://sistemagestaosalao.web.app

---

## 🔄 Como Alterar Senhas

### Via Sistema (Recomendado):

1. Faça login como Administrador
2. Acesse **Administração** > **Usuários**
3. Clique em **Editar** no usuário desejado
4. Preencha a nova senha e confirme
5. Clique em **Salvar**

### Via Supabase Dashboard (Alternativa):

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** > **Users**
3. Selecione o usuário desejado
4. Clique em **"..."** > **"Reset password"**
5. Defina a nova senha

---

## 📚 Documentação Relacionada

- `SEGURANCA.md` - Guia completo de segurança
- `GUIA_IMPLEMENTACAO_HASH.md` - Implementação de hash de senhas
- `database/migration_add_usuario_admin.sql` - Script de criação de usuários

