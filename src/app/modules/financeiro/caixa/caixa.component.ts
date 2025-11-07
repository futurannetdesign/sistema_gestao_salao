import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { MovimentacaoCaixa } from '../../../models/financeiro.model';

@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.css']
})
export class CaixaComponent implements OnInit {
  movimentacoes: MovimentacaoCaixa[] = [];
  movimentacoesFiltradas: MovimentacaoCaixa[] = [];
  loading = true;
  dataFiltro = '';
  tipoFiltro = '';
  alertMessage = '';
  alertType = '';
  saldoAtual = 0;
  totalEntradas = 0;
  totalSaidas = 0;
  saldoDia = 0;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const hoje = new Date().toISOString().split('T')[0];
    this.dataFiltro = hoje;
    await this.carregarMovimentacoes();
  }

  async carregarMovimentacoes() {
    try {
      this.loading = true;
      this.movimentacoes = await this.supabase.select('movimentacoes_caixa') as MovimentacaoCaixa[];
      
      this.calcularTotais();
      this.filtrarMovimentacoes();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar movimentações: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  calcularTotais() {
    this.totalEntradas = this.movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);
    
    this.totalSaidas = this.movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);
    
    this.saldoAtual = this.totalEntradas - this.totalSaidas;

    // Calcular saldo do dia
    const hoje = this.dataFiltro || new Date().toISOString().split('T')[0];
    const movimentacoesHoje = this.movimentacoes.filter(m => m.data_movimentacao === hoje);
    const entradasHoje = movimentacoesHoje
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);
    const saidasHoje = movimentacoesHoje
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);
    this.saldoDia = entradasHoje - saidasHoje;
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

  formatarMoeda(valor: number): string {
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

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

