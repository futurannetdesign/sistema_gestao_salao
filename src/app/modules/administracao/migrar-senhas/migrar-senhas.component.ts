import { Component, OnInit } from '@angular/core';
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

  constructor(
    private supabase: SupabaseService,
    private passwordService: PasswordService,
    public authService: AuthService
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

    if (!confirm(`Deseja migrar ${this.usuariosComSenhaPlana.length} senha(s) para hash?\n\n⚠️ IMPORTANTE: As senhas serão migradas automaticamente no próximo login de cada usuário.\n\nPara migrar agora, cada usuário precisa fazer login uma vez.`)) {
      return;
    }

    this.showAlert('⚠️ Migração automática: As senhas serão migradas automaticamente quando cada usuário fizer login. Não é necessário migrar manualmente.', 'info');
  }

  async migrarSenhaUsuario(usuario: Usuario) {
    this.showAlert('⚠️ Migração automática: A senha será migrada automaticamente quando o usuário fizer login. Não é necessário migrar manualmente.', 'info');
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

