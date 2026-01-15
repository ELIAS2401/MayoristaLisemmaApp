import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../shared/header.component/header.component';
import { NotaCreditoService } from '../../services/nota-credito-service';
import { NotaCredito } from '../../../../interfaces/nota-credito.interface';
import { ChangeDetectorRef } from '@angular/core';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-listar-notas-credito',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './listar-notas-credito.html',
  styleUrl: './listar-notas-credito.css',
})
export class ListarNotasCredito implements OnInit {

  notas: NotaCredito[] = [];
  abierta: number | null = null;
  constructor(
    private service: NotaCreditoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.service.notas$.subscribe(list => {
      this.notas = [...list];
      this.cdr.markForCheck();
      console.log(this.notas);
    });

    this.service.cargarNotas();
    
  }
  toggle(id: number) {
    this.abierta = this.abierta === id ? null : id;
  }
  descargar(nota: NotaCredito) {

    const doc = new jsPDF();
    let y = 20;

    // TÍTULO
    doc.setFontSize(16);
    doc.text('Nota de Crédito', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(11);
    doc.text(`N°: ${nota.id}`, 10, y);
    y += 6;

    doc.text(`Fecha: ${new Date(nota.fecha).toLocaleDateString()}`, 10, y);
    y += 6;

    const cliente = nota.cliente?.nombreDueno || 'Consumidor Final';
    doc.text(`Cliente: ${cliente}`, 10, y);
    y += 10;

    // ENCABEZADO TABLA
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', 10, y);
    doc.text('Cant.', 90, y);
    doc.text('Precio', 120, y);
    doc.text('Subtotal', 160, y);
    y += 5;

    doc.setFont('helvetica', 'normal');

    // DETALLES
    nota.detalles.forEach(d => {

      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(d.ventaDetalle.producto.nombre, 10, y);
      doc.text(String(d.cantidad), 95, y, { align: 'right' });
      doc.text(`$${d.precioUnitario}`, 125, y, { align: 'right' });
      doc.text(`$${d.cantidad * d.precioUnitario}`, 170, y, { align: 'right' });

      y += 6;
    });

    // TOTAL
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: $${nota.total}`, 170, y, { align: 'right' });

    // DESCARGA
    doc.save(`nota-credito-${nota.id}.pdf`);
  }

}
