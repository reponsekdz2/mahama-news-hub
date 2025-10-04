
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'clients',
        loadChildren: () => import('./modules/clients/clients.module').then(m => m.ClientsModule)
      },
      // Placeholder routes for other modules
      { path: 'loans', loadChildren: () => import('./modules/loans/loans.module').then(m => m.LoansModule) },
      { path: 'savings', loadChildren: () => import('./modules/savings/savings.module').then(m => m.SavingsModule) },
      { path: 'reports', loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule) },
      { path: 'accounting', loadChildren: () => import('./modules/accounting/accounting.module').then(m => m.AccountingModule) },
      { path: 'settings', loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    relativeLinkResolution: 'legacy'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
