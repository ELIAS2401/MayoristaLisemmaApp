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
import { NotaCredito } from '../generar-nota-credito/generar-nota-credito';

@Component({
  selector: 'app-listar-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, VerDetalle, RegistrarVenta, NotaCredito],
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

  mostrarNotaCredito = false;

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

    if (venta.estado !== 'ACTIVA') {
      throw new Error('Solo se pueden anular ventas ACTIVAS');
    }

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

  descargarResumenPDF() {
    const ventas = this.ventasFiltradas.filter(v => v.estado !== 'ANULADA');

    if (ventas.length === 0) {
      alert('No hay ventas activas para imprimir');
      return;
    }

    this.calcularResumenZona();

    const doc = new jsPDF();
    let y = 20;

    const img = new Image();
    img.src = 'assets/img/lisemma-logo.png';
    doc.addImage(img, 'PNG', 80, 5, 50, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Resumen de Ventas', 14, y + 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Fecha de impresión: ${new Date().toLocaleDateString()}`,
      14,
      y + 28
    );

    if (this.zonaSeleccionada) {
      doc.text(`Zona: ${this.zonaSeleccionada}`, 120, y + 28);
    }

    y += 40;

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Cantidad total']],
      body: this.resumenZona.map(r => [r.producto, r.cantidad]),
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold'
      }
    });

    y = (doc as any).lastAutoTable.finalY + 5;

    doc.text(
      `Total de productos vendidos: ${this.totalProductosZona}`,
      14,
      y
    );

    doc.save('resumen-ventas.pdf');
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

  descargarFactura(venta: Venta) {
    const doc = new jsPDF();
    let y = 20;

    /* =========================
       LOGO
    ========================= */
    const img = new Image();
    img.src = 'assets/img/lisemma-logo.png';
    doc.addImage(img, 'PNG', 80, 5, 50, 20);

    /* =========================
       TÍTULO
    ========================= */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Factura - Venta #${venta.id}`, 14, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    y += 35;

    /* =========================
       DATOS GENERALES
    ========================= */
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, 14, y);
    y += 5;
    doc.text(`Vendedor: ${venta.usuario.nombre}`, 14, y);
    y += 5;
    doc.text(`Cliente: ${venta.cliente?.nombreDueno || 'Consumidor Final'}`, 14, y);
    y += 5;
    doc.text(`Zona: ${venta.cliente?.zona || '-'}`, 14, y);
    y += 5;
    doc.text(`Dirección: ${venta.cliente?.direccion || '-'}`, 14, y);

    y += 8;

    /* =========================
       TABLA DE PRODUCTOS
    ========================= */
    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: venta.detalles.map(d => [
        d.producto.nombre,
        d.cantidad,
        `$${Number(d.precioUnitario).toLocaleString()}`,
        `$${Number(d.cantidad * d.precioUnitario).toLocaleString()}`
      ]),
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold'
      }
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    /* =========================
       CÁLCULOS
    ========================= */
    const subtotal = venta.detalles.reduce(
      (sum, d) => sum + Number(d.cantidad) * Number(d.precioUnitario),
      0
    );

    const tieneNotaCredito = !!venta.notaCredito;

    /* =========================
       SUBTOTAL
    ========================= */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(
      `Subtotal: $${subtotal.toLocaleString()}`,
      196,
      y,
      { align: 'right' }
    );

    y += 6;

    /* =========================
       NOTA DE CRÉDITO
    ========================= */
    if (tieneNotaCredito && venta.notaCredito) {
      doc.setTextColor(0, 128, 0);

      doc.text(
        `Nota de Crédito #${venta.notaCredito.id}: -$${Number(venta.montoNotaUsado).toLocaleString()}`,
        196,
        y,
        { align: 'right' }
      );

      y += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Estado de la Nota: ${venta.notaCredito.estado}`,
        196,
        y,
        { align: 'right' }
      );

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      y += 6;
    }

    /* =========================
       TOTAL FINAL
    ========================= */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(
      `TOTAL A PAGAR: $${Number(venta.total).toLocaleString()}`,
      196,
      y,
      { align: 'right' }
    );

    /* =========================
       ACLARACIÓN
    ========================= */
    if (tieneNotaCredito) {
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'El total refleja la aplicación de una Nota de Crédito.',
        14,
        y
      );
    }

    /* =========================
       GUARDAR PDF
    ========================= */
    doc.save(`factura-venta-${venta.id}.pdf`);
  }


  abrirNotaCredito(venta: Venta) {
    this.ventaSeleccionada = venta;
    this.mostrarNotaCredito = true;
  }

  cerrarNotaCredito() {
    this.mostrarNotaCredito = false;
    this.ventaSeleccionada = undefined;
  }

}

