import { Cliente } from './cliente.interface';
import { Usuario } from './usuario.interface';
import { DetalleVenta } from './detalle-venta.interface';

export interface Venta {
  id?: number;
  fecha?: Date;
  clienteId?: number;
  cliente?: Cliente;
  usuarioId: number;
  usuario?: Usuario;
  total: number;
  detalles?: DetalleVenta[];
}