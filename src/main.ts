import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error('Erro ao inicializar aplicação:', err);
    // Exibir mensagem de erro na tela se possível
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; background: #f44336; color: white; padding: 20px; z-index: 9999; text-align: center;';
    errorDiv.textContent = 'Erro ao carregar aplicação. Verifique o console para mais detalhes.';
    document.body.appendChild(errorDiv);
  });

