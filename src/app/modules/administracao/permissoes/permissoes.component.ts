import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PermissaoService } from '../../../services/permissao.service';
import { AuthService } from '../../../services/auth.service';
import { Permissao, ModuloPermissao, AcaoPermissao } from '../../../models/permissao.model';

@Component({
  selector: 'app-permissoes',
  templateUrl: './permissoes.component.html',
  styleUrls: ['./permissoes.component.css']
})
export class PermissoesComponent implements OnInit {
  permissoes: Permissao[] = [];
  permissoesAgrupadas: { [modulo: string]: { [acao: string]: Permissao } } = {};
  loading = true;
  alertMessage = '';
  alertType = '';
  perfilSelecionado: 'admin' | 'funcionario' = 'funcionario';

  modulos: { key: ModuloPermissao; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'servicos', label: 'Serviços' },
    { key: 'profissionais', label: 'Profissionais' },
    { key: 'agendamentos', label: 'Agendamentos' },
    { key: 'contas_receber', label: 'Contas a Receber' },
    { key: 'contas_pagar', label: 'Contas a Pagar' },
    { key: 'caixa', label: 'Caixa' },
    { key: 'estoque', label: 'Estoque' },
    { key: 'fornecedores', label: 'Fornecedores' },
    { key: 'configuracoes', label: 'Configurações' },
    { key: 'auditoria', label: 'Auditoria' }
  ];

  acoes: { key: AcaoPermissao; label: string }[] = [
    { key: 'visualizar', label: 'Visualizar' },
    { key: 'criar', label: 'Criar' },
    { key: 'editar', label: 'Editar' },
    { key: 'excluir', label: 'Excluir' },
    { key: 'marcar_pago', label: 'Marcar como Pago' },
    { key: 'sincronizar', label: 'Sincronizar' }
  ];

  acoesPorModulo: { [modulo: string]: AcaoPermissao[] } = {
    'dashboard': ['visualizar'],
    'clientes': ['visualizar', 'criar', 'editar', 'excluir'],
    'servicos': ['visualizar', 'criar', 'editar', 'excluir'],
    'profissionais': ['visualizar', 'criar', 'editar', 'excluir'],
    'agendamentos': ['visualizar', 'criar', 'editar', 'excluir'],
    'contas_receber': ['visualizar', 'criar', 'editar', 'excluir', 'marcar_pago', 'sincronizar'],
    'contas_pagar': ['visualizar', 'criar', 'editar', 'excluir', 'marcar_pago'],
    'caixa': ['visualizar', 'sincronizar'],
    'estoque': ['visualizar', 'criar', 'editar', 'excluir'],
    'fornecedores': ['visualizar', 'criar', 'editar', 'excluir'],
    'configuracoes': ['visualizar', 'editar'],
    'auditoria': ['visualizar']
  };

  constructor(
    private supabase: SupabaseService,
    public permissaoService: PermissaoService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    // Verificar se é admin
    if (!this.authService.isAdmin()) {
      this.showAlert('Apenas administradores podem gerenciar permissões!', 'danger');
      return;
    }

    await this.carregarPermissoes();
  }

  async carregarPermissoes() {
    try {
      this.loading = true;
      this.permissoes = await this.permissaoService.carregarPermissoesPerfil(this.perfilSelecionado);
      this.agruparPermissoes();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar permissões: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  agruparPermissoes() {
    this.permissoesAgrupadas = {};
    
    for (const permissao of this.permissoes) {
      if (!this.permissoesAgrupadas[permissao.modulo]) {
        this.permissoesAgrupadas[permissao.modulo] = {};
      }
      this.permissoesAgrupadas[permissao.modulo][permissao.acao] = permissao;
    }
  }

  async alterarPermissao(modulo: ModuloPermissao, acao: AcaoPermissao, permitido: boolean) {
    try {
      await this.permissaoService.atualizarPermissao(
        this.perfilSelecionado,
        modulo,
        acao,
        permitido
      );
      
      // Atualizar localmente
      if (!this.permissoesAgrupadas[modulo]) {
        this.permissoesAgrupadas[modulo] = {};
      }
      
      const permissaoExistente = this.permissoesAgrupadas[modulo][acao];
      if (permissaoExistente) {
        permissaoExistente.permitido = permitido;
      } else {
        // Criar nova permissão localmente
        const novaPermissao: Permissao = {
          perfil: this.perfilSelecionado,
          modulo: modulo,
          acao: acao,
          permitido: permitido
        };
        this.permissoesAgrupadas[modulo][acao] = novaPermissao;
        this.permissoes.push(novaPermissao);
      }

      this.showAlert('Permissão atualizada com sucesso!', 'success');
    } catch (error: any) {
      this.showAlert('Erro ao atualizar permissão: ' + error.message, 'danger');
    }
  }

  temPermissao(modulo: ModuloPermissao, acao: AcaoPermissao): boolean {
    if (this.perfilSelecionado === 'admin') {
      return true; // Admin sempre tem acesso
    }
    
    const permissao = this.permissoesAgrupadas[modulo]?.[acao];
    return permissao?.permitido === true;
  }

  async onPerfilChange() {
    await this.carregarPermissoes();
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

