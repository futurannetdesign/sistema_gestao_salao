import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Servico, CATEGORIAS_SERVICOS } from '../../models/servico.model';

@Component({
  selector: 'app-servicos',
  templateUrl: './servicos.component.html',
  styleUrls: ['./servicos.component.css']
})
export class ServicosComponent implements OnInit {
  servicos: Servico[] = [];
  servicosFiltrados: Servico[] = [];
  loading = true;
  searchTerm = '';
  categoriaFiltro = '';
  alertMessage = '';
  alertType = '';
  categorias = CATEGORIAS_SERVICOS;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarServicos();
  }

  async carregarServicos() {
    try {
      this.loading = true;
      this.servicos = await this.supabase.select('servicos') as Servico[];
      this.filtrarServicos();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar serviços: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarServicos() {
    let filtrados = this.servicos;

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(servico =>
        servico.nome.toLowerCase().includes(termo) ||
        servico.categoria.toLowerCase().includes(termo)
      );
    }

    if (this.categoriaFiltro) {
      filtrados = filtrados.filter(servico => servico.categoria === this.categoriaFiltro);
    }

    this.servicosFiltrados = filtrados;
  }

  novoServico() {
    this.router.navigate(['/servicos/novo']);
  }

  editarServico(id: number) {
    this.router.navigate(['/servicos/editar', id]);
  }

  async excluirServico(id: number) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      await this.supabase.update('servicos', id, { ativo: false });
      this.showAlert('Serviço desativado com sucesso!', 'success');
      await this.carregarServicos();
    } catch (error: any) {
      this.showAlert('Erro ao excluir serviço: ' + error.message, 'danger');
    }
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

