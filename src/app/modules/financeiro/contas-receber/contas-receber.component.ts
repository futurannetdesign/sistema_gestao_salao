import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { PermissaoService } from '../../../services/permissao.service';
import { ContaReceber } from '../../../models/financeiro.model';
import { Cliente } from '../../../models/cliente.model';
import { Agendamento } from '../../../models/agendamento.model';
import { Servico } from '../../../models/servico.model';

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
  periodoFiltro = 'todos'; // dia, semana, mes, todos
  alertMessage = '';
  alertType = '';
  totalPendente = 0;
  totalPago = 0;
  totalVencido = 0;
  podeCriar = false;
  podeEditar = false;
  podeExcluir = false;
  podeMarcarPago = false;
  podeSincronizar = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    public permissaoService: PermissaoService
  ) {}

  async ngOnInit() {
    await this.carregarPermissoes();
    await Promise.all([
      this.carregarContas(),
      this.carregarClientes()
    ]);
    
    // Sincronizar agendamentos existentes automaticamente ao carregar
    await this.sincronizarAgendamentos();
  }

  async carregarPermissoes() {
    this.podeCriar = await this.permissaoService.podeCriar('contas_receber');
    this.podeEditar = await this.permissaoService.podeEditar('contas_receber');
    this.podeExcluir = await this.permissaoService.podeExcluir('contas_receber');
    this.podeMarcarPago = await this.permissaoService.verificarPermissao('contas_receber', 'marcar_pago');
    this.podeSincronizar = await this.permissaoService.verificarPermissao('contas_receber', 'sincronizar');
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
      
      // Atualizar conta a receber
      await this.supabase.update('contas_receber', id, { 
        status: 'pago',
        data_pagamento: hoje
      });

      // Criar movimentação de entrada no caixa
      await this.criarMovimentacaoCaixa(conta, hoje, 'entrada');

      this.showAlert('Conta marcada como paga e movimentação registrada no caixa!', 'success');
      await this.carregarContas();
    } catch (error: any) {
      this.showAlert('Erro ao atualizar conta: ' + error.message, 'danger');
    }
  }

  async criarMovimentacaoCaixa(conta: ContaReceber, dataPagamento: string, tipo: 'entrada' | 'saida') {
    try {
      // Verificar se já existe movimentação para esta conta
      const movimentacoesExistentes = await this.supabase.select('movimentacoes_caixa', { 
        referencia_id: conta.id,
        referencia_tipo: 'conta_receber'
      });

      if (movimentacoesExistentes && movimentacoesExistentes.length > 0) {
        // Atualizar movimentação existente
        await this.supabase.update('movimentacoes_caixa', movimentacoesExistentes[0].id, {
          valor: conta.valor,
          data_movimentacao: dataPagamento,
          forma_pagamento: conta.forma_pagamento || null,
          observacoes: `Pagamento de conta a receber: ${conta.descricao}`
        });
        return;
      }

      // Criar nova movimentação
      const movimentacao = {
        tipo: tipo,
        descricao: `Recebimento: ${conta.descricao}`,
        valor: conta.valor,
        data_movimentacao: dataPagamento,
        forma_pagamento: conta.forma_pagamento || null,
        referencia_id: conta.id,
        referencia_tipo: 'conta_receber',
        observacoes: `Pagamento de conta a receber #${conta.id}`
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

  async sincronizarAgendamentos() {
    try {
      // Buscar todos os agendamentos que têm valor
      const agendamentos = await this.supabase.select('agendamentos') as Agendamento[];
      
      // Buscar todas as contas a receber existentes para verificar quais agendamentos já têm conta
      const contasExistentes = await this.supabase.select('contas_receber') as ContaReceber[];
      const agendamentosComConta = new Set(contasExistentes
        .filter(c => c.agendamento_id)
        .map(c => c.agendamento_id!));
      
      // Buscar serviços e clientes
      const servicos = await this.supabase.select('servicos') as Servico[];
      const clientes = await this.supabase.select('clientes') as Cliente[];
      
      let contasCriadas = 0;
      
      // Criar contas a receber para agendamentos que não têm conta e têm valor
      for (const agendamento of agendamentos) {
        // Pular se já tem conta ou não tem valor
        if (agendamentosComConta.has(agendamento.id!) || !agendamento.valor_cobrado) {
          continue;
        }
        
        // Buscar dados relacionados
        const servico = servicos.find(s => s.id === agendamento.servico_id);
        const cliente = clientes.find(c => c.id === agendamento.cliente_id);
        
        // Data de vencimento: 7 dias após a data do agendamento
        const dataAgendamento = new Date(agendamento.data_hora);
        const dataVencimento = new Date(dataAgendamento);
        dataVencimento.setDate(dataVencimento.getDate() + 7);
        
        const descricao = servico?.nome 
          ? (cliente?.nome ? `${servico.nome} - ${cliente.nome}` : servico.nome)
          : 'Serviço';
        
        // Determinar status e dados de pagamento baseado no agendamento
        let statusConta = 'pendente';
        let dataPagamento = null;
        let formaPagamento = null;
        
        // Se o agendamento está concluído e tem data de pagamento, marcar como pago
        if (agendamento.status === 'concluido' && agendamento.data_pagamento) {
          statusConta = 'pago';
          // Garantir que data_pagamento está no formato correto (YYYY-MM-DD)
          if (typeof agendamento.data_pagamento === 'string') {
            dataPagamento = agendamento.data_pagamento.split('T')[0];
          } else {
            dataPagamento = agendamento.data_pagamento;
          }
          formaPagamento = agendamento.forma_pagamento || null;
        }
        
        const contaReceber = {
          cliente_id: agendamento.cliente_id,
          agendamento_id: agendamento.id,
          descricao: descricao,
          valor: agendamento.valor_cobrado,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: statusConta,
          data_pagamento: dataPagamento,
          forma_pagamento: formaPagamento,
          observacoes: `Gerado automaticamente do agendamento #${agendamento.id}`
        };
        
        await this.supabase.insert('contas_receber', contaReceber);
        contasCriadas++;
      }
      
      // Recarregar contas se foram criadas novas
      if (contasCriadas > 0) {
        await this.carregarContas();
        this.showAlert(`${contasCriadas} conta(s) a receber criada(s) automaticamente!`, 'success');
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar agendamentos:', error);
      // Não mostrar erro ao usuário, apenas logar
    }
  }

  verOrdemServico(agendamentoId: number) {
    this.router.navigate(['/agendamentos/ordem-servico', agendamentoId]);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

