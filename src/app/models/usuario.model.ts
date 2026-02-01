export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha_hash?: string;
  perfil: 'admin' | 'gerente' | 'funcionario';
  ativo?: boolean;
  salao_id?: string;
  created_at?: string;
  updated_at?: string;
}

