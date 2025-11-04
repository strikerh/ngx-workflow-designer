# System Architecture

Comprehensive overview of the Alert Workflow Module's architecture, data flow, and design patterns.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Alert Workflow Module                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Workflow List │  │ Workflow Designer│  │  Execution     │  │
│  │  Component     │──│   Component      │──│  Engine        │  │
│  └────────────────┘  └──────────────────┘  └────────────────┘  │
│         │                     │                     │            │
│         │                     ▼                     │            │
│         │            ┌─────────────────┐            │            │
│         │            │  Inspector      │            │            │
│         │            │  Components     │            │            │
│         │            └─────────────────┘            │            │
│         │                     │                     │            │
│         ▼                     ▼                     ▼            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Workflow Designer Service (State)              │  │
│  │  • nodes: Signal<WorkflowNode[]>                         │  │
│  │  • edges: Signal<WorkflowEdge[]>                         │  │
│  │  • selectedNodeId: Signal<string | null>                 │  │
│  │  • Undo/Redo history management                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                     │                     │            │
│         ▼                     ▼                     ▼            │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Workflow   │  │  Nodes Config    │  │  Variables       │  │
│  │  API Service│  │  Service         │  │  Service         │  │
│  └─────────────┘  └──────────────────┘  └──────────────────┘  │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
    ┌──────────────┐
    │   Backend    │
    │   API        │
    └──────────────┘
```

## 📦 Module Structure

```
alert-wf/
├── core/                          # Shared business logic
│   ├── models/                    # Data models and interfaces
│   └── services/                  # API and business services
│       └── workflow-api.service.ts
│
├── workflow-list/                 # Workflow management
│   ├── workflow-list.component.ts
│   ├── workflow-list.component.html
│   └── workflow-list.component.css
│
├── workflow-designer/             # Visual workflow builder
│   ├── workflow-designer.component.ts
│   ├── workflow-designer.service.ts
│   ├── workflow-history.service.ts
│   ├── workflow-nodes-config.service.ts
│   ├── workflow-variables.service.ts
│   ├── workflow-designer.interfaces.ts
│   │
│   └── components/                # Designer sub-components
│       ├── workflow-header.component.ts
│       ├── workflow-palette.component.ts
│       ├── workflow-canvas.component.ts
│       ├── workflow-node.component.ts
│       ├── workflow-logs.component.ts
│       └── inspector/             # Property editing
│           ├── workflow-inspector.component.ts
│           ├── node-properties.component.ts
│           ├── node-fields-editor.component.ts
│           └── node-fields-inputs/
│               ├── generic-selector.component.ts
│               ├── dynamic-select.component.ts
│               ├── template-input.component.ts
│               ├── user-selector.component.ts
│               └── switch-cases-editor.component.ts
│
└── docs/                          # Documentation
```

## 🔄 Data Flow

### Component Hierarchy

```
WorkflowDesignerComponent (Root)
│
├─► WorkflowHeaderComponent
│   ├─ Save/Load/Undo/Redo controls
│   └─ Template dropdown
│
├─► WorkflowPaletteComponent
│   ├─ Categorized node types
│   └─ Drag-and-drop source
│
├─► WorkflowCanvasComponent
│   ├─ Node rendering (WorkflowNodeComponent)
│   ├─ Edge rendering
│   ├─ Pan and zoom
│   └─ Connection drawing
│
├─► WorkflowInspectorComponent
│   ├─ NodePropertiesComponent (when node selected)
│   │   └─ NodeFieldsEditorComponent
│   │       └─ [Dynamic field components]
│   │
│   └─ InspectorTabsComponent (when no node selected)
│       ├─ WorkflowPropertiesComponent
│       └─ WorkflowVariablesComponent
│
└─► WorkflowLogsComponent
    └─ Execution logs and debugging
```

### State Management Flow

```
1. User Action
   ↓
2. Component Event
   ↓
3. Parent Component Handler
   ↓
4. Service Method Call
   ↓
5. Signal Update
   ↓
6. Computed Signals Recalculate
   ↓
7. UI Re-renders (Reactive)
```

**Example: Adding a Node**

```typescript
// 1. User clicks node in palette
<button (click)="onNodeClick('action.sms')">SMS</button>

// 2. PaletteComponent emits event
@Output() nodeSelected = new EventEmitter<string>();
onNodeClick(type: string) {
  this.nodeSelected.emit(type);
}

// 3. DesignerComponent handles event
<app-workflow-palette (nodeSelected)="addNodeToCanvas($event)">
addNodeToCanvas(type: string) {
  this.workflowService.addNode(type);
}

// 4. Service updates signal
addNode(type: string): void {
  const node = this.createNode(type);
  this.nodes.update(nodes => [...nodes, node]);
  this.selectedNodeId.set(node.id);
  this.saveStateToHistory('Added node');
}

// 5. Computed signals react
selectedNode = computed(() => {
  const id = this.selectedNodeId();
  return this.nodes().find(n => n.id === id) || null;
});

// 6. Template re-renders
@if (workflowService.selectedNode()) {
  <app-node-properties [node]="workflowService.selectedNode()!" />
}
```

## 🎯 Design Patterns

### 1. Signal-Based Reactive State

**Pattern**: Use Angular signals for reactive state management

```typescript
@Injectable({ providedIn: 'root' })
export class WorkflowDesignerService {
  // Writable signals
  nodes = signal<WorkflowNode[]>([]);
  selectedNodeId = signal<string | null>(null);
  
  // Computed signals (derived state)
  selectedNode = computed(() => {
    const id = this.selectedNodeId();
    return this.nodes().find(n => n.id === id) || null;
  });
  
  // Update methods
  addNode(node: WorkflowNode) {
    this.nodes.update(nodes => [...nodes, node]);
  }
}
```

**Benefits**:
- Fine-grained reactivity
- Automatic dependency tracking
- No manual subscription management
- Better performance than observables for sync data

### 2. Event Bubbling Architecture

**Pattern**: Child components emit events, parents handle service calls

```typescript
// Child Component (Presentational)
@Component({ ... })
export class NodePropertiesComponent {
  @Input() node: WorkflowNode;
  @Output() labelChange = new EventEmitter<string>();
  @Output() removeNode = new EventEmitter<void>();
  
  // Just emit events
  onLabelChange(value: string) {
    this.labelChange.emit(value);
  }
}

// Parent Component (Container)
@Component({ ... })
export class WorkflowInspectorComponent {
  constructor(private workflowService: WorkflowDesignerService) {}
  
  // Handle service interaction
  handleLabelChange(value: string) {
    const nodeId = this.workflowService.selectedNodeId();
    this.workflowService.updateNode(nodeId, { label: value });
  }
}
```

**Benefits**:
- Clear separation of concerns
- Reusable presentational components
- Easier testing
- Loose coupling

### 3. Configuration-Driven UI

**Pattern**: Node types and fields defined in configuration, UI generated dynamically

```typescript
// Configuration
const nodeConfig: NodeTypeConfig = {
  type: "action.sms",
  properties: [
    { key: 'message', label: 'Message', type: 'textarea' },
    { key: 'priority', label: 'Priority', type: 'select' }
  ],
  exits: ["onSuccess", "onFailure"]
};

// Dynamic rendering
@for (field of fields; track field.key) {
  @switch (field.type) {
    @case ('textarea') {
      <app-template-input [(ngModel)]="node.params[field.key]" />
    }
    @case ('select') {
      <app-dynamic-select [options]="field.options" />
    }
  }
}
```

**Benefits**:
- Add new node types without code changes
- Consistent UI patterns
- Easy to modify configurations
- Hot-reloadable (when using JSON config)

### 4. History/Undo Pattern

**Pattern**: Snapshot-based undo/redo

```typescript
@Injectable({ providedIn: 'root' })
export class WorkflowHistoryService {
  private history = signal<WorkflowHistoryState[]>([]);
  private currentIndex = signal<number>(-1);
  
  saveState(state: WorkflowHistoryState) {
    // Remove future states if undid
    const newHistory = this.history().slice(0, this.currentIndex() + 1);
    newHistory.push(state);
    
    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    this.history.set(newHistory);
    this.currentIndex.set(newHistory.length - 1);
  }
  
  undo(): WorkflowHistoryState | null {
    if (!this.canUndo()) return null;
    this.currentIndex.update(i => i - 1);
    return this.history()[this.currentIndex()];
  }
}
```

### 5. Service Injection Pattern

**Pattern**: Use `inject()` function for cleaner, more testable code

```typescript
@Injectable({ providedIn: 'root' })
export class WorkflowDesignerService {
  // Modern inject() pattern
  private http = inject(HttpClient);
  private variablesService = inject(WorkflowVariablesService);
  private historyService = inject(WorkflowHistoryService);
  
  // Clean, no constructor bloat
}
```

## 🔌 Service Architecture

### WorkflowDesignerService (State Management)

**Responsibilities**:
- Manage workflow nodes and edges
- Handle selection state
- Coordinate canvas operations (pan, zoom)
- Integrate with history service
- Convert between API and internal formats

**Key Methods**:
```typescript
addNode(type: string, opts?: Partial<WorkflowNode>): void
removeNode(id: string): void
addEdge(from: string, to: string, exitPoint?: string): void
removeEdge(id: string): void
updateNode(id: string, updates: Partial<WorkflowNode>): void
loadWorkflow(id: string): Promise<boolean>
saveWorkflow(name: string, description?: string): Promise<ApiWorkflow | null>
```

### WorkflowApiService (Backend Communication)

**Responsibilities**:
- HTTP requests to backend
- Response transformation
- Error handling

**Key Methods**:
```typescript
getWorkflows(): Observable<ApiWorkflow[]>
getWorkflow(id: string): Observable<ApiWorkflow>
createWorkflow(workflow: Omit<ApiWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Observable<ApiWorkflow>
updateWorkflow(id: string, workflow: Partial<ApiWorkflow>): Observable<ApiWorkflow>
deleteWorkflow(id: string): Observable<void>
```

### WorkflowNodesConfigService (Node Configuration)

**Responsibilities**:
- Load node type configurations
- Provide node metadata (icons, colors, fields)
- Toggle between TypeScript/JSON config sources

**Key Methods**:
```typescript
getNodeTypeConfig(type: string): NodeTypeConfig | undefined
getPalette(): PaletteItem[]
getTypeIcons(): Record<string, string>
isConfigLoaded(): boolean
```

### WorkflowVariablesService (Variable Management)

**Responsibilities**:
- Manage workflow variables
- Provide template variables for autocomplete
- Sync with workflow state

**Key Methods**:
```typescript
setVariables(variables: Record<string, any>): void
getVariable(key: string): any
setVariable(key: string, value: any): void
removeVariable(key: string): void
getVariablesArray(): TemplateVariable[]
getTemplateVariables(): TemplateVariable[]
```

### WorkflowHistoryService (Undo/Redo)

**Responsibilities**:
- Maintain state history
- Provide undo/redo functionality
- Limit history size

**Key Methods**:
```typescript
saveState(state: WorkflowHistoryState, description?: string): void
undo(): WorkflowHistoryState | null
redo(): WorkflowHistoryState | null
canUndo(): boolean
canRedo(): boolean
```

## 🎨 UI Component Patterns

### Standalone Components

All components are standalone (no NgModule):

```typescript
@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [CommonModule, FormsModule, ...],
  template: `...`
})
export class WorkflowNodeComponent { }
```

### Smart vs Presentational

**Smart Components** (Containers):
- Inject services
- Manage state
- Handle business logic
- Example: WorkflowDesignerComponent, WorkflowInspectorComponent

**Presentational Components** (Dumb):
- Receive data via @Input()
- Emit events via @Output()
- No service injection (except utilities)
- Example: NodePropertiesComponent, WorkflowNodeComponent

## 📊 Data Models

### Core Interfaces

```typescript
// Internal representation (canvas)
interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  params: Record<string, any>;
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  exitPoint?: string;
}

// API representation (backend)
interface ApiWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: ApiNode[];
  edges: ApiEdge[];
  variables?: Record<string, any>;
  metadata?: WorkflowMetadata;
  createdAt: string;
  updatedAt: string;
}
```

### Conversion Between Formats

```typescript
// Internal → API
convertInternalToApi(name: string): Omit<ApiWorkflow, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    nodes: this.nodes().map(n => ({
      id: n.id,
      type: n.type,
      position: { x: n.x, y: n.y },
      data: { label: n.label, params: n.params }
    })),
    edges: this.edges().map(e => ({
      id: e.id,
      source: e.from,
      target: e.to,
      data: e.exitPoint ? { exitPoint: e.exitPoint } : {}
    })),
    variables: this.variablesService.variables()
  };
}

// API → Internal
convertApiToInternal(apiWorkflow: ApiWorkflow): void {
  const nodes = apiWorkflow.nodes.map(n => ({
    id: n.id,
    type: n.type,
    label: n.data.label,
    x: n.position.x,
    y: n.position.y,
    params: n.data.params
  }));
  
  this.nodes.set(nodes);
  // ... similar for edges, variables
}
```

## 🚀 Performance Optimizations

### 1. Computed Signals for Derived Data

Avoid recalculations:
```typescript
// ✅ Cached computation
selectedNode = computed(() => {
  const id = this.selectedNodeId();
  return this.nodes().find(n => n.id === id);
});
```

### 2. Track By in Loops

Minimize re-renders:
```typescript
@for (node of nodes(); track node.id) {
  <app-node [node]="node" />
}
```

### 3. OnPush Change Detection

For frequently updating components:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

### 4. Debounce Expensive Operations

```typescript
private debouncedSave = debounce(() => this.saveWorkflow(), 500);
```

## 📚 Additional Resources

- [Node Exit Points](./node-exit-points.md)
- [API Integration](./api-integration.md)
- [Development Guide](../guides/development.md)

---

**Next**: Learn about [Node Exit Points System](./node-exit-points.md)
