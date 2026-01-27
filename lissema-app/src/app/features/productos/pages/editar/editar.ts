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

  stockActual = 0;
  stockAReponer: number | null = null;

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
        this.stockActual = p.stock ?? 0;
        this.stockAReponer = null;
        this.cdr.detectChanges();
      }
    });
  }

  guardar() {
    const cambios: any = {
      nombre: this.nombre,
      categoriaId: this.categoriaId ? Number(this.categoriaId) : null,
      costoUnitario: this.costoUnitario,
      precioUnitario: this.precioUnitario,
    };

    if (this.stockAReponer && this.stockAReponer > 0) {
      cambios.stockAReponer = Number(this.stockAReponer);
    }

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

