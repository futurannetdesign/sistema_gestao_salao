# 💈 Sistema de Gestão para Salão de Beleza Unissex

## 🧭 Objetivo Geral
Desenvolver um **sistema completo de gestão para salão de beleza unissex**, incluindo:
- Cadastro de clientes
- Controle de agendamentos
- Registro de serviços prestados e valores
- Controle de estoque
- Contas a pagar e a receber
- Caixa de entrada e saída
- Envio de promoções via WhatsApp
- Painel administrativo moderno e fácil de usar
- Banco de dados gerenciado no **Supabase**, com uso do **SQL Editor**.

---

## ⚙️ Tecnologias
- **Frontend:** Angular (HTML, CSS, TypeScript)
- **Backend:** Supabase (banco de dados + autenticação + API)
- **Banco de dados:** PostgreSQL (via Supabase)
- **Integrações:** WhatsApp API / Twilio (para envios automáticos)
- **Ambiente de desenvolvimento:** Cursor AI + VS Code

---

## 🧱 Estrutura do Sistema
O sistema será dividido em **módulos** e desenvolvido em **etapas validadas**.

### 🔹 Módulo 1: Clientes
- Cadastro de clientes com:
  - Nome completo
  - Celular
  - WhatsApp
  - E-mail
  - Data de nascimento
  - Sexo
  - Observações
- Edição e exclusão de clientes
- Listagem com busca e filtros
- Envio de promoções via WhatsApp (integração posterior)

### 🔹 Módulo 2: Serviços
- Cadastro de serviços com:
  - Nome do serviço
  - Categoria (ex: Cabelo, Unha, Barba, Depilação, Sobrancelha, Maquiagem)
  - Valor padrão
  - Duração estimada (minutos)
  - Observações
- Associação de serviços com clientes (histórico de atendimentos)
- Atualização e exclusão de serviços

### 🔹 Módulo 3: Agendamentos
- Agendamento de serviços para clientes
- Escolha do profissional responsável
- Data e hora
- Status (Agendado, Concluído, Cancelado)
- Visualização em calendário

### 🔹 Módulo 4: Financeiro
#### Contas a Receber
- Registro de pagamentos dos clientes
- Valor, data, forma de pagamento (dinheiro, cartão, Pix)
- Status (pendente, pago, vencido)
- Relatório diário, semanal e mensal

#### Contas a Pagar
- Despesas do salão (aluguel, água, luz, produtos)
- Data de vencimento, valor, categoria e status

#### Caixa
- Entradas (serviços, vendas de produtos)
- Saídas (pagamentos, despesas)
- Saldo diário e histórico

### 🔹 Módulo 5: Estoque
- Cadastro de produtos (shampoo, tintas, cremes, etc.)
- Quantidade mínima
- Controle de entrada e saída
- Alertas de baixo estoque

### 🔹 Módulo 6: Administração
- Painel geral com resumo financeiro, agendamentos do dia e estatísticas
- Controle de usuários e permissões (admin / funcionário)
- Configurações do sistema (nome do salão, logotipo, horário de funcionamento)

---

## 🧩 Banco de Dados (Supabase - SQL Editor)

### 🗃️ Tabelas Principais

#### 1. `clientes`
```sql
create table clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  celular text,
  whatsapp text,
  email text,
  data_nascimento date,
  sexo text,
  observacoes text,
  created_at timestamp default now()
);

