import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';
import { PermissaoService } from '../../services/permissao.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  menuOpen = false;
  dataHoraAtual = '';
  diaSemana = '';
  dataFormatada = '';
  horaFormatada = '';
  logoUrl: string | null = null;
  nomeSalao = 'Embeleze-se';
  usuarioLogado: Usuario | null = null;
  private intervalId: any;
  
  // Permissões para menu
  podeVerClientes = false;
  podeVerServicos = false;
  podeVerProfissionais = false;
  podeVerAgendamentos = false;
  podeVerContasReceber = false;
  podeVerContasPagar = false;
  podeVerCaixa = false;
  podeVerEstoque = false;
  podeVerFornecedores = false;
  podeVerConfiguracoes = false;
  podeVerAuditoria = false;

  constructor(
    private supabase: SupabaseService,
    public authService: AuthService,
    public permissaoService: PermissaoService
  ) {}

  async ngOnInit() {
    this.usuarioLogado = this.authService.getUsuarioLogado();
    await Promise.all([
      this.carregarConfiguracoes(),
      this.carregarPermissoesMenu()
    ]);
    this.atualizarDataHora();
    // Atualizar a cada minuto
    this.intervalId = setInterval(() => {
      this.atualizarDataHora();
    }, 60000);
  }

  async carregarPermissoesMenu() {
    this.podeVerClientes = await this.permissaoService.podeVisualizar('clientes');
    this.podeVerServicos = await this.permissaoService.podeVisualizar('servicos');
    this.podeVerProfissionais = await this.permissaoService.podeVisualizar('profissionais');
    this.podeVerAgendamentos = await this.permissaoService.podeVisualizar('agendamentos');
    this.podeVerContasReceber = await this.permissaoService.podeVisualizar('contas_receber');
    this.podeVerContasPagar = await this.permissaoService.podeVisualizar('contas_pagar');
    this.podeVerCaixa = await this.permissaoService.podeVisualizar('caixa');
    this.podeVerEstoque = await this.permissaoService.podeVisualizar('estoque');
    this.podeVerFornecedores = await this.permissaoService.podeVisualizar('fornecedores');
    this.podeVerConfiguracoes = await this.permissaoService.podeVisualizar('configuracoes');
    this.podeVerAuditoria = await this.permissaoService.podeVisualizar('auditoria');
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  atualizarDataHora() {
    const agora = new Date();
    
    // Dia da semana
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    this.diaSemana = diasSemana[agora.getDay()];
    
    // Data formatada
    this.dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Hora formatada
    this.horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    this.dataHoraAtual = `${this.diaSemana}, ${this.dataFormatada} - ${this.horaFormatada}`;
  }

  async carregarConfiguracoes() {
    try {
      const configuracoes = await this.supabase.select('configuracoes') as any[];
      const configMap: any = {};
      configuracoes.forEach((config: any) => {
        configMap[config.chave] = config.valor;
      });

      this.nomeSalao = configMap['nome_salao'] || 'Embeleze-se';
      this.logoUrl = configMap['logo_url'] || null;
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }
}

