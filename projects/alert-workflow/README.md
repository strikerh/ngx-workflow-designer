# ngx-workflow-designer

Configurable, production-ready workflow designer for Angular 20+ (zoneless). Built with PrimeNG 20 and Tailwind CSS. Ships as an Angular library with FESM bundles.

- Visual designer: drag-and-drop nodes, connect exits, pan/zoom
- Inspector: configuration-driven fields (text, number, textarea, select, switch-cases)
- History: undo/redo with snapshot-based history
- API integration: CRUD for workflows and templates
- Router optional: works with or without Angular Router
- Config-first: drive palette, icons, colors, exits, and node fields from config

Repository: https://github.com/strikerh/ngx-workflow-designer
NPM: https://www.npmjs.com/package/ngx-workflow-designer

---

## Requirements

- Angular 20+
- PrimeNG 20+, primeicons 7+
- Tailwind CSS 3+

---

## Installation

```bash
npm install ngx-workflow-designer primeng primeicons
```

optional (Tailwind, if not already installed):

```bash
npm install -D tailwindcss postcss autoprefixer
```

---

## Quick Start

### 1) Provide the library config (No Router)

```ts
// app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { provideAlertWorkflow, WorkflowDesignerLibConfig, PALETTE_CATEGORIES } from 'ngx-workflow-designer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimations(),
    providePrimeNG({ theme: { preset: Lara }, cssLayer: { name: 'primeng', order: 'primeng, app' } }),
    ...provideAlertWorkflow(<WorkflowDesignerLibConfig>{
      api: { baseUrl: 'https://api.example.com/workflow', templatesUrl: 'https://api.example.com/workflow' },
      features: { import: true, export: true, new: true, templates: true, save: true, workflowList: true, backButton: false, backUrl: '/' },
      palette: { categories: PALETTE_CATEGORIES }
    })
  ]
};
```

```ts
// app.component.ts (or any page component)
import { Component } from '@angular/core';
import { WorkflowDesignerComponent } from 'ngx-workflow-designer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `<workflow-designer></workflow-designer>`
})
export class AppComponent {}
```

### 2) With Router (optional)

```ts
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'workflow', pathMatch: 'full' },
  { path: 'workflow', loadComponent: () => import('ngx-workflow-designer').then(m => m.WorkflowDesignerComponent) }
];
```

---

## Configuration (Library Provider)

```ts
interface WorkflowDesignerLibConfig {
  api: {
    baseUrl: string;           // REST endpoint base for workflow CRUD
    templatesUrl: string;      // REST endpoint for templates
    token?: string;            // Optional auth token (or use an interceptor)
  };
  features: {
    import: boolean;           // Show Import JSON
    export: boolean;           // Show Export JSON
    new: boolean;              // Show New Workflow
    templates: boolean;        // Show Templates dropdown
    save: boolean;             // Show Save/Update
    workflowList: boolean;     // Show Workflows dropdown
    backButton: boolean;       // Show Back button
    backUrl: string;           // Back button target URL
  };
  nodesConfig?: {              // Optional Node Types source controls
    source?: 'ts' | 'json';    // Defaults to 'ts'
    jsonUrl?: string;          // If source==='json', where to fetch
  };
  palette?: {
    categories?: PaletteCategoryConfig[]; // Palette sections
    nodeTypes?: NodeTypeConfig[];         // Node types provided directly (highest precedence)
  };
}
```

Environment-based example:

```ts
import { environment } from './environments/environment';

...provideAlertWorkflow({
  api: {
    baseUrl: `${environment.workflowApiUrl}/workflow`,
    templatesUrl: `${environment.workflowApiUrl}/workflow`,
    token: environment.workflowApiToken
  },
  features: { /* flags */ },
  palette: { categories: PALETTE_CATEGORIES }
});
```

---

## Node Configuration (Palette + Inspector)

Define palette categories:

```ts
import { PaletteCategoryConfig } from 'ngx-workflow-designer';

export const PALETTE_CATEGORIES: PaletteCategoryConfig[] = [
  { id: 'triggers',  label: 'Triggers',  icon: '⚡', headerClass: 'text-amber-700',  filterPrefix: 'trigger.' },
  { id: 'controls',  label: 'Controls',  icon: '🧭', headerClass: 'text-sky-700',    filterPrefix: 'control.' },
  { id: 'actions',   label: 'Actions',   icon: '🎯', headerClass: 'text-emerald-700', filterPrefix: 'action.' },
  { id: 'terminals', label: 'Terminals', icon: '⛔', headerClass: 'text-slate-700',   filterPrefix: 'end.' },
  { id: 'utility',   label: 'Utility',   icon: '🔧', headerClass: 'text-purple-700',  filterPrefix: ['var.', 'audit.', 'utility.'] },
];
```

Define node types:

```ts
import { NodeTypeConfig } from 'ngx-workflow-designer';

export const WORKFLOW_NODES_CONFIG: NodeTypeConfig[] = [
  {
    type: 'trigger.manual',
    category: 'trigger',
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    icon: '⚡',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      { key: 'label', label: 'Trigger Name', type: 'text', required: true, default: 'Manual Trigger', showInNode: true }
    ],
    exits: ['next']
  },
  {
    type: 'control.if',
    category: 'control',
    label: 'If / Else',
    description: 'Conditional branch',
    icon: '🧭',
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      { key: 'condition', label: 'Condition', type: 'text', required: true, placeholder: 'a > b', showInNode: true }
    ],
    exits: ['onTrue', 'onFalse']
  }
];
```

Inspector field shape:

```ts
interface NodeFieldConfig<T = any> {
  key: string;                              // Key under node.params[key]
  label: string;                            // Display label
  type: 'text' | 'number' | 'textarea' | 'select' | 'switch-cases';
  required?: boolean;
  placeholder?: string;
  help?: string;                            // Help text under the field
  default?: any;                            // Default on node creation
  showInNode?: boolean;                     // If true, used as node's compact summary (first true wins)
  options?: T;                              // For select or specialized fields
  showIf?: {                                // Conditional visibility
    watchField: string;
    operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'greaterThan' | 'lessThan';
    value: any;
  } | Array<any>;
}
```

Dynamic node summary behavior:
- If any property has `showInNode: true`, the first one is rendered inside the node (value is truncated in UI).
- If none are marked, fallback uses the first non-`label` param as `key: value`. If no params exist, the node label is shown.

Provide your palette and node types via the provider config:

```ts
...provideAlertWorkflow({
  // ...
  palette: {
    categories: PALETTE_CATEGORIES,
    nodeTypes: WORKFLOW_NODES_CONFIG // highest precedence
  }
})
```

---

## Styling

Tailwind (ensure library templates are scanned):

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './projects/**/*.{html,ts}' // include library templates during dev
  ],
  theme: { extend: {} },
  plugins: []
};
```

Global styles:

```css
/* src/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

PrimeNG theme (example):

```ts
providePrimeNG({
  ripple: true,
  theme: { preset: Lara },
  cssLayer: { name: 'primeng', order: 'primeng, app' }
});
```

---

## API Expectations (default service)

The library’s default service expects these endpoints:

```
GET    /workflow              -> { results: ApiWorkflow[] | { data: ApiWorkflow[] }, errors: string[] }
GET    /workflow/:id          -> { results: ApiWorkflow | { data: ApiWorkflow },  errors: string[] }
POST   /workflow              -> { results: ApiWorkflow | { data: ApiWorkflow },  errors: string[] }
PUT    /workflow/:id          -> { results: ApiWorkflow | { data: ApiWorkflow },  errors: string[] }
```

Response envelope:

```ts
interface ApiResponse<T> { results: T; errors: string[]; }
```

Minimal shape (internal mapping handles positions, exits, variables):

```ts
interface ApiWorkflow {
  workflowId: number | string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  variables?: Record<string, any>;
}
```

---

## Troubleshooting

- Styles missing? Ensure Tailwind scans `projects/**/*` and your global styles import Tailwind directives. Provide a PrimeNG theme with cssLayer.
- Router provided but navigation not used? If you don’t want router, remove `provideRouter()` or keep routes empty.
- “Cannot find module 'ngx-workflow-designer'”? Ensure it’s installed and your build can resolve node_modules. For mono repos, you can add a TS path for local dev only.

---

## License

MIT
