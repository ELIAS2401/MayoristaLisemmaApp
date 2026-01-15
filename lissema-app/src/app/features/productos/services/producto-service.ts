import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../../interfaces/producto.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly baseApiUrl = `${environment.apiUrl}/productos`;
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  private http = inject(HttpClient);

  // Método para cargar productos desde el backend
  cargarProductos() {
    this.http.get<Producto[]>(this.baseApiUrl).subscribe({
      next: p => {
        const productosConvertidos = p.map(item => ({
          ...item,
          activo: item.activo ?? true,
          categoria: item.categoria ?? { nombre: "-" },
          costoUnitario: Number(item.costoUnitario ?? 0),
          precioUnitario: Number(item.precioUnitario ?? 0),
          stock: Number(item.stock ?? 0)
        }));

        this.productosSubject.next(productosConvertidos); // EMITE Y ACTUALIZA
      },
      error: (err) => console.error('Error al obtener productos:', err)
    });
  }

  getProducto(id: number) {
    return this.http.get<Producto>(`${this.baseApiUrl}/${id}`);
  }

  updateProducto(id: number, data: any) {
    return this.http.put(`${this.baseApiUrl}/${id}`, data);
  }

  eliminarProducto(id: number) {
    return this.http.delete(`${this.baseApiUrl}/${id}`);
  }

  agregarProducto(producto: Producto) {
    return this.http.post<Producto>(this.baseApiUrl, producto);
  }
}
