import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Profissional, ESPECIALIDADES } from '../../../models/profissional.model';

@Component({
  selector: 'app-profissional-form',
  templateUrl: './profissional-form.component.html',
  styleUrls: ['./profissional-form.component.css']
})
export class ProfissionalFormComponent implements OnInit {
  profissionalForm: FormGroup;
  profissionalId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';
  especialidades = ESPECIALIDADES;
  especialidadesSelecionadas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.profissionalForm = this.fb.group({
      nome: ['', Validators.required],
      celular: [''],
      email: ['', Validators.email],
      ativo: [true]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.profissionalId = +id;
      await this.carregarProfissional();
    }
  }

  async carregarProfissional() {
    try {
      this.loading = true;
      const profissionais = await this.supabase.select('profissionais', { id: this.profissionalId });
      if (profissionais && profissionais.length > 0) {
        const profissional = profissionais[0] as Profissional;
        this.especialidadesSelecionadas = profissional.especialidades || [];
        this.profissionalForm.patchValue({
          nome: profissional.nome,
          celular: profissional.celular || '',
          email: profissional.email || '',
          ativo: profissional.ativo !== false
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar profissional: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  toggleEspecialidade(especialidade: string) {
    const index = this.especialidadesSelecionadas.indexOf(especialidade);
    if (index > -1) {
      this.especialidadesSelecionadas.splice(index, 1);
    } else {
      this.especialidadesSelecionadas.push(especialidade);
    }
  }

  isEspecialidadeSelecionada(especialidade: string): boolean {
    return this.especialidadesSelecionadas.includes(especialidade);
  }

  async salvar() {
    if (this.profissionalForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = {
        ...this.profissionalForm.value,
        especialidades: this.especialidadesSelecionadas
      };

      if (this.profissionalId) {
        await this.supabase.update('profissionais', this.profissionalId, dados);
        this.showAlert('Profissional atualizado com sucesso!', 'success');
      } else {
        await this.supabase.insert('profissionais', dados);
        this.showAlert('Profissional cadastrado com sucesso!', 'success');
      }

      setTimeout(() => {
        this.router.navigate(['/profissionais']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar profissional: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/profissionais']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

