import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@quexlo/alert-workflow').then(m => m.WorkflowDesignerComponent)
  },
  {
    path: 'workflow-designer',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
