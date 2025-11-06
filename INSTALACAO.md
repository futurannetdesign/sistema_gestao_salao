# 📋 Guia de Instalação e Configuração

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase (gratuita)

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Acesse o **SQL Editor** no painel do Supabase
4. Execute o script SQL do arquivo `database/schema.sql`
5. Copie a **URL** e a **chave anônima (anon key)** do seu projeto
6. Edite o arquivo `src/environments/environment.ts` e preencha:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'SUA_URL_DO_SUPABASE',
  supabaseKey: 'SUA_CHAVE_DO_SUPABASE'
};
```

## Passo 3: Executar o Sistema

```bash
npm start
```

O sistema estará disponível em `http://localhost:4200`

## Passo 4: Configurar Dados Iniciais

### Criar Profissionais

No SQL Editor do Supabase, execute:

```sql
INSERT INTO profissionais (nome, celular, email, especialidades, ativo)
VALUES 
  ('João Silva', '(11) 99999-9999', 'joao@email.com', ARRAY['Cabelo', 'Barba'], true),
  ('Maria Santos', '(11) 88888-8888', 'maria@email.com', ARRAY['Unha', 'Maquiagem'], true);
```

### Criar Configurações Iniciais

```sql
INSERT INTO configuracoes (chave, valor, tipo, descricao)
VALUES 
  ('nome_salao', 'Salão Beleza & Estilo', 'text', 'Nome do salão'),
  ('telefone', '(11) 3333-3333', 'text', 'Telefone de contato'),
  ('horario_funcionamento', 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 14h', 'text', 'Horário de funcionamento');
```

## Estrutura do Sistema

### Módulos Implementados

✅ **Módulo 1: Clientes** - CRUD completo
✅ **Módulo 2: Serviços** - CRUD completo com categorias
✅ **Módulo 3: Agendamentos** - CRUD com visualização em lista e calendário
✅ **Módulo 4: Financeiro** - Contas a Receber, Contas a Pagar e Caixa
✅ **Módulo 5: Estoque** - CRUD com alertas de estoque baixo
✅ **Módulo 6: Administração** - Dashboard e Configurações

## Funcionalidades Principais

- ✅ Cadastro completo de clientes
- ✅ Gestão de serviços e categorias
- ✅ Sistema de agendamentos com status
- ✅ Controle financeiro completo
- ✅ Gestão de estoque com alertas
- ✅ Dashboard com estatísticas
- ✅ Sistema responsivo

## Próximos Passos (Futuras Implementações)

- [ ] Integração com WhatsApp API
- [ ] Sistema de autenticação de usuários
- [ ] Relatórios em PDF
- [ ] Exportação de dados
- [ ] Notificações push
- [ ] App mobile

## Suporte

Para dúvidas ou problemas, consulte a documentação do Angular e Supabase.

