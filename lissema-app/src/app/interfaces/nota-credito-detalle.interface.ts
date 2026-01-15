import { Producto } from './producto.interface';

export interface NotaCreditoDetalle {
  id: number;
  cantidad: number;
  precioUnitario: number;

  ventaDetalle: {
    id: number;
    producto: Producto;
  };
}

