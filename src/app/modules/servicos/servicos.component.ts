import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { PermissaoService } from '../../services/permissao.service';
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
  podeCriar = false;
  podeEditar = false;
  podeExcluir = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    public permissaoService: PermissaoService
  ) {}

  async ngOnInit() {
    await this.carregarPermissoes();
    await this.carregarServicos();
  }

  async carregarPermissoes() {
    this.podeCriar = await this.permissaoService.podeCriar('servicos');
    this.podeEditar = await this.permissaoService.podeEditar('servicos');
    this.podeExcluir = await this.permissaoService.podeExcluir('servicos');
  }

  async carregarServicos() {
    try {
      this.loading = true;
      this.servicos = await this.supabase.select('servicos') as Servico[];
      // Garantir que valor_padrao está presente
      this.servicos.forEach(servico => {
        if (!servico.valor_padrao && servico.valor_padrao !== 0) {
          console.warn(`Serviço ${servico.id} (${servico.nome}) não tem valor_padrao definido`);
        }
      });
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
    try {
      // Verificar se há agendamentos vinculados
      const agendamentos = await this.supabase.select('agendamentos', { servico_id: id }) as any[];
      
      if (agendamentos && agendamentos.length > 0) {
        const mensagem = `Não é possível desativar este serviço pois existem ${agendamentos.length} agendamento(s) vinculado(s) a ele.\n\nPara desativar, primeiro é necessário excluir ou cancelar todos os agendamentos relacionados.`;
        alert(mensagem);
        return;
      }

      if (!confirm('Tem certeza que deseja desativar este serviço?')) {
        return;
      }

      await this.supabase.update('servicos', id, { ativo: false });
      this.showAlert('Serviço desativado com sucesso!', 'success');
      await this.carregarServicos();
    } catch (error: any) {
      this.showAlert('Erro ao desativar serviço: ' + error.message, 'danger');
    }
  }

  formatarMoeda(valor: number | undefined | null): string {
    if (!valor && valor !== 0) return 'R$ 0,00';
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

