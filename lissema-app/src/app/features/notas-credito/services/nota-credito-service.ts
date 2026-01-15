import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth';
import { NotaCredito } from '../../../interfaces/nota-credito.interface';
import { BehaviorSubject } from 'rxjs';
import { CrearNotaCreditoItem } from '../../../interfaces/crear-nota-credito-item.interface';

@Injectable({
  providedIn: 'root',
})
export class NotaCreditoService {

  private baseUrl = `${environment.apiUrl}/notas-credito`;

  private notasSubject = new BehaviorSubject<NotaCredito[]>([]);
  notas$ = this.notasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  cargarNotas() {
    const headers = this.auth.getAuthHeaders();
    console.log('Auth headers:', headers);

    this.http.get<NotaCredito[]>(
      this.baseUrl,
      { headers }
    ).subscribe({
      next: n => this.notasSubject.next(n),
      error: err => console.error('Error cargando notas', err)
    });
  }

  cargarNotas$() {
    const headers = this.auth.getAuthHeaders();

    return this.http.get<NotaCredito[]>(this.baseUrl, { headers });
  }

  getNotasSnapshot(): NotaCredito[] {
    return this.notasSubject.value;
  }
  listarPorVenta(ventaId: number) {
    return this.http.get<NotaCredito[]>(
      `${this.baseUrl}/venta/${ventaId}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  descargarPDF(id: number) {
    return this.http.get(
      `${this.baseUrl}/${id}/pdf`,
      {
        headers: this.auth.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  generarNotaCredito(ventaId: number,
    items: CrearNotaCreditoItem[]) {
    return this.http.post(
      `${this.baseUrl}/${ventaId}`,
      { items },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
