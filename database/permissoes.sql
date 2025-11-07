-- Tabela de Permissões por Perfil
-- Define quais ações cada perfil pode realizar

create table permissoes (
  id bigint generated always as identity primary key,
  perfil text not null, -- 'admin' ou 'funcionario'
  modulo text not null, -- 'clientes', 'servicos', 'agendamentos', etc.
  acao text not null, -- 'visualizar', 'criar', 'editar', 'excluir', 'marcar_pago', 'sincronizar'
  permitido boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(perfil, modulo, acao)
);

-- Índices para melhor performance
create index idx_permissoes_perfil on permissoes(perfil);
create index idx_permissoes_modulo on permissoes(modulo);

-- Permissões padrão para ADMIN (tudo permitido)
INSERT INTO permissoes (perfil, modulo, acao, permitido) VALUES
-- Dashboard
('admin', 'dashboard', 'visualizar', true),
-- Clientes
('admin', 'clientes', 'visualizar', true),
('admin', 'clientes', 'criar', true),
('admin', 'clientes', 'editar', true),
('admin', 'clientes', 'excluir', true),
-- Serviços
('admin', 'servicos', 'visualizar', true),
('admin', 'servicos', 'criar', true),
('admin', 'servicos', 'editar', true),
('admin', 'servicos', 'excluir', true),
-- Profissionais
('admin', 'profissionais', 'visualizar', true),
('admin', 'profissionais', 'criar', true),
('admin', 'profissionais', 'editar', true),
('admin', 'profissionais', 'excluir', true),
-- Agendamentos
('admin', 'agendamentos', 'visualizar', true),
('admin', 'agendamentos', 'criar', true),
('admin', 'agendamentos', 'editar', true),
('admin', 'agendamentos', 'excluir', true),
-- Contas a Receber
('admin', 'contas_receber', 'visualizar', true),
('admin', 'contas_receber', 'criar', true),
('admin', 'contas_receber', 'editar', true),
('admin', 'contas_receber', 'excluir', true),
('admin', 'contas_receber', 'marcar_pago', true),
('admin', 'contas_receber', 'sincronizar', true),
-- Contas a Pagar
('admin', 'contas_pagar', 'visualizar', true),
('admin', 'contas_pagar', 'criar', true),
('admin', 'contas_pagar', 'editar', true),
('admin', 'contas_pagar', 'excluir', true),
('admin', 'contas_pagar', 'marcar_pago', true),
-- Caixa
('admin', 'caixa', 'visualizar', true),
('admin', 'caixa', 'sincronizar', true),
-- Estoque
('admin', 'estoque', 'visualizar', true),
('admin', 'estoque', 'criar', true),
('admin', 'estoque', 'editar', true),
('admin', 'estoque', 'excluir', true),
-- Fornecedores
('admin', 'fornecedores', 'visualizar', true),
('admin', 'fornecedores', 'criar', true),
('admin', 'fornecedores', 'editar', true),
('admin', 'fornecedores', 'excluir', true),
-- Configurações (apenas admin)
('admin', 'configuracoes', 'visualizar', true),
('admin', 'configuracoes', 'editar', true),
-- Auditoria (apenas admin)
('admin', 'auditoria', 'visualizar', true);

-- Permissões padrão para FUNCIONÁRIO (configurável)
-- Por padrão, funcionários podem visualizar e criar, mas não excluir
INSERT INTO permissoes (perfil, modulo, acao, permitido) VALUES
-- Dashboard
('funcionario', 'dashboard', 'visualizar', true),
-- Clientes
('funcionario', 'clientes', 'visualizar', true),
('funcionario', 'clientes', 'criar', true),
('funcionario', 'clientes', 'editar', true),
('funcionario', 'clientes', 'excluir', false),
-- Serviços
('funcionario', 'servicos', 'visualizar', true),
('funcionario', 'servicos', 'criar', false),
('funcionario', 'servicos', 'editar', false),
('funcionario', 'servicos', 'excluir', false),
-- Profissionais
('funcionario', 'profissionais', 'visualizar', true),
('funcionario', 'profissionais', 'criar', false),
('funcionario', 'profissionais', 'editar', false),
('funcionario', 'profissionais', 'excluir', false),
-- Agendamentos
('funcionario', 'agendamentos', 'visualizar', true),
('funcionario', 'agendamentos', 'criar', true),
('funcionario', 'agendamentos', 'editar', true),
('funcionario', 'agendamentos', 'excluir', false),
-- Contas a Receber
('funcionario', 'contas_receber', 'visualizar', true),
('funcionario', 'contas_receber', 'criar', false),
('funcionario', 'contas_receber', 'editar', false),
('funcionario', 'contas_receber', 'excluir', false),
('funcionario', 'contas_receber', 'marcar_pago', true),
('funcionario', 'contas_receber', 'sincronizar', false),
-- Contas a Pagar
('funcionario', 'contas_pagar', 'visualizar', false),
('funcionario', 'contas_pagar', 'criar', false),
('funcionario', 'contas_pagar', 'editar', false),
('funcionario', 'contas_pagar', 'excluir', false),
('funcionario', 'contas_pagar', 'marcar_pago', false),
-- Caixa
('funcionario', 'caixa', 'visualizar', true),
('funcionario', 'caixa', 'sincronizar', false),
-- Estoque
('funcionario', 'estoque', 'visualizar', true),
('funcionario', 'estoque', 'criar', false),
('funcionario', 'estoque', 'editar', false),
('funcionario', 'estoque', 'excluir', false),
-- Fornecedores
('funcionario', 'fornecedores', 'visualizar', true),
('funcionario', 'fornecedores', 'criar', false),
('funcionario', 'fornecedores', 'editar', false),
('funcionario', 'fornecedores', 'excluir', false),
-- Configurações (não permitido para funcionários)
('funcionario', 'configuracoes', 'visualizar', false),
('funcionario', 'configuracoes', 'editar', false),
-- Auditoria (não permitido para funcionários)
('funcionario', 'auditoria', 'visualizar', false);

