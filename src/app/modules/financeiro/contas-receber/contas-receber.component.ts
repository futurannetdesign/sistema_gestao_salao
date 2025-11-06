import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { ContaReceber } from '../../../models/financeiro.model';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-contas-receber',
  templateUrl: './contas-receber.component.html',
  styleUrls: ['./contas-receber.component.css']
})
export class ContasReceberComponent implements OnInit {
  contas: ContaReceber[] = [];
  contasFiltradas: ContaReceber[] = [];
  clientes: Cliente[] = [];
  loading = true;
  searchTerm = '';
  statusFiltro = '';
  periodoFiltro = 'mes'; // dia, semana, mes
  alertMessage = '';
  alertType = '';
  totalPendente = 0;
  totalPago = 0;
  totalVencido = 0;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await Promise.all([
      this.carregarContas(),
      this.carregarClientes()
    ]);
  }

  async carregarContas() {
    try {
      this.loading = true;
      this.contas = await this.supabase.select('contas_receber') as ContaReceber[];
      
      // Carregar dados relacionados
      for (const conta of this.contas) {
        if (conta.cliente_id) {
          const clientes = await this.supabase.select('clientes', { id: conta.cliente_id });
          conta.cliente = clientes?.[0] as Cliente;
        }
      }

      this.atualizarStatusVencidas();
      this.calcularTotais();
      this.filtrarContas();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar contas: ' + error.message, 'danger');
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

  async atualizarStatusVencidas() {
    const hoje = new Date().toISOString().split('T')[0];
    for (const conta of this.contas) {
      if (conta.status === 'pendente' && conta.data_vencimento < hoje) {
        await this.supabase.update('contas_receber', conta.id!, { status: 'vencido' });
        conta.status = 'vencido';
      }
    }
  }

  calcularTotais() {
    this.totalPendente = this.contas
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.valor, 0);
    
    this.totalPago = this.contas
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + c.valor, 0);
    
    this.totalVencido = this.contas
      .filter(c => c.status === 'vencido')
      .reduce((sum, c) => sum + c.valor, 0);
  }

  filtrarContas() {
    let filtradas = this.contas;

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(conta =>
        conta.descricao.toLowerCase().includes(termo) ||
        conta.cliente?.nome.toLowerCase().includes(termo)
      );
    }

    if (this.statusFiltro) {
      filtradas = filtradas.filter(conta => conta.status === this.statusFiltro);
    }

    // Filtrar por período
    const hoje = new Date();
    if (this.periodoFiltro === 'dia') {
      const hojeStr = hoje.toISOString().split('T')[0];
      filtradas = filtradas.filter(conta => conta.data_vencimento === hojeStr);
    } else if (this.periodoFiltro === 'semana') {
      const semanaAtras = new Date(hoje);
      semanaAtras.setDate(hoje.getDate() - 7);
      filtradas = filtradas.filter(conta => {
        const dataVenc = new Date(conta.data_vencimento);
        return dataVenc >= semanaAtras && dataVenc <= hoje;
      });
    } else if (this.periodoFiltro === 'mes') {
      const mesAtras = new Date(hoje);
      mesAtras.setMonth(hoje.getMonth() - 1);
      filtradas = filtradas.filter(conta => {
        const dataVenc = new Date(conta.data_vencimento);
        return dataVenc >= mesAtras && dataVenc <= hoje;
      });
    }

    this.contasFiltradas = filtradas.sort((a, b) => 
      new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
    );
  }

  async marcarComoPago(id: number) {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      await this.supabase.update('contas_receber', id, { 
        status: 'pago',
        data_pagamento: hoje
      });
      this.showAlert('Conta marcada como paga!', 'success');
      await this.carregarContas();
    } catch (error: any) {
      this.showAlert('Erro ao atualizar conta: ' + error.message, 'danger');
    }
  }

  async excluirConta(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
      return;
    }

    try {
      await this.supabase.delete('contas_receber', id);
      this.showAlert('Conta excluída com sucesso!', 'success');
      await this.carregarContas();
    } catch (error: any) {
      this.showAlert('Erro ao excluir conta: ' + error.message, 'danger');
    }
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pago':
        return 'badge-success';
      case 'vencido':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'pago':
        return 'Pago';
      case 'vencido':
        return 'Vencido';
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

