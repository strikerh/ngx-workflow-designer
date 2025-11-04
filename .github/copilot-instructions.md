# Copilot Instructions for this Repo (Angular 20 + Tailwind + PrimeNG)

Use this guide to be immediately productive in this codebase. Prefer concrete patterns and files referenced below over generic Angular advice.

## What this app is
- Domain: Alert Workflow Module with a visual workflow designer, list, and inspector.
- Key areas (under `src/app/alert-wf/`):
  - `workflow-list/` – list, search, actions for workflows.
  - `workflow-designer/` – canvas, palette, inspector, history, variables, nodes config.
  - `core/services/workflow-api.service.ts` – backend integration and API shapes.
  - `docs/technical/architecture.md` – big-picture architecture and data flow.

## Build, run, and test
- Dev server (port 4444): `npm start` (runs `ng serve --port 4444`).
- Build: `npm run build`.
- Unit tests (Karma): `npm test` (runs `ng test`).
- Tailwind is already wired via `postcss.config.cjs` and `tailwind.config.js`.

## Architecture essentials you should follow
- Standalone components and Angular Signals are standard. No NgModules.
- Smart/container components orchestrate services; presentational children only @Input/@Output.
  - Example: Palette emits `nodeSelected`; `WorkflowDesignerComponent` calls `WorkflowDesignerService.addNode(...)`.
- State lives in services with signals and computed:
  - See `workflow-designer.service.ts` for `nodes`, `edges`, `selectedNodeId`, `selectedEdgeId`, `zoom`, etc.
  - Always update via service methods and call history saves (e.g., `saveStateToHistory('Moved node')`).
- History/Undo is snapshot-based via `workflow-history.service.ts`; ensure user actions save descriptive states.
- Node UI is configuration-driven via `workflow-nodes-config.service.ts`:
  - Toggle `USE_TYPESCRIPT_CONFIG` (TS config vs. JSON at `/public/workflow-nodes-config.json`).
  - Palette, icons, node colors, and properties derive from `NodeTypeConfig` entries.

## Backend/API integration
- All backend calls go through `WorkflowApiService`.
  - Base URL resolves from `WORKFLOW_LIB_CONFIG.api.baseUrl` or `environment.workflowApiUrl + '/workflow'`.
  - Optional auth header from `WORKFLOW_LIB_CONFIG.api.token` or `environment.workflowApiToken`.
  - Key methods: `getWorkflows`, `getWorkflow`, `createWorkflow`, `updateWorkflow`, `deleteWorkflow`, `getTemplates`.
  - API models: `ApiWorkflow` differs from internal canvas models; conversions live in `workflow-designer.service.ts`.
- When persisting, use `convertInternalToApiWorkflow(...)` and route through the API service.

## Cross-component communication pattern
- Children emit events; parents invoke service methods. Avoid injecting state services into presentational children.
- The canvas, palette, inspector, and header communicate only via events + service calls. Inspect `workflow-designer.component.html/ts` and `components/*` for examples.

## Conventions that matter here
- Naming: Use explicit, module-scoped names (e.g., `WorkflowListComponent`, `WorkflowApiService`). Avoid generic names like `ListComponent`.
- Imports: Prefer relative imports within the module; external shared imports are explicit (see examples in `DEVELOPER_GUIDELINES.md`).
- Styling: Tailwind utility classes + PrimeNG components; keep component CSS minimal.
- i18n: Transloco is installed (`@jsverse/transloco`). Follow patterns in `core/i18n/transloco.service.ts` if adding translations.

## Useful entry points and examples
- Service state and commands: `workflow-designer.service.ts` (`addNode`, `removeNode`, `startConnect`, `zoomAt`, `duplicateNode`).
- Node config and palette: `workflow-nodes-config.data.ts` + `workflow-nodes-config.service.ts` (`getPalette`, `getTypeIcons`, `getNodesByCategory`).
- Variables management and interpolation: `workflow-variables.service.ts` (`setVariables`, `interpolate`, `DEFAULT_TEMPLATE_VARIABLES`).
- API shapes and headers: `core/services/workflow-api.service.ts` (note `ApiResponse<T>` and header/token wiring).

## Gotchas and tips
- Dev server uses port 4444 (not 4200). Prefer `npm start` over `ng serve`.
- If you add/modify node types, update config (TS or JSON) and rely on the dynamic rendering in inspector components.
- Keep history meaningful: every observable user action in the designer should push a new history state.
- When changing API base URLs or tokens, adjust `WORKFLOW_LIB_CONFIG` or `src/environments/*`.

## When adding features
- Wire new UI through the event → service pattern and update signals; don’t mutate arrays directly in components.
- Extend `ApiWorkflow` mapping only in `workflow-designer.service.ts` to keep the translation consistent.
- Prefer computed signals for derived state (e.g., `selectedNode`, `selectedEdge`).

References: `src/app/alert-wf/docs/technical/architecture.md`, `src/app/alert-wf/DEVELOPER_GUIDELINES.md`, `src/app/alert-wf/README.md`.
