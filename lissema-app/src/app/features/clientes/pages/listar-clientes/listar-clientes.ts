import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../../../interfaces/cliente.interface';
import { HeaderComponent } from '../../../../shared/header.component/header.component';
import { AgregarCliente } from '../agregar-cliente/agregar-cliente';
import { EditarCliente } from '../editar-cliente/editar-cliente';
@Component({
  selector: 'app-listar-clientes',
  imports: [CommonModule, FormsModule, HeaderComponent, AgregarCliente, EditarCliente],
  templateUrl: './listar-clientes.html',
  styleUrl: './listar-clientes.css',
})
export class ListarClientes implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  clientes$ = this.clienteService.clientes$;

  clientesOriginal: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  busqueda = '';

  mostrarAgregar = false;
  mostrarEditar = false;
  clienteSeleccionadoId: number | null = null;

  hoy = new Date();

  ngOnInit() {
    this.clientes$.subscribe(list => {
      this.clientesOriginal = [...list];
      this.clientesFiltrados = [...list];
      this.cdr.markForCheck();
    });

    this.clienteService.cargarClientes();
  }

  agregarNuevo() {
    this.mostrarAgregar = true;
  }

  cerrarAgregar() {
    this.mostrarAgregar = false;
  }

  editar(id: number) {
    this.clienteSeleccionadoId = id;
    this.mostrarEditar = true;
  }

  cerrarEditar() {
    this.mostrarEditar = false;
    this.clienteSeleccionadoId = null;
  }

  eliminar(id: number) {
    if (!confirm('¿Desea eliminar este cliente?')) return;
    this.clienteService.eliminarCliente(id).subscribe({
      next: () => this.clienteService.cargarClientes(),
      error: (err) => console.error(err)
    });
  }

  actualizarFiltro() {
    const t = this.busqueda.trim().toLowerCase();
    if (!t) {
      this.clientesFiltrados = [...this.clientesOriginal];
      return;
    }

    this.clientesFiltrados = this.clientesOriginal.filter(c =>
      c.nombreNegocio.toLowerCase().includes(t) ||
      c.nombreDueno?.toLowerCase().includes(t) ||
      c.cuit.includes(t)
    );
  }
}
