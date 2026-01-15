import { Venta } from './venta.interface';
import { Producto } from './producto.interface';

export interface DetalleVenta {
  id: number;
  cantidad: number;
  cantidadAcreditada: number;
  precioUnitario: number;
  producto: Producto;
}