export interface Permissao {
  id?: number;
  perfil: 'admin' | 'funcionario';
  modulo: string;
  acao: 'visualizar' | 'criar' | 'editar' | 'excluir' | 'marcar_pago' | 'sincronizar';
  permitido: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ModuloPermissao = 
  | 'dashboard'
  | 'clientes'
  | 'servicos'
  | 'profissionais'
  | 'agendamentos'
  | 'contas_receber'
  | 'contas_pagar'
  | 'caixa'
  | 'estoque'
  | 'fornecedores'
  | 'configuracoes'
  | 'auditoria';

export type AcaoPermissao = 
  | 'visualizar'
  | 'criar'
  | 'editar'
  | 'excluir'
  | 'marcar_pago'
  | 'sincronizar';

