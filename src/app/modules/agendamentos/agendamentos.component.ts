import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Agendamento } from '../../models/agendamento.model';
import { Cliente } from '../../models/cliente.model';
import { Servico } from '../../models/servico.model';
import { Profissional } from '../../models/agendamento.model';

@Component({
  selector: 'app-agendamentos',
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.css']
})
export class AgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  agendamentosFiltrados: Agendamento[] = [];
  clientes: Cliente[] = [];
  servicos: Servico[] = [];
  profissionais: Profissional[] = [];
  loading = true;
  searchTerm = '';
  statusFiltro = '';
  dataFiltro = '';
  alertMessage = '';
  alertType = '';
  viewMode: 'lista' | 'calendario' = 'lista';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.carregarAgendamentos(),
      this.carregarClientes(),
      this.carregarServicos(),
      this.carregarProfissionais()
    ]);
  }

  async carregarAgendamentos() {
    try {
      this.loading = true;
      const agendamentos = await this.supabase.select('agendamentos') as Agendamento[];
      
      // Carregar dados relacionados
      for (const agendamento of agendamentos) {
        if (agendamento.cliente_id) {
          const clientes = await this.supabase.select('clientes', { id: agendamento.cliente_id });
          agendamento.cliente = clientes?.[0] as Cliente;
        }
        if (agendamento.servico_id) {
          const servicos = await this.supabase.select('servicos', { id: agendamento.servico_id });
          agendamento.servico = servicos?.[0] as Servico;
        }
        if (agendamento.profissional_id) {
          const profissionais = await this.supabase.select('profissionais', { id: agendamento.profissional_id });
          agendamento.profissional = profissionais?.[0] as Profissional;
        }
      }
      
      this.agendamentos = agendamentos;
      this.filtrarAgendamentos();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar agendamentos: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async carregarClientes() {
    try {
      this.clientes = await this.supabase.select('clientes') as Cliente[];
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  async carregarServicos() {
    try {
      this.servicos = await this.supabase.select('servicos', { ativo: true }) as Servico[];
    } catch (error: any) {
      console.error('Erro ao carregar serviços:', error);
    }
  }

  async carregarProfissionais() {
    try {
      this.profissionais = await this.supabase.select('profissionais', { ativo: true }) as Profissional[];
    } catch (error: any) {
      console.error('Erro ao carregar profissionais:', error);
    }
  }

  filtrarAgendamentos() {
    let filtrados = this.agendamentos;

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(agendamento =>
        agendamento.cliente?.nome.toLowerCase().includes(termo) ||
        agendamento.servico?.nome.toLowerCase().includes(termo)
      );
    }

    if (this.statusFiltro) {
      filtrados = filtrados.filter(agendamento => agendamento.status === this.statusFiltro);
    }

    if (this.dataFiltro) {
      filtrados = filtrados.filter(agendamento => {
        const dataAgendamento = new Date(agendamento.data_hora).toISOString().split('T')[0];
        return dataAgendamento === this.dataFiltro;
      });
    }

    this.agendamentosFiltrados = filtrados.sort((a, b) => 
      new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
    );
  }

  novoAgendamento() {
    this.router.navigate(['/agendamentos/novo']);
  }

  editarAgendamento(id: number) {
    this.router.navigate(['/agendamentos/editar', id]);
  }

  async atualizarStatus(id: number, novoStatus: string) {
    try {
      await this.supabase.update('agendamentos', id, { status: novoStatus });
      this.showAlert('Status atualizado com sucesso!', 'success');
      await this.carregarAgendamentos();
    } catch (error: any) {
      this.showAlert('Erro ao atualizar status: ' + error.message, 'danger');
    }
  }

  async excluirAgendamento(id: number) {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    try {
      await this.supabase.delete('agendamentos', id);
      this.showAlert('Agendamento excluído com sucesso!', 'success');
      await this.carregarAgendamentos();
    } catch (error: any) {
      this.showAlert('Erro ao excluir agendamento: ' + error.message, 'danger');
    }
  }

  formatarDataHora(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR');
  }

  formatarMoeda(valor: number | undefined): string {
    if (!valor) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'concluido':
        return 'badge-success';
      case 'cancelado':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

