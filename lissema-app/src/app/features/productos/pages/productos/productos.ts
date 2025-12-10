import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ProductoService } from '../../services/producto-service';
import { Producto } from '../../../../interfaces/producto.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  totalCosto = 0;
  totalPrecio = 0;

  ngOnInit() {
    this.productoService.getProductos().subscribe({
      next: (p) => {
        this.productos = p.map(item => ({
          ...item,
          costoUnitario: Number(item.costoUnitario ?? 0),
          precioUnitario: Number(item.precioUnitario ?? 0),
          stock: Number(item.stock ?? 0)
        }));

        this.totalCosto = this.productos.reduce(
          (sum, item) => sum + (item.costoUnitario * (item.stock ?? 0)), 0
        );
        this.totalPrecio = this.productos.reduce(
          (sum, item) => sum + (item.precioUnitario * (item.stock ?? 0)), 0
        );

        // Forzar que Angular detecte cambios y renderice la tabla
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  editar(id: number) {
    this.router.navigate(['/productos/editar', id]);
  }
}
