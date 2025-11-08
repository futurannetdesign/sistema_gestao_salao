import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { AuthService } from '../../../services/auth.service';
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

    if (!confirm(`Deseja realmente desativar o usuário "${usuario.nome}"?\n\nO usuário não poderá mais fazer login no sistema.`)) {
      return;
    }

    try {
      await this.supabase.update('usuarios', id, { ativo: false });
      this.showAlert('Usuário desativado com sucesso!', 'success');
      await this.carregarUsuarios();
    } catch (error: any) {
      this.showAlert('Erro ao desativar usuário: ' + error.message, 'danger');
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

