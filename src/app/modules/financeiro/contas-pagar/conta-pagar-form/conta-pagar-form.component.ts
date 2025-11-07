import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { ContaPagar } from '../../../../models/financeiro.model';

@Component({
  selector: 'app-conta-pagar-form',
  templateUrl: './conta-pagar-form.component.html',
  styleUrls: ['./conta-pagar-form.component.css']
})
export class ContaPagarFormComponent implements OnInit {
  contaForm: FormGroup;
  contaId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';
  categorias = ['Aluguel', 'Água', 'Luz', 'Produtos', 'Salários', 'Outros'];
  formasPagamento = ['dinheiro', 'cartao', 'pix', 'transferencia'];

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.contaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      data_vencimento: ['', Validators.required],
      categoria: ['', Validators.required],
      forma_pagamento: [''],
      data_pagamento: [''],
      status: ['pendente'],
      observacoes: ['']
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contaId = +id;
      await this.carregarConta();
    }
  }

  async carregarConta() {
    try {
      this.loading = true;
      const contas = await this.supabase.select('contas_pagar', { id: this.contaId });
      if (contas && contas.length > 0) {
        const conta = contas[0] as ContaPagar;
        
        // Formatar datas para os inputs
        const dataVencimento = conta.data_vencimento ? new Date(conta.data_vencimento).toISOString().split('T')[0] : '';
        const dataPagamento = conta.data_pagamento ? new Date(conta.data_pagamento).toISOString().split('T')[0] : '';

        this.contaForm.patchValue({
          descricao: conta.descricao,
          valor: conta.valor,
          data_vencimento: dataVencimento,
          categoria: conta.categoria,
          forma_pagamento: conta.forma_pagamento || '',
          data_pagamento: dataPagamento,
          status: conta.status,
          observacoes: conta.observacoes || ''
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar conta: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    if (this.contaForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = this.contaForm.value;
      
      // Processar data_pagamento
      if (dados.status === 'pago' && dados.data_pagamento) {
        dados.data_pagamento = dados.data_pagamento.split('T')[0];
      } else {
        dados.data_pagamento = null;
      }
      
      // Remover forma_pagamento se não houver data de pagamento
      if (!dados.data_pagamento) {
        dados.forma_pagamento = null;
      }

      // Converter valor para número
      if (dados.valor) {
        dados.valor = parseFloat(dados.valor);
      }

      // Formatar data_vencimento
      if (dados.data_vencimento) {
        dados.data_vencimento = dados.data_vencimento.split('T')[0];
      }

      let contaId: number;
      
      if (this.contaId) {
        await this.supabase.update('contas_pagar', this.contaId, dados);
        contaId = this.contaId;
        this.showAlert('Conta atualizada com sucesso!', 'success');
      } else {
        const resultado = await this.supabase.insert('contas_pagar', dados) as any;
        contaId = resultado.id;
        this.showAlert('Conta cadastrada com sucesso!', 'success');
      }

      // Se a conta foi salva como paga, criar movimentação no caixa
      if (dados.status === 'pago' && dados.data_pagamento) {
        await this.criarMovimentacaoCaixa(contaId, dados);
      }

      setTimeout(() => {
        this.router.navigate(['/financeiro/contas-pagar']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar conta: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async criarMovimentacaoCaixa(contaId: number, dados: any) {
    try {
      // Verificar se já existe movimentação para esta conta
      const movimentacoesExistentes = await this.supabase.select('movimentacoes_caixa', { 
        referencia_id: contaId,
        referencia_tipo: 'conta_pagar'
      });

      if (movimentacoesExistentes && movimentacoesExistentes.length > 0) {
        // Atualizar movimentação existente
        await this.supabase.update('movimentacoes_caixa', movimentacoesExistentes[0].id, {
          valor: dados.valor,
          data_movimentacao: dados.data_pagamento,
          forma_pagamento: dados.forma_pagamento || null,
          observacoes: `Pagamento de conta a pagar: ${dados.descricao}`
        });
        return;
      }

      // Criar nova movimentação
      const movimentacao = {
        tipo: 'saida',
        descricao: `Pagamento: ${dados.descricao}`,
        valor: dados.valor,
        data_movimentacao: dados.data_pagamento,
        forma_pagamento: dados.forma_pagamento || null,
        referencia_id: contaId,
        referencia_tipo: 'conta_pagar',
        observacoes: `Pagamento de conta a pagar #${contaId} - ${dados.categoria}`
      };

      await this.supabase.insert('movimentacoes_caixa', movimentacao);
    } catch (error: any) {
      console.error('Erro ao criar movimentação no caixa:', error);
      // Não interromper o fluxo se falhar a criação da movimentação
    }
  }

  cancelar() {
    this.router.navigate(['/financeiro/contas-pagar']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

