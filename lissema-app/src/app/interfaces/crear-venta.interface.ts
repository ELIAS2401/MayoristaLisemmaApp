import { CrearDetalleVenta } from './crear-detalle-venta.interface';
export interface CrearVenta {
  clienteId?: number;
  usuarioId: number;
  detalles: CrearDetalleVenta[];
}