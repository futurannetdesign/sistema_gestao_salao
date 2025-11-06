import { Cliente } from './cliente.model';

export interface ContaReceber {
  id?: number;
  cliente_id?: number;
  agendamento_id?: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento?: 'dinheiro' | 'cartao' | 'pix';
  status: 'pendente' | 'pago' | 'vencido';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
}

export interface ContaPagar {
  id?: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  categoria: string;
  forma_pagamento?: 'dinheiro' | 'cartao' | 'pix' | 'transferencia';
  status: 'pendente' | 'pago' | 'vencido';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MovimentacaoCaixa {
  id?: number;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  data_movimentacao: string;
  forma_pagamento?: string;
  referencia_id?: number;
  referencia_tipo?: string;
  observacoes?: string;
  created_at?: string;
}

