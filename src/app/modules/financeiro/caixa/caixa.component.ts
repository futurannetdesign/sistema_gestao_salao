import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { MovimentacaoCaixa, ContaReceber, ContaPagar } from '../../../models/financeiro.model';

@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.css']
})
export class CaixaComponent implements OnInit {
  movimentacoes: MovimentacaoCaixa[] = [];
  movimentacoesFiltradas: MovimentacaoCaixa[] = [];
  contasReceber: ContaReceber[] = [];
  contasPagar: ContaPagar[] = [];
  loading = true;
  dataFiltro = '';
  tipoFiltro = '';
  alertMessage = '';
  alertType = '';
  saldoAtual = 0;
  totalEntradas = 0;
  totalSaidas = 0;
  saldoDia = 0;
  
  // Resumo Contas a Receber
  totalReceberPendente = 0;
  totalReceberPago = 0;
  totalReceberVencido = 0;
  
  // Resumo Contas a Pagar
  totalPagarPendente = 0;
  totalPagarPago = 0;
  totalPagarVencido = 0;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const hoje = new Date().toISOString().split('T')[0];
    this.dataFiltro = hoje;
    // Inicializar valores para evitar undefined
    this.saldoAtual = 0;
    this.totalEntradas = 0;
    this.totalSaidas = 0;
    this.saldoDia = 0;
    
    await Promise.all([
      this.carregarMovimentacoes(),
      this.carregarContasReceber(),
      this.carregarContasPagar()
    ]);
    // Sincronizar automaticamente após carregar todos os dados
    await this.sincronizarContasComCaixa();
    // Recalcular totais após sincronização
    this.calcularTotais();
  }

  async carregarMovimentacoes() {
    try {
      this.movimentacoes = await this.supabase.select('movimentacoes_caixa') as MovimentacaoCaixa[];
      // Garantir que movimentacoes é um array válido
      if (!this.movimentacoes) {
        this.movimentacoes = [];
      }
      this.calcularTotais();
      this.filtrarMovimentacoes();
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error);
      this.movimentacoes = [];
      this.calcularTotais();
    }
  }

  async carregarContasReceber() {
    try {
      this.contasReceber = await this.supabase.select('contas_receber') as ContaReceber[];
      this.calcularResumoContasReceber();
    } catch (error: any) {
      console.error('Erro ao carregar contas a receber:', error);
    }
  }

  async carregarContasPagar() {
    try {
      this.contasPagar = await this.supabase.select('contas_pagar') as ContaPagar[];
      this.calcularResumoContasPagar();
      this.loading = false;
    } catch (error: any) {
      console.error('Erro ao carregar contas a pagar:', error);
      this.loading = false;
    }
  }

  calcularTotais() {
    // Garantir que movimentacoes é um array válido
    if (!this.movimentacoes || this.movimentacoes.length === 0) {
      this.totalEntradas = 0;
      this.totalSaidas = 0;
      this.saldoAtual = 0;
      this.saldoDia = 0;
      console.log('calcularTotais: Nenhuma movimentação encontrada');
      return;
    }

    // Calcular totais de todas as movimentações (saldo atual)
    this.totalEntradas = this.movimentacoes
      .filter(m => m && m.tipo === 'entrada' && m.valor != null)
      .reduce((sum, m) => {
        const valor = Number(m.valor) || 0;
        return sum + valor;
      }, 0);
    
    this.totalSaidas = this.movimentacoes
      .filter(m => m && m.tipo === 'saida' && m.valor != null)
      .reduce((sum, m) => {
        const valor = Number(m.valor) || 0;
        return sum + valor;
      }, 0);
    
    this.saldoAtual = this.totalEntradas - this.totalSaidas;

    console.log('calcularTotais:', {
      totalMovimentacoes: this.movimentacoes.length,
      totalEntradas: this.totalEntradas,
      totalSaidas: this.totalSaidas,
      saldoAtual: this.saldoAtual
    });

    // Calcular saldo do dia
    const hoje = this.dataFiltro || new Date().toISOString().split('T')[0];
    const movimentacoesHoje = this.movimentacoes.filter(m => m && m.data_movimentacao === hoje);
    const entradasHoje = movimentacoesHoje
      .filter(m => m.tipo === 'entrada' && m.valor != null)
      .reduce((sum, m) => {
        const valor = Number(m.valor) || 0;
        return sum + valor;
      }, 0);
    const saidasHoje = movimentacoesHoje
      .filter(m => m.tipo === 'saida' && m.valor != null)
      .reduce((sum, m) => {
        const valor = Number(m.valor) || 0;
        return sum + valor;
      }, 0);
    this.saldoDia = entradasHoje - saidasHoje;

    console.log('calcularTotais - Saldo do Dia:', {
      dataFiltro: hoje,
      movimentacoesHoje: movimentacoesHoje.length,
      entradasHoje: entradasHoje,
      saidasHoje: saidasHoje,
      saldoDia: this.saldoDia
    });
  }

  calcularResumoContasReceber() {
    this.totalReceberPendente = this.contasReceber
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.valor, 0);
    
    this.totalReceberPago = this.contasReceber
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + c.valor, 0);
    
    this.totalReceberVencido = this.contasReceber
      .filter(c => c.status === 'vencido')
      .reduce((sum, c) => sum + c.valor, 0);
  }

  calcularResumoContasPagar() {
    this.totalPagarPendente = this.contasPagar
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.valor, 0);
    
    this.totalPagarPago = this.contasPagar
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + c.valor, 0);
    
    this.totalPagarVencido = this.contasPagar
      .filter(c => c.status === 'vencido')
      .reduce((sum, c) => sum + c.valor, 0);
  }

  filtrarMovimentacoes() {
    let filtradas = this.movimentacoes;

    if (this.dataFiltro) {
      filtradas = filtradas.filter(m => m.data_movimentacao === this.dataFiltro);
    }

    if (this.tipoFiltro) {
      filtradas = filtradas.filter(m => m.tipo === this.tipoFiltro);
    }

    this.movimentacoesFiltradas = filtradas.sort((a, b) => 
      new Date(b.data_movimentacao + 'T' + (b.created_at?.split('T')[1] || '00:00:00')).getTime() - 
      new Date(a.data_movimentacao + 'T' + (a.created_at?.split('T')[1] || '00:00:00')).getTime()
    );
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarMoeda(valor: number | undefined | null): string {
    if (valor === undefined || valor === null || isNaN(valor)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  getTipoBadgeClass(tipo: string): string {
    return tipo === 'entrada' ? 'badge-success' : 'badge-danger';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'entrada' ? 'Entrada' : 'Saída';
  }

  verContaRelacionada(movimentacao: MovimentacaoCaixa) {
    if (movimentacao.referencia_tipo === 'conta_receber' && movimentacao.referencia_id) {
      this.router.navigate(['/financeiro/contas-receber']);
    } else if (movimentacao.referencia_tipo === 'conta_pagar' && movimentacao.referencia_id) {
      this.router.navigate(['/financeiro/contas-pagar']);
    }
  }

  novaContaReceber() {
    this.router.navigate(['/financeiro/contas-receber']);
  }

  novaContaPagar() {
    this.router.navigate(['/financeiro/contas-pagar/novo']);
  }

  verContasReceber() {
    this.router.navigate(['/financeiro/contas-receber']);
  }

  verContasPagar() {
    this.router.navigate(['/financeiro/contas-pagar']);
  }

  async sincronizarContasComCaixa() {
    try {
      // Recarregar todas as contas e movimentações para garantir dados atualizados
      await Promise.all([
        this.carregarContasReceber(),
        this.carregarContasPagar(),
        this.carregarMovimentacoes()
      ]);

      let movimentacoesCriadas = 0;

      // Sincronizar Contas a Receber pagas
      const contasReceberPagas = this.contasReceber.filter(c => c.status === 'pago' && c.data_pagamento);
      
      for (const conta of contasReceberPagas) {
        // Verificar se já existe movimentação para esta conta no banco
        const movimentacoesExistentes = await this.supabase.select('movimentacoes_caixa', {
          referencia_id: conta.id,
          referencia_tipo: 'conta_receber'
        }) as MovimentacaoCaixa[];

        if ((!movimentacoesExistentes || movimentacoesExistentes.length === 0) && conta.id) {
          // Garantir que data_pagamento está no formato correto
          let dataPagamento = conta.data_pagamento;
          if (typeof dataPagamento === 'string' && dataPagamento.includes('T')) {
            dataPagamento = dataPagamento.split('T')[0];
          }

          // Criar movimentação de entrada
          const movimentacao = {
            tipo: 'entrada',
            descricao: `Recebimento: ${conta.descricao}`,
            valor: conta.valor,
            data_movimentacao: dataPagamento,
            forma_pagamento: conta.forma_pagamento || null,
            referencia_id: conta.id,
            referencia_tipo: 'conta_receber',
            observacoes: `Pagamento de conta a receber #${conta.id}`
          };

          await this.supabase.insert('movimentacoes_caixa', movimentacao);
          movimentacoesCriadas++;
        }
      }

      // Sincronizar Contas a Pagar pagas
      const contasPagarPagas = this.contasPagar.filter(c => c.status === 'pago' && c.data_pagamento);
      
      for (const conta of contasPagarPagas) {
        // Verificar se já existe movimentação para esta conta no banco
        const movimentacoesExistentes = await this.supabase.select('movimentacoes_caixa', {
          referencia_id: conta.id,
          referencia_tipo: 'conta_pagar'
        }) as MovimentacaoCaixa[];

        if ((!movimentacoesExistentes || movimentacoesExistentes.length === 0) && conta.id) {
          // Garantir que data_pagamento está no formato correto
          let dataPagamento = conta.data_pagamento;
          if (typeof dataPagamento === 'string' && dataPagamento.includes('T')) {
            dataPagamento = dataPagamento.split('T')[0];
          }

          // Criar movimentação de saída
          const movimentacao = {
            tipo: 'saida',
            descricao: `Pagamento: ${conta.descricao}`,
            valor: conta.valor,
            data_movimentacao: dataPagamento,
            forma_pagamento: conta.forma_pagamento || null,
            referencia_id: conta.id,
            referencia_tipo: 'conta_pagar',
            observacoes: `Pagamento de conta a pagar #${conta.id} - ${conta.categoria}`
          };

          await this.supabase.insert('movimentacoes_caixa', movimentacao);
          movimentacoesCriadas++;
        }
      }

      // Recarregar movimentações e recalcular totais após sincronização
      if (movimentacoesCriadas > 0) {
        await this.carregarMovimentacoes();
        // Recalcular totais após sincronização
        this.calcularTotais();
        this.showAlert(`${movimentacoesCriadas} movimentação(ões) sincronizada(s) automaticamente!`, 'success');
      } else {
        // Sempre recalcular totais mesmo se não houver novas movimentações
        this.calcularTotais();
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar contas com caixa:', error);
      // Não mostrar erro ao usuário para não interromper o fluxo
    }
  }

  async sincronizarManual() {
    try {
      this.loading = true;
      await this.sincronizarContasComCaixa();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao sincronizar: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  temReferencia(movimentacao: MovimentacaoCaixa): boolean {
    return !!(movimentacao.referencia_id && 
      (movimentacao.referencia_tipo === 'conta_receber' || movimentacao.referencia_tipo === 'conta_pagar'));
  }

  getReferenciaLabel(movimentacao: MovimentacaoCaixa): string {
    if (movimentacao.referencia_tipo === 'conta_receber') {
      return '📥 Conta a Receber';
    } else if (movimentacao.referencia_tipo === 'conta_pagar') {
      return '📤 Conta a Pagar';
    }
    return '';
  }

  async excluirMovimentacao(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) {
      return;
    }

    try {
      this.loading = true;
      await this.supabase.delete('movimentacoes_caixa', id);
      this.showAlert('Movimentação excluída com sucesso!', 'success');
      await this.carregarMovimentacoes();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao excluir movimentação: ' + error.message, 'danger');
      this.loading = false;
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

