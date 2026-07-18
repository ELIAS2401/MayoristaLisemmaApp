import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inject, OnInit } from '@angular/core';

import { VentaService } from '../../../ventas/services/venta-service';
import { Venta } from '../../../../interfaces/venta.interface';
import { HeaderComponent } from '../../../../shared/header.component/header.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-listar-reportes',
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './listar-reportes.html',
  styleUrl: './listar-reportes.css',
})
export class ListarReportes implements OnInit {

  private ventaService = inject(VentaService);

  ventasOriginal: Venta[] = [];
  ventasFiltradas: Venta[] = [];

  // Filtros
  fechaDesde = '';
  fechaHasta = '';
  zonaSeleccionada = '';
  clienteBusqueda = '';
  gananciaTotal = 0;

  zonas: string[] = [];

  // KPIs
  totalVendido = 0;
  cantidadVentas = 0;
  ticketPromedio = 0;

  // Reportes
  ventasPorZona: any[] = [];
  topClientes: any[] = [];
  fechaHoy = '';

  ngOnInit() {

    this.ventaService.ventas$.subscribe(v => {

      // 🚫 ignorar emisión vacía inicial
      if (!v || v.length === 0) return;

      this.ventasOriginal = v.filter(x => x.estado !== 'ANULADA');

      // setear fecha SOLO cuando hay datos reales
      this.fechaHoy = new Date().toISOString().slice(0, 10);
      this.fechaDesde = this.fechaHoy;
      this.fechaHasta = this.fechaHoy;

      this.zonas = [
        ...new Set(
          this.ventasOriginal
            .map(v => v.cliente?.zona)
            .filter(Boolean)
        )
      ] as string[];

      this.aplicarFiltros();
    });

    this.ventaService.cargarVentas();
  }

  getHoy(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  aplicarFiltros() {

    const desde = this.fechaDesde
      ? new Date(this.fechaDesde + 'T00:00:00')
      : null;

    const hasta = this.fechaHasta
      ? new Date(this.fechaHasta + 'T23:59:59')
      : null;

    this.ventasFiltradas = this.ventasOriginal.filter(v => {

      const fechaVenta = new Date(v.fecha);

      const fechaOk =
        (!desde || fechaVenta >= desde) &&
        (!hasta || fechaVenta <= hasta);

      const zonaOk = this.zonaSeleccionada
        ? v.cliente?.zona === this.zonaSeleccionada
        : true;

      const clienteOk = this.clienteBusqueda
        ? v.cliente?.nombreDueno
          ?.toLowerCase()
          .includes(this.clienteBusqueda.toLowerCase())
        : true;

      return fechaOk && zonaOk && clienteOk;
    });

    this.calcularKPIs();
    this.calcularVentasPorZona();
    this.calcularTopClientes();
  }

  calcularTotalVentaReal(venta: Venta): number {
    const totalNC = (venta.notasCredito ?? [])
      .reduce((sum, nc) => sum + Number(nc.total), 0);
    return Number(venta.total) - totalNC;
  }

  calcularKPIs() {

    this.totalVendido = this.ventasFiltradas
      .reduce((sum, v) => sum + this.calcularTotalVentaReal(v), 0);


    this.cantidadVentas = this.ventasFiltradas.length;


    this.ticketPromedio = this.cantidadVentas
      ? this.totalVendido / this.cantidadVentas
      : 0;


    this.gananciaTotal = this.ventasFiltradas.reduce((sum, venta) => {

      const gananciaVenta = venta.detalles.reduce((sumaItem, detalle) => {

        const costo = Number(detalle.producto.costoUnitario);

        const cantidadVendidaReal =
          detalle.cantidad - (detalle.cantidadAcreditada ?? 0);

        return sumaItem +
          (Number(detalle.precioUnitario) - costo)
          * cantidadVendidaReal;

      }, 0);

      const gananciaDevuelta = (venta.notasCredito ?? [])
        .reduce((sumaNC, nc) => {
          return sumaNC + (nc.detalles ?? []).reduce((sumaItem, det) => {
            const costo = Number(det.ventaDetalle.producto.costoUnitario);
            return sumaItem +
              (Number(det.precioUnitario) - costo) * det.cantidad;
          }, 0);
        }, 0);

      return sum + gananciaVenta - gananciaDevuelta;

    }, 0);
  }

  calcularVentasPorZona() {
    const map = new Map<string, number>();

    this.ventasFiltradas.forEach(v => {
      const zona = v.cliente?.zona || 'Sin zona';
      map.set(zona, (map.get(zona) || 0) + this.calcularTotalVentaReal(v));
    });

    this.ventasPorZona = Array.from(map.entries()).map(([zona, total]) => ({
      zona,
      total
    }));
  }

  calcularTopClientes() {
    const map = new Map<string, number>();

    this.ventasFiltradas.forEach(v => {
      const cliente = v.cliente?.nombreDueno || 'Consumidor Final';
      map.set(cliente, (map.get(cliente) || 0) + this.calcularTotalVentaReal(v));
    });

    this.topClientes = Array.from(map.entries())
      .map(([cliente, total]) => ({ cliente, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  descargarPDF() {

    if (this.cantidadVentas === 0) {
      alert('No hay datos para imprimir');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    // Logo
    const img = new Image();
    img.src = 'assets/img/lisemma-logo.png';
    doc.addImage(img, 'PNG', 80, 5, 50, 20);

    // Título
    doc.setFontSize(16);
    doc.text('Reporte del Negocio', 14, y + 20);

    // Filtros aplicados
    doc.setFontSize(10);
    doc.text(`Desde: ${this.fechaDesde || '-'}`, 14, y + 28);
    doc.text(`Hasta: ${this.fechaHasta || '-'}`, 60, y + 28);
    doc.text(`Zona: ${this.zonaSeleccionada || 'Todas'}`, 110, y + 28);
    doc.text(
      `Cliente: ${this.clienteBusqueda || 'Todos'}`,
      14,
      y + 34
    );

    doc.text(
      `Fecha de impresión: ${new Date().toLocaleDateString()}`,
      14,
      y + 40
    );

    y += 50;

    // KPIs
    doc.setFontSize(12);
    doc.text('Resumen General', 14, y);
    y += 6;

    doc.setFontSize(10);
    doc.text(`Total vendido: $${this.totalVendido.toLocaleString()}`, 14, y);
    y += 5;
    doc.text(`Ganancia: $${this.gananciaTotal.toLocaleString()}`, 14, y);
    y += 5;
    doc.text(`Cantidad de ventas: ${this.cantidadVentas}`, 14, y);
    y += 5;
    doc.text(
      `Ticket promedio: $${Math.round(this.ticketPromedio).toLocaleString()}`,
      14,
      y
    );

    y += 10;

    // Ventas por zona
    autoTable(doc, {
      startY: y,
      head: [['Zona', 'Total vendido']],
      body: this.ventasPorZona.map(z => [
        z.zona,
        `$${Number(z.total).toLocaleString()}`
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 53, 69] }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Top clientes
    autoTable(doc, {
      startY: y,
      head: [['Cliente', 'Total comprado']],
      body: this.topClientes.map(c => [
        c.cliente,
        `$${Number(c.total).toLocaleString()}`
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 53, 69] }
    });

    doc.save('reporte-negocio.pdf');
  }

}
