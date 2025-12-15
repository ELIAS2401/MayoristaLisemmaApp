import { CommonModule } from '@angular/common';
import { ProductoService } from './../../services/producto-service';
import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-producto.html',
  styleUrl: './agregar-producto.css',
})
export class AgregarProducto {

  @Output() cerrar = new EventEmitter<void>();

  private productoService = inject(ProductoService);

  nombre: string = '';
  categoriaId: number | null = null;  // ← CORRECTO
  costoUnitario: number | null = null;
  precioUnitario: number | null = null;
  stock: number | null = null;

  guardar() {

    const nuevoProducto = {
      nombre: this.nombre,
      categoriaId: this.categoriaId ?? undefined,
      costoUnitario: this.costoUnitario ?? 0,
      precioUnitario: this.precioUnitario ?? 0,
      stock: this.stock ?? 0
    };

    this.productoService.agregarProducto(nuevoProducto).subscribe({
      next: () => {
        this.productoService.cargarProductos();
        this.cerrar.emit();
      },
      error: err => console.error('Error al agregar:', err)
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
