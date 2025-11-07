# ngx-workflow-designer - AI Agent Guide

Production-ready Angular 20 workflow designer library. This monorepo contains both the library (`projects/alert-workflow/`) and a demo app (`src/`) for development and testing.

## Project Structure (Critical!)

This is a **dual-mode monorepo**:
- **Library**: `projects/alert-workflow/` - the publishable npm package (`ngx-workflow-designer`)
- **Demo App**: `src/` - development/testing harness that consumes the library locally

**All feature work happens in `projects/alert-workflow/`**. The demo app only provides configuration and page wrappers.

## Build, Run, Test

```bash
npm start              # Dev server (port 4444, not 4200!)
npm run build          # Build demo app
npm test               # Run Karma tests
npm run build:lib      # Build library to dist/alert-workflow/
npm run pack:lib       # Create tarball after build:lib
npm run publish:lib    # Publish to npm (requires build:lib first)
```

**Port 4444** is hardcoded in `package.json` scripts. Don't use `ng serve` directly.

## Architecture Patterns (Required Reading)

### 1. Signal-Based State Management
All state lives in services as signals, never in components:
```typescript
// In workflow-designer.service.ts
nodes = signal<WorkflowNode[]>([]);
edges = signal<WorkflowEdge[]>([]);
selectedNodeId = signal<string | null>(null);
selectedNode = computed(() => this.nodes().find(n => n.id === this.selectedNodeId()));
```

**Rule**: Components read signals but NEVER mutate. All mutations through service methods that:
1. Update the signal
2. Call `this.historyService.saveState(...)` with a descriptive action

### 2. Smart/Presentational Component Split
- **Smart** (`workflow-designer.component.ts`): Injects services, orchestrates
- **Presentational** (`components/*`): @Input/@Output only, zero service injection

Example from palette → designer flow:
```typescript
// Palette emits
@Output() nodeSelected = new EventEmitter<string>();

// Designer handles
onNodeSelected(type: string) {
  this.designerService.addNode(type);  // Service mutates + saves history
}
```

### 3. Configuration-Driven Node System
Nodes, palette, inspector fields all derive from `NodeTypeConfig[]`:
- **Source hierarchy** (highest precedence first):
  1. `provideAlertWorkflow({ palette: { nodeTypes: [...] } })` in host app
  2. `WORKFLOW_NODE_TYPES` injection token (for merging extra types)
  3. JSON from `nodesConfig.jsonUrl` (if `source: 'json'`)
  4. TypeScript default: `WORKFLOW_NODES_CONFIG` in `config/workflow-nodes-config.data.ts`

Service `WorkflowNodesConfigService` loads and merges all sources. Inspector renders fields dynamically from `config.properties[]`.

**Adding a node type**: Extend config array with `{ type, category, label, description, icon, color, properties[], exits[] }`. No code changes needed for rendering.

### 4. History System (Snapshot-Based Undo/Redo)
`WorkflowHistoryService` maintains stack of `{ nodes, edges, selectedNodeId, selectedEdgeId, description }`. 

**Critical**: Every user action must call `designerService.saveStateToHistory('Action description')` or history breaks. Max 50 states, auto-truncates on overflow.

### 5. API Integration Layer
`WorkflowApiService` abstracts backend:
- Configured via `WORKFLOW_LIB_CONFIG.api.baseUrl` + optional `token`
- Models: `ApiWorkflow` (backend shape) ≠ `{ nodes, edges }` (canvas shape)
- Conversions in `workflow-designer.service.ts` (`convertInternalToApiWorkflow`, `convertApiToInternalWorkflow`)

**Rule**: Never call HttpClient directly. Route through `workflowApi.getWorkflow()` etc.

## Library Configuration (Host App Contract)

Host apps configure via `provideAlertWorkflow()`:
```typescript
// In host app's app.config.ts
provideAlertWorkflow({
  api: {
    baseUrl: 'https://api.example.com/workflow',
    templatesUrl: 'https://api.example.com/templates',  // optional, defaults to baseUrl
    token: 'Bearer xyz'  // optional auth
  },
  features: {
    import: true, export: true, new: true, save: true,
    templates: true, workflowList: true,
    backButton: false, backUrl: '/'
  },
  nodesConfig: {  // optional
    source: 'json',  // or 'ts' (default)
    jsonUrl: '/assets/nodes-config.json'
  },
  palette: {
    categories: PALETTE_CATEGORIES,  // Must import from lib
    nodeTypes: CUSTOM_NODES  // optional: override/extend node types
  }
})
```

## Key Files & Their Roles

| Path | Purpose |
|------|---------|
| `projects/alert-workflow/src/public-api.ts` | Library exports (public API surface) |
| `projects/alert-workflow/src/lib/core/providers.ts` | `provideAlertWorkflow()` helper |
| `projects/alert-workflow/src/lib/core/workflow-lib.config.ts` | Config interfaces + `WORKFLOW_LIB_CONFIG` token |
| `projects/alert-workflow/src/lib/workflow-designer/workflow-designer.service.ts` | Main state + commands (1096 lines - read carefully!) |
| `projects/alert-workflow/src/lib/workflow-designer/workflow-history.service.ts` | Undo/redo snapshots |
| `projects/alert-workflow/src/lib/workflow-designer/workflow-nodes-config.service.ts` | Config loading + merging logic |
| `projects/alert-workflow/src/lib/core/services/workflow-api.service.ts` | REST client for workflows |
| `projects/alert-workflow/src/lib/workflow-designer/workflow-designer.interfaces.ts` | All TypeScript interfaces |

## Gotchas & Non-Obvious Behaviors

1. **Tailwind Scope**: `tailwind.config.js` scans both `src/**` and `projects/**`. Library components use Tailwind classes directly (not scoped).

2. **PrimeNG Theming**: Library expects host app to provide `providePrimeNG()` with Lara theme. No bundled theme CSS.

3. **Zoneless Mode**: Angular 20 zoneless. All change detection via signals. No `ChangeDetectorRef` anywhere.

4. **No Router Dependency**: Library works with or without `@angular/router`. Back button is optional (`features.backButton`).

5. **Variable Interpolation**: `WorkflowVariablesService.interpolate(text)` replaces `{{varName}}` markers. Default variables in `DEFAULT_TEMPLATE_VARIABLES`.

6. **Exit Point Routing**: Nodes can have multiple exits (`['next']`, `['onTrue', 'onFalse']`, `['case1', 'case2', 'default']`). `WorkflowEdge.exitPoint` stores which exit was connected.

7. **Computed Properties**: `PALETTE` and `TYPE_ICONS` in `workflow-designer.service.ts` are computed from config service. Don't hardcode new node types there.

## Testing Conventions

- Tests use Karma + Jasmine (Angular defaults)
- No E2E tests currently
- Mock `WORKFLOW_LIB_CONFIG` in tests:
  ```typescript
  TestBed.configureTestingModule({
    providers: [{ provide: WORKFLOW_LIB_CONFIG, useValue: mockConfig }]
  });
  ```

## Publishing Workflow

1. Update version in `projects/alert-workflow/package.json`
2. `npm run build:lib`
3. `npm run pack:lib` (optional - creates tarball for testing)
4. `npm run publish:lib` (requires npm auth)

Published as `ngx-workflow-designer` on npm. Repository: `strikerh/ngx-workflow-designer`.

## When Extending

- **New node type**: Add to config array, define `properties[]` with field specs. Inspector auto-renders.
- **New service method**: Update signal → save history → emit change.
- **New component**: Follow presentational pattern (no service injection unless container).
- **New API endpoint**: Extend `WorkflowApiService`, maintain `ApiResponse<T>` wrapper pattern.

## References

- Library README: `projects/alert-workflow/README.md` (user-facing docs)
- Demo app config: `src/app/app.config.ts` (example integration)
- Node config examples: `projects/alert-workflow/src/lib/workflow-designer/config/workflow-nodes-config.data.ts`

