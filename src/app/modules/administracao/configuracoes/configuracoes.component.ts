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
  logoPreview: string | null = null;
  logoFile: File | null = null;

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
      whatsapp_api_key: [''],
      logo_url: ['']
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
        nome_salao: configMap['nome_salao'] || 'Embeleze-se',
        telefone: configMap['telefone'] || '',
        email: configMap['email'] || '',
        endereco: configMap['endereco'] || '',
        horario_funcionamento: configMap['horario_funcionamento'] || '',
        whatsapp_api_key: configMap['whatsapp_api_key'] || '',
        logo_url: configMap['logo_url'] || ''
      });
      
      // Carregar preview da logo se existir
      if (configMap['logo_url']) {
        this.logoPreview = configMap['logo_url'];
      }

      this.loading = false;
    } catch (error: any) {
      this.showAlert('Erro ao carregar configurações: ' + error.message, 'danger');
      this.loading = false;
    }
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!tiposPermitidos.includes(file.type)) {
        this.showAlert('Formato de arquivo não suportado. Use JPEG, PNG, GIF, WEBP ou SVG.', 'danger');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('Arquivo muito grande. Tamanho máximo: 5MB.', 'danger');
        return;
      }

      this.logoFile = file;
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.configForm.patchValue({ logo_url: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removerLogo() {
    this.logoFile = null;
    this.logoPreview = null;
    this.configForm.patchValue({ logo_url: '' });
  }

  async salvar() {
    try {
      this.loading = true;
      const valores = this.configForm.value;

      for (const [chave, valor] of Object.entries(valores)) {
        // Salvar mesmo se vazio para logo_url (para remover logo)
        if (chave === 'logo_url' || valor) {
          // Verificar se já existe
          const existentes = await this.supabase.select('configuracoes', { chave });
          
          if (existentes && existentes.length > 0) {
            await this.supabase.update('configuracoes', existentes[0].id, { valor: valor as string || '' });
          } else {
            await this.supabase.insert('configuracoes', {
              chave,
              valor: valor as string || '',
              tipo: 'text'
            });
          }
        }
      }

      this.showAlert('Configurações salvas com sucesso!', 'success');
      this.loading = false;
      
      // Recarregar página após 1 segundo para atualizar o header
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

