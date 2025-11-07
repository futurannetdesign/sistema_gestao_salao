import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Fornecedor } from '../../models/fornecedor.model';

@Component({
  selector: 'app-fornecedores',
  templateUrl: './fornecedores.component.html',
  styleUrls: ['./fornecedores.component.css']
})
export class FornecedoresComponent implements OnInit {
  fornecedores: Fornecedor[] = [];
  fornecedoresFiltrados: Fornecedor[] = [];
  loading = true;
  searchTerm = '';
  alertMessage = '';
  alertType = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarFornecedores();
  }

  async carregarFornecedores() {
    try {
      this.loading = true;
      this.fornecedores = await this.supabase.select('fornecedores') as Fornecedor[];
      this.filtrarFornecedores();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar fornecedores: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarFornecedores() {
    let filtrados = this.fornecedores;

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(fornecedor =>
        fornecedor.nome.toLowerCase().includes(termo) ||
        fornecedor.telefone?.toLowerCase().includes(termo) ||
        fornecedor.whatsapp?.toLowerCase().includes(termo) ||
        fornecedor.email?.toLowerCase().includes(termo) ||
        fornecedor.cidade?.toLowerCase().includes(termo)
      );
    }

    this.fornecedoresFiltrados = filtrados.sort((a, b) => 
      a.nome.localeCompare(b.nome)
    );
  }

  async excluirFornecedor(id: number) {
    try {
      // Verificar se há produtos vinculados a este fornecedor
      const produtos = await this.supabase.select('produtos', { fornecedor_id: id }) as any[];

      if (produtos && produtos.length > 0) {
        const mensagem = `Não é possível excluir este fornecedor pois existem ${produtos.length} produto(s) vinculado(s) a ele.\n\nPara excluir, primeiro é necessário alterar ou excluir todos os produtos relacionados.`;
        alert(mensagem);
        return;
      }

      if (!confirm('Tem certeza que deseja excluir este fornecedor?')) {
        return;
      }

      await this.supabase.update('fornecedores', id, { ativo: false });
      this.showAlert('Fornecedor desativado com sucesso!', 'success');
      await this.carregarFornecedores();
    } catch (error: any) {
      this.showAlert('Erro ao excluir fornecedor: ' + error.message, 'danger');
    }
  }

  novoFornecedor() {
    this.router.navigate(['/fornecedores/novo']);
  }

  editarFornecedor(id: number) {
    this.router.navigate(['/fornecedores/editar', id]);
  }

  formatarTelefone(telefone: string | undefined): string {
    if (!telefone) return '-';
    // Formatar telefone: (XX) XXXXX-XXXX
    const apenasNumeros = telefone.replace(/\D/g, '');
    if (apenasNumeros.length === 11) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
    } else if (apenasNumeros.length === 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return telefone;
  }

  abrirWhatsApp(whatsapp: string | undefined) {
    if (!whatsapp) return;
    const numero = whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${numero}`;
    window.open(url, '_blank');
  }

  ligar(telefone: string | undefined) {
    if (!telefone) return;
    const numero = telefone.replace(/\D/g, '');
    window.location.href = `tel:${numero}`;
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

