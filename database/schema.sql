-- Sistema de Gestão para Salão de Beleza Unissex
-- Script SQL para criação das tabelas no Supabase

-- 1. Tabela de Clientes
create table clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  celular text,
  whatsapp text,
  email text,
  data_nascimento date,
  sexo text,
  observacoes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 2. Tabela de Profissionais
create table profissionais (
  id bigint generated always as identity primary key,
  nome text not null,
  celular text,
  email text,
  especialidades text[],
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 3. Tabela de Serviços
create table servicos (
  id bigint generated always as identity primary key,
  nome text not null,
  categoria text not null,
  valor_padrao numeric(10,2) not null,
  duracao_estimada integer not null, -- em minutos
  observacoes text,
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 4. Tabela de Agendamentos
create table agendamentos (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references clientes(id) on delete restrict,
  servico_id bigint not null references servicos(id) on delete restrict,
  profissional_id bigint references profissionais(id) on delete set null,
  data_hora timestamp not null,
  status text not null default 'agendado', -- agendado, concluido, cancelado
  observacoes text,
  valor_cobrado numeric(10,2),
  data_pagamento date,
  forma_pagamento text, -- dinheiro, cartao, pix, transferencia
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 5. Tabela de Contas a Receber
create table contas_receber (
  id bigint generated always as identity primary key,
  cliente_id bigint references clientes(id) on delete set null,
  agendamento_id bigint references agendamentos(id) on delete set null,
  descricao text not null,
  valor numeric(10,2) not null,
  data_vencimento date not null,
  data_pagamento date,
  forma_pagamento text, -- dinheiro, cartao, pix
  status text not null default 'pendente', -- pendente, pago, vencido
  observacoes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 6. Tabela de Contas a Pagar
create table contas_pagar (
  id bigint generated always as identity primary key,
  descricao text not null,
  valor numeric(10,2) not null,
  data_vencimento date not null,
  data_pagamento date,
  categoria text not null, -- aluguel, agua, luz, produtos, outros
  forma_pagamento text, -- dinheiro, cartao, pix, transferencia
  status text not null default 'pendente', -- pendente, pago, vencido
  observacoes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 7. Tabela de Movimentações de Caixa
create table movimentacoes_caixa (
  id bigint generated always as identity primary key,
  tipo text not null, -- entrada, saida
  descricao text not null,
  valor numeric(10,2) not null,
  data_movimentacao date not null,
  forma_pagamento text,
  referencia_id bigint, -- id da conta receber/pagar ou agendamento
  referencia_tipo text, -- conta_receber, conta_pagar, agendamento, outros
  observacoes text,
  created_at timestamp default now()
);

-- 8. Tabela de Fornecedores
create table fornecedores (
  id bigint generated always as identity primary key,
  nome text not null,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  observacoes text,
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 9. Tabela de Produtos (Estoque)
create table produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  descricao text,
  categoria text, -- shampoo, tinta, creme, etc
  quantidade_atual integer not null default 0,
  quantidade_minima integer not null default 0,
  unidade_medida text default 'unidade', -- unidade, litro, kg, etc
  valor_unitario numeric(10,2),
  fornecedor_id bigint references fornecedores(id) on delete set null,
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 10. Tabela de Movimentações de Estoque
create table movimentacoes_estoque (
  id bigint generated always as identity primary key,
  produto_id bigint not null references produtos(id) on delete restrict,
  tipo text not null, -- entrada, saida
  quantidade integer not null,
  motivo text, -- compra, venda, uso, perda, ajuste
  observacoes text,
  created_at timestamp default now()
);

-- 11. Tabela de Usuários do Sistema
create table usuarios (
  id bigint generated always as identity primary key,
  nome text not null,
  email text not null unique,
  senha_hash text, -- se usar autenticação própria
  perfil text not null default 'funcionario', -- admin, funcionario
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 12. Tabela de Configurações do Sistema
create table configuracoes (
  id bigint generated always as identity primary key,
  chave text not null unique,
  valor text not null,
  tipo text default 'text', -- text, number, boolean, json
  descricao text,
  updated_at timestamp default now()
);

-- Índices para melhor performance
create index idx_agendamentos_cliente on agendamentos(cliente_id);
create index idx_agendamentos_data_hora on agendamentos(data_hora);
create index idx_agendamentos_status on agendamentos(status);
create index idx_contas_receber_cliente on contas_receber(cliente_id);
create index idx_contas_receber_status on contas_receber(status);
create index idx_contas_pagar_status on contas_pagar(status);
create index idx_movimentacoes_caixa_data on movimentacoes_caixa(data_movimentacao);
create index idx_movimentacoes_estoque_produto on movimentacoes_estoque(produto_id);
create index idx_produtos_ativo on produtos(ativo);

-- Função para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para atualizar updated_at
create trigger update_clientes_updated_at before update on clientes
  for each row execute function update_updated_at_column();

create trigger update_profissionais_updated_at before update on profissionais
  for each row execute function update_updated_at_column();

create trigger update_servicos_updated_at before update on servicos
  for each row execute function update_updated_at_column();

create trigger update_agendamentos_updated_at before update on agendamentos
  for each row execute function update_updated_at_column();

create trigger update_contas_receber_updated_at before update on contas_receber
  for each row execute function update_updated_at_column();

create trigger update_contas_pagar_updated_at before update on contas_pagar
  for each row execute function update_updated_at_column();

create trigger update_produtos_updated_at before update on produtos
  for each row execute function update_updated_at_column();

create trigger update_usuarios_updated_at before update on usuarios
  for each row execute function update_updated_at_column();

create trigger update_configuracoes_updated_at before update on configuracoes
  for each row execute function update_updated_at_column();

