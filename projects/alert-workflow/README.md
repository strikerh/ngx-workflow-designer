# ngx-workflow-designer

<p align="center">
  <img src="https://img.shields.io/npm/v/ngx-workflow-designer" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/ngx-workflow-designer" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/strikerh/ngx-workflow-designer" alt="license" />
  <img src="https://img.shields.io/badge/Angular-20%2B-red" alt="Angular 20+" />
</p>

**Production-ready visual workflow designer for Angular 20+** with full TypeScript support, zoneless change detection, and configuration-driven architecture.

## ✨ Features

- 🎨 **Visual Designer** - Drag-and-drop nodes, multi-exit connections, pan/zoom canvas
- ⚙️ **Configuration-Driven** - Define node types, fields, validations, and palette via config
- 📋 **Smart Inspector** - Auto-generated property panels with conditional field visibility
- ⏱️ **History System** - Snapshot-based undo/redo with 50-state stack
- 🔌 **API Integration** - Built-in REST client for workflows, templates, and CRUD operations
- 🎯 **Dynamic Validation** - Real-time workflow validation with visual error highlighting
- 🧩 **Flexible Architecture** - Works with or without Angular Router
- 💾 **Import/Export** - JSON-based workflow serialization with multiple format support
- 🔍 **Variable System** - Template variable interpolation with default values
- 🎭 **PrimeNG Themed** - Integrated with PrimeNG 20 components and Lara theme

**Repository:** https://github.com/strikerh/ngx-workflow-designer  
**NPM:** https://www.npmjs.com/package/ngx-workflow-designer  
**Demo:** https://strikerh.github.io/ngx-workflow-designer/

---

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
  - [Complete Minimal Example](#complete-minimal-example)
  - [Using Without a Backend](#using-without-a-backend)
- [Configuration](#-configuration)
  - [Library Provider Options](#library-provider-options)
  - [Feature Flags](#feature-flags)
  - [API Configuration](#api-configuration)
- [Node Configuration](#-node-configuration)
  - [Defining Node Types](#defining-node-types)
  - [Property Field Types](#property-field-types)
  - [Conditional Fields](#conditional-fields)
  - [Palette Categories](#palette-categories)
- [Advanced Usage](#-advanced-usage)
  - [Custom Node Types](#custom-node-types)
  - [Dynamic Configuration Loading](#dynamic-configuration-loading)
  - [Variable System](#variable-system)
  - [Validation Customization](#validation-customization)
- [API Integration](#-api-integration)
- [Styling & Theming](#-styling--theming)
- [Troubleshooting](#-troubleshooting)
  - [Setup Checklist](#setup-checklist)
  - [Common Issues](#common-issues)
- [Changelog](#-changelog)
- [License](#-license)

---

## 📦 Requirements

| Dependency | Version | Required |
|------------|---------|----------|
| Angular | 20+ | ✅ |
| PrimeNG | 20+ | ✅ |
| primeicons | 7+ | ✅ |
| Tailwind CSS | 3+ | ✅ |
| TypeScript | 5.5+ | ✅ |

---

## 🚀 Installation

```bash
# Install the library
npm install ngx-workflow-designer

# Install peer dependencies
npm install primeng primeicons

# Install Tailwind (if not already present)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

---

## ⚡ Quick Start

### 1. Configure Your Application

**Without Router:**

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { 
  provideAlertWorkflow, 
  WorkflowDesignerLibConfig, 
  PALETTE_CATEGORIES 
} from 'ngx-workflow-designer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimations(),
    providePrimeNG({ 
      theme: { preset: Lara },
      cssLayer: { name: 'primeng', order: 'primeng, app' }
    }),
    ...provideAlertWorkflow({
      api: {
        baseUrl: 'https://api.example.com/workflow',
        templatesUrl: 'https://api.example.com/templates',
        token: 'Bearer your-token' // Optional
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
        categories: PALETTE_CATEGORIES
      }
    } as WorkflowDesignerLibConfig)
  ]
};
```

**With Router:**

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'workflow', pathMatch: 'full' },
  { 
    path: 'workflow', 
    loadComponent: () => import('ngx-workflow-designer')
      .then(m => m.WorkflowDesignerComponent) 
  },
  { 
    path: 'workflow/:id', 
    loadComponent: () => import('ngx-workflow-designer')
      .then(m => m.WorkflowDesignerComponent) 
  }
];
```

```typescript
// src/app/app.config.ts
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ... other providers
  ]
};
```

### 2. Use the Component

```typescript
// src/app/app.component.ts
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

### 3. Configure Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './node_modules/ngx-workflow-designer/**/*.{html,ts,mjs}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
```

```css
/* src/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* PrimeNG CSS variable fallbacks (required for proper theming) */
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --surface-ground: #f8f9fa;
  --text-color: #1f2937;
}
```

**PostCSS Configuration** (required for Tailwind):

```javascript
// postcss.config.js (create this file in your project root)
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

---

### Complete Minimal Example

Here's a **complete, copy-paste ready example** with all required files:

**1. Install Dependencies:**

```bash
npm install ngx-workflow-designer primeng primeicons
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**2. Create `postcss.config.js`:**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

**3. Configure `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './node_modules/ngx-workflow-designer/**/*.{html,ts,mjs}' // ⚠️ CRITICAL: Must include library files
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
```

**4. Update `src/styles.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* PrimeNG CSS variable fallbacks */
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --surface-ground: #f8f9fa;
  --text-color: #1f2937;
}
```

**5. Configure `src/app/app.config.ts`:**

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { provideAlertWorkflow, PALETTE_CATEGORIES } from 'ngx-workflow-designer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimations(),
    providePrimeNG({
      theme: { preset: Lara }
    }),
    ...provideAlertWorkflow({
      api: {
        baseUrl: 'https://api.example.com/workflow' // Replace with your API
      },
      features: {
        import: true,
        export: true,
        new: true,
        templates: false,      // Disable if no backend
        save: false,           // Disable if no backend
        workflowList: false,   // Disable if no backend
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

**6. Update `src/app/app.component.ts`:**

```typescript
import { Component } from '@angular/core';
import { WorkflowDesignerComponent } from 'ngx-workflow-designer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: '<workflow-designer></workflow-designer>',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
  `]
})
export class AppComponent {}
```

**7. Run your app:**

```bash
ng serve
```

---

### Using Without a Backend

If you don't have a backend API, configure the library for **standalone mode**. The library now gracefully handles missing API configuration without throwing errors:

```typescript
// src/app/app.config.ts
...provideAlertWorkflow({
  api: {
    baseUrl: '' // ✅ Empty string is now allowed - library will warn but continue
  },
  features: {
    import: true,       // ✅ Keep - works without backend
    export: true,       // ✅ Keep - works without backend
    new: true,          // ✅ Keep - works without backend
    templates: false,   // ❌ Disable - requires backend
    save: false,        // ❌ Disable - requires backend
    workflowList: false // ❌ Disable - requires backend
  },
  palette: {
    categories: PALETTE_CATEGORIES
  }
})
```

**Important**: When `baseUrl` is empty or missing:
- A warning will be logged to console: `"WorkflowApiService: No baseUrl configured. API features will be disabled."`
- API-dependent features (templates, save, workflowList) will throw clear errors if accessed
- The library will continue to work normally for offline features

**Features that work WITHOUT a backend:**
- ✅ Visual workflow designer (drag & drop)
- ✅ Node configuration and properties
- ✅ Canvas pan/zoom
- ✅ Undo/Redo history
- ✅ Workflow validation
- ✅ **Export workflow as JSON** (download to local file)
- ✅ **Import workflow from JSON** (upload from local file)
- ✅ Variable management

**Features that REQUIRE a backend:**
- ❌ Save workflow to server
- ❌ Load workflow from server
- ❌ Templates dropdown
- ❌ Workflow list dropdown

**Local Storage Alternative** (optional):

You can implement local storage persistence yourself:

```typescript
import { Component, OnInit } from '@angular/core';
import { WorkflowDesignerComponent, WorkflowDesignerService } from 'ngx-workflow-designer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `
    <workflow-designer></workflow-designer>
    <button (click)="saveToLocal()">Save to Local Storage</button>
    <button (click)="loadFromLocal()">Load from Local Storage</button>
  `
})
export class AppComponent implements OnInit {
  constructor(private workflowService: WorkflowDesignerService) {}

  ngOnInit() {
    this.loadFromLocal();
  }

  saveToLocal() {
    const workflow = {
      nodes: this.workflowService.nodes(),
      edges: this.workflowService.edges()
    };
    localStorage.setItem('workflow', JSON.stringify(workflow));
    console.log('Workflow saved to local storage');
  }

  loadFromLocal() {
    const saved = localStorage.getItem('workflow');
    if (saved) {
      const workflow = JSON.parse(saved);
      this.workflowService.loadWorkflowData(workflow.nodes, workflow.edges);
      console.log('Workflow loaded from local storage');
    }
  }
}
```

---

## ⚙️ Configuration

## ⚙️ Configuration

### Library Provider Options

```typescript
interface WorkflowDesignerLibConfig {
  api: {
    baseUrl: string;           // Main REST endpoint for workflows
    templatesUrl?: string;     // Optional separate endpoint for templates
    token?: string;            // Optional Bearer token (or use HTTP interceptor)
  };
  features: {
    import: boolean;           // Show "Import JSON" button
    export: boolean;           // Show "Export JSON" button
    new: boolean;              // Show "New Workflow" button
    templates: boolean;        // Show templates dropdown
    save: boolean;             // Show "Save" button
    workflowList: boolean;     // Show workflows dropdown
    backButton: boolean;       // Show back navigation button
    backUrl: string;           // URL for back button navigation
  };
  nodesConfig?: {              // Optional: Override node type configuration source
    source?: 'ts' | 'json';    // Default: 'ts' (TypeScript config)
    jsonUrl?: string;          // URL to fetch JSON config (if source='json')
  };
  palette?: {
    categories?: PaletteCategoryConfig[];  // Palette section definitions
    nodeTypes?: NodeTypeConfig[];          // Node type definitions (highest priority)
  };
}
```

### Feature Flags

All feature flags default to `true` when not specified. Disable features you don't need:

```typescript
provideAlertWorkflow({
  // ...
  features: {
    import: false,        // Hide import button
    export: true,         // Show export button
    new: true,            // Show new workflow button
    templates: false,     // Hide templates (if you manage workflows differently)
    save: true,           // Show save button
    workflowList: false,  // Hide workflow list (e.g., if using external navigation)
    backButton: true,     // Show back button
    backUrl: '/dashboard' // Navigate to dashboard on back
  }
})
```

### API Configuration

#### Environment-Based Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  workflowApiUrl: 'http://localhost:3000',
  workflowApiToken: ''
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  workflowApiUrl: 'https://api.production.com',
  workflowApiToken: 'your-production-token'
};
```

```typescript
// src/app/app.config.ts
import { environment } from '../environments/environment';

provideAlertWorkflow({
  api: {
    baseUrl: `${environment.workflowApiUrl}/workflow`,
    templatesUrl: `${environment.workflowApiUrl}/templates`,
    token: environment.workflowApiToken
  },
  // ...
})
```

#### Using HTTP Interceptor for Auth

```typescript
// Don't provide token in config, use an interceptor instead
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
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // ...
  ]
};
```

---

## 🎨 Node Configuration

### Defining Node Types

Node types control the palette, inspector fields, exits, and visual appearance:

```typescript
import { NodeTypeConfig } from 'ngx-workflow-designer';

export const WORKFLOW_NODES_CONFIG: NodeTypeConfig[] = [
  {
    type: 'trigger.manual',              // Unique identifier (category.name pattern)
    category: 'trigger',                 // Used for palette grouping
    label: 'Manual Trigger',             // Display name
    description: 'Manually start workflow',  // Tooltip text
    icon: '⚡',                          // Emoji or icon class
    color: 'bg-amber-100 border-amber-300 text-amber-800',  // Palette button colors
    nodeColor: 'bg-amber-50 border-amber-200',              // Canvas node colors
    properties: [                        // Inspector field definitions
      {
        key: 'label',
        label: 'Trigger Name',
        type: 'text',
        required: true,
        default: 'Manual Trigger',
        showInNode: true               // Show this field's value in node
      }
    ],
    exits: ['next']                      // Exit point names
  },
  {
    type: 'control.if',
    category: 'control',
    label: 'If / Else',
    description: 'Branch based on condition',
    icon: '🔀',
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      {
        key: 'condition',
        label: 'Condition Expression',
        type: 'text',
        required: true,
        placeholder: 'e.g., {{temperature}} > 30',
        help: 'Supports variable interpolation with {{varName}}',
        showInNode: true
      }
    ],
    exits: ['onTrue', 'onFalse']         // Multiple exits
  },
  {
    type: 'control.switch',
    category: 'control',
    label: 'Switch',
    description: 'Multi-way branch',
    icon: '🧭',
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      {
        key: 'expression',
        label: 'Switch Expression',
        type: 'text',
        required: true,
        placeholder: '{{status}}'
      },
      {
        key: 'cases',
        label: 'Cases',
        type: 'switch-cases',              // Special field type
        required: true,
        help: 'Dynamic exit points based on cases'
      }
    ],
    exits: []  // Dynamically generated from 'cases' parameter
  },
  {
    type: 'action.email',
    category: 'action',
    label: 'Send Email',
    description: 'Send email notification',
    icon: '✉️',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'to',
        label: 'Recipient',
        type: 'text',
        required: true,
        placeholder: 'user@example.com',
        showInNode: true
      },
      {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Alert: {{alertType}}'
      },
      {
        key: 'body',
        label: 'Message Body',
        type: 'textarea',
        required: true,
        placeholder: 'Enter email content...'
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        default: 'normal',
        options: {
          choices: [
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' }
          ]
        }
      }
    ],
    exits: ['next']
  }
];
```

### Property Field Types

#### Text Field

```typescript
{
  key: 'username',
  label: 'Username',
  type: 'text',
  required: true,
  placeholder: 'Enter username',
  help: 'System username for authentication',
  default: '',
  showInNode: false
}
```

#### Number Field

```typescript
{
  key: 'timeout',
  label: 'Timeout (seconds)',
  type: 'number',
  required: false,
  default: 30,
  placeholder: '30',
  help: 'Request timeout in seconds'
}
```

#### Textarea Field

```typescript
{
  key: 'message',
  label: 'Message Content',
  type: 'textarea',
  required: true,
  placeholder: 'Enter your message here...',
  default: ''
}
```

#### Select Field

```typescript
{
  key: 'method',
  label: 'HTTP Method',
  type: 'select',
  required: true,
  default: 'GET',
  options: {
    choices: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'DELETE', label: 'DELETE' }
    ]
  }
}
```

#### Switch-Cases Field

Special field type for dynamic branching (used in Switch node):

```typescript
{
  key: 'cases',
  label: 'Case Values',
  type: 'switch-cases',
  required: true,
  help: 'Comma-separated case values. A "default" exit is always added.'
}
```

User enters: `pending, approved, rejected`  
Results in exits: `['pending', 'approved', 'rejected', 'default']`

### Conditional Fields

Show/hide fields based on other field values:

```typescript
{
  type: 'action.http',
  // ...
  properties: [
    {
      key: 'method',
      label: 'HTTP Method',
      type: 'select',
      default: 'GET',
      options: {
        choices: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' }
        ]
      }
    },
    {
      key: 'body',
      label: 'Request Body',
      type: 'textarea',
      showIf: {                          // Conditional visibility
        watchField: 'method',
        operator: 'equals',
        value: 'POST'
      }
    },
    {
      key: 'timeout',
      label: 'Timeout',
      type: 'number',
      showIf: {                          // Multiple conditions (OR logic)
        watchField: 'method',
        operator: 'includes',
        value: ['POST', 'PUT', 'DELETE']
      }
    }
  ]
}
```

**Supported operators:**
- `equals` - Exact match
- `notEquals` - Not equal
- `includes` - Value is in array
- `notIncludes` - Value not in array
- `greaterThan` - Numeric comparison
- `lessThan` - Numeric comparison

### Palette Categories

Define how nodes are grouped in the left sidebar:

```typescript
import { PaletteCategoryConfig } from 'ngx-workflow-designer';

export const PALETTE_CATEGORIES: PaletteCategoryConfig[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    icon: '⚡',
    headerClass: 'text-amber-700',
    filterPrefix: 'trigger.'          // Show nodes starting with 'trigger.'
  },
  {
    id: 'controls',
    label: 'Flow Control',
    icon: '🧭',
    headerClass: 'text-sky-700',
    filterPrefix: 'control.'
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: '🎯',
    headerClass: 'text-emerald-700',
    filterPrefix: 'action.'
  },
  {
    id: 'terminals',
    label: 'End Points',
    icon: '⛔',
    headerClass: 'text-slate-700',
    filterPrefix: 'end.'
  },
  {
    id: 'utility',
    label: 'Utilities',
    icon: '🔧',
    headerClass: 'text-purple-700',
    filterPrefix: ['var.', 'audit.', 'utility.']  // Multiple prefixes
  }
];
```

---

## 🚀 Advanced Usage

### Custom Node Types

You can provide custom node types in three ways (priority order):

1. **Via Provider (Highest Priority)**
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

## 🔧 Troubleshooting

### Setup Checklist

Before reporting issues, verify your setup is complete:

- [ ] ✅ **Tailwind installed**: `npm install -D tailwindcss postcss autoprefixer`
- [ ] ✅ **PostCSS config exists**: `postcss.config.js` in project root
- [ ] ✅ **Tailwind config scans library**: Content array includes `'./node_modules/ngx-workflow-designer/**/*.{html,ts,mjs}'`
- [ ] ✅ **Tailwind directives in styles.css**: `@tailwind base; @tailwind components; @tailwind utilities;`
- [ ] ✅ **CSS variables have fallbacks**: Add `:root` variables to `styles.css` (see Complete Example above)
- [ ] ✅ **PrimeNG theme configured**: `providePrimeNG({ theme: { preset: Lara } })`
- [ ] ✅ **HTTP client provided**: `provideHttpClient()` in app.config.ts
- [ ] ✅ **Animations enabled**: `provideAnimations()` in app.config.ts
- [ ] ✅ **Features disabled if no backend**: Set `templates: false, save: false, workflowList: false` if you don't have an API

### Common Issues

#### 🔴 **All styles are missing / UI looks broken**

**Symptoms**: Library components are unstyled, transparent backgrounds, no borders

**Causes & Solutions**:

1. **Tailwind not scanning library files**
   ```javascript
   // ❌ WRONG - Missing library path
   content: ['./src/**/*.{html,ts}']
   
   // ✅ CORRECT - Includes library
   content: [
     './src/**/*.{html,ts}',
     './node_modules/ngx-workflow-designer/**/*.{html,ts,mjs}' // Critical!
   ]
   ```

2. **Missing PostCSS configuration**
   ```bash
   # Create postcss.config.js in project root
   echo "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };" > postcss.config.js
   ```

3. **Missing CSS variable fallbacks**
   ```css
   /* Add to src/styles.css */
   :root {
     --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     --surface-ground: #f8f9fa;
     --text-color: #1f2937;
   }
   ```

4. **Tailwind directives not imported**
   ```css
   /* Must be in src/styles.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

#### 🔴 **API errors on load / "Failed to fetch"**

**Symptoms**: Console errors about network requests, empty dropdowns

**Solution**: Disable API-dependent features if you don't have a backend:

```typescript
provideAlertWorkflow({
  api: {
    baseUrl: '' // Can be empty if features are disabled
  },
  features: {
    templates: false,      // ❌ Requires API
    save: false,           // ❌ Requires API
    workflowList: false,   // ❌ Requires API
    import: true,          // ✅ Works offline
    export: true           // ✅ Works offline
  }
})
```

---

#### 🔴 **Transparent or white background**

**Symptoms**: Canvas or panels have no background color

**Cause**: Missing PrimeNG CSS variables

**Solution**: Add CSS variable fallbacks to `styles.css`:

```css
:root {
  --surface-ground: #f8f9fa;
  --surface-0: #ffffff;
  --surface-50: #f9fafb;
  --surface-100: #f3f4f6;
  --text-color: #1f2937;
  --primary-color: #3b82f6;
}
```

---

#### 🔴 **Module not found: 'ngx-workflow-designer'**

**Solutions**:

```bash
# 1. Ensure library is installed
npm install ngx-workflow-designer

# 2. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Restart Angular dev server
ng serve
```

---

#### 🔴 **Router navigation not working**

**Cause**: Library uses Angular Router but it's not configured

**Solution 1**: Provide router configuration:

```typescript
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ... other providers
  ]
};
```

**Solution 2**: Use without router (disable back button):

```typescript
provideAlertWorkflow({
  features: {
    backButton: false  // Disable if no router
  }
})
```

---

#### 🔴 **Validation errors persist after fixing nodes**

**Cause**: Validation doesn't auto-refresh

**Solution**: Manually trigger validation:

```typescript
import { WorkflowDesignerService } from 'ngx-workflow-designer';

constructor(private workflowService: WorkflowDesignerService) {}

fixAndRevalidate() {
  // Make your changes
  this.workflowService.updateNodeData(nodeId, newData);
  
  // Re-run validation
  this.workflowService.runValidate();
}
```

---

#### 🔴 **PrimeNG components not styled**

**Cause**: PrimeNG theme not configured

**Solution**: Add PrimeNG provider:

```typescript
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: { preset: Lara }
    }),
    // ... other providers
  ]
};
```

---

#### 🔴 **CORS errors when calling API**

**Cause**: Backend not configured for CORS

**Solution**: Configure CORS headers on your backend:

```javascript
// Example: Express.js backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

---

#### 🔴 **Build errors about missing dependencies**

**Solution**: Install all peer dependencies:

```bash
npm install primeng primeicons
npm install -D tailwindcss postcss autoprefixer
```

---

### Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Verify all files** match the [Complete Minimal Example](#complete-minimal-example)
3. **Compare with demo app**: https://strikerh.github.io/ngx-workflow-designer/
4. **Open an issue**: https://github.com/strikerh/ngx-workflow-designer/issues

---

## 📋 Changelog

See [CHANGELOG.md](https://github.com/strikerh/ngx-workflow-designer/blob/master/projects/alert-workflow/CHANGELOG.md) for release notes and migration guides.

**Latest Release**: v0.0.7 - Fixed component styles by removing `@apply` directives for better compatibility

---

## 📄 License

MIT © [strikerh](https://github.com/strikerh)

---

## 🤝 Contributing

Contributions welcome! Please fork the repository and submit a Pull Request.

---

## 📞 Support

- **Issues:** https://github.com/strikerh/ngx-workflow-designer/issues
- **NPM:** https://www.npmjs.com/package/ngx-workflow-designer

---

**Made with ❤️ using Angular 20, PrimeNG, and Tailwind CSS**
