import { Usuario } from './usuario.interface';

export interface TipoUsuario {
  id?: number;
  descripcion?: string;
  usuarios?: Usuario[];
}