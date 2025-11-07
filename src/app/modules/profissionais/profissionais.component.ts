import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Profissional } from '../../models/profissional.model';

@Component({
  selector: 'app-profissionais',
  templateUrl: './profissionais.component.html',
  styleUrls: ['./profissionais.component.css']
})
export class ProfissionaisComponent implements OnInit {
  profissionais: Profissional[] = [];
  profissionaisFiltrados: Profissional[] = [];
  loading = true;
  searchTerm = '';
  alertMessage = '';
  alertType = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarProfissionais();
  }

  async carregarProfissionais() {
    try {
      this.loading = true;
      this.profissionais = await this.supabase.select('profissionais') as Profissional[];
      this.profissionaisFiltrados = this.profissionais;
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar profissionais: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarProfissionais() {
    const termo = this.searchTerm.toLowerCase();
    this.profissionaisFiltrados = this.profissionais.filter(profissional =>
      profissional.nome.toLowerCase().includes(termo) ||
      profissional.celular?.toLowerCase().includes(termo) ||
      profissional.email?.toLowerCase().includes(termo) ||
      profissional.especialidades?.some(esp => esp.toLowerCase().includes(termo))
    );
  }

  novoProfissional() {
    this.router.navigate(['/profissionais/novo']);
  }

  editarProfissional(id: number) {
    this.router.navigate(['/profissionais/editar', id]);
  }

  async excluirProfissional(id: number) {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) {
      return;
    }

    try {
      await this.supabase.update('profissionais', id, { ativo: false });
      this.showAlert('Profissional desativado com sucesso!', 'success');
      await this.carregarProfissionais();
    } catch (error: any) {
      this.showAlert('Erro ao excluir profissional: ' + error.message, 'danger');
    }
  }

  formatarTelefone(telefone: string | undefined): string {
    if (!telefone) return '-';
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  formatarEspecialidades(especialidades: string[] | undefined): string {
    if (!especialidades || especialidades.length === 0) return '-';
    return especialidades.join(', ');
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

