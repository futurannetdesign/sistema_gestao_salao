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
      valor_cobrado: ['', [Validators.required, Validators.min(0)]]
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

        this.agendamentoForm.patchValue({
          cliente_id: agendamento.cliente_id,
          servico_id: agendamento.servico_id,
          profissional_id: agendamento.profissional_id || '',
          data_hora: dataHoraFormatada,
          status: agendamento.status,
          observacoes: agendamento.observacoes || '',
          valor_cobrado: agendamento.valor_cobrado || ''
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

      if (this.agendamentoId) {
        await this.supabase.update('agendamentos', this.agendamentoId, dados);
        this.showAlert('Agendamento atualizado com sucesso!', 'success');
      } else {
        await this.supabase.insert('agendamentos', dados);
        this.showAlert('Agendamento cadastrado com sucesso!', 'success');
      }

      setTimeout(() => {
        this.router.navigate(['/agendamentos']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar agendamento: ' + error.message, 'danger');
      this.loading = false;
    }
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

