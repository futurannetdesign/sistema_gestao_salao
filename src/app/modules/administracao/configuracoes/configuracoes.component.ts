import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css']
})
export class ConfiguracoesComponent implements OnInit {
  configForm: FormGroup;
  loading = false;
  alertMessage = '';
  alertType = '';

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService
  ) {
    this.configForm = this.fb.group({
      nome_salao: [''],
      telefone: [''],
      email: [''],
      endereco: [''],
      horario_funcionamento: [''],
      whatsapp_api_key: ['']
    });
  }

  async ngOnInit() {
    await this.carregarConfiguracoes();
  }

  async carregarConfiguracoes() {
    try {
      this.loading = true;
      const configuracoes = await this.supabase.select('configuracoes') as any[];
      
      const configMap: any = {};
      configuracoes.forEach((config: any) => {
        configMap[config.chave] = config.valor;
      });

      this.configForm.patchValue({
        nome_salao: configMap['nome_salao'] || '',
        telefone: configMap['telefone'] || '',
        email: configMap['email'] || '',
        endereco: configMap['endereco'] || '',
        horario_funcionamento: configMap['horario_funcionamento'] || '',
        whatsapp_api_key: configMap['whatsapp_api_key'] || ''
      });

      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar configurações: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  async salvar() {
    try {
      this.loading = true;
      const valores = this.configForm.value;

      for (const [chave, valor] of Object.entries(valores)) {
        if (valor) {
          // Verificar se já existe
          const existentes = await this.supabase.select('configuracoes', { chave });
          
          if (existentes && existentes.length > 0) {
            await this.supabase.update('configuracoes', existentes[0].id, { valor: valor as string });
          } else {
            await this.supabase.insert('configuracoes', {
              chave,
              valor: valor as string,
              tipo: 'text'
            });
          }
        }
      }

      this.showAlert('Configurações salvas com sucesso!', 'success');
      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao salvar configurações: ' + error.message, 'danger');
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

