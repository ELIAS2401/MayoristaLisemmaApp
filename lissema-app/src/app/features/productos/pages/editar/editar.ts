import { Component } from '@angular/core';
import { inject, Input, Output, EventEmitter } from '@angular/core';
import { ProductoService } from '../../services/producto-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-editar',
  imports: [CommonModule, FormsModule],
  templateUrl: './editar.html',
  styleUrl: './editar.css',
})
export class Editar {

  @Input() productoId!: number;
  @Output() cerrar = new EventEmitter<void>();

  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  nombre = '';
  categoriaId: number | null = null;
  costoUnitario: number | null = null;
  precioUnitario: number | null = null;

  stock: number | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoId'] && this.productoId) {
      this.cargarProducto();
    }
  }

  cargarProducto() {
    this.productoService.getProducto(this.productoId).subscribe({
      next: (p) => {
        this.nombre = p.nombre;
        this.categoriaId = p.categoriaId ?? null;
        this.costoUnitario = p.costoUnitario;
        this.precioUnitario = p.precioUnitario;
        this.stock = p.stock ?? 0;
        this.cdr.detectChanges();
      }
    });
  }

  guardar() {
    const cambios = {
      nombre: this.nombre,
      categoriaId: this.categoriaId ? Number(this.categoriaId) : null,
      costoUnitario: Number(this.costoUnitario ?? 0),
      precioUnitario: Number(this.precioUnitario ?? 0),
      stock: Number(this.stock ?? 0)
    };

    this.productoService.updateProducto(this.productoId, cambios).subscribe({
      next: () => {
        this.productoService.cargarProductos();
        this.cerrar.emit();
      },
      error: err => console.error('Error al editar:', err)
    });
  }


  cerrarModal() {
    this.cerrar.emit();
  }
}

