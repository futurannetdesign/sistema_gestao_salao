import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { PasswordService } from '../../../services/password.service';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-migrar-senhas',
  templateUrl: './migrar-senhas.component.html',
  styleUrls: ['./migrar-senhas.component.css']
})
export class MigrarSenhasComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosComSenhaPlana: Usuario[] = [];
  loading = true;
  migrando = false;
  alertMessage = '';
  alertType = '';
  progresso = 0;
  total = 0;
  
  // Modal de alterar senha
  showModalAlterarSenha = false;
  usuarioSelecionado: Usuario | null = null;
  novaSenha = '';
  confirmarSenha = '';
  alterandoSenha = false;

  constructor(
    private supabase: SupabaseService,
    private passwordService: PasswordService,
    public authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Verificar se é admin
    if (!this.authService.isAdmin()) {
      this.showAlert('Apenas administradores podem migrar senhas!', 'danger');
      return;
    }

    await this.carregarUsuarios();
  }

  async carregarUsuarios() {
    try {
      this.loading = true;
      this.usuarios = await this.supabase.select('usuarios') as Usuario[];
      
      // Filtrar usuários com senha em texto plano
      this.usuariosComSenhaPlana = this.usuarios.filter(usuario => {
        if (!usuario.senha_hash) return false;
        return this.passwordService.isPlainText(usuario.senha_hash);
      });

      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar usuários: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async migrarTodasSenhas() {
    if (this.usuariosComSenhaPlana.length === 0) {
      this.showAlert('Não há senhas para migrar!', 'info');
      return;
    }

    this.showAlert('⚠️ Migração automática: As senhas serão migradas automaticamente quando cada usuário fizer login. Não é necessário migrar manualmente.', 'info');
  }

  async migrarSenhaUsuario(usuario: Usuario) {
    this.showAlert('⚠️ Migração automática: A senha será migrada automaticamente quando o usuário fizer login. Não é necessário migrar manualmente.', 'info');
  }

  abrirModalAlterarSenha(usuario: Usuario) {
    this.usuarioSelecionado = usuario;
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.showModalAlterarSenha = true;
  }

  fecharModalAlterarSenha() {
    this.showModalAlterarSenha = false;
    this.usuarioSelecionado = null;
    this.novaSenha = '';
    this.confirmarSenha = '';
  }

  async alterarSenha() {
    if (!this.usuarioSelecionado) return;

    // Validações
    if (!this.novaSenha || this.novaSenha.length < 6) {
      this.showAlert('A senha deve ter no mínimo 6 caracteres!', 'danger');
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.showAlert('As senhas não coincidem!', 'danger');
      return;
    }

    try {
      this.alterandoSenha = true;
      
      // Fazer hash da nova senha
      const senhaHash = await this.passwordService.hashPassword(this.novaSenha);
      
      // Atualizar no banco
      await this.supabase.update('usuarios', this.usuarioSelecionado.id!, {
        senha_hash: senhaHash
      });

      this.showAlert('✅ Senha alterada com sucesso!', 'success');
      this.fecharModalAlterarSenha();
      await this.carregarUsuarios(); // Recarregar lista
    } catch (error: any) {
      this.showAlert('Erro ao alterar senha: ' + error.message, 'danger');
    } finally {
      this.alterandoSenha = false;
    }
  }

  criarNovoUsuario() {
    this.router.navigate(['/usuarios/novo']);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

