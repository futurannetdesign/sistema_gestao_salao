import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Agendamento } from '../../models/agendamento.model';
import { Cliente } from '../../models/cliente.model';
import { Servico } from '../../models/servico.model';
import { Profissional } from '../../models/profissional.model';
import { AuditoriaService } from '../../services/auditoria.service';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-ordem-servico',
  templateUrl: './ordem-servico.component.html',
  styleUrls: ['./ordem-servico.component.css']
})
export class OrdemServicoComponent implements OnInit {
  @ViewChild('ordemServicoContent', { static: false }) ordemServicoContent!: ElementRef;
  
  agendamentoId: number | null = null;
  agendamento: Agendamento | null = null;
  cliente: Cliente | null = null;
  servico: Servico | null = null;
  profissional: Profissional | null = null;
  loading = true;
  alertMessage = '';
  alertType = '';
  nomeSalao = 'Embeleze-se';
  logoUrl: string | null = null;
  telefoneSalao = '';
  enderecoSalao = '';
  exportandoPDF = false;

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private auditoria: AuditoriaService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.agendamentoId = +id;
      await Promise.all([
        this.carregarAgendamento(),
        this.carregarConfiguracoes()
      ]);
      
      // Registrar visualização na auditoria
      await this.auditoria.registrar('visualizar', 'agendamentos', this.agendamentoId, null, null, 'Visualização de ordem de serviço');
    } else {
      this.router.navigate(['/agendamentos']);
    }
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
      this.telefoneSalao = configMap['telefone'] || '';
      this.enderecoSalao = configMap['endereco'] || '';
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async carregarAgendamento() {
    try {
      this.loading = true;
      const agendamentos = await this.supabase.select('agendamentos', { id: this.agendamentoId });
      
      if (agendamentos && agendamentos.length > 0) {
        this.agendamento = agendamentos[0] as Agendamento;
        
        // Carregar dados relacionados
        if (this.agendamento.cliente_id) {
          const clientes = await this.supabase.select('clientes', { id: this.agendamento.cliente_id });
          this.cliente = clientes?.[0] as Cliente;
        }
        
        if (this.agendamento.servico_id) {
          const servicos = await this.supabase.select('servicos', { id: this.agendamento.servico_id });
          this.servico = servicos?.[0] as Servico;
        }
        
        if (this.agendamento.profissional_id) {
          const profissionais = await this.supabase.select('profissionais', { id: this.agendamento.profissional_id });
          this.profissional = profissionais?.[0] as Profissional;
        }
      }
      
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar ordem de serviço: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  formatarDataHora(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR');
  }

  formatarData(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleDateString('pt-BR');
  }

  formatarHora(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarMoeda(valor: number | undefined): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  formatarTelefone(telefone: string | undefined): string {
    if (!telefone) return '-';
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getDataGeracao(): string {
    return new Date().toLocaleString('pt-BR');
  }

  async exportarPDF() {
    try {
      this.exportandoPDF = true;
      await this.auditoria.registrar('exportar', 'agendamentos', this.agendamentoId || undefined, null, null, 'Exportação de ordem de serviço para PDF');
      
      // Aguardar um pouco para garantir que o conteúdo está renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const elemento = this.ordemServicoContent.nativeElement;
      
      // Capturar o HTML como imagem
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Largura A4 em mm
      const pageHeight = 297; // Altura A4 em mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Gerar nome do arquivo
      const nomeArquivo = `Ordem_Servico_${this.agendamentoId}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Salvar PDF
      pdf.save(nomeArquivo);
      
      this.showAlert('PDF exportado com sucesso!', 'success');
    } catch (error: any) {
      this.showAlert('Erro ao exportar PDF: ' + error.message, 'danger');
    } finally {
      this.exportandoPDF = false;
    }
  }

  async imprimir() {
    await this.auditoria.registrar('imprimir', 'agendamentos', this.agendamentoId || undefined, null, null, 'Impressão de ordem de serviço');
    window.print();
  }

  voltar() {
    this.router.navigate(['/agendamentos']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

