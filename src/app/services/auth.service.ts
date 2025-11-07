import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { PasswordService } from './password.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioLogado: Usuario | null = null;
  private readonly STORAGE_KEY = 'usuario_logado';

  constructor(
    private supabase: SupabaseService,
    private passwordService: PasswordService,
    private router: Router
  ) {
    this.carregarSessao();
  }

  async login(email: string, senha: string): Promise<{ success: boolean; message: string; usuario?: Usuario }> {
    try {
      // Buscar usuário por email
      const usuarios = await this.supabase.select('usuarios', { email: email }) as Usuario[];
      
      if (!usuarios || usuarios.length === 0) {
        return { success: false, message: 'Email ou senha incorretos!' };
      }

      const usuario = usuarios[0];

      // Verificar se o usuário está ativo
      if (!usuario.ativo) {
        return { success: false, message: 'Usuário inativo. Entre em contato com o administrador.' };
      }

      // Verificar senha
      if (!usuario.senha_hash) {
        return { success: false, message: 'Senha não configurada. Entre em contato com o administrador.' };
      }

      // Verificar se a senha está em texto plano (migração)
      const isPlainText = this.passwordService.isPlainText(usuario.senha_hash);
      
      let senhaValida = false;
      
      if (isPlainText) {
        // Senha em texto plano (migração) - comparar diretamente
        senhaValida = usuario.senha_hash === senha;
        
        // Se a senha for válida, fazer hash e atualizar no banco
        if (senhaValida) {
          try {
            const hash = await this.passwordService.hashPassword(senha);
            await this.supabase.update('usuarios', usuario.id!, { senha_hash: hash });
          } catch (error: any) {
            console.error('Erro ao migrar senha para hash:', error);
            // Continuar com login mesmo se a migração falhar
          }
        }
      } else {
        // Senha já está hasheada - verificar usando bcrypt
        senhaValida = await this.passwordService.verifyPassword(senha, usuario.senha_hash);
      }

      if (!senhaValida) {
        return { success: false, message: 'Email ou senha incorretos!' };
      }

      // Salvar sessão
      this.usuarioLogado = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usuarioLogado));

      return { success: true, message: 'Login realizado com sucesso!', usuario: this.usuarioLogado };
    } catch (error: any) {
      return { success: false, message: 'Erro ao realizar login: ' + error.message };
    }
  }

  logout() {
    this.usuarioLogado = null;
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
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

