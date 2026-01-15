import { NotaCreditoService } from '../../../notas-credito/services/nota-credito-service';
import { VentaService } from '../../services/venta-service';
import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Venta } from '../../../../interfaces/venta.interface';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CrearNotaCreditoItem } from '../../../../interfaces/crear-nota-credito-item.interface';

@Component({
  selector: 'app-nota-credito',
  imports: [CommonModule, FormsModule],
  templateUrl: './generar-nota-credito.html',
  styleUrl: './generar-nota-credito.css',
})
export class NotaCredito {
  @Input() venta!: Venta;
  @Output() cerrar = new EventEmitter<void>();

  detalles: any[] = [];
  totalCredito = 0;

  private notaCreditoService = inject(NotaCreditoService);
  private ventaService = inject(VentaService);

  ngOnInit() {
    this.detalles = this.venta.detalles.map(d => ({
      ventaDetalleId: d.id,
      producto: d.producto,
      precioUnitario: d.precioUnitario,
      cantidadVendida: d.cantidad,
      cantidadAcreditada: d.cantidadAcreditada,
      cantidadDisponible: d.cantidad - d.cantidadAcreditada,
      devolver: 0
    }));
  }

  recalcular() {
    this.totalCredito = this.detalles.reduce(
      (sum, d) => sum + (d.devolver * d.precioUnitario || 0),
      0
    );
  }

  confirmar() {
    const items: CrearNotaCreditoItem[] = this.detalles
      .filter(d => d.devolver > 0)
      .map(d => ({
        ventaDetalleId: d.ventaDetalleId,
        productoId: d.producto.id,
        cantidad: d.devolver,
        precioUnitario: d.precioUnitario
      }));

    this.notaCreditoService
      .generarNotaCredito(this.venta.id, items)
      .subscribe({
        next: () => {
          this.ventaService.cargarVentas();
          this.notaCreditoService.cargarNotas();
          this.cerrar.emit();
        },
        error: err => {
          alert(err?.error?.message || 'No se pudo generar la nota de crédito');
        }
      });
  }

}
