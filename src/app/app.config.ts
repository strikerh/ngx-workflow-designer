import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

import { routes } from './app.routes';
import { WORKFLOW_LIB_CONFIG, WorkflowDesignerLibConfig } from './alert-wf/core/workflow-lib.config';
import { PALETTE_CATEGORIES } from './alert-wf/workflow-designer/workflow-nodes-config.data';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: 'none'
        }
      }
    }),
    {
      provide: WORKFLOW_LIB_CONFIG,
      useValue: <WorkflowDesignerLibConfig>{
        api: {
          baseUrl: `${environment.workflowApiUrl}/workflow`,
          templatesUrl: `${environment.workflowApiUrl}/workflow`,
          token: environment.workflowApiToken
        },
        features: {
          import: false,
          export: true,
          new: true,
          templates: true,
          save: true,
          workflowList: true,
          backButton: false,
          backUrl: '/'
        },
        palette: {
          // You can override or reorder categories here; defaults to PALETTE_CATEGORIES
          categories: PALETTE_CATEGORIES
        }
      }
    },
    ConfirmationService,
    MessageService
  ]
};
