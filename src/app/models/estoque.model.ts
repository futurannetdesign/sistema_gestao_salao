export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade_medida?: string;
  valor_unitario?: number;
  fornecedor?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MovimentacaoEstoque {
  id?: number;
  produto_id: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo?: string;
  observacoes?: string;
  created_at?: string;
}

