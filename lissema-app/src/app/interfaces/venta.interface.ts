import { Cliente } from './cliente.interface';
import { Usuario } from './usuario.interface';
import { DetalleVenta } from './detalle-venta.interface';

export interface Venta {
  id: number;
  fecha: string;              // ISO desde backend
  estado: 'ACTIVA' | 'ANULADA';

  cliente?: Cliente;
  usuario: Usuario;

  total: number;
  detalles: DetalleVenta[];
}
