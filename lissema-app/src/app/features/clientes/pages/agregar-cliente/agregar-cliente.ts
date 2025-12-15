import { Component } from '@angular/core';
import { EventEmitter, Output, inject } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-cliente',
  imports: [FormsModule],
  templateUrl: './agregar-cliente.html',
  styleUrl: './agregar-cliente.css',
})
export class AgregarCliente {
  @Output() cerrar = new EventEmitter<void>();

  private clienteService = inject(ClienteService);

  // Campos del formulario (igual que vos hacés con producto)
  nombreNegocio = '';
  nombreDueno = '';
  telefono = '';
  direccion = '';
  zona = '';
  email = '';
  cuit = '';

  guardar() {

    const nuevoCliente = {
      nombreNegocio: this.nombreNegocio,
      nombreDueno: this.nombreDueno,
      telefono: this.telefono,
      direccion: this.direccion,
      zona: this.zona,
      email: this.email,
      cuit: this.cuit
    };

    this.clienteService.agregarCliente(nuevoCliente).subscribe({
      next: () => {
        this.clienteService.cargarClientes();
        this.cerrar.emit();
      },
      error: (err) => console.error(err)
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
