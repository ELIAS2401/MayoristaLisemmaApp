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
}
