import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../../interfaces/producto.interface';
@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly baseApiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  getProductos() {
    console.log("URL que pega Angular:", this.baseApiUrl);
    
    return this.http.get<Producto[]>(this.baseApiUrl);
  }

  getProducto(id: number) {
    return this.http.get<Producto>(`${this.baseApiUrl}/${id}`);
  }

  updateProducto(id: number, data: any) {
    return this.http.put(`${this.baseApiUrl}/${id}`, data);
  }
}
