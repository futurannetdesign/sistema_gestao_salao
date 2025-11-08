import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { AuthService } from '../../../../services/auth.service';
import { PasswordUpdateService } from '../../../../services/password-update.service';
import { Usuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  usuarioForm: FormGroup;
  usuarioId: number | null = null;
  loading = false;
  alertMessage = '';
  alertType = '';
  alterandoSenha = false;
  mostrarSenha = false;
  showSuccessPopup = false;
  successMessage = '';

      constructor(
        private fb: FormBuilder,
        private supabase: SupabaseService,
        public authService: AuthService,
        private passwordUpdateService: PasswordUpdateService,
        private route: ActivatedRoute,
        private router: Router
      ) {
    this.usuarioForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      perfil: ['funcionario', Validators.required],
      senha: [''],
      confirmarSenha: [''],
      ativo: [true]
    });
  }

  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.showAlert('Apenas administradores podem gerenciar usuários!', 'danger');
      this.router.navigate(['/usuarios']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = +id;
      await this.carregarUsuario();
    } else {
      // Novo usuário - senha obrigatória
      this.usuarioForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm.get('confirmarSenha')?.setValidators([Validators.required]);
    }

    // Adicionar validação de confirmação de senha
    this.usuarioForm.get('confirmarSenha')?.valueChanges.subscribe(() => {
      this.validarSenhas();
    });
    this.usuarioForm.get('senha')?.valueChanges.subscribe(() => {
      this.validarSenhas();
    });
  }

  validarSenhas() {
    const senha = this.usuarioForm.get('senha')?.value;
    const confirmarSenha = this.usuarioForm.get('confirmarSenha')?.value;
    
    if (senha && confirmarSenha && senha !== confirmarSenha) {
      this.usuarioForm.get('confirmarSenha')?.setErrors({ mismatch: true });
    } else {
      this.usuarioForm.get('confirmarSenha')?.setErrors(null);
    }
  }

  async carregarUsuario() {
    try {
      this.loading = true;
      const usuarios = await this.supabase.select('usuarios', { id: this.usuarioId });
      if (usuarios && usuarios.length > 0) {
        const usuario = usuarios[0] as Usuario;
        this.usuarioForm.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          ativo: usuario.ativo !== false
        });
        // Senha não é carregada por segurança
        this.usuarioForm.get('senha')?.clearValidators();
        this.usuarioForm.get('confirmarSenha')?.clearValidators();
        this.usuarioForm.get('senha')?.updateValueAndValidity();
        this.usuarioForm.get('confirmarSenha')?.updateValueAndValidity();
      } else {
        this.showAlert('Usuário não encontrado!', 'danger');
        this.router.navigate(['/usuarios']);
      }
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar usuário: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    if (this.usuarioForm.invalid) {
      this.marcarCamposComErro();
      this.showAlert('Por favor, preencha todos os campos obrigatórios corretamente!', 'danger');
      return;
    }

    const dados = this.usuarioForm.value;

    // Validar senhas
    if (!this.usuarioId) {
      // Novo usuário - senha obrigatória
      if (!dados.senha || dados.senha.length < 6) {
        this.showAlert('A senha deve ter no mínimo 6 caracteres!', 'danger');
        return;
      }
      if (dados.senha !== dados.confirmarSenha) {
        this.showAlert('As senhas não coincidem!', 'danger');
        return;
      }
    } else {
      // Editar usuário - senha opcional
      if (dados.senha && dados.senha.length > 0) {
        if (dados.senha.length < 6) {
          this.showAlert('A senha deve ter no mínimo 6 caracteres!', 'danger');
          return;
        }
        if (dados.senha !== dados.confirmarSenha) {
          this.showAlert('As senhas não coincidem!', 'danger');
          return;
        }
      }
    }

    try {
      this.loading = true;

      if (this.usuarioId) {
        // Atualizar usuário existente
        // Preparar dados para salvar na tabela usuarios
        const dadosParaSalvar: any = {
          nome: dados.nome,
          email: dados.email,
          perfil: dados.perfil,
          ativo: dados.ativo !== false
        };

        // Atualizar na tabela usuarios
        await this.supabase.update('usuarios', this.usuarioId, dadosParaSalvar);
        
        // Se há senha, atualizar no Supabase Auth usando API REST
        if (dados.senha && dados.senha.length > 0) {
          // Buscar o email do usuário (usar o email atualizado ou o antigo)
          const emailParaAtualizar = dados.email || (await this.supabase.select('usuarios', { id: this.usuarioId }) as Usuario[])[0]?.email;
          
          if (!emailParaAtualizar) {
            throw new Error('Email do usuário não encontrado');
          }
          
          // Atualizar senha usando API REST do Supabase
          try {
            const resultado = await this.passwordUpdateService.updateUserPassword(emailParaAtualizar, dados.senha);
            
            if (resultado.success) {
              this.mostrarPopupSucesso('Usuário e senha atualizados com sucesso!');
            } else {
              throw new Error(resultado.message);
            }
          } catch (error: any) {
            const errorMessage = error.message || 'Erro desconhecido';
            
            // Verificar se é erro de Service Role Key não configurada
            if (errorMessage.includes('Service Role Key não configurada')) {
              console.error('UsuarioFormComponent: Service Role Key não configurada');
              this.showAlert(
                '⚠️ ERRO: Service Role Key não configurada! Adicione "supabaseServiceRoleKey" no arquivo environment.ts e environment.prod.ts. Consulte CONFIGURAR_SERVICE_ROLE_KEY.md para instruções.',
                'danger'
              );
            } else {
              console.error('UsuarioFormComponent: Erro ao atualizar senha:', errorMessage);
              this.showAlert(
                '⚠️ Usuário atualizado, mas erro ao alterar senha: ' + errorMessage,
                'warning'
              );
            }
            this.mostrarPopupSucesso('Usuário atualizado! Erro ao alterar senha (veja aviso)');
          }
        } else {
          // Se não há senha, apenas atualizar dados
          this.mostrarPopupSucesso('Usuário atualizado com sucesso!');
        }
      } else {
        // Criar novo usuário
        // Criar registro na tabela usuarios
        const dadosParaSalvar: any = {
          nome: dados.nome,
          email: dados.email,
          perfil: dados.perfil,
          ativo: dados.ativo !== false
        };

        await this.supabase.insert('usuarios', dadosParaSalvar);
        
        // Avisar que precisa criar no Supabase Auth
        this.showAlert(
          '✅ Usuário criado na tabela! Agora crie o usuário no Supabase Auth: Authentication > Users > Add user (Email: ' + dados.email + ' | Senha: [senha informada])',
          'info'
        );
        this.mostrarPopupSucesso('Usuário criado! Crie no Supabase Auth para fazer login.');
      }

      setTimeout(() => {
        this.router.navigate(['/usuarios']);
      }, 2000);
    } catch (error: any) {
      this.showAlert('Erro ao salvar usuário: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }

  marcarCamposComErro() {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  mostrarPopupSucesso(mensagem: string) {
    this.successMessage = mensagem;
    this.showSuccessPopup = true;
    setTimeout(() => {
      this.showSuccessPopup = false;
    }, 5000);
  }
  
  fecharPopupSucesso() {
    this.showSuccessPopup = false;
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}

