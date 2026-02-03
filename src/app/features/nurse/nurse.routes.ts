import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { featureGuard } from '../../core/guards/feature.guard';

export default [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/nurse-layout').then(m => m.NurseLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pages/pacientes/pacientes').then(m => m.PacientesComponent)
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./pages/pacientes/paciente-detalle').then(m => m.PacienteDetalleComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/agenda/agenda').then(m => m.AgendaComponent)
      },
      {
        path: 'cred',
        loadComponent: () => import('./pages/cred/cred').then(m => m.CREDComponent)
      },
      {
        path: 'vacunas',
        loadComponent: () => import('./pages/vacunas/vacunas').then(m => m.VacunasComponent)
      },
      {
        path: 'historia-clinica',
        loadComponent: () => import('./pages/historia-clinica/historia-clinica').then(m => m.HistoriaClinicaComponent)
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./pages/facturacion/facturacion').then(m => m.FacturacionComponent)
      },
      {
        path: 'reportes',
        canActivate: [featureGuard],
        data: { feature: 'reports_his' },
        loadComponent: () => import('./pages/reportes/reportes').then(m => m.ReportesComponent)
      },
      {
        path: 'documentos',
        loadComponent: () => import('./pages/documentos/documentos').then(m => m.DocumentosComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/configuracion/configuracion').then(m => m.ConfiguracionComponent)
      }
    ]
  }
] as Routes;
