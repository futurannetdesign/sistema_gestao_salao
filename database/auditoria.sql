-- Tabela de Auditoria para registrar todas as ações do sistema
create table auditoria (
  id bigint generated always as identity primary key,
  usuario_id bigint references usuarios(id) on delete set null,
  acao text not null, -- criar, editar, excluir, visualizar, exportar, imprimir
  tabela text not null, -- nome da tabela afetada
  registro_id bigint, -- id do registro afetado
  dados_anteriores jsonb, -- dados antes da alteração
  dados_novos jsonb, -- dados após a alteração
  ip_address text,
  user_agent text,
  observacoes text,
  created_at timestamp default now()
);

-- Índices para auditoria
create index idx_auditoria_usuario on auditoria(usuario_id);
create index idx_auditoria_tabela on auditoria(tabela);
create index idx_auditoria_acao on auditoria(acao);
create index idx_auditoria_data on auditoria(created_at);

