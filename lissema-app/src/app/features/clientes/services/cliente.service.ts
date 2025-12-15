import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from '../../../interfaces/cliente.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  clientes$ = this.clientesSubject.asObservable();

  private api = environment.apiUrl + '/clientes';
  private http = inject(HttpClient);

  cargarClientes() {
    this.http.get<Cliente[]>(this.api).subscribe(clientes => {
      this.clientesSubject.next(clientes);
    });
  }

  agregarCliente(cliente: Cliente) {
    return this.http.post<Cliente>(this.api, cliente);
  }

  eliminarCliente(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  obtenerClientePorId(id: number) {
    return this.http.get<Cliente>(`${this.api}/${id}`);
  }

  editarCliente(id: number, cliente: Cliente) {
    return this.http.put(`${this.api}/${id}`, cliente);
  }
}
