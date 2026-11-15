import { Routes } from '@angular/router';

import { Analysis } from './components/dashboard/analysis/analysis';
import { Categories } from './components/dashboard/categories/categories';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/login/login';
import { Transactions } from './components/dashboard/transactions/transactions';
import { dashboardGuard, loginGuard } from './guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Route titles are translation keys, resolved by TranslatedTitleStrategy.
  { path: 'login', component: Login, canActivate: [loginGuard], title: 'LOGIN.LOGIN' },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [dashboardGuard],
    children: [
      { path: 'transactions', component: Transactions, title: 'DASHBOARD.TRANSACTIONS' },
      { path: 'categories', component: Categories, title: 'DASHBOARD.CATEGORIES' },
      { path: 'analysis', component: Analysis, title: 'DASHBOARD.ANALYSIS' },
      { path: '', redirectTo: 'transactions', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
