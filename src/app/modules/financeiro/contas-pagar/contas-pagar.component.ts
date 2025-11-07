import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { ContaPagar } from '../../../models/financeiro.model';

@Component({
  selector: 'app-contas-pagar',
  templateUrl: './contas-pagar.component.html',
  styleUrls: ['./contas-pagar.component.css']
})
export class ContasPagarComponent implements OnInit {
  contas: ContaPagar[] = [];
  contasFiltradas: ContaPagar[] = [];
  loading = true;
  searchTerm = '';
  statusFiltro = '';
  categoriaFiltro = '';
  periodoFiltro = 'todos';
  alertMessage = '';
  alertType = '';
  totalPendente = 0;
  totalPago = 0;
  totalVencido = 0;
  categorias = ['Aluguel', 'Água', 'Luz', 'Produtos', 'Salários', 'Outros'];

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarContas();
  }

  async carregarContas() {
    try {
      this.loading = true;
      this.contas = await this.supabase.select('contas_pagar') as ContaPagar[];
      
      this.atualizarStatusVencidas();
      this.calcularTotais();
      this.filtrarContas();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar contas: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async atualizarStatusVencidas() {
    const hoje = new Date().toISOString().split('T')[0];
    for (const conta of this.contas) {
      if (conta.status === 'pendente' && conta.data_vencimento < hoje) {
        await this.supabase.update('contas_pagar', conta.id!, { status: 'vencido' });
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
        conta.descricao.toLowerCase().includes(termo)
      );
    }

    if (this.statusFiltro) {
      filtradas = filtradas.filter(conta => conta.status === this.statusFiltro);
    }

    if (this.categoriaFiltro) {
      filtradas = filtradas.filter(conta => conta.categoria === this.categoriaFiltro);
    }

    // Filtrar por período (só se não for "todos")
    if (this.periodoFiltro !== 'todos') {
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
    }

    this.contasFiltradas = filtradas.sort((a, b) => 
      new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
    );
  }

  async marcarComoPago(id: number) {
    try {
      const conta = this.contas.find(c => c.id === id);
      if (!conta) {
        this.showAlert('Conta não encontrada!', 'danger');
        return;
      }

      const hoje = new Date().toISOString().split('T')[0];
      
      // Atualizar conta a pagar
      await this.supabase.update('contas_pagar', id, { 
        status: 'pago',
        data_pagamento: hoje
      });

      // Criar movimentação de saída no caixa
      await this.criarMovimentacaoCaixa(conta, hoje, 'saida');

      this.showAlert('Conta marcada como paga e movimentação registrada no caixa!', 'success');
      await this.carregarContas();
    } catch (error: any) {
      this.showAlert('Erro ao atualizar conta: ' + error.message, 'danger');
    }
  }

  async criarMovimentacaoCaixa(conta: ContaPagar, dataPagamento: string, tipo: 'entrada' | 'saida') {
    try {
      // Verificar se já existe movimentação para esta conta
      const movimentacoesExistentes = await this.supabase.select('movimentacoes_caixa', { 
        referencia_id: conta.id,
        referencia_tipo: 'conta_pagar'
      });

      if (movimentacoesExistentes && movimentacoesExistentes.length > 0) {
        // Atualizar movimentação existente
        await this.supabase.update('movimentacoes_caixa', movimentacoesExistentes[0].id, {
          valor: conta.valor,
          data_movimentacao: dataPagamento,
          forma_pagamento: conta.forma_pagamento || null,
          observacoes: `Pagamento de conta a pagar: ${conta.descricao}`
        });
        return;
      }

      // Criar nova movimentação
      const movimentacao = {
        tipo: tipo,
        descricao: `Pagamento: ${conta.descricao}`,
        valor: conta.valor,
        data_movimentacao: dataPagamento,
        forma_pagamento: conta.forma_pagamento || null,
        referencia_id: conta.id,
        referencia_tipo: 'conta_pagar',
        observacoes: `Pagamento de conta a pagar #${conta.id} - ${conta.categoria}`
      };

      await this.supabase.insert('movimentacoes_caixa', movimentacao);
    } catch (error: any) {
      console.error('Erro ao criar movimentação no caixa:', error);
      // Não interromper o fluxo se falhar a criação da movimentação
    }
  }

  async excluirConta(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
      return;
    }

    try {
      await this.supabase.delete('contas_pagar', id);
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

  novaConta() {
    this.router.navigate(['/financeiro/contas-pagar/novo']);
  }

  editarConta(id: number) {
    this.router.navigate(['/financeiro/contas-pagar/editar', id]);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}
