import { Venta } from './venta.interface';
import { Producto } from './producto.interface';

export interface DetalleVenta {
  id?: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number; // precio unitario al momento de la venta
  venta?: Venta;
  producto?: Producto;
}