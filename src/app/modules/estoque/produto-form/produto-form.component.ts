import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Produto } from '../../../models/estoque.model';
import { Fornecedor } from '../../../models/fornecedor.model';

@Component({
  selector: 'app-produto-form',
  templateUrl: './produto-form.component.html',
  styleUrls: ['./produto-form.component.css']
})
export class ProdutoFormComponent implements OnInit {
  produtoForm: FormGroup;
  produtoId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';
  unidadesMedida = ['unidade', 'litro', 'kg', 'grama', 'metro', 'caixa', 'pacote'];
  fornecedores: Fornecedor[] = [];

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
      categoria: [''],
      quantidade_atual: [0, [Validators.required, Validators.min(0)]],
      quantidade_minima: [0, [Validators.required, Validators.min(0)]],
      unidade_medida: ['unidade'],
      valor_unitario: ['', Validators.min(0)],
      fornecedor_id: [''],
      ativo: [true]
    });
  }

  async ngOnInit() {
    await this.carregarFornecedores();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produtoId = +id;
      await this.carregarProduto();
    }
  }

  async carregarFornecedores() {
    try {
      this.fornecedores = await this.supabase.select('fornecedores', { ativo: true }) as Fornecedor[];
    } catch (error: any) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  }

  async carregarProduto() {
    try {
      this.loading = true;
      const produtos = await this.supabase.select('produtos', { id: this.produtoId });
      if (produtos && produtos.length > 0) {
        const produto = produtos[0] as Produto;
        this.produtoForm.patchValue({
          nome: produto.nome,
          descricao: produto.descricao || '',
          categoria: produto.categoria || '',
          quantidade_atual: produto.quantidade_atual,
          quantidade_minima: produto.quantidade_minima,
          unidade_medida: produto.unidade_medida || 'unidade',
          valor_unitario: produto.valor_unitario || '',
          fornecedor_id: produto.fornecedor_id || '',
          ativo: produto.ativo !== false
        });
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar produto: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    if (this.produtoForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const dados = this.produtoForm.value;
      
      dados.quantidade_atual = parseInt(dados.quantidade_atual);
      dados.quantidade_minima = parseInt(dados.quantidade_minima);
      
      if (dados.valor_unitario) {
        dados.valor_unitario = parseFloat(dados.valor_unitario);
      } else {
        dados.valor_unitario = null;
      }

      // Remover fornecedor_id se vazio
      if (!dados.fornecedor_id) {
        dados.fornecedor_id = null;
      }

      if (this.produtoId) {
        await this.supabase.update('produtos', this.produtoId, dados);
        this.showAlert('Produto atualizado com sucesso!', 'success');
      } else {
        await this.supabase.insert('produtos', dados);
        this.showAlert('Produto cadastrado com sucesso!', 'success');
      }

      setTimeout(() => {
        this.router.navigate(['/estoque']);
      }, 1500);
    } catch (error: any) {
      this.showAlert('Erro ao salvar produto: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/estoque']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

