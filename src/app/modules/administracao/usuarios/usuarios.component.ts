import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { AuthService } from '../../../services/auth.service';
import { PasswordUpdateService } from '../../../services/password-update.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  loading = true;
  alertMessage = '';
  alertType = '';
  termoBusca = '';

  constructor(
    private supabase: SupabaseService,
    public authService: AuthService,
    private passwordUpdateService: PasswordUpdateService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.showAlert('Apenas administradores podem gerenciar usuários!', 'danger');
      return;
    }

    await this.carregarUsuarios();
  }

  async carregarUsuarios() {
    try {
      this.loading = true;
      this.usuarios = await this.supabase.select('usuarios') as Usuario[];
      this.usuariosFiltrados = this.usuarios;
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar usuários: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  filtrarUsuarios() {
    if (!this.termoBusca.trim()) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    const termo = this.termoBusca.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.nome?.toLowerCase().includes(termo) ||
      usuario.email?.toLowerCase().includes(termo)
    );
  }

  novoUsuario() {
    this.router.navigate(['/usuarios/novo']);
  }

  editarUsuario(id: number) {
    this.router.navigate(['/usuarios/editar', id]);
  }

  async excluirUsuario(id: number) {
    const usuario = this.usuarios.find(u => u.id === id);
    if (!usuario) return;

    // Não permitir excluir o próprio usuário
    const usuarioLogado = this.authService.getUsuarioLogado();
    if (usuarioLogado?.id === id) {
      this.showAlert('Você não pode excluir seu próprio usuário!', 'danger');
      return;
    }

    if (!confirm(`Deseja realmente EXCLUIR DEFINITIVAMENTE o usuário "${usuario.nome}"?\n\nEsta ação removerá o acesso dele ao sistema e apagará o registro.`)) {
      return;
    }

    try {
      this.loading = true;
      
      // 1. Remover do Auth via Edge Function
      const delResult = await this.passwordUpdateService.callAdminFunction({
        action: 'delete_user',
        userId: usuario.auth_id,
        email: usuario.email 
      });

      if (!delResult.success) {
        // Se falhar no Auth (ex: usuário não existe mais no auth), prosseguimos deletando da tabela local
        console.warn('Falha ao deletar do Auth, tentando deletar da tabela local:', delResult.message);
      }

      // 2. Deletar da tabela local (usuarios)
      await this.supabase.delete('usuarios', id);
      
      this.showAlert('Usuário excluído definitivamente!', 'success');
      await this.carregarUsuarios();
    } catch (error: any) {
      this.showAlert('Erro ao excluir usuário: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async ativarUsuario(id: number) {
    try {
      await this.supabase.update('usuarios', id, { ativo: true });
      this.showAlert('Usuário ativado com sucesso!', 'success');
      await this.carregarUsuarios();
    } catch (error: any) {
      this.showAlert('Erro ao ativar usuário: ' + error.message, 'danger');
    }
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

