import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Transactions } from './pages/transactions/transactions';
import { Budgets } from './pages/budgets/budgets';
import { Categories } from './pages/categories/categories';
import { TaxCalculator } from './pages/tax-calculator/tax-calculator';

import { AppLayout } from './components/app-layout/app-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'transactions',
        component: Transactions
      },
      {
        path: 'budgets',
        component: Budgets
      },
      {
        path: 'categories',
        component: Categories
      },
      {
        path: 'tax-calculator',
        component: TaxCalculator
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];