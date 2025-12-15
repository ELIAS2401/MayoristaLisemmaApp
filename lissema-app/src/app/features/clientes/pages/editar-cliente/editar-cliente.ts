import { Component } from '@angular/core';
import { EventEmitter, Input, Output, inject } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-editar-cliente',
  imports: [FormsModule],
  templateUrl: './editar-cliente.html',
  styleUrl: './editar-cliente.css',
})
export class EditarCliente {
  @Input() clienteId!: number;
  @Output() cerrar = new EventEmitter<void>();

  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  // Campos editables (igual a tu caso producto)
  nombreNegocio = '';
  nombreDueno = '';
  telefono = '';
  direccion = '';
  zona = '';
  email = '';
  cuit = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clienteId'] && this.clienteId) {
      this.cargarCliente();
    }
  }

  cargarCliente() {
    this.clienteService.obtenerClientePorId(this.clienteId).subscribe({
      next: (c) => {
        this.nombreNegocio = c.nombreNegocio;
        this.nombreDueno = c.nombreDueno ?? '';
        this.telefono = c.telefono ?? '';
        this.direccion = c.direccion ?? '';
        this.zona = c.zona ?? '';
        this.email = c.email ?? '';
        this.cuit = c.cuit;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  guardar() {
    const cambios = {
      nombreNegocio: this.nombreNegocio,
      nombreDueno: this.nombreDueno,
      telefono: this.telefono,
      direccion: this.direccion,
      zona: this.zona,
      email: this.email,
      cuit: this.cuit
    };

    this.clienteService.editarCliente(this.clienteId, cambios).subscribe({
      next: () => {
        this.clienteService.cargarClientes();
        this.cerrar.emit();
      },
      error: err => console.error('Error al editar:', err)
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
