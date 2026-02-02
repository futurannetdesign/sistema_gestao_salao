import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordUpdateService {

  constructor(private supabase: SupabaseService) {}

  /**
   * Invoca a Edge Function 'admin-user-ops' para criar usuário ou trocar senha de forma segura.
   */
  async callAdminFunction(payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Timeout de 15 segundos para evitar travamento eterno
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tempo limite da requisição excedido (15s)')), 15000)
      );

      const invokePromise = this.supabase.client.functions.invoke('admin-user-ops', {
        body: payload
      });

      const { data, error }: any = await Promise.race([invokePromise, timeoutPromise]);

      if (error) throw error;
      
      return {
        success: true,
        message: 'Operação realizada com sucesso!',
        data: data?.data
      };

    } catch (error: any) {
      console.error('Erro ao chamar Edge Function:', error);
      // Tratamento de mensagens de erro comuns do Supabase
      let msg = error.message || 'Erro desconhecido';
      if (msg.includes('Flow control')) msg = 'Erro de conexão com a função.';
      return {
        success: false,
        message: msg
      };
    }
  }

  async updateUserPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.callAdminFunction({
      action: 'update_password',
      email: email,
      password: newPassword
    });
  }

  async createUser(email: string, password: string, userData: any): Promise<{ success: boolean; message: string; data?: any }> {
    return this.callAdminFunction({
      action: 'create_user',
      email: email,
      password: password,
      userData: userData
    });
  }
}
