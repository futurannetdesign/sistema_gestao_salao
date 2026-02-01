import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesRoutingModule } from './clientes-routing.module';
import { ClientesComponent } from './clientes.component';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';

@NgModule({
  declarations: [
    ClientesComponent,
    ClienteFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientesRoutingModule
  ]
})
export class ClientesModule { }
