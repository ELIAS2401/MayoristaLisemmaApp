import { TipoUsuario } from './tipo-usuario.interface';
import { Venta } from './venta.interface';

export interface Usuario {
  id?: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  zona?: string;
  email?: string;
  password: string;
  creadoEn?: Date;
  tipoUsuarioId?: number;
  tipoUsuario?: TipoUsuario;
  ventas?: Venta[];
}