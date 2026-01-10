import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VentaService } from '../../services/venta-service';
import { Venta } from '../../../../interfaces/venta.interface';
import { HeaderComponent } from '../../../../shared/header.component/header.component';
import { VerDetalle } from '../ver-detalle/ver-detalle';
import { RegistrarVenta } from '../registrar-venta/registrar-venta';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-listar-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, VerDetalle, RegistrarVenta],
  templateUrl: './listar-ventas.html',
  styleUrls: ['./listar-ventas.css'],
})

export class ListarVentas implements OnInit {

  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  ventas$ = this.ventaService.ventas$;

  ventasOriginal: Venta[] = [];
  ventasFiltradas: Venta[] = [];

  ventaSeleccionada?: Venta;
  mostrarDetalle = false;

  busquedaCliente = '';
  busquedaFecha = '';

  totalVentas = 0;
  hoy = new Date();

  mostrarAgregar = false;

  busquedaZona = '';
  zonas: string[] = [];
  zonaSeleccionada = '';

  mostrarResumenZona = false;
  resumenZona: { producto: string; cantidad: number }[] = [];
  totalProductosZona = 0;

  ngOnInit() {
    this.ventas$.subscribe(v => {
      this.ventasOriginal = [...v];
      this.ventasFiltradas = [...v]; // TODAS al entrar

      this.zonas = [
        ...new Set(
          v
            .map(x => x.cliente?.zona)
            .filter(z => z)
        )
      ] as string[];

      this.calcularTotalVentas();
      this.cdr.markForCheck();
    });

    this.ventaService.cargarVentas();
  }


  verDetalle(venta: Venta) {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.ventaSeleccionada = undefined;
  }

  abrirAgregar() {
    this.mostrarAgregar = true;
  }

  cerrarAgregar() {
    this.mostrarAgregar = false;
  }

  anular(venta: Venta) {
    if (venta.estado === 'ANULADA') return;

    if (confirm('¿Anular esta venta? El stock será restaurado.')) {
      this.ventaService.anularVenta(venta.id).subscribe(() => {
        this.ventaService.cargarVentas();
      });
    }
  }

  actualizarFiltro() {
    const texto = this.busquedaCliente.trim().toLowerCase();

    this.ventasFiltradas = this.ventasOriginal.filter(v => {

      const clienteOk = texto
        ? v.cliente?.nombreDueno?.toLowerCase().includes(texto)
        : true;

      const fechaOk = this.busquedaFecha
        ? v.fecha.startsWith(this.busquedaFecha)
        : true;

      const zonaOk = this.zonaSeleccionada
        ? v.cliente?.zona === this.zonaSeleccionada
        : true;

      return clienteOk && fechaOk && zonaOk;
    });
    this.calcularTotalVentas();
    if (this.mostrarResumenZona) {
      this.calcularResumenZona();
    }
  }

  calcularTotalVentas() {
    this.totalVentas = this.ventasFiltradas
      .filter(v => v.estado !== 'ANULADA') // opcional pero recomendado
      .reduce((sum, v) => sum + Number(v.total), 0);
  }

  filtrarHoy() {
    const hoy = new Date().toISOString().slice(0, 10);
    this.busquedaFecha = hoy;
    this.actualizarFiltro();
  }

  limpiarFiltros() {
    this.busquedaCliente = '';
    this.busquedaFecha = '';
    this.zonaSeleccionada = '';

    this.ventasFiltradas = [...this.ventasOriginal];
    this.calcularTotalVentas();
  }

  descargarPDF() {

    const ventas = this.ventasFiltradas.filter(v => v.estado !== 'ANULADA');

    this.calcularResumenZona();

    if (ventas.length === 0) {
      alert('No hay ventas activas para imprimir');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    // LOGO
    const img = new Image();
    img.src = 'assets/img/lisemma-logo.png';
    doc.addImage(img, 'PNG', 80, 5, 50, 20);

    // TITULO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Reporte de Ventas', 14, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(
      `Fecha de impresión: ${new Date().toLocaleDateString()}`,
      14,
      y + 28
    );

    if (this.zonaSeleccionada) {
      doc.text(
        `Zona: ${this.zonaSeleccionada}`,
        120,
        y + 28
      );
    }

    y += 40;

    /* =========================
      RESUMEN POR ZONA
    ========================= */

    if (this.resumenZona.length > 0) {

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(
        this.zonaSeleccionada
          ? `Resumen Zona: ${this.zonaSeleccionada}`
          : 'Resumen de todas las zonas',
        14,
        y
      );
      y += 6;

      doc.setFontSize(10);
      doc.text(
        `Total de productos vendidos: ${this.totalProductosZona}`,
        14,
        y
      );
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Producto', 'Cantidad total']],
        body: this.resumenZona.map(r => [
          r.producto,
          r.cantidad
        ]),
        styles: {
          fontSize: 9
        },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: 20,
          fontStyle: 'bold'
        }
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    ventas.forEach((venta) => {

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      /* =========================
         ENCABEZADO DE VENTA
      ========================== */

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`VENTA #${venta.id}`, 14, y);

      y += 3;
      doc.setDrawColor(180);
      doc.line(14, y, 196, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // FILA 1
      doc.text(
        `Fecha: ${new Date(venta.fecha).toLocaleString()}`,
        14,
        y
      );
      doc.text(
        `Cliente: ${venta.cliente?.nombreDueno || 'Consumidor Final'}`,
        110,
        y
      );
      y += 5;

      // FILA 2
      doc.text(
        `Dirección: ${venta.cliente?.direccion || '-'}`,
        14,
        y
      );
      doc.text(
        `Zona: ${venta.cliente?.zona || '-'}`,
        110,
        y
      );
      y += 8;

      /* =========================
         TABLA DE PRODUCTOS
      ========================== */

      autoTable(doc, {
        startY: y,
        head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: venta.detalles.map(d => [
          d.producto.nombre,
          d.cantidad,
          `$${Number(d.precioUnitario).toLocaleString()}`,
          `$${Number(d.cantidad * d.precioUnitario).toLocaleString()}`
        ]),
        styles: {
          fontSize: 9
        },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: 20,
          fontStyle: 'bold'
        }
      });

      y = (doc as any).lastAutoTable.finalY + 6;

      /* =========================
         TOTAL
      ========================== */

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(
        `TOTAL: $${Number(venta.total).toLocaleString()}`,
        196,
        y,
        { align: 'right' }
      );

      y += 6;

      // SEPARADOR FINAL
      doc.setDrawColor(200);
      doc.line(14, y, 196, y);
      y += 10;
    });

    doc.save('ventas-filtradas.pdf');
  }

  calcularResumenZona() {
    const mapa = new Map<string, number>();
    let total = 0;

    this.ventasFiltradas
      .filter(v => v.estado !== 'ANULADA')
      .forEach(venta => {
        venta.detalles.forEach(det => {
          const nombre = det.producto.nombre;
          const cant = Number(det.cantidad);

          mapa.set(nombre, (mapa.get(nombre) || 0) + cant);
          total += cant;
        });
      });

    this.resumenZona = Array.from(mapa.entries()).map(
      ([producto, cantidad]) => ({ producto, cantidad })
    );

    this.totalProductosZona = total;
  }


  toggleResumenZona() {
    this.mostrarResumenZona = !this.mostrarResumenZona;

    if (this.mostrarResumenZona) {
      this.calcularResumenZona();
    }
  }


}

