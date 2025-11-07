import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Permissao, ModuloPermissao, AcaoPermissao } from '../models/permissao.model';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService {
  private permissoesCache: Map<string, boolean> = new Map();

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  async verificarPermissao(modulo: ModuloPermissao, acao: AcaoPermissao): Promise<boolean> {
    const usuario = this.authService.getUsuarioLogado();
    
    // Admin tem acesso total
    if (usuario?.perfil === 'admin') {
      return true;
    }

    // Se não há usuário logado, negar acesso
    if (!usuario) {
      return false;
    }

    // Criar chave de cache
    const cacheKey = `${usuario.perfil}_${modulo}_${acao}`;
    
    // Verificar cache
    if (this.permissoesCache.has(cacheKey)) {
      return this.permissoesCache.get(cacheKey)!;
    }

    try {
      // Buscar permissão no banco
      const permissoes = await this.supabase.select('permissoes', {
        perfil: usuario.perfil,
        modulo: modulo,
        acao: acao
      }) as Permissao[];

      const permitido = permissoes && permissoes.length > 0 && permissoes[0].permitido === true;
      
      // Armazenar no cache
      this.permissoesCache.set(cacheKey, permitido);
      
      return permitido;
    } catch (error: any) {
      console.error('Erro ao verificar permissão:', error);
      // Em caso de erro, negar acesso por segurança
      return false;
    }
  }

  async carregarPermissoesPerfil(perfil: 'admin' | 'funcionario'): Promise<Permissao[]> {
    try {
      const permissoes = await this.supabase.select('permissoes', { perfil: perfil }) as Permissao[];
      return permissoes || [];
    } catch (error: any) {
      console.error('Erro ao carregar permissões:', error);
      return [];
    }
  }

  async atualizarPermissao(perfil: 'admin' | 'funcionario', modulo: ModuloPermissao, acao: AcaoPermissao, permitido: boolean): Promise<void> {
    try {
      // Buscar permissão existente
      const permissoes = await this.supabase.select('permissoes', {
        perfil: perfil,
        modulo: modulo,
        acao: acao
      }) as Permissao[];

      if (permissoes && permissoes.length > 0) {
        // Atualizar permissão existente
        await this.supabase.update('permissoes', permissoes[0].id!, { permitido: permitido });
      } else {
        // Criar nova permissão
        await this.supabase.insert('permissoes', {
          perfil: perfil,
          modulo: modulo,
          acao: acao,
          permitido: permitido
        });
      }

      // Limpar cache
      this.permissoesCache.clear();
    } catch (error: any) {
      console.error('Erro ao atualizar permissão:', error);
      throw error;
    }
  }

  limparCache() {
    this.permissoesCache.clear();
  }

  // Métodos de conveniência para verificar permissões comuns
  async podeVisualizar(modulo: ModuloPermissao): Promise<boolean> {
    return this.verificarPermissao(modulo, 'visualizar');
  }

  async podeCriar(modulo: ModuloPermissao): Promise<boolean> {
    return this.verificarPermissao(modulo, 'criar');
  }

  async podeEditar(modulo: ModuloPermissao): Promise<boolean> {
    return this.verificarPermissao(modulo, 'editar');
  }

  async podeExcluir(modulo: ModuloPermissao): Promise<boolean> {
    return this.verificarPermissao(modulo, 'excluir');
  }
}

