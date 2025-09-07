import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/categorize',
    pathMatch: 'full'
  },
  {
    path: 'categorize',
    loadComponent: () => import('./components/expense-categorization.component').then(m => m.ExpenseCategorizationComponent)
  },
  {
    path: 'import',
    loadComponent: () => import('./components/expense-import.component').then(m => m.ExpenseImportComponent)
  }
];
