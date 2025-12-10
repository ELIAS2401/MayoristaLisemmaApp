import { Venta } from './venta.interface';

export interface Cliente {
  id?: number;
  nombreNegocio: string;
  nombreDueno?: string;
  telefono?: string;
  direccion?: string;
  zona?: string;
  email?: string;
  cuit: string;
  ventas?: Venta[];
}