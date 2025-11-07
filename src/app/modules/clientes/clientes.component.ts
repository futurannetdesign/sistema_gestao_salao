import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { PermissaoService } from '../../services/permissao.service';
import { Cliente } from '../../models/cliente.model';
import { Agendamento } from '../../models/agendamento.model';
import { ContaReceber } from '../../models/financeiro.model';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading = true;
  searchTerm = '';
  alertMessage = '';
  alertType = '';
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
    await this.carregarClientes();
  }

  async carregarPermissoes() {
    this.podeCriar = await this.permissaoService.podeCriar('clientes');
    this.podeEditar = await this.permissaoService.podeEditar('clientes');
    this.podeExcluir = await this.permissaoService.podeExcluir('clientes');
  }

  async carregarClientes() {
    try {
      this.loading = true;
      this.clientes = await this.supabase.select('clientes') as Cliente[];
      this.clientesFiltrados = this.clientes;
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar clientes: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarClientes() {
    const termo = this.searchTerm.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.celular?.toLowerCase().includes(termo)
    );
  }

  novoCliente() {
    this.router.navigate(['/clientes/novo']);
  }

  editarCliente(id: number) {
    this.router.navigate(['/clientes/editar', id]);
  }

  async excluirCliente(id: number) {
    try {
      // Verificar se há agendamentos vinculados
      const agendamentos = await this.supabase.select('agendamentos', { cliente_id: id }) as any[];
      
      if (agendamentos && agendamentos.length > 0) {
        const mensagem = `Não é possível excluir este cliente pois existem ${agendamentos.length} agendamento(s) vinculado(s) a ele.\n\nPara excluir, primeiro é necessário excluir ou cancelar todos os agendamentos relacionados.`;
        alert(mensagem);
        return;
      }

      // Verificar se há contas a receber vinculadas
      const contasReceber = await this.supabase.select('contas_receber', { cliente_id: id }) as any[];
      
      if (contasReceber && contasReceber.length > 0) {
        const mensagem = `Não é possível excluir este cliente pois existem ${contasReceber.length} conta(s) a receber vinculada(s) a ele.\n\nPara excluir, primeiro é necessário quitar ou excluir todas as contas relacionadas.`;
        alert(mensagem);
        return;
      }

      // Se não houver vínculos, confirmar exclusão
      if (!confirm('Tem certeza que deseja excluir este cliente?')) {
        return;
      }

      await this.supabase.delete('clientes', id);
      this.showAlert('Cliente excluído com sucesso!', 'success');
      await this.carregarClientes();
    } catch (error: any) {
      // Verificar se é erro de constraint
      if (error.message && error.message.includes('foreign key constraint')) {
        this.showAlert('Não é possível excluir este cliente pois existem registros vinculados (agendamentos ou contas a receber).', 'danger');
      } else {
        this.showAlert('Erro ao excluir cliente: ' + error.message, 'danger');
      }
    }
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  formatarData(data: string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarTelefone(telefone: string | undefined): string {
    if (!telefone) return '-';
    // Remover caracteres não numéricos
    const apenasNumeros = telefone.replace(/\D/g, '');
    // Formatar: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (apenasNumeros.length === 11) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
    } else if (apenasNumeros.length === 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return telefone;
  }

  abrirWhatsApp(cliente: Cliente, mensagem?: string) {
    const whatsapp = cliente.whatsapp || cliente.celular;
    if (!whatsapp) {
      this.showAlert('Cliente não possui WhatsApp cadastrado!', 'warning');
      return;
    }

    const numero = whatsapp.replace(/\D/g, '');
    let url = `https://wa.me/55${numero}`;
    
    if (mensagem) {
      const mensagemEncoded = encodeURIComponent(mensagem);
      url += `?text=${mensagemEncoded}`;
    }
    
    window.open(url, '_blank');
  }

  async enviarPromocao(cliente: Cliente) {
    const mensagem = `Olá ${cliente.nome}! 🎉\n\nTemos uma promoção especial para você!\n\nConfira nossas ofertas e agende seu horário.\n\nAguardamos você! 💅✨`;
    this.abrirWhatsApp(cliente, mensagem);
  }

  async enviarBoleto(cliente: Cliente) {
    try {
      // Buscar contas a receber pendentes do cliente
      const contasReceber = await this.supabase.select('contas_receber', { cliente_id: cliente.id }) as ContaReceber[];
      const contasPendentes = contasReceber.filter(c => c.status === 'pendente' || c.status === 'vencido');
      
      if (contasPendentes.length === 0) {
        this.showAlert('Cliente não possui contas a receber pendentes!', 'info');
        return;
      }

      let mensagem = `Olá ${cliente.nome}! 💰\n\nVocê possui ${contasPendentes.length} conta(s) pendente(s):\n\n`;
      
      contasPendentes.forEach((conta, index) => {
        const dataVenc = new Date(conta.data_vencimento).toLocaleDateString('pt-BR');
        const valor = this.formatarMoeda(conta.valor);
        mensagem += `${index + 1}. ${conta.descricao}\n`;
        mensagem += `   Vencimento: ${dataVenc}\n`;
        mensagem += `   Valor: ${valor}\n\n`;
      });

      const total = contasPendentes.reduce((sum, c) => sum + c.valor, 0);
      mensagem += `Total: ${this.formatarMoeda(total)}\n\n`;
      mensagem += `Por favor, entre em contato para quitar sua(s) conta(s).\n\nObrigado! 😊`;

      this.abrirWhatsApp(cliente, mensagem);
    } catch (error: any) {
      this.showAlert('Erro ao buscar contas a receber: ' + error.message, 'danger');
    }
  }

  async enviarOrdemServico(cliente: Cliente) {
    try {
      // Buscar agendamentos concluídos do cliente
      const agendamentos = await this.supabase.select('agendamentos', { cliente_id: cliente.id }) as Agendamento[];
      const agendamentosConcluidos = agendamentos.filter(a => a.status === 'concluido').sort((a, b) => 
        new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
      );

      if (agendamentosConcluidos.length === 0) {
        this.showAlert('Cliente não possui ordens de serviço!', 'info');
        return;
      }

      // Pegar o agendamento mais recente
      const agendamento = agendamentosConcluidos[0];
      
      // Carregar dados relacionados
      if (agendamento.servico_id) {
        const servicos = await this.supabase.select('servicos', { id: agendamento.servico_id });
        agendamento.servico = servicos?.[0] as any;
      }

      const dataHora = new Date(agendamento.data_hora);
      const dataFormatada = dataHora.toLocaleDateString('pt-BR');
      const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const valor = agendamento.valor_cobrado ? this.formatarMoeda(agendamento.valor_cobrado) : 'N/A';

      let mensagem = `Olá ${cliente.nome}! 📄\n\n`;
      mensagem += `Sua Ordem de Serviço #${agendamento.id}:\n\n`;
      mensagem += `Serviço: ${agendamento.servico?.nome || 'N/A'}\n`;
      mensagem += `Data: ${dataFormatada} às ${horaFormatada}\n`;
      mensagem += `Valor: ${valor}\n\n`;
      
      if (agendamento.observacoes) {
        mensagem += `Observações: ${agendamento.observacoes}\n\n`;
      }

      mensagem += `Obrigado pela preferência! 💅✨`;

      this.abrirWhatsApp(cliente, mensagem);
    } catch (error: any) {
      this.showAlert('Erro ao buscar ordem de serviço: ' + error.message, 'danger');
    }
  }

  formatarMoeda(valor: number | undefined): string {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
}

