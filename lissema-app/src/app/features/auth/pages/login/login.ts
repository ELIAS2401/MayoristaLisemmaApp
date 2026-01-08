import { For } from './../../../../../../node_modules/@babel/types/lib/index-legacy.d';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { NgForm } from '@angular/forms';

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
  mensajeExito: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/productos']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['registrado'] === 'ok') {
        this.mensajeExito = 'Registro exitoso. Ya podés iniciar sesión.';
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  loguearse(form: NgForm) {
    this.mensajeError = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.loading = false;
        this.mensajeError = 'Mail y/o contraseña incorrectos.';
        form.control.markAllAsTouched(); // 👈 clave
      }
    });
  }
}