import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  title = 'Sistema de Gestão - Salão de Beleza';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Aguardar um pouco antes de verificar autenticação para garantir que tudo está carregado
    setTimeout(() => {
      // Verificar autenticação ao navegar
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        try {
          const url = event.url;
          // Não redirecionar se já estiver na página de login
          if (url !== '/login' && url !== '/' && !this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
        }
      });
    }, 100);
  }
}

