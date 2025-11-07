import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './modules/clientes/clientes.component';
import { ClienteFormComponent } from './modules/clientes/cliente-form/cliente-form.component';
import { ServicosComponent } from './modules/servicos/servicos.component';
import { ServicoFormComponent } from './modules/servicos/servico-form/servico-form.component';
import { AgendamentosComponent } from './modules/agendamentos/agendamentos.component';
import { AgendamentoFormComponent } from './modules/agendamentos/agendamento-form/agendamento-form.component';
import { ContasReceberComponent } from './modules/financeiro/contas-receber/contas-receber.component';
import { ContasPagarComponent } from './modules/financeiro/contas-pagar/contas-pagar.component';
import { ContaPagarFormComponent } from './modules/financeiro/contas-pagar/conta-pagar-form/conta-pagar-form.component';
import { CaixaComponent } from './modules/financeiro/caixa/caixa.component';
import { EstoqueComponent } from './modules/estoque/estoque.component';
import { ProdutoFormComponent } from './modules/estoque/produto-form/produto-form.component';
import { FornecedoresComponent } from './modules/fornecedores/fornecedores.component';
import { FornecedorFormComponent } from './modules/fornecedores/fornecedor-form/fornecedor-form.component';
import { ProfissionaisComponent } from './modules/profissionais/profissionais.component';
import { ProfissionalFormComponent } from './modules/profissionais/profissional-form/profissional-form.component';
import { ConfiguracoesComponent } from './modules/administracao/configuracoes/configuracoes.component';
import { PermissoesComponent } from './modules/administracao/permissoes/permissoes.component';
import { MigrarSenhasComponent } from './modules/administracao/migrar-senhas/migrar-senhas.component';
import { OrdemServicoComponent } from './modules/ordem-servico/ordem-servico.component';
import { AuditoriaComponent } from './modules/auditoria/auditoria.component';
import { LoginComponent } from './modules/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SupabaseService } from './services/supabase.service';
import { AuditoriaService } from './services/auditoria.service';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { PermissaoService } from './services/permissao.service';
import { AuthGuard } from './guards/auth.guard';
import { PermissaoGuard } from './guards/permissao.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'clientes/novo', component: ClienteFormComponent },
      { path: 'clientes/editar/:id', component: ClienteFormComponent },
      { path: 'servicos', component: ServicosComponent },
      { path: 'servicos/novo', component: ServicoFormComponent },
      { path: 'servicos/editar/:id', component: ServicoFormComponent },
      { path: 'profissionais', component: ProfissionaisComponent },
      { path: 'profissionais/novo', component: ProfissionalFormComponent },
      { path: 'profissionais/editar/:id', component: ProfissionalFormComponent },
      { path: 'agendamentos', component: AgendamentosComponent },
      { path: 'agendamentos/novo', component: AgendamentoFormComponent },
      { path: 'agendamentos/editar/:id', component: AgendamentoFormComponent },
      { path: 'agendamentos/ordem-servico/:id', component: OrdemServicoComponent },
      { path: 'financeiro/contas-receber', component: ContasReceberComponent },
      { path: 'financeiro/contas-pagar', component: ContasPagarComponent },
      { path: 'financeiro/contas-pagar/novo', component: ContaPagarFormComponent },
      { path: 'financeiro/contas-pagar/editar/:id', component: ContaPagarFormComponent },
      { path: 'financeiro/caixa', component: CaixaComponent },
      { path: 'estoque', component: EstoqueComponent },
      { path: 'estoque/novo', component: ProdutoFormComponent },
      { path: 'estoque/editar/:id', component: ProdutoFormComponent },
      { path: 'fornecedores', component: FornecedoresComponent },
      { path: 'fornecedores/novo', component: FornecedorFormComponent },
      { path: 'fornecedores/editar/:id', component: FornecedorFormComponent },
      { path: 'configuracoes', component: ConfiguracoesComponent },
      { path: 'permissoes', component: PermissoesComponent },
      { path: 'migrar-senhas', component: MigrarSenhasComponent },
      { path: 'auditoria', component: AuditoriaComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DashboardComponent,
    ClientesComponent,
    ClienteFormComponent,
    ServicosComponent,
    ServicoFormComponent,
    AgendamentosComponent,
    AgendamentoFormComponent,
    ContasReceberComponent,
    ContasPagarComponent,
    ContaPagarFormComponent,
    CaixaComponent,
    EstoqueComponent,
    ProdutoFormComponent,
    FornecedoresComponent,
    FornecedorFormComponent,
    ProfissionaisComponent,
    ProfissionalFormComponent,
    ConfiguracoesComponent,
    PermissoesComponent,
    MigrarSenhasComponent,
    OrdemServicoComponent,
    AuditoriaComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [SupabaseService, AuditoriaService, AuthService, PasswordService, PermissaoService, AuthGuard, PermissaoGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

