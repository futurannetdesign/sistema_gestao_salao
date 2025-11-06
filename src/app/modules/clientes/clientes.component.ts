import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Cliente } from '../../models/cliente.model';

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

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarClientes();
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
      cliente.celular?.toLowerCase().includes(termo) ||
      cliente.email?.toLowerCase().includes(termo)
    );
  }

  novoCliente() {
    this.router.navigate(['/clientes/novo']);
  }

  editarCliente(id: number) {
    this.router.navigate(['/clientes/editar', id]);
  }

  async excluirCliente(id: number) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await this.supabase.delete('clientes', id);
      this.showAlert('Cliente excluído com sucesso!', 'success');
      await this.carregarClientes();
    } catch (error: any) {
      this.showAlert('Erro ao excluir cliente: ' + error.message, 'danger');
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
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

