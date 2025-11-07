import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Produto } from '../../models/estoque.model';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.css']
})
export class EstoqueComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  loading = true;
  searchTerm = '';
  categoriaFiltro = '';
  alertMessage = '';
  alertType = '';
  produtosBaixoEstoque: Produto[] = [];

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarProdutos();
  }

  async carregarProdutos() {
    try {
      this.loading = true;
      this.produtos = await this.supabase.select('produtos') as Produto[];
      
      // Carregar dados dos fornecedores
      for (const produto of this.produtos) {
        if (produto.fornecedor_id) {
          const fornecedores = await this.supabase.select('fornecedores', { id: produto.fornecedor_id });
          if (fornecedores && fornecedores.length > 0) {
            produto.fornecedor = fornecedores[0] as any;
          }
        }
      }
      
      this.produtosBaixoEstoque = this.produtos.filter(p => 
        (p.ativo ?? false) && p.quantidade_atual <= p.quantidade_minima
      );
      this.filtrarProdutos();
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar produtos: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarProdutos() {
    let filtrados = this.produtos;

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(produto =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.descricao?.toLowerCase().includes(termo) ||
        produto.categoria?.toLowerCase().includes(termo)
      );
    }

    if (this.categoriaFiltro) {
      filtrados = filtrados.filter(produto => produto.categoria === this.categoriaFiltro);
    }

    this.produtosFiltrados = filtrados;
  }

  getCategorias(): string[] {
    const categorias = new Set<string>();
    this.produtos.forEach(p => {
      if (p.categoria) categorias.add(p.categoria);
    });
    return Array.from(categorias).sort();
  }

  novoProduto() {
    this.router.navigate(['/estoque/novo']);
  }

  editarProduto(id: number) {
    this.router.navigate(['/estoque/editar', id]);
  }

  async excluirProduto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await this.supabase.update('produtos', id, { ativo: false });
      this.showAlert('Produto desativado com sucesso!', 'success');
      await this.carregarProdutos();
    } catch (error: any) {
      this.showAlert('Erro ao excluir produto: ' + error.message, 'danger');
    }
  }

  isBaixoEstoque(produto: Produto): boolean {
    return (produto.ativo ?? false) && produto.quantidade_atual <= produto.quantidade_minima;
  }

  formatarMoeda(valor: number | undefined): string {
    if (!valor) return '-';
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

