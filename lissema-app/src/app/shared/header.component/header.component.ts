import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private router = inject(Router);

  cerrarSesion() {
    // Aquí puedes limpiar tokens, localStorage, etc.
    console.log('Cerrando sesión...');
    this.router.navigate(['/auth/login']);
  }
}
