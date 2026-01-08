import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loading = false;
  mensajeError = '';
  mensajeExito = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.mensajeError = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.loading = false;
        this.mensajeError = 'Mail y/o contraseña incorrectos.';
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
}
