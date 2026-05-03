import { Routes } from '@angular/router';

import { Analysis } from './components/dashboard/analysis/analysis';
import { Categories } from './components/dashboard/categories/categories';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/login/login';
import { Transactions } from './components/dashboard/transactions/transactions';
import { dashboardGuard, loginGuard } from './guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuard] },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [dashboardGuard],
    children: [
      { path: 'transactions', component: Transactions },
      { path: 'categories', component: Categories },
      { path: 'analysis', component: Analysis },
      { path: '', redirectTo: 'transactions', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
