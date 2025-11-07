export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha_hash?: string;
  perfil: 'admin' | 'funcionario';
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

