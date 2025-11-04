# @quexlo/alert-workflow# @quexlo/alert-workflow (Angular 20, Standalone, Zoneless)



> **A reusable, fully-featured workflow designer component for Angular 20+ applications**Reusable workflow designer as a drop‑in component. Tailwind 3 + PrimeNG 20, fully standalone, no NgModules, and DI via tokens/providers.



Visual workflow designer with drag-and-drop nodes, connection management, validation, templates, and API integration. Built with Angular 20 (zoneless), Tailwind CSS 3, and PrimeNG 20.## Install (local monorepo path alias)



---This repo wires a TS path alias in `tsconfig.json`:



## 📋 Table of Contents```jsonc

{

- [Features](#features)  "compilerOptions": {

- [Requirements](#requirements)    "paths": {

- [Installation](#installation)      "@quexlo/alert-workflow": ["./projects/alert-workflow/src/public-api.ts"]

- [Quick Start](#quick-start)    }

- [Configuration](#configuration)  }

- [Usage Patterns](#usage-patterns)}

- [API Reference](#api-reference)```

- [Node Configuration](#node-configuration)

- [Styling](#styling)In external hosts, publish the lib and install it, then import from `@quexlo/alert-workflow`.

- [Examples](#examples)

- [Troubleshooting](#troubleshooting)## Use in a host app



---1) Provide config in `ApplicationConfig`:



## ✨ Features```ts

import { ApplicationConfig } from '@angular/core';

- **Visual Workflow Designer**: Drag-and-drop canvas with pan/zoomimport { provideRouter } from '@angular/router';

- **Node Management**: Add, remove, connect, duplicate, and configure nodesimport { provideHttpClient } from '@angular/common/http';

- **Smart Connections**: Exit points and validation for node connectionsimport { provideAnimations } from '@angular/platform-browser/animations';

- **Templates**: Load pre-built workflow templatesimport { providePrimeNG } from 'primeng/config';

- **Workflow List**: Browse and load existing workflowsimport Lara from '@primeng/themes/lara';

- **History**: Undo/Redo support with state snapshots

- **Validation**: Real-time workflow validation with error reportingimport { provideAlertWorkflow, WorkflowDesignerLibConfig, PALETTE_CATEGORIES } from '@quexlo/alert-workflow';

- **Import/Export**: JSON import/export for workflows

- **Variables**: Dynamic variable interpolation in node propertiesexport const appConfig: ApplicationConfig = {

- **API Integration**: Full CRUD operations for workflows  providers: [

- **Router Optional**: Works with or without Angular Router    provideRouter([]),

- **Fully Typed**: Complete TypeScript definitions    provideHttpClient(),

- **Standalone**: No NgModules, pure standalone components    provideAnimations(),

- **Zoneless**: Compatible with Angular zoneless change detection    providePrimeNG({ theme: { preset: Lara, options: { darkModeSelector: 'none' } } }),

    ...provideAlertWorkflow(<WorkflowDesignerLibConfig>{

---      api: {

        baseUrl: 'https://example.com/api/workflow',

## 🔧 Requirements        templatesUrl: 'https://example.com/api/workflow',

        token: 'Bearer ...'

- **Angular**: 20.0.0 or higher      },

- **PrimeNG**: 20.0.0 or higher      features: {

- **Tailwind CSS**: 3.0.0 or higher        import: false,

- **TypeScript**: 5.6.0 or higher        export: true,

        new: true,

---        templates: true,

        save: true,

## 📦 Installation        workflowList: true,

        backButton: true,

### 1. Install Dependencies        backUrl: '/workflows'

      },

```bash      palette: { categories: PALETTE_CATEGORIES }

npm install primeng @primeng/themes primeicons    })

npm install -D tailwindcss postcss autoprefixer  ]

```};

```

### 2. Configure Tailwind

2) Use the component

**`tailwind.config.js`:**

```jsOption A — Route to the component:

/** @type {import('tailwindcss').Config} */

module.exports = {```ts

  content: [export const routes = [

    "./src/**/*.{html,ts}",  {

    "./projects/**/*.{html,ts}"  // Include library templates    path: '',

  ],    loadComponent: () => import('@quexlo/alert-workflow').then(m => m.WorkflowDesignerComponent)

  theme: {  }

    extend: {},];

  },```

  plugins: [],

}That’s it—the component renders with the configured API and features.

```

Option B — Use as a tag in a host template (standalone import):

**`postcss.config.cjs`:**

```js```ts

module.exports = {import { Component } from '@angular/core';

  plugins: {import { WorkflowDesignerComponent } from '@quexlo/alert-workflow';

    tailwindcss: {},

    autoprefixer: {},@Component({

  },  selector: 'app-page',

}  standalone: true,

```  imports: [WorkflowDesignerComponent],

  template: `<workflow-designer></workflow-designer>`

**`src/styles.css`:**})

```cssexport class PageComponent {}

@tailwind base;```

@tailwind components;

@tailwind utilities;### Using environment variables

```

If your host app manages API settings via Angular environments, wire them directly into the provider:

### 3. Add Library to Project

```ts

For local development (monorepo):import { environment } from './environments/environment';



**`tsconfig.json`:**...provideAlertWorkflow(<WorkflowDesignerLibConfig>{

```jsonc  api: {

{    baseUrl: `${environment.workflowApiUrl}/workflow`,

  "compilerOptions": {    templatesUrl: `${environment.workflowApiUrl}/workflow`,

    "paths": {    token: environment.workflowApiToken

      "@quexlo/alert-workflow": ["./projects/alert-workflow/src/public-api.ts"]  },

    }  features: { /* flags here */ },

  }  palette: { categories: PALETTE_CATEGORIES }

}})

``````



For production, publish the library and install via npm:### Upgrade notes (from app-embedded to library)

```bash

npm install @quexlo/alert-workflow- Replace local imports with library imports:

```  - `@quexlo/alert-workflow` → imports `WorkflowDesignerComponent`, `provideAlertWorkflow`, tokens, types.

- Remove duplicated app-side implementations of designer components/services.

---- Provide the config via `provideAlertWorkflow` once at bootstrap.

- Route to `WorkflowDesignerComponent` using `loadComponent`.

## 🚀 Quick Start

### Try it locally

### Minimal Setup (No Router)

The demo app in this repo already consumes the library.

**`app.config.ts`:**

```ts- Dev server

import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

import { provideHttpClient } from '@angular/common/http';```powershell

import { provideAnimations } from '@angular/platform-browser/animations';npm start

import { providePrimeNG } from 'primeng/config';```

import Lara from '@primeng/themes/lara';

import { provideAlertWorkflow, PALETTE_CATEGORIES } from '@quexlo/alert-workflow';- Build



export const appConfig: ApplicationConfig = {```powershell

  providers: [npm run build

    provideZonelessChangeDetection(),```

    provideHttpClient(),

    provideAnimations(),## Advanced

    providePrimeNG({

      ripple: true,- Extra node types: provide an array via the second param of `provideAlertWorkflow(config, extraNodeTypes)`.

      theme: { preset: Lara }- Nodes config source: set `nodesConfig: { source: 'json'|'ts', jsonUrl?: string }` on the config.

    }),- Feature flags control header actions (New/Templates/Import/Export/Save/Back).

    ...provideAlertWorkflow({- Palette: override categories or use `PALETTE_CATEGORIES` as a base.

      api: {

        baseUrl: 'https://your-api.com/workflow',## Exports

        templatesUrl: 'https://your-api.com/workflow',

        token: 'Bearer YOUR_TOKEN'- `WorkflowDesignerComponent`

      },- `provideAlertWorkflow`, `WORKFLOW_LIB_CONFIG`, `WorkflowDesignerLibConfig`

      features: {- `PALETTE_CATEGORIES`

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
        categories: PALETTE_CATEGORIES
      }
    })
  ]
};
```

**`app.component.ts`:**
```ts
import { Component } from '@angular/core';
import { WorkflowDesignerComponent } from '@quexlo/alert-workflow';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `<workflow-designer></workflow-designer>`
})
export class AppComponent {}
```

That's it! The workflow designer is now running.

---

## ⚙️ Configuration

### `WorkflowDesignerLibConfig`

```ts
interface WorkflowDesignerLibConfig {
  api: {
    baseUrl: string;           // API endpoint for workflow CRUD
    templatesUrl: string;      // API endpoint for templates
    token?: string;            // Optional auth token
  };
  features: {
    import: boolean;           // Show Import JSON button
    export: boolean;           // Show Export JSON button
    new: boolean;              // Show New Workflow button
    templates: boolean;        // Show Templates dropdown
    save: boolean;             // Show Save/Update button
    workflowList: boolean;     // Show Workflows dropdown
    backButton: boolean;       // Show Back button
    backUrl: string;           // URL for back button (or external URL)
  };
  nodesConfig?: {              // Optional JSON/TS source settings
    source?: 'ts' | 'json';
    jsonUrl?: string;
  };
  palette?: {
    categories?: PaletteCategory[]; // Node palette categories
    nodeTypes?: NodeTypeConfig[];   // Provide node types directly (highest precedence)
  };
}
```

### Using Environment Variables

**`environments/environment.ts`:**
```ts
export const environment = {
  production: false,
  workflowApiUrl: 'http://localhost:3000/api',
  workflowApiToken: 'Bearer dev-token'
};
```

**`app.config.ts`:**
```ts
import { environment } from './environments/environment';

...provideAlertWorkflow({
  api: {
    baseUrl: `${environment.workflowApiUrl}/workflow`,
    templatesUrl: `${environment.workflowApiUrl}/workflow`,
    token: environment.workflowApiToken
  },
  // ... rest of config
})
```

---

## 📖 Usage Patterns

### Pattern 1: Standalone Component (No Router)

Best for simple single-page apps.

```ts
import { Component } from '@angular/core';
import { WorkflowDesignerComponent } from '@quexlo/alert-workflow';

@Component({
  selector: 'app-workflow-page',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `
    <div class="workflow-container">
      <workflow-designer></workflow-designer>
    </div>
  `,
  styles: [`
    .workflow-container {
      width: 100%;
      height: 100vh;
    }
  `]
})
export class WorkflowPageComponent {}
```

### Pattern 2: With Router (Route-based Loading)

Best for multi-page apps with routing.

**`app.routes.ts`:**
```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'workflows',
    loadComponent: () => import('./pages/workflow-list.component')
      .then(m => m.WorkflowListComponent)
  },
  {
    path: 'workflow',
    loadComponent: () => import('@quexlo/alert-workflow')
      .then(m => m.WorkflowDesignerComponent)
  }
];
```

**Navigate with workflow ID:**
```ts
router.navigate(['/workflow'], { queryParams: { id: '123' } });
```

### Pattern 3: With Input Binding

Pass workflow ID directly as an input.

```ts
@Component({
  selector: 'app-workflow-page',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `
    <workflow-designer [workflowId]="workflowId"></workflow-designer>
  `
})
export class WorkflowPageComponent {
  workflowId = '123';
}
```

### Pattern 4: URL Query Params (Without Router)

The library automatically parses URL query params even without a router.

Simply navigate to:
```
http://localhost:4200/?id=123
```

The workflow with ID `123` will load automatically.

---

## 🔌 API Reference

### API Endpoints

The library expects the following REST API endpoints:

#### Get Workflow
```
GET /workflow/:id
Response: { results: ApiWorkflow, errors: [] }
```

#### List Workflows
```
GET /workflow
Response: { results: ApiWorkflow[], errors: [] }
```

#### Create Workflow
```
POST /workflow
Body: { name, description, nodes, edges, variables }
Response: { results: ApiWorkflow, errors: [] }
```

#### Update Workflow
```
PUT /workflow/:id
Body: { name, description, nodes, edges, variables }
Response: { results: ApiWorkflow, errors: [] }
```

#### Get Templates
```
GET /workflow  (with template filtering)
Response: { results: ApiWorkflow[], errors: [] }
```

### API Response Format

```ts
interface ApiResponse<T> {
  results: T;
  errors: string[];
}

interface ApiWorkflow {
  workflowId: number | string;
  name: string;
  description?: string;
  nodes: ApiNode[];
  edges: ApiEdge[];
  variables?: Record<string, any>;
}
```

---

## 🎨 Node Configuration

### Built-in Node Types

The library includes these node types by default:

- **Triggers**: `webhook`, `schedule`, `manual`
- **Actions**: `http_request`, `email`, `database`, `transform`
- **Logic**: `condition`, `switch`, `loop`, `merge`
- **Data**: `variable_set`, `variable_get`, `filter`, `aggregate`
- **Notification**: `slack`, `teams`, `sms`, `push`
- **AI**: `ai_prompt`, `ai_classify`, `ai_extract`

### Custom Node Types

Add custom node types by providing them in the config:

```ts
import { NodeTypeConfig } from '@quexlo/alert-workflow';

const customNodes: NodeTypeConfig[] = [
  {
    type: 'custom_action',
    label: 'Custom Action',
    category: 'actions',
    description: 'My custom node',
    icon: 'pi pi-bolt',
    color: '#10b981',
    inputs: 1,
    outputs: [
      { id: 'success', label: 'Success' },
      { id: 'error', label: 'Error' }
    ],
    properties: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'text',
        required: true
      }
    ]
  }
];

...provideAlertWorkflow({
  // ... other config
  palette: {
    // ... categories
    nodeTypes: customNodes
  }
})
```

---

## 🎨 Styling

### Tailwind Classes

The library uses Tailwind utility classes. Ensure your Tailwind config includes the library templates:

```js
content: [
  "./src/**/*.{html,ts}",
  "./projects/**/*.{html,ts}"  // Important!
]
```

### PrimeNG Theme

The library works with any PrimeNG theme. Example with Lara preset:

```ts
providePrimeNG({
  ripple: true,
  theme: {
    preset: Lara,
    options: {
      darkModeSelector: 'none'  // Or '.dark-mode' for dark theme
    }
  },
  cssLayer: {
    name: 'primeng',
    order: 'primeng, app'
  }
})
```

### Custom Styles

Override library styles in your global CSS:

```css
/* Customize node colors */
workflow-designer .workflow-node {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Customize canvas background */
.workflow-canvas {
  background-color: #f9fafb;
  background-image: 
    linear-gradient(#e5e7eb 1px, transparent 1px),
    linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 💡 Examples

### Example 1: Minimal Setup

See [Quick Start](#quick-start) above.

### Example 2: With Authentication

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};

// In app.config.ts
providers: [
  provideHttpClient(withInterceptors([authInterceptor])),
  // ...
]
```

### Example 3: Environment-based Config

```ts
// environment.ts
export const environment = {
  production: false,
  api: {
    workflow: 'http://localhost:3000/api/workflow'
  }
};

// app.config.ts
...provideAlertWorkflow({
  api: {
    baseUrl: environment.api.workflow,
    templatesUrl: environment.api.workflow
  },
  features: {
    import: !environment.production,  // Dev only
    export: true,
    new: true,
    templates: true,
    save: true,
    workflowList: environment.production,  // Prod only
    backButton: false,
    backUrl: '/'
  },
  palette: { categories: PALETTE_CATEGORIES }
})
```

---

## 🐛 Troubleshooting

### Router is injected but navigation doesn't work

**Problem**: The library detects a router but workflows don't load when selected.

**Solution**: The library checks if `router.config.length > 0`. If you don't want routing, ensure you don't call `provideRouter()` in your app config.

### Styles are missing

**Problem**: Nodes and UI elements have no styling.

**Solutions**:
1. Ensure Tailwind scans library templates in `tailwind.config.js`
2. Import Tailwind directives in `src/styles.css`
3. Check that PrimeNG theme is provided

### PrimeNG and Tailwind CSS conflicts

**Problem**: Styles are being overridden.

**Solution**: Enable PrimeNG CSS layer:

```ts
providePrimeNG({
  theme: { preset: Lara },
  cssLayer: {
    name: 'primeng',
    order: 'primeng, app'
  }
})
```

### API calls fail with 401/403

**Problem**: Authentication errors.

**Solutions**:
1. Provide a valid token in the config
2. Use an HTTP interceptor for dynamic tokens
3. Check CORS settings on your API

### Workflow doesn't load from URL

**Problem**: Navigating to `?id=123` doesn't load the workflow.

**Solution**: The library parses URL params automatically. Check:
1. The workflow ID exists in your API
2. Console for any errors
3. API response format matches expected structure

### TypeScript errors

**Problem**: `Cannot find module '@quexlo/alert-workflow'`

**Solution**: Ensure the path alias is configured in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@quexlo/alert-workflow": ["./projects/alert-workflow/src/public-api.ts"]
    }
  }
}
```

---

## 📚 Additional Resources

- **Architecture**: See `projects/alert-workflow/src/lib/alert-wf/docs/technical/architecture.md`
- **Node Config Guide**: See `projects/alert-workflow/src/lib/alert-wf/docs/guides/node-configuration.md`
- **API Integration**: See `projects/alert-workflow/src/lib/alert-wf/docs/technical/api-integration.md`

---

## 📄 License

[Your License Here]

---

## 🤝 Contributing

[Contributing guidelines]

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Your repo URL]
- Email: [Your email]
- Docs: [Your docs URL]
