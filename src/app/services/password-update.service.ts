import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordUpdateService {
  private supabaseUrl: string;
  private serviceRoleKey: string;

  constructor(private http: HttpClient) {
    this.supabaseUrl = environment.supabaseUrl;
    // Service Role Key deve estar no environment
    // Agora acessa diretamente porque está tipada na interface
    this.serviceRoleKey = environment.supabaseServiceRoleKey || '';
    
    // Log apenas em desenvolvimento
    if (!environment.production) {
      console.log('PasswordUpdateService: Constructor - Service Role Key configurada:', !!this.serviceRoleKey);
    }
  }

  /**
   * Atualiza a senha de um usuário no Supabase Auth usando a API REST Admin
   * Requer Service Role Key no environment
   */
  async updateUserPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Log apenas em desenvolvimento
    if (!environment.production) {
      console.log('PasswordUpdateService: Iniciando atualização de senha para:', email);
    }
    
    // Verificar novamente se a Service Role Key está configurada
    // (pode ter sido atualizada após a inicialização)
    const serviceRoleKey = environment.supabaseServiceRoleKey || this.serviceRoleKey || '';

    if (!serviceRoleKey || serviceRoleKey.trim() === '') {
      const errorMsg = 'Service Role Key não configurada. Adicione supabaseServiceRoleKey no environment.ts e environment.prod.ts';
      console.error('PasswordUpdateService:', errorMsg);
      if (!environment.production) {
        console.error('PasswordUpdateService: Environment keys disponíveis:', Object.keys(environment));
      }
      throw new Error(errorMsg);
    }
    
    // Usar a Service Role Key encontrada
    const finalServiceRoleKey = serviceRoleKey;

    try {
      // 1. Buscar o usuário por email para obter o ID
      const listUsersUrl = `${this.supabaseUrl}/auth/v1/admin/users`;
      const listHeaders = new HttpHeaders({
        'apikey': finalServiceRoleKey,
        'Authorization': `Bearer ${finalServiceRoleKey}`,
        'Content-Type': 'application/json'
      });

      const usersResponse: any = await this.http.get(listUsersUrl, { headers: listHeaders }).toPromise();
      
      if (!usersResponse || !usersResponse.users) {
        console.error('PasswordUpdateService: Resposta inválida ao buscar usuários');
        throw new Error('Erro ao buscar usuários. Resposta: ' + JSON.stringify(usersResponse));
      }

      const user = usersResponse.users.find((u: any) => u.email === email);
      
      if (!user) {
        throw new Error('Usuário não encontrado no Supabase Auth. Email: ' + email);
      }

      // 2. Atualizar a senha do usuário
      const updateUrl = `${this.supabaseUrl}/auth/v1/admin/users/${user.id}`;
      const updateHeaders = new HttpHeaders({
        'apikey': finalServiceRoleKey,
        'Authorization': `Bearer ${finalServiceRoleKey}`,
        'Content-Type': 'application/json'
      });

      const updateData = {
        password: newPassword
      };

      const updateResponse: any = await this.http.put(updateUrl, updateData, { headers: updateHeaders }).toPromise();

      if (updateResponse && updateResponse.id) {
        if (!environment.production) {
          console.log('PasswordUpdateService: Senha atualizada com sucesso!');
        }
        return {
          success: true,
          message: 'Senha atualizada com sucesso!'
        };
      } else {
        console.error('PasswordUpdateService: Resposta inesperada ao atualizar senha');
        throw new Error('Resposta inesperada ao atualizar senha: ' + JSON.stringify(updateResponse));
      }
    } catch (error: any) {
      // Logs de erro sempre são importantes, mas limitar informações sensíveis
      const errorMessage = error.message || 'Erro desconhecido';
      
      if (error.status === 401 || error.status === 403) {
        console.error('PasswordUpdateService: Erro de autenticação');
        throw new Error('Erro de autenticação. Verifique se a Service Role Key está correta.');
      } else if (error.status === 404) {
        console.error('PasswordUpdateService: Usuário não encontrado');
        throw new Error('Usuário não encontrado no Supabase Auth.');
      } else {
        console.error('PasswordUpdateService: Erro ao atualizar senha:', errorMessage);
        if (error.error) {
          throw new Error('Erro ao atualizar senha: ' + (error.error.message || 'Erro desconhecido'));
        } else {
          throw new Error('Erro ao atualizar senha: ' + errorMessage);
        }
      }
    }
  }
}

