import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Servico, CATEGORIAS_SERVICOS } from '../../../models/servico.model';

@Component({
  selector: 'app-servico-form',
  templateUrl: './servico-form.component.html',
  styleUrls: ['./servico-form.component.css']
})
export class ServicoFormComponent implements OnInit {
  servicoForm: FormGroup;
  servicoId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';
  categorias = CATEGORIAS_SERVICOS;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.servicoForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      valor_padrao: ['', [Validators.required, Validators.min(0)]],
      duracao_estimada: ['', [Validators.required, Validators.min(1)]],
      observacoes: [''],
      ativo: [true]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicoId = +id;
      await this.carregarServico();
    }
  }

  async carregarServico() {
    try {
      this.loading = true;
      const servicos = await this.supabase.select('servicos', { id: this.servicoId });
      if (servicos && servicos.length > 0) {
        const servico = servicos[0] as Servico;
        this.servicoForm.patchValue({
          nome: servico.nome,
          categoria: servico.categoria,
          valor_padrao: servico.valor_padrao,
          duracao_estimada: servico.duracao_estimada,
          observacoes: servico.observacoes || '',
          ativo: servico.ativo !== false
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar serviço: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    if (this.servicoForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = this.servicoForm.value;
      dados.valor_padrao = parseFloat(dados.valor_padrao);
      dados.duracao_estimada = parseInt(dados.duracao_estimada);

      if (this.servicoId) {
        await this.supabase.update('servicos', this.servicoId, dados);
        this.showAlert('Serviço atualizado com sucesso!', 'success');
      } else {
        await this.supabase.insert('servicos', dados);
        this.showAlert('Serviço cadastrado com sucesso!', 'success');
      }

      setTimeout(() => {
        this.router.navigate(['/servicos']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar serviço: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/servicos']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

