import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { inject } from '@angular/core';
import { Usuario } from '../../../../interfaces/usuario.interface';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.html',
})
export class Registro {

  private router = inject(Router);
  private authService = inject(AuthService);

  loading: boolean = false;
  nombre = '';
  apellido = '';
  email = '';
  dni: number | null = null;
  password = '';
  passwordConfirmar = '';
  mensajeError: string = '';

  registrarse() {
    if (this.password !== this.passwordConfirmar) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    const usuario: Usuario = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      dni: this.dni?.toString() ?? '',  // Prisma lo guarda como string
      password: this.password
    };

    this.loading = true;

    this.authService.register(usuario).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading = false;
        this.mensajeError = 'Error en el registro. Intente nuevamente.';
      }
    });
  }

  irALogin() {
    this.router.navigate(['/auth/login']);
  }

}

