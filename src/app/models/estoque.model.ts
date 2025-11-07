import { Fornecedor } from './fornecedor.model';

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade_medida?: string;
  valor_unitario?: number;
  fornecedor_id?: number;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
  fornecedor?: Fornecedor;
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

