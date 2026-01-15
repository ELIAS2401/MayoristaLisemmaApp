import { Venta } from './venta.interface';
import { Usuario } from './usuario.interface';
import { Cliente } from './cliente.interface';
import { NotaCreditoDetalle } from './nota-credito-detalle.interface';

export interface NotaCredito {
  id: number;
  fecha: string;

  total: number;
  montoUsado: number;
  estado: 'DISPONIBLE' | 'PARCIAL' | 'USADA' | 'ANULADA';

  clienteId: number;
  cliente?: Cliente;

  usuario: Usuario;
  detalles: NotaCreditoDetalle[];
}
