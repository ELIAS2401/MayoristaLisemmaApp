import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductoService } from '../../services/producto-service';
import { Producto } from '../../../../interfaces/producto.interface';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../shared/header.component/header.component';
import { AgregarProducto } from '../agregar-producto/agregar-producto';
import { Editar } from '../editar/editar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, AgregarProducto, Editar],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class Productos implements OnInit {

  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);
  mostrarModal = false;

  productos$ = this.productoService.productos$; // observable
  totalCosto = 0;
  totalPrecio = 0;

  busqueda: string = '';
  productosOriginal: Producto[] = [];
  productosFiltradosList: Producto[] = [];

  mostrarEditar = false;
  productoSeleccionadoId: number | null = null;

  hoy = new Date();

  ngOnInit() {

    // 1) Primero te suscribís al observable
    this.productos$.subscribe(prods => {
      console.log("PRODS:", prods);
      const activos = prods.filter(p => p.activo !== false);

      this.productosOriginal = [...prods];
      this.productosFiltradosList = [...prods];

      this.totalCosto = prods.reduce(
        (sum, item) => sum + (item.costoUnitario * (item.stock ?? 0)), 0
      );

      this.totalPrecio = prods.reduce(
        (sum, item) => sum + (item.precioUnitario * (item.stock ?? 0)), 0
      );

      // ESTO ES LO QUE LE FALTABA A TU COMPONENTE
      this.cdr.markForCheck();
    });

    // 2) Y recién después pedís los productos
    this.productoService.cargarProductos();
  }

  eliminar(id: number) {
    if (confirm('¿Desea eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => this.productoService.cargarProductos(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  agregarNuevo() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  editar(id: number) {
    this.productoSeleccionadoId = id;
    this.mostrarEditar = true;  // Mostrar modal INMEDIATAMENTE
  }

  cerrarEditar() {
    this.mostrarEditar = false;
    this.productoSeleccionadoId = null;
  }

  descargarPDF() {
    const productos = this.productosFiltradosList; // 👈 CLAVE

    const doc = new jsPDF();

    const img = new Image();
    img.src = 'assets/img/lisemma-logo.png';
    doc.addImage(img, 'PNG', 80, 5, 50, 20);

    doc.setFontSize(18);
    doc.text('Inventario de Productos', 14, 40);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 50);

    // Totales SOLO de lo visible
    const totalCosto = productos.reduce(
      (sum, p) => sum + p.costoUnitario * (p.stock ?? 0), 0
    );

    const totalPrecio = productos.reduce(
      (sum, p) => sum + p.precioUnitario * (p.stock ?? 0), 0
    );

    const diferencia = totalPrecio - totalCosto;

    doc.text(`Costo Total: $${totalCosto.toLocaleString()}`, 14, 60);
    doc.text(`Precio Total: $${totalPrecio.toLocaleString()}`, 14, 67);
    doc.text(`Diferencia: $${diferencia.toLocaleString()}`, 14, 74);

    autoTable(doc, {
      startY: 85,
      head: [['Nombre', 'Categoría', 'Stock', 'Costo', 'Precio', 'Costo Inventario', 'Precio Inventario']],
      body: productos.map(p => [
        p.nombre,
        p.categoria?.nombre || '-',
        p.stock ?? 0,
        `$${p.costoUnitario}`,
        `$${p.precioUnitario}`,
        `$${p.costoUnitario * (p.stock ?? 0)}`,
        `$${p.precioUnitario * (p.stock ?? 0)}`
      ]),
      styles: { fontSize: 9 }
    });

    doc.save('inventario.pdf');
  }


  actualizarFiltro() {
    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.productosFiltradosList = [...this.productosOriginal];
      return;
    }

    this.productosFiltradosList = this.productosOriginal.filter(p =>
      p.nombre?.toLowerCase().includes(texto)
    );
  }

  activarProducto(id: number) {
    if (!confirm('¿Desea activar este producto? El stock comenzará en 0.')) {
      return;
    }

    this.productoService.updateProducto(id, {
      activo: true,
      stock: 0
    }).subscribe({
      next: () => {
        this.productoService.cargarProductos();
      },
      error: err => console.error('Error al activar producto:', err)
    });
  }

}
