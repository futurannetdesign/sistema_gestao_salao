export interface Auditoria {
  id?: number;
  usuario_id?: number;
  acao: string;
  tabela: string;
  registro_id?: number;
  dados_anteriores?: any;
  dados_novos?: any;
  ip_address?: string;
  user_agent?: string;
  observacoes?: string;
  created_at?: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

export const ACOES_AUDITORIA = [
  'criar',
  'editar',
  'excluir',
  'visualizar',
  'exportar',
  'imprimir',
  'login',
  'logout',
  'atualizar_status'
];

