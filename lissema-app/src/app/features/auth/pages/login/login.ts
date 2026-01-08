import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  submitted = false;
  loading = false;
  mensajeError = '';
  mensajeExito = '';

  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

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

  loguearse() {
    this.submitted = true;
    this.loginForm.markAllAsTouched();
    this.mensajeError = '';

    if (this.loginForm.invalid) {
      this.mensajeError = 'Completá correctamente los campos.';
      this.cdr.detectChanges(); // 👈 CLAVE
      return;
    }

    this.loading = true;

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // 👈 CLAVE
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/productos']);
        },
        error: (err) => {

          if (err.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Intentalo más tarde.';
          } else if (err.status === 401 || err.status === 403) {
            this.mensajeError = 'Mail o contraseña incorrectos.';
          } else {
            this.mensajeError = 'Ocurrió un error inesperado.';
          }

          this.cdr.detectChanges(); // 👈 ESTO HACE QUE SE VEA INMEDIATO
        }
      });
  }
  irARegistro() {
    this.router.navigate(['/registro']);
  }
}
