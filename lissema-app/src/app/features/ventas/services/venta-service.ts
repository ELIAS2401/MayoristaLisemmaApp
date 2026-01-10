import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Venta } from '../../../interfaces/venta.interface';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth';
import { inject } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class VentaService {

  private readonly baseApiUrl = `${environment.apiUrl}/ventas`;

  private ventasSubject = new BehaviorSubject<Venta[]>([]);
  ventas$ = this.ventasSubject.asObservable();
  private authService = inject(AuthService);
  constructor(private http: HttpClient) { }

  cargarVentas() {
    this.http.get<Venta[]>(this.baseApiUrl).subscribe({
      next: (ventas) => {
        const ventasConvertidas: Venta[] = ventas.map(v => ({
          ...v,
          total: Number(v.total),
          detalles: v.detalles ?? [] // seguridad extra
        }));

        this.ventasSubject.next(ventasConvertidas);
      },
      error: (err) => {
        console.error('Error al obtener ventas:', err);
      }
    });
  }

  anularVenta(id: number) {
    return this.http.patch(`${this.baseApiUrl}/${id}/anular`, {});
  }

  agregarVenta(data: any) {
    return this.http.post(`${this.baseApiUrl}`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
