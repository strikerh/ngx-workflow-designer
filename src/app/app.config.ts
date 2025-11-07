import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

import { provideAlertWorkflow, WorkflowDesignerLibConfig } from 'ngx-workflow-designer';
import { environment } from '../environments/environment';
import { PALETTE_CATEGORIES, WORKFLOW_NODES_CONFIG } from './workflow-nodes-config.data';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
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
    ...provideAlertWorkflow(<WorkflowDesignerLibConfig>{
      api: {
        baseUrl: `${environment.workflowApiUrl}/workflow`,
        templatesUrl: `${environment.workflowApiUrl}/workflow`,
        token: environment.workflowApiToken
      },
      features: {
        import: true,
        export: true,
        new: true,
        templates: true,
        save: true,
        workflowList: true,
        backButton: false,
        backUrl: '/'
      },
      palette: {
        categories: PALETTE_CATEGORIES,
        nodeTypes: WORKFLOW_NODES_CONFIG
      }
    }),
    ConfirmationService,
    MessageService
  ]
};
