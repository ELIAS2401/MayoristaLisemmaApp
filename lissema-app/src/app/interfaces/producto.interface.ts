import { Categoria } from './categoria.interface';
import { DetalleVenta } from './detalle-venta.interface';

export interface Producto {
  id?: number;
  nombre: string;
  categoriaId?: number;
  categoria?: Categoria;
  stock?: number;
  costoUnitario: number;
  precioUnitario: number;
  creadoEn?: Date;
  activo?: boolean;
  detalleVentas?: DetalleVenta[];
}
