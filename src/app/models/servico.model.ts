export interface Servico {
  id?: number;
  nome: string;
  categoria: string;
  valor_padrao: number;
  duracao_estimada: number;
  observacoes?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORIAS_SERVICOS = [
  'Cabelo',
  'Unha',
  'Barba',
  'Depilação',
  'Sobrancelha',
  'Maquiagem',
  'Outros'
];

