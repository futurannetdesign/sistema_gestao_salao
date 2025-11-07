import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Fornecedor } from '../../../models/fornecedor.model';

@Component({
  selector: 'app-fornecedor-form',
  templateUrl: './fornecedor-form.component.html',
  styleUrls: ['./fornecedor-form.component.css']
})
export class FornecedorFormComponent implements OnInit {
  fornecedorForm: FormGroup;
  fornecedorId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.fornecedorForm = this.fb.group({
      nome: ['', Validators.required],
      telefone: [''],
      whatsapp: [''],
      email: ['', Validators.email],
      endereco: [''],
      cidade: [''],
      estado: [''],
      cep: [''],
      observacoes: [''],
      ativo: [true]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fornecedorId = +id;
      await this.carregarFornecedor();
    }
  }

  async carregarFornecedor() {
    try {
      this.loading = true;
      const fornecedores = await this.supabase.select('fornecedores', { id: this.fornecedorId });
      if (fornecedores && fornecedores.length > 0) {
        const fornecedor = fornecedores[0] as Fornecedor;
        this.fornecedorForm.patchValue({
          nome: fornecedor.nome,
          telefone: fornecedor.telefone || '',
          whatsapp: fornecedor.whatsapp || '',
          email: fornecedor.email || '',
          endereco: fornecedor.endereco || '',
          cidade: fornecedor.cidade || '',
          estado: fornecedor.estado || '',
          cep: fornecedor.cep || '',
          observacoes: fornecedor.observacoes || '',
          ativo: fornecedor.ativo ?? true
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar fornecedor: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    if (this.fornecedorForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = this.fornecedorForm.value;

      // Remover campos vazios
      Object.keys(dados).forEach(key => {
        if (dados[key] === '' || dados[key] === null) {
          dados[key] = null;
        }
      });

      if (this.fornecedorId) {
        await this.supabase.update('fornecedores', this.fornecedorId, dados);
        this.showAlert('Fornecedor atualizado com sucesso!', 'success');
      } else {
        await this.supabase.insert('fornecedores', dados);
        this.showAlert('Fornecedor cadastrado com sucesso!', 'success');
      }

      setTimeout(() => {
        this.router.navigate(['/fornecedores']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar fornecedor: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/fornecedores']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

