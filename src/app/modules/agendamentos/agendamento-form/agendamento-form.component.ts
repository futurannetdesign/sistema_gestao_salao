import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Agendamento } from '../../../models/agendamento.model';
import { Profissional } from '../../../models/profissional.model';
import { Cliente } from '../../../models/cliente.model';
import { Servico } from '../../../models/servico.model';

@Component({
  selector: 'app-agendamento-form',
  templateUrl: './agendamento-form.component.html',
  styleUrls: ['./agendamento-form.component.css']
})
export class AgendamentoFormComponent implements OnInit {
  agendamentoForm: FormGroup;
  agendamentoId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';
  clientes: Cliente[] = [];
  servicos: Servico[] = [];
  profissionais: Profissional[] = [];

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.agendamentoForm = this.fb.group({
      cliente_id: ['', Validators.required],
      servico_id: ['', Validators.required],
      profissional_id: [''],
      data_hora: ['', Validators.required],
      status: ['agendado'],
      observacoes: [''],
      valor_cobrado: ['', [Validators.required, Validators.min(0)]],
      data_pagamento: [''],
      forma_pagamento: ['']
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.carregarClientes(),
      this.carregarServicos(),
      this.carregarProfissionais()
    ]);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.agendamentoId = +id;
      await this.carregarAgendamento();
    }
  }

  async carregarClientes() {
    try {
      this.clientes = await this.supabase.select('clientes') as Cliente[];
    } catch (error: any) {
      this.showAlert('Erro ao carregar clientes: ' + error.message, 'danger');
    }
  }

  async carregarServicos() {
    try {
      this.servicos = await this.supabase.select('servicos', { ativo: true }) as Servico[];
    } catch (error: any) {
      this.showAlert('Erro ao carregar serviços: ' + error.message, 'danger');
    }
  }

  async carregarProfissionais() {
    try {
      this.profissionais = await this.supabase.select('profissionais', { ativo: true }) as Profissional[];
    } catch (error: any) {
      this.showAlert('Erro ao carregar profissionais: ' + error.message, 'danger');
    }
  }

  async carregarAgendamento() {
    try {
      this.loading = true;
      const agendamentos = await this.supabase.select('agendamentos', { id: this.agendamentoId });
      if (agendamentos && agendamentos.length > 0) {
        const agendamento = agendamentos[0] as Agendamento;
        
        // Formatar data_hora para o input datetime-local
        const dataHora = new Date(agendamento.data_hora);
        const dataHoraFormatada = new Date(dataHora.getTime() - dataHora.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);

        // Formatar data_pagamento se existir
        let dataPagamentoFormatada = '';
        if (agendamento.data_pagamento) {
          const dataPagamento = new Date(agendamento.data_pagamento);
          dataPagamentoFormatada = dataPagamento.toISOString().split('T')[0];
        }

        this.agendamentoForm.patchValue({
          cliente_id: agendamento.cliente_id,
          servico_id: agendamento.servico_id,
          profissional_id: agendamento.profissional_id || '',
          data_hora: dataHoraFormatada,
          status: agendamento.status,
          observacoes: agendamento.observacoes || '',
          valor_cobrado: agendamento.valor_cobrado || '',
          data_pagamento: dataPagamentoFormatada,
          forma_pagamento: agendamento.forma_pagamento || ''
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar agendamento: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  onServicoChange() {
    const servicoId = this.agendamentoForm.get('servico_id')?.value;
    const servico = this.servicos.find(s => s.id === servicoId);
    if (servico && servico.valor_padrao) {
      // Sempre preencher o valor do serviço quando selecionar
      this.agendamentoForm.patchValue({ valor_cobrado: servico.valor_padrao });
    }
  }
  
  getServicoSelecionado(): Servico | undefined {
    const servicoId = this.agendamentoForm.get('servico_id')?.value;
    return this.servicos.find(s => s.id === servicoId);
  }
  
  formatarMoeda(valor: number | undefined): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  async salvar() {
    if (this.agendamentoForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = this.agendamentoForm.value;
      
      // Converter data_hora para formato ISO
      if (dados.data_hora) {
        dados.data_hora = new Date(dados.data_hora).toISOString();
      }

      // Converter valor_cobrado para número
      if (dados.valor_cobrado) {
        dados.valor_cobrado = parseFloat(dados.valor_cobrado);
      }

      // Remover profissional_id se vazio
      if (!dados.profissional_id) {
        dados.profissional_id = null;
      }

      // Processar data_pagamento e forma_pagamento
      if (dados.status === 'concluido' && dados.data_pagamento) {
        // Garantir que data_pagamento está no formato correto (YYYY-MM-DD)
        if (typeof dados.data_pagamento === 'string') {
          dados.data_pagamento = dados.data_pagamento.split('T')[0];
        }
      } else {
        dados.data_pagamento = null;
      }
      
      if (dados.status !== 'concluido' || !dados.forma_pagamento) {
        dados.forma_pagamento = null;
      }

      let agendamentoId: number;

      if (this.agendamentoId) {
        await this.supabase.update('agendamentos', this.agendamentoId, dados);
        agendamentoId = this.agendamentoId;
        this.showAlert('Agendamento atualizado com sucesso!', 'success');
      } else {
        const resultado = await this.supabase.insert('agendamentos', dados) as any;
        agendamentoId = resultado.id;
        this.showAlert('Agendamento cadastrado com sucesso!', 'success');
      }

      // Criar conta a receber automaticamente
      await this.criarContaReceber(agendamentoId, dados);

      setTimeout(() => {
        this.router.navigate(['/agendamentos']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar agendamento: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async criarContaReceber(agendamentoId: number, dadosAgendamento: any) {
    try {
      // Verificar se já existe uma conta a receber para este agendamento
      const contasExistentes = await this.supabase.select('contas_receber', { agendamento_id: agendamentoId });
      
      if (contasExistentes && contasExistentes.length > 0) {
        // Atualizar conta existente se o valor mudou ou se o status mudou
        const contaExistente = contasExistentes[0] as any;
        
        // Determinar status e dados de pagamento baseado no agendamento
        let statusConta = 'pendente';
        let dataPagamento = null;
        let formaPagamento = null;
        
        // Se o agendamento está concluído e tem data de pagamento, marcar como pago
        if (dadosAgendamento.status === 'concluido' && dadosAgendamento.data_pagamento) {
          statusConta = 'pago';
          // Garantir que data_pagamento está no formato correto (YYYY-MM-DD)
          if (typeof dadosAgendamento.data_pagamento === 'string') {
            dataPagamento = dadosAgendamento.data_pagamento.split('T')[0];
          } else {
            dataPagamento = dadosAgendamento.data_pagamento;
          }
          formaPagamento = dadosAgendamento.forma_pagamento || null;
        }
        
        const dadosAtualizacao: any = {
          valor: dadosAgendamento.valor_cobrado,
          descricao: this.getDescricaoConta(dadosAgendamento)
        };
        
        // Atualizar status e dados de pagamento se mudaram
        if (contaExistente.status !== statusConta) {
          dadosAtualizacao.status = statusConta;
        }
        if (contaExistente.data_pagamento !== dataPagamento) {
          dadosAtualizacao.data_pagamento = dataPagamento;
        }
        if (contaExistente.forma_pagamento !== formaPagamento) {
          dadosAtualizacao.forma_pagamento = formaPagamento;
        }
        
        await this.supabase.update('contas_receber', contaExistente.id, dadosAtualizacao);
        return;
      }

      // Buscar dados do serviço para descrição
      const servico = this.servicos.find(s => s.id === dadosAgendamento.servico_id);
      const cliente = this.clientes.find(c => c.id === dadosAgendamento.cliente_id);
      
      // Data de vencimento: mesma data do agendamento ou data futura (ex: 7 dias)
      const dataAgendamento = new Date(dadosAgendamento.data_hora);
      const dataVencimento = new Date(dataAgendamento);
      dataVencimento.setDate(dataVencimento.getDate() + 7); // 7 dias após o agendamento

      // Determinar status e dados de pagamento baseado no agendamento
      let statusConta = 'pendente';
      let dataPagamento = null;
      let formaPagamento = null;
      
      // Se o agendamento está concluído e tem data de pagamento, marcar como pago
      if (dadosAgendamento.status === 'concluido' && dadosAgendamento.data_pagamento) {
        statusConta = 'pago';
        dataPagamento = dadosAgendamento.data_pagamento;
        formaPagamento = dadosAgendamento.forma_pagamento || null;
      }

      const contaReceber = {
        cliente_id: dadosAgendamento.cliente_id,
        agendamento_id: agendamentoId,
        descricao: this.getDescricaoConta(dadosAgendamento, servico, cliente),
        valor: dadosAgendamento.valor_cobrado,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status: statusConta,
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        observacoes: `Gerado automaticamente do agendamento #${agendamentoId}`
      };

      await this.supabase.insert('contas_receber', contaReceber);
    } catch (error: any) {
      console.error('Erro ao criar conta a receber:', error);
      // Não interromper o fluxo se falhar a criação da conta
    }
  }

  getDescricaoConta(dadosAgendamento: any, servico?: Servico, cliente?: Cliente): string {
    const servicoNome = servico?.nome || 'Serviço';
    const clienteNome = cliente?.nome || '';
    
    if (clienteNome) {
      return `${servicoNome} - ${clienteNome}`;
    }
    return servicoNome;
  }

  cancelar() {
    this.router.navigate(['/agendamentos']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

