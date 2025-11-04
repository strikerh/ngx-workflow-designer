# Workflow Designer Lib (extraction plan)

This project currently hosts the workflow designer as an app feature. The code is now parameterized via providers so it can be extracted into a reusable Angular library with minimal changes.

## Configure in an app

Provide the configuration once at bootstrap:

```ts
import { WORKFLOW_LIB_CONFIG } from './src/app/alert-wf/core/workflow-lib.config';

providers: [
  {
    provide: WORKFLOW_LIB_CONFIG,
    useValue: {
      api: {
        baseUrl: 'https://demo.quexlo.com:8443/api/workflow',
        // Optional: use a different endpoint for templates listing
        templatesUrl: 'https://demo.quexlo.com:8443/api/workflow',
        token: 'Bearer ...'
      },
      features: {
        import: true,
        export: true,
        new: true,
        templates: true,
        save: true,
        workflowList: false,
        // Header back button control
        backButton: true,
        backUrl: '/'
      }
    }
  }
]
```

Header buttons (Back, New, Templates, Import, Export, Save) are dynamically shown/hidden by these flags. Use `backButton` to toggle the Back button and `backUrl` to define where it navigates (defaults to `/`). The API client consumes the configurable `baseUrl`, optional `templatesUrl`, and `token`.

## Extract as a library (Angular 17+/20)

1. Generate a library shell:
   - `ng generate library workflow-designer`
   - Or manually create `projects/workflow-designer/` with `ng-packagr`.
2. Move these files into the lib with their relative structure and exports:
   - `alert-wf/workflow-designer/**/*`
   - `alert-wf/core/services/workflow-api.service.ts`
   - `alert-wf/core/workflow-lib.config.ts`
   - any shared helpers/models (`workflow-designer.interfaces.ts`, nodes config services)
3. Create `public-api.ts` exporting the standalone components and injection tokens:
   - `WorkflowDesignerComponent`
   - `WorkflowHeaderComponent`
   - `WORKFLOW_LIB_CONFIG` and `WorkflowDesignerLibConfig`
4. Update imports to reference the lib entry points.
5. Build and publish:
   - `ng build workflow-designer`
   - `npm publish dist/workflow-designer`

## Advanced options

- Node palette config: Provide `WORKFLOW_NODE_TYPES` to augment/override node types.
  Example:

  ```ts
  import { WORKFLOW_NODE_TYPES } from './src/app/alert-wf/core/workflow-node-types.token';

  providers: [
    {
      provide: WORKFLOW_NODE_TYPES,
      useValue: [
        {
          type: 'action.sms',
          label: 'SMS (Customized)',
          description: 'Send SMS via custom gateway',
          category: 'action',
          icon: "<span class='material-icons'>sms</span>",
          color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
          nodeColor: 'bg-emerald-50 border-emerald-200',
          properties: [
            { key: 'to', label: 'Recipients', type: 'text', required: true },
            { key: 'message', label: 'Message', type: 'textarea', required: true },
            { key: 'gateway', label: 'Gateway', type: 'text', required: false },
          ],
          exits: ['onSuccess', 'onFailure']
        },
        {
          type: 'action.webhook.notify',
          label: 'Notify Webhook',
          description: 'POST to an external service',
          category: 'action',
          icon: "<span class='material-icons'>http</span>",
          color: 'bg-purple-100 border-purple-300 text-purple-800',
          nodeColor: 'bg-purple-50 border-purple-200',
          properties: [
            { key: 'url', label: 'URL', type: 'text', required: true },
            { key: 'payload', label: 'Payload', type: 'textarea', required: false },
          ],
          exits: ['onSuccess', 'onFailure']
        }
      ]
    }
  ]
  ```
- i18n/labels: Add optional labels section to the config for button texts and tooltips.
- Auth strategy: Instead of a token string, accept a function or `HttpHeaders` factory.
- Events: Expose output events for host apps (onSave, onValidate, onNodeSelect).
- Theming: Keep using PrimeNG provider; allow hosts to override via their own provider.

Once these steps are followed, the designer becomes a drop‑in component for any Angular app via:

```html
<workflow-designer></workflow-designer>
```

backed by the provider config above.
