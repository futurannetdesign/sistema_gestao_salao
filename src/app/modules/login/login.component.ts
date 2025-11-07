import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  alertMessage = '';
  alertType = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit() {
    // Se já estiver logado, redirecionar
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Obter URL de retorno se houver
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.showAlert('Por favor, preencha todos os campos corretamente.', 'warning');
      return;
    }

    try {
      this.loading = true;
      const { email, senha } = this.loginForm.value;

      const resultado = await this.authService.login(email, senha);

      if (resultado.success) {
        this.showAlert(resultado.message, 'success');
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      } else {
        this.showAlert(resultado.message, 'danger');
        this.loading = false;
      }
    } catch (error: any) {
      this.showAlert('Erro ao realizar login: ' + error.message, 'danger');
      this.loading = false;
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

