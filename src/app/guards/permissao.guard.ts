import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PermissaoService } from '../services/permissao.service';
import { ModuloPermissao } from '../models/permissao.model';

@Injectable({
  providedIn: 'root'
})
export class PermissaoGuard implements CanActivate {
  // Mapeamento de rotas para módulos
  private rotaModuloMap: { [key: string]: ModuloPermissao } = {
    'dashboard': 'dashboard',
    'clientes': 'clientes',
    'servicos': 'servicos',
    'profissionais': 'profissionais',
    'agendamentos': 'agendamentos',
    'financeiro/contas-receber': 'contas_receber',
    'financeiro/contas-pagar': 'contas_pagar',
    'financeiro/caixa': 'caixa',
    'estoque': 'estoque',
    'fornecedores': 'fornecedores',
    'configuracoes': 'configuracoes',
    'auditoria': 'auditoria'
  };

  constructor(
    private permissaoService: PermissaoService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Extrair módulo da rota
    const url = state.url.split('?')[0]; // Remover query params
    const pathSegments = url.split('/').filter(segment => segment);
    
    // Determinar módulo baseado na rota
    let modulo: ModuloPermissao | null = null;
    
    if (pathSegments.length > 0) {
      const primeiroSegmento = pathSegments[0];
      const caminhoCompleto = pathSegments.join('/');
      
      // Verificar mapeamento completo primeiro
      if (this.rotaModuloMap[caminhoCompleto]) {
        modulo = this.rotaModuloMap[caminhoCompleto];
      } else if (this.rotaModuloMap[primeiroSegmento]) {
        modulo = this.rotaModuloMap[primeiroSegmento];
      }
    }

    // Se não encontrou módulo, permitir acesso (pode ser rota especial)
    if (!modulo) {
      return true;
    }

    // Verificar permissão de visualização
    const podeVisualizar = await this.permissaoService.podeVisualizar(modulo);
    
    if (!podeVisualizar) {
      this.router.navigate(['/dashboard'], { 
        queryParams: { error: 'sem_permissao' } 
      });
      return false;
    }

    return true;
  }
}

