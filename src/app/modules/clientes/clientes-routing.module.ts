import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesComponent } from './clientes.component';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';

const routes: Routes = [
  { path: '', component: ClientesComponent },
  { path: 'novo', component: ClienteFormComponent },
  { path: 'editar/:id', component: ClienteFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
