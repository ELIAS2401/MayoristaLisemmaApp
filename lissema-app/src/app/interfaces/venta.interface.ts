import { Cliente } from './cliente.interface';
import { Usuario } from './usuario.interface';
import { DetalleVenta } from './detalle-venta.interface';
import { NotaCredito } from './nota-credito.interface';
export interface Venta {
  id: number;
  fecha: string;
  estado: 'ACTIVA' | 'ANULADA' | 'ACREDITADA' | 'PARCIALMENTE_ACREDITADA';

  cliente?: Cliente;
  usuario: Usuario;

  total: number;
  detalles: DetalleVenta[];

  notaCredito?: NotaCredito | null;
  montoNotaUsado?: number | null;
}
