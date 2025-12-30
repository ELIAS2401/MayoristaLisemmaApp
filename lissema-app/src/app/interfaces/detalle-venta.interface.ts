import { Venta } from './venta.interface';
import { Producto } from './producto.interface';

export interface DetalleVenta {
  id: number;
  cantidad: number;
  precioUnitario: number;
  producto: Producto;
}