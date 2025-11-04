import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./alert-wf/workflow-designer/workflow-designer.component').then(m => m.WorkflowDesignerComponent)
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
