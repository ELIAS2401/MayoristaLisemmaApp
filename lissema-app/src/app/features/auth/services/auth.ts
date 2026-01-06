import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Usuario } from '../../../interfaces/usuario.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseApiUrl = `${environment.apiUrl}/usuarios`;

  private http = inject(HttpClient);

  // =========================
  // ESTADO DE SESIÓN
  // =========================
  private readonly _isLoggedIn = new BehaviorSubject<boolean>(false);
  readonly isLoggedIn$ = this._isLoggedIn.asObservable();

  private readonly _currentUser = new BehaviorSubject<Usuario | null>(null);
  readonly currentUser$ = this._currentUser.asObservable();

  // =========================
  // CONSTRUCTOR
  // =========================
  constructor() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');

    if (token && user) {
      this._isLoggedIn.next(true);
      this._currentUser.next(JSON.parse(user));
    }
  }

  // =========================
  // REGISTRO
  // =========================
  register(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseApiUrl}/registro`, usuario);
  }

  // =========================
  // LOGIN
  // =========================
  login(email: string, password: string): Observable<{ token: string; user: Usuario }> {
    return this.http
      .post<{ token: string; user: Usuario }>(`${this.baseApiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res.token && res.user) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('usuario', JSON.stringify(res.user));
            this.setCurrentUser(res.user);
          }
        })
      );
  }

  // =========================
  // USUARIO ACTUAL
  // =========================
  setCurrentUser(user: Usuario) {
    this._currentUser.next(user);
    this._isLoggedIn.next(true);

    if (user.id !== undefined) {
      sessionStorage.setItem('idUsuario', user.id.toString());
    }
  }

  getCurrentUser(): Usuario | null {
    return this._currentUser.value;
  }

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('idUsuario');

    this._currentUser.next(null);
    this._isLoggedIn.next(false);
  }

  // =========================
  // TOKEN / AUTH
  // =========================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
