import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

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
  private intervalId: any;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.carregarConfiguracoes();
    this.atualizarDataHora();
    // Atualizar a cada minuto
    this.intervalId = setInterval(() => {
      this.atualizarDataHora();
    }, 60000);
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
}

