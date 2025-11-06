import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = true;
  
  // Estatísticas
  totalClientes = 0;
  totalAgendamentosHoje = 0;
  totalAgendamentosPendentes = 0;
  receitaMes = 0;
  despesaMes = 0;
  saldoMes = 0;
  produtosBaixoEstoque = 0;
  contasVencidas = 0;

  // Agendamentos do dia
  agendamentosHoje: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      this.loading = true;
      
      await Promise.all([
        this.carregarEstatisticas(),
        this.carregarAgendamentosHoje()
      ]);
      
      this.loading = false;
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      this.loading = false;
    }
  }

  async carregarEstatisticas() {
    try {
      // Total de clientes
      const clientes = await this.supabase.select('clientes');
      this.totalClientes = clientes?.length || 0;

      // Agendamentos do dia
      const hoje = new Date().toISOString().split('T')[0];
      const agendamentos = await this.supabase.select('agendamentos') as any[];
      this.totalAgendamentosHoje = agendamentos.filter(a => 
        a.data_hora.startsWith(hoje)
      ).length;
      
      this.totalAgendamentosPendentes = agendamentos.filter(a => 
        a.status === 'agendado'
      ).length;

      // Receitas do mês
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      
      const contasReceber = await this.supabase.select('contas_receber') as any[];
      const contasReceberMes = contasReceber.filter(c => {
        const dataPagamento = c.data_pagamento ? new Date(c.data_pagamento) : null;
        return c.status === 'pago' && dataPagamento && dataPagamento >= inicioMes;
      });
      this.receitaMes = contasReceberMes.reduce((sum, c) => sum + c.valor, 0);

      // Despesas do mês
      const contasPagar = await this.supabase.select('contas_pagar') as any[];
      const contasPagarMes = contasPagar.filter(c => {
        const dataPagamento = c.data_pagamento ? new Date(c.data_pagamento) : null;
        return c.status === 'pago' && dataPagamento && dataPagamento >= inicioMes;
      });
      this.despesaMes = contasPagarMes.reduce((sum, c) => sum + c.valor, 0);

      this.saldoMes = this.receitaMes - this.despesaMes;

      // Produtos com estoque baixo
      const produtos = await this.supabase.select('produtos') as any[];
      this.produtosBaixoEstoque = produtos.filter(p => 
        p.ativo && p.quantidade_atual <= p.quantidade_minima
      ).length;

      // Contas vencidas
      const hojeStr = new Date().toISOString().split('T')[0];
      this.contasVencidas = contasReceber.filter(c => 
        c.status === 'vencido' || (c.status === 'pendente' && c.data_vencimento < hojeStr)
      ).length;
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async carregarAgendamentosHoje() {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const agendamentos = await this.supabase.select('agendamentos') as any[];
      
      const agendamentosHoje = agendamentos.filter(a => 
        a.data_hora.startsWith(hoje) && a.status === 'agendado'
      ).sort((a, b) => 
        new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
      );

      // Carregar dados relacionados
      for (const agendamento of agendamentosHoje) {
        if (agendamento.cliente_id) {
          const clientes = await this.supabase.select('clientes', { id: agendamento.cliente_id });
          agendamento.cliente = clientes?.[0];
        }
        if (agendamento.servico_id) {
          const servicos = await this.supabase.select('servicos', { id: agendamento.servico_id });
          agendamento.servico = servicos?.[0];
        }
      }

      this.agendamentosHoje = agendamentosHoje.slice(0, 5); // Limitar a 5
    } catch (error: any) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  formatarDataHora(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}

