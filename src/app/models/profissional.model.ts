export interface Profissional {
  id?: number;
  nome: string;
  celular?: string;
  email?: string;
  especialidades?: string[];
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const ESPECIALIDADES = [
  'Cabelo',
  'Unha',
  'Barba',
  'Depilação',
  'Sobrancelha',
  'Maquiagem',
  'Massagem',
  'Estética Facial',
  'Outros'
];

