import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  usuario?: Usuario | null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  cerrarSesion() {
    this.authService.logout();
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }
}
