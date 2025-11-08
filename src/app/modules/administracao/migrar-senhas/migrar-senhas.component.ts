import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SupabaseService } from "../../../services/supabase.service";
import { AuthService } from "../../../services/auth.service";
import { Usuario } from "../../../models/usuario.model";

@Component({
  selector: "app-migrar-senhas",
  templateUrl: "./migrar-senhas.component.html",
  styleUrls: ["./migrar-senhas.component.css"],
})
export class MigrarSenhasComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosComSenhaPlana: Usuario[] = [];
  loading = true;
  migrando = false;
  alertMessage = "";
  alertType = "";
  progresso = 0;
  total = 0;

  // Modal de alterar senha
  showModalAlterarSenha = false;
  usuarioSelecionado: Usuario | null = null;
  novaSenha = "";
  confirmarSenha = "";
  alterandoSenha = false;

  constructor(
    private supabase: SupabaseService,
    public authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Verificar se é admin
    if (!this.authService.isAdmin()) {
      this.showAlert("Apenas administradores podem migrar senhas!", "danger");
      return;
    }

    await this.carregarUsuarios();
  }

  async carregarUsuarios() {
    try {
      this.loading = true;
      this.usuarios = (await this.supabase.select("usuarios")) as Usuario[];

      // Com Supabase Auth, não precisamos mais verificar senhas em texto plano
      // Todos os usuários devem estar no Supabase Auth
      this.usuariosComSenhaPlana = [];

      this.loading = false;
    } catch (error: any) {
      this.showAlert("Erro ao carregar usuários: " + error.message, "danger");
      this.loading = false;
    }
  }

  async migrarTodasSenhas() {
    if (this.usuariosComSenhaPlana.length === 0) {
      this.showAlert("Não há senhas para migrar!", "info");
      return;
    }

    this.showAlert(
      "⚠️ Migração automática: As senhas serão migradas automaticamente quando cada usuário fizer login. Não é necessário migrar manualmente.",
      "info"
    );
  }

  async migrarSenhaUsuario(usuario: Usuario) {
    this.showAlert(
      "⚠️ Migração automática: A senha será migrada automaticamente quando o usuário fizer login. Não é necessário migrar manualmente.",
      "info"
    );
  }

  abrirModalAlterarSenha(usuario: Usuario) {
    this.usuarioSelecionado = usuario;
    this.novaSenha = "";
    this.confirmarSenha = "";
    this.showModalAlterarSenha = true;
  }

  fecharModalAlterarSenha() {
    this.showModalAlterarSenha = false;
    this.usuarioSelecionado = null;
    this.novaSenha = "";
    this.confirmarSenha = "";
  }

  async alterarSenha() {
    if (!this.usuarioSelecionado) return;

    // Validações
    if (!this.novaSenha || this.novaSenha.length < 6) {
      this.showAlert("A senha deve ter no mínimo 6 caracteres!", "danger");
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.showAlert("As senhas não coincidem!", "danger");
      return;
    }

    try {
      this.alterandoSenha = true;

      console.log(
        "Iniciando alteração de senha para usuário:",
        this.usuarioSelecionado.id
      );

      // Atualizar senha no Supabase Auth
      // Nota: O Supabase Auth não permite alterar senha de outro usuário diretamente do cliente
      // A melhor forma é usar recuperação de senha ou alterar manualmente no Dashboard
      console.log("Enviando email de recuperação de senha para:", this.usuarioSelecionado.email);
      
      // Enviar email de recuperação de senha
      try {
        const { error: recoveryError } = await this.supabase.client.auth.resetPasswordForEmail(
          this.usuarioSelecionado.email!,
          {
            redirectTo: window.location.origin + '/login'
          }
        );

        if (recoveryError) {
          console.error("Erro ao enviar email de recuperação:", recoveryError);
          this.showAlert(
            '⚠️ Não foi possível enviar email de recuperação. Para alterar a senha, acesse: Supabase Dashboard > Authentication > Users > Selecione o usuário "' + this.usuarioSelecionado.email + '" > Clique em "..." > "Reset password" e defina a nova senha: "' + this.novaSenha + '"',
            'warning'
          );
          this.fecharModalAlterarSenha();
        } else {
          this.showAlert(
            '✅ Email de recuperação de senha enviado para: ' + this.usuarioSelecionado.email + '. O usuário precisará usar o link do email para definir a nova senha: "' + this.novaSenha + '"',
            'info'
          );
          this.mostrarPopupSucesso();
          this.fecharModalAlterarSenha();
          await this.carregarUsuarios();
        }
      } catch (error: any) {
        console.error("Erro ao alterar senha:", error);
        this.showAlert(
          '⚠️ Para alterar a senha, acesse: Supabase Dashboard > Authentication > Users > Selecione o usuário "' + this.usuarioSelecionado.email + '" > Clique em "..." > "Reset password" e defina a nova senha: "' + this.novaSenha + '"',
          'warning'
        );
        this.fecharModalAlterarSenha();
      }
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      this.showAlert(
        "Erro ao alterar senha: " + (error.message || error),
        "danger"
      );
    } finally {
      this.alterandoSenha = false;
    }
  }

  showSuccessPopup = false;

  mostrarPopupSucesso() {
    this.showSuccessPopup = true;
    setTimeout(() => {
      this.showSuccessPopup = false;
    }, 5000);
  }

  fecharPopupSucesso() {
    this.showSuccessPopup = false;
  }

  criarNovoUsuario() {
    this.router.navigate(["/usuarios/novo"]);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = "";
    }, 5000);
  }
}
