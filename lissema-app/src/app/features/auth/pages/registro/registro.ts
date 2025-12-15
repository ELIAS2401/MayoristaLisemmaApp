import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../../../interfaces/usuario.interface';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  nombre = '';
  apellido = '';
  email = '';
  dni: number | null = null;
  telefono = '';
  direccion = '';
  zona = '';
  password = '';
  passwordConfirmar = '';
  mensajeError = '';

  // ---------------------------
  // VALIDACIONES EN TIEMPO REAL
  // ---------------------------
  get emailValido(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.email);
  }

  get passwordValida(): boolean {
    const regex = /^(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(this.password);
  }

  get passwordsCoinciden(): boolean {
    return this.password === this.passwordConfirmar && this.password.length > 0;
  }

  // ---------------------------
  // REGISTRARSE
  // ---------------------------
  registrarse() {
    if (!this.emailValido) {
      this.mensajeError = 'El email no es válido';
      return;
    }

    if (!this.passwordValida) {
      this.mensajeError = 'La contraseña debe tener al menos 8 caracteres y un símbolo';
      return;
    }

    if (!this.passwordsCoinciden) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    const usuario: Usuario = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      dni: this.dni?.toString() ?? '',
      telefono: this.telefono,
      direccion: this.direccion,
      zona: this.zona,
      password: this.password,
      tipoUsuarioId: 1
    };

    this.authService.register(usuario).subscribe({
      next: () => this.irALogin(),
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al registrar usuario'; 
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------
  // NAVEGACIÓN
  // ---------------------------
  irALogin() {
    this.router.navigate(['/login'], {
      queryParams: { registrado: 'ok' }
    });
  }
}
