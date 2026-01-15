import { Venta } from './interfaces/venta.interface';
import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'registro',
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
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/productos/pages/listar-productos/productos').then(c => c.Productos)
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/pages/listar-clientes/listar-clientes').then(c => c.ListarClientes)
  },
  {
    path: 'ventas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ventas/pages/listar-ventas/listar-ventas').then(c => c.ListarVentas)
  },
  {
    path: 'reportes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reportes/pages/listar-reportes/listar-reportes').then(c => c.ListarReportes)
  },
  {
    path: 'notas-credito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notas-credito/pages/listar-notas-credito/listar-notas-credito').then(c => c.ListarNotasCredito)
  },
];
