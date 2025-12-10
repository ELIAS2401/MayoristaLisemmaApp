import { For } from './../../../../../../node_modules/@babel/types/lib/index-legacy.d';
import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = ''
  mensajeError: string = '';
  loading: boolean = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  irARegistro() {
    // Lógica para navegar a la página de registro
    this.router.navigate(['/auth/registro']);
  }

  loguearse() {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']); // Redirigir al home u otra página
      }

      , error: (err) => {
        this.loading = false;
        this.mensajeError = 'Mail y/o contraseña incorrectos.';
      }
    });
  }
}