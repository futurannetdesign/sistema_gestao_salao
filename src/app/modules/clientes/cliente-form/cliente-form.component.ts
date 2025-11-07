import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  clienteId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', Validators.required],
      celular: [''],
      whatsapp: [''],
      sexo: [''],
      observacoes: ['']
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = +id;
      await this.carregarCliente();
    }
  }

  async carregarCliente() {
    try {
      this.loading = true;
      const clientes = await this.supabase.select('clientes', { id: this.clienteId });
      if (clientes && clientes.length > 0) {
        const cliente = clientes[0] as Cliente;
        this.clienteForm.patchValue({
          nome: cliente.nome,
          celular: cliente.celular || '',
          whatsapp: cliente.whatsapp || '',
          sexo: cliente.sexo || '',
          observacoes: cliente.observacoes || ''
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar cliente: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    if (this.clienteForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = this.clienteForm.value;

      if (this.clienteId) {
        await this.supabase.update('clientes', this.clienteId, dados);
        this.showAlert('Cliente atualizado com sucesso!', 'success');
      } else {
        await this.supabase.insert('clientes', dados);
        this.showAlert('Cliente cadastrado com sucesso!', 'success');
      }

      setTimeout(() => {
        this.router.navigate(['/clientes']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar cliente: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

