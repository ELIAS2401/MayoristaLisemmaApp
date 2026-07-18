import { Component, Output, EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { Venta } from '../../../../interfaces/venta.interface';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-ver-detalle',
  imports: [CommonModule],
  templateUrl: './ver-detalle.html',
  styleUrl: './ver-detalle.css',
})
export class VerDetalle {
  @Input() venta?: Venta;
  @Output() cerrar = new EventEmitter<void>();

  calcularTotalVentaReal(venta: Venta): number {
    return Number(venta.total) - this.calcularTotalNC(venta);
  }

  calcularTotalNC(venta: Venta): number {
    return (venta.notasCredito ?? [])
      .reduce((sum, nc) => sum + Number(nc.total), 0);
  }
}
