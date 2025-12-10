import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/registro',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/pages/registro/registro').then(c => c.Registro)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(c => c.Login)
  },
  {
    path: 'productos', loadComponent: () =>
      import('./features/productos/pages/productos/productos').then(c => c.Productos)
  }
];
