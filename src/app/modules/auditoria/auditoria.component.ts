import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Auditoria, ACOES_AUDITORIA } from '../../models/auditoria.model';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  auditorias: Auditoria[] = [];
  auditoriasFiltradas: Auditoria[] = [];
  loading = true;
  searchTerm = '';
  acaoFiltro = '';
  tabelaFiltro = '';
  dataInicioFiltro = '';
  dataFimFiltro = '';
  alertMessage = '';
  alertType = '';

  acoes = ACOES_AUDITORIA;
  tabelas = ['clientes', 'servicos', 'agendamentos', 'contas_receber', 'contas_pagar', 'produtos', 'profissionais', 'usuarios'];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.carregarAuditorias();
  }

  async carregarAuditorias() {
    try {
      this.loading = true;
      this.auditorias = await this.supabase.select('auditoria') as Auditoria[];
      
      // Carregar dados de usuários relacionados
      for (const auditoria of this.auditorias) {
        if (auditoria.usuario_id) {
          const usuarios = await this.supabase.select('usuarios', { id: auditoria.usuario_id });
          if (usuarios && usuarios.length > 0) {
            auditoria.usuario = usuarios[0] as any;
          }
        }
      }
      
      this.filtrarAuditorias();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar auditoria: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarAuditorias() {
    let filtradas = [...this.auditorias];

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(auditoria =>
        auditoria.acao.toLowerCase().includes(termo) ||
        auditoria.tabela.toLowerCase().includes(termo) ||
        auditoria.usuario?.nome?.toLowerCase().includes(termo) ||
        auditoria.observacoes?.toLowerCase().includes(termo)
      );
    }

    if (this.acaoFiltro) {
      filtradas = filtradas.filter(auditoria => auditoria.acao === this.acaoFiltro);
    }

    if (this.tabelaFiltro) {
      filtradas = filtradas.filter(auditoria => auditoria.tabela === this.tabelaFiltro);
    }

    if (this.dataInicioFiltro) {
      filtradas = filtradas.filter(auditoria => {
        if (!auditoria.created_at) return false;
        return new Date(auditoria.created_at) >= new Date(this.dataInicioFiltro);
      });
    }

    if (this.dataFimFiltro) {
      filtradas = filtradas.filter(auditoria => {
        if (!auditoria.created_at) return false;
        const dataFim = new Date(this.dataFimFiltro);
        dataFim.setHours(23, 59, 59, 999);
        return new Date(auditoria.created_at) <= dataFim;
      });
    }

    this.auditoriasFiltradas = filtradas.sort((a, b) => {
      const dataA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dataB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dataB - dataA; // Mais recente primeiro
    });
  }

  formatarDataHora(dataHora: string | undefined): string {
    if (!dataHora) return '-';
    return new Date(dataHora).toLocaleString('pt-BR');
  }

  getAcaoLabel(acao: string): string {
    const labels: any = {
      'criar': 'Criar',
      'editar': 'Editar',
      'excluir': 'Excluir',
      'visualizar': 'Visualizar',
      'exportar': 'Exportar',
      'imprimir': 'Imprimir',
      'login': 'Login',
      'logout': 'Logout',
      'atualizar_status': 'Atualizar Status'
    };
    return labels[acao] || acao;
  }

  getAcaoBadgeClass(acao: string): string {
    switch (acao) {
      case 'criar':
        return 'badge-success';
      case 'editar':
        return 'badge-info';
      case 'excluir':
        return 'badge-danger';
      case 'exportar':
      case 'imprimir':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }

  verDetalhes(auditoria: Auditoria) {
    let detalhes = `Ação: ${this.getAcaoLabel(auditoria.acao)}\n`;
    detalhes += `Tabela: ${auditoria.tabela}\n`;
    detalhes += `Registro ID: ${auditoria.registro_id || 'N/A'}\n`;
    detalhes += `Data/Hora: ${this.formatarDataHora(auditoria.created_at)}\n`;
    if (auditoria.usuario) {
      detalhes += `Usuário: ${auditoria.usuario.nome} (${auditoria.usuario.email})\n`;
    }
    if (auditoria.observacoes) {
      detalhes += `Observações: ${auditoria.observacoes}\n`;
    }
    if (auditoria.dados_anteriores) {
      detalhes += `\nDados Anteriores:\n${JSON.stringify(auditoria.dados_anteriores, null, 2)}\n`;
    }
    if (auditoria.dados_novos) {
      detalhes += `\nDados Novos:\n${JSON.stringify(auditoria.dados_novos, null, 2)}`;
    }
    
    alert(detalhes);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

