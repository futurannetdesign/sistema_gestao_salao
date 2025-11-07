import { Cliente } from './cliente.model';
import { Servico } from './servico.model';
import { Profissional } from './profissional.model';

export interface Agendamento {
  id?: number;
  cliente_id: number;
  servico_id: number;
  profissional_id?: number;
  data_hora: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  observacoes?: string;
  valor_cobrado?: number;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
  servico?: Servico;
  profissional?: Profissional;
}

