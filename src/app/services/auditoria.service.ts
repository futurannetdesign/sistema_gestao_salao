import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  constructor(private supabase: SupabaseService) {}

  async registrar(acao: string, tabela: string, registroId?: number, dadosAnteriores?: any, dadosNovos?: any, observacoes?: string) {
    try {
      const auditoria = {
        acao,
        tabela,
        registro_id: registroId || null,
        dados_anteriores: dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
        dados_novos: dadosNovos ? JSON.stringify(dadosNovos) : null,
        observacoes: observacoes || null,
        ip_address: await this.getIpAddress(),
        user_agent: navigator.userAgent
      };

      await this.supabase.insert('auditoria', auditoria);
    } catch (error: any) {
      console.error('Erro ao registrar auditoria:', error);
      // Não interromper o fluxo se a auditoria falhar
    }
  }

  private async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'N/A';
    }
  }
}

