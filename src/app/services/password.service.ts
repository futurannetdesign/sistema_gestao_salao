import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Faz hash de uma senha usando a Edge Function do Supabase
   */
  async hashPassword(senha: string): Promise<string> {
    try {
      const { data, error } = await this.supabase.functions.invoke('hash-password', {
        body: { senha }
      });

      if (error) {
        throw error;
      }

      return data.hash;
    } catch (error: any) {
      console.error('Erro ao fazer hash da senha:', error);
      throw new Error('Erro ao fazer hash da senha: ' + error.message);
    }
  }

  /**
   * Verifica se uma senha corresponde ao hash armazenado
   */
  async verifyPassword(senha: string, hash: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.functions.invoke('hash-password', {
        body: { senha, hash }
      });

      if (error) {
        throw error;
      }

      return data.valid === true;
    } catch (error: any) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  }

  /**
   * Verifica se uma senha está em texto plano (para migração)
   */
  isPlainText(senha: string): boolean {
    // Hash bcrypt sempre começa com $2a$, $2b$ ou $2y$ e tem 60 caracteres
    const bcryptPattern = /^\$2[ayb]\$.{56}$/;
    return !bcryptPattern.test(senha);
  }
}

