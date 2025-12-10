import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../../../interfaces/usuario.interface';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseApiUrl = `${environment.apiUrl}/auth`; // 👉 tu backend Node/Prisma

  private http = inject(HttpClient);
  // Estado de sesión
  private readonly _isLoggedIn = new BehaviorSubject<boolean>(false);
  readonly isLoggedIn$ = this._isLoggedIn.asObservable();

  private readonly _currentUser = new BehaviorSubject<Usuario | null>(null);
  readonly currentUser$ = this._currentUser.asObservable();
  // -------------------
  //  REGISTRO
  // -------------------
  register(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseApiUrl}/register`, usuario);
  }

  // LOGIN
  login(email: string, password: string): Observable<{ token: string; user: Usuario }> {
    return this.http.post<{ token: string; user: Usuario }>('http://localhost:3000/login', { email, password })
      .pipe(
        tap(res => {
          if (res.token && res.user) {
            // Guardar token
            localStorage.setItem('token', res.token);

            // Guardar info del usuario
            this.setCurrentUser(res.user);
          }
        })
      );
  }

  // Guardar usuario y actualizar estado
  setCurrentUser(user: Usuario) {
    this._currentUser.next(user);
    this._isLoggedIn.next(true);

    if (user.id !== undefined) {
      sessionStorage.setItem('idUsuario', user.id.toString());
    } else {
      console.warn('El usuario no tiene id definido');
    }
  }


  // LOGOUT
  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('idUsuario');
    this._currentUser.next(null);
    this._isLoggedIn.next(false);
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Headers para peticiones autenticadas
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
