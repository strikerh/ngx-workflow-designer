# @quexlo/alert-workflow (Angular 20, Standalone, Zoneless)

Reusable workflow designer as a drop‑in component. Tailwind 3 + PrimeNG 20, fully standalone, no NgModules, and DI via tokens/providers.

## Install (local monorepo path alias)

This repo wires a TS path alias in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@quexlo/alert-workflow": ["./projects/alert-workflow/src/public-api.ts"]
    }
  }
}
```

In external hosts, publish the lib and install it, then import from `@quexlo/alert-workflow`.

## Use in a host app

1) Provide config in `ApplicationConfig`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

import { provideAlertWorkflow, WorkflowDesignerLibConfig, PALETTE_CATEGORIES } from '@quexlo/alert-workflow';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideHttpClient(),
    provideAnimations(),
    providePrimeNG({ theme: { preset: Lara, options: { darkModeSelector: 'none' } } }),
    ...provideAlertWorkflow(<WorkflowDesignerLibConfig>{
      api: {
        baseUrl: 'https://example.com/api/workflow',
        templatesUrl: 'https://example.com/api/workflow',
        token: 'Bearer ...'
      },
      features: {
        import: false,
        export: true,
        new: true,
        templates: true,
        save: true,
        workflowList: true,
        backButton: true,
        backUrl: '/workflows'
      },
      palette: { categories: PALETTE_CATEGORIES }
    })
  ]
};
```

2) Use the component

Option A — Route to the component:

```ts
export const routes = [
  {
    path: '',
    loadComponent: () => import('@quexlo/alert-workflow').then(m => m.WorkflowDesignerComponent)
  }
];
```

That’s it—the component renders with the configured API and features.

Option B — Use as a tag in a host template (standalone import):

```ts
import { Component } from '@angular/core';
import { WorkflowDesignerComponent } from '@quexlo/alert-workflow';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `<workflow-designer></workflow-designer>`
})
export class PageComponent {}
```

### Using environment variables

If your host app manages API settings via Angular environments, wire them directly into the provider:

```ts
import { environment } from './environments/environment';

...provideAlertWorkflow(<WorkflowDesignerLibConfig>{
  api: {
    baseUrl: `${environment.workflowApiUrl}/workflow`,
    templatesUrl: `${environment.workflowApiUrl}/workflow`,
    token: environment.workflowApiToken
  },
  features: { /* flags here */ },
  palette: { categories: PALETTE_CATEGORIES }
})
```

### Upgrade notes (from app-embedded to library)

- Replace local imports with library imports:
  - `@quexlo/alert-workflow` → imports `WorkflowDesignerComponent`, `provideAlertWorkflow`, tokens, types.
- Remove duplicated app-side implementations of designer components/services.
- Provide the config via `provideAlertWorkflow` once at bootstrap.
- Route to `WorkflowDesignerComponent` using `loadComponent`.

### Try it locally

The demo app in this repo already consumes the library.

- Dev server

```powershell
npm start
```

- Build

```powershell
npm run build
```

## Advanced

- Extra node types: provide an array via the second param of `provideAlertWorkflow(config, extraNodeTypes)`.
- Nodes config source: set `nodesConfig: { source: 'json'|'ts', jsonUrl?: string }` on the config.
- Feature flags control header actions (New/Templates/Import/Export/Save/Back).
- Palette: override categories or use `PALETTE_CATEGORIES` as a base.

## Exports

- `WorkflowDesignerComponent`
- `provideAlertWorkflow`, `WORKFLOW_LIB_CONFIG`, `WorkflowDesignerLibConfig`
- `PALETTE_CATEGORIES`
