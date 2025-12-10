import { Producto } from './producto.interface';

export interface Categoria {
  id?: number;
  nombre: string;
  productos?: Producto[];
}