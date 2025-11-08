import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioLogado: Usuario | null = null;
  private readonly STORAGE_KEY = 'usuario_logado';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.carregarSessao();
    this.verificarSessaoSupabase();
  }

  async login(email: string, senha: string): Promise<{ success: boolean; message: string; usuario?: Usuario }> {
    try {
      // Login usando Supabase Auth
      const { data: authData, error: authError } = await this.supabase.client.auth.signInWithPassword({
        email: email,
        password: senha
      });

      if (authError) {
        return { success: false, message: 'Email ou senha incorretos!' };
      }

      if (!authData.user) {
        return { success: false, message: 'Erro ao realizar login!' };
      }

      // Buscar dados do usuário na tabela usuarios
      const usuarios = await this.supabase.select('usuarios', { email: email }) as Usuario[];
      
      if (!usuarios || usuarios.length === 0) {
        // Se não existe na tabela usuarios, criar registro básico
        const novoUsuario = await this.supabase.insert('usuarios', {
          email: email,
          nome: authData.user.email?.split('@')[0] || 'Usuário',
          perfil: 'funcionario',
          ativo: true
        }) as Usuario;
        
        this.usuarioLogado = novoUsuario;
      } else {
        const usuario = usuarios[0];

        // Verificar se o usuário está ativo
        if (!usuario.ativo) {
          await this.supabase.client.auth.signOut();
          return { success: false, message: 'Usuário inativo. Entre em contato com o administrador.' };
        }

        this.usuarioLogado = {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          ativo: usuario.ativo
        };
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usuarioLogado));

      return { success: true, message: 'Login realizado com sucesso!', usuario: this.usuarioLogado };
    } catch (error: any) {
      return { success: false, message: 'Erro ao realizar login: ' + error.message };
    }
  }

  async logout() {
    // Fazer logout do Supabase Auth
    await this.supabase.client.auth.signOut();
    
    this.usuarioLogado = null;
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private async verificarSessaoSupabase() {
    // Verificar se há sessão ativa no Supabase
    const { data: { session } } = await this.supabase.client.auth.getSession();
    
    if (session) {
      // Carregar dados do usuário se houver sessão
      const usuarios = await this.supabase.select('usuarios', { email: session.user.email }) as Usuario[];
      if (usuarios && usuarios.length > 0) {
        const usuario = usuarios[0];
        if (usuario.ativo) {
          this.usuarioLogado = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            ativo: usuario.ativo
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usuarioLogado));
        }
      }
    } else {
      // Se não há sessão, limpar dados locais
      this.usuarioLogado = null;
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  isAuthenticated(): boolean {
    return this.usuarioLogado !== null;
  }

  getUsuarioLogado(): Usuario | null {
    return this.usuarioLogado;
  }

  isAdmin(): boolean {
    return this.usuarioLogado?.perfil === 'admin';
  }

  isFuncionario(): boolean {
    return this.usuarioLogado?.perfil === 'funcionario';
  }

  private carregarSessao() {
    const sessao = localStorage.getItem(this.STORAGE_KEY);
    if (sessao) {
      try {
        this.usuarioLogado = JSON.parse(sessao);
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }
}

