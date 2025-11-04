# Development Best Practices

Guidelines and best practices for developing with the Alert Workflow Module.

## 🎯 Module Isolation

### Working in the Module Context

Always work within the alert-wf module context to avoid pollution:

```typescript
// ✅ Good: Relative imports within module
import { WorkflowApiService } from '../core/services/workflow-api.service';

// ✅ Good: Explicit external imports
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';

// ❌ Avoid: Implicit cross-module imports
import { SomeService } from '../../other-module/services/some.service';
```

### Naming Conventions

Use descriptive, module-specific names:

```typescript
// ✅ Good: Clear, module-specific
export class WorkflowListComponent { }
export class WorkflowDesignerService { }
export class WorkflowNode { }

// ❌ Bad: Generic, ambiguous
export class ListComponent { }
export class DesignerService { }
export class Node { }
```

## 🏗️ Component Development

### Use Angular Signals

Prefer signals over observables for local state:

```typescript
// ✅ Good: Using signals
nodes = signal<WorkflowNode[]>([]);
selectedNode = computed(() => {
  const id = this.selectedNodeId();
  return this.nodes().find(n => n.id === id);
});

// ⚠️ OK: Observables for HTTP/async
this.http.get<Workflow[]>('/api/workflows').subscribe(...);
```

### Standalone Components

All components should be standalone:

```typescript
@Component({
  selector: 'app-workflow-node',
  standalone: true,  // ← Always true
  imports: [CommonModule, FormsModule, ...],
  template: `...`
})
export class WorkflowNodeComponent { }
```

### Single Responsibility

Keep components focused:

```typescript
// ✅ Good: Focused component
@Component({ selector: 'app-node-properties' })
export class NodePropertiesComponent {
  // Only handles node property editing
}

// ❌ Bad: God component
@Component({ selector: 'app-workflow-everything' })
export class WorkflowEverythingComponent {
  // Handles nodes, edges, properties, variables, everything...
}
```

## 📊 State Management

### Use Services for Shared State

```typescript
// ✅ Good: Centralized state in service
@Injectable({ providedIn: 'root' })
export class WorkflowDesignerService {
  nodes = signal<WorkflowNode[]>([]);
  edges = signal<WorkflowEdge[]>([]);
  
  addNode(node: WorkflowNode) {
    this.nodes.update(nodes => [...nodes, node]);
  }
}

// ❌ Bad: State scattered in components
@Component({ ... })
export class SomeComponent {
  private localNodes: WorkflowNode[] = [];  // Isolated state
}
```

### Emit Events, Don't Call Services

Components should emit events, parents call services:

```typescript
// ✅ Good: Component emits event
@Component({ ... })
export class ChildComponent {
  @Output() valueChange = new EventEmitter<string>();
  
  onInputChange(value: string) {
    this.valueChange.emit(value);  // Just emit
  }
}

// Parent handles service call
@Component({ ... })
export class ParentComponent {
  handleValueChange(value: string) {
    this.workflowService.updateNode(id, { value });  // Service call
  }
}

// ❌ Bad: Component calls service directly
@Component({ ... })
export class ChildComponent {
  constructor(private workflowService: WorkflowDesignerService) {}
  
  onInputChange(value: string) {
    this.workflowService.updateNode(id, { value });  // Tight coupling
  }
}
```

## 🎨 Template Best Practices

### Use Control Flow Syntax

Use Angular's new control flow syntax:

```typescript
// ✅ Good: New syntax
@if (selectedNode()) {
  <div>{{ selectedNode()!.label }}</div>
}

@for (node of nodes(); track node.id) {
  <app-workflow-node [node]="node" />
}

// ❌ Bad: Old syntax
<div *ngIf="selectedNode()">
  {{ selectedNode()!.label }}
</div>

<app-workflow-node *ngFor="let node of nodes(); trackBy: trackById" [node]="node" />
```

### Track By for Performance

Always use `track` in loops:

```typescript
// ✅ Good: Track by unique ID
@for (node of nodes(); track node.id) {
  <app-node [node]="node" />
}

// ❌ Bad: Track by index (re-renders unnecessarily)
@for (node of nodes(); track $index) {
  <app-node [node]="node" />
}
```

## 🔧 Service Development

### Proper Dependency Injection

```typescript
// ✅ Good: Use inject()
@Injectable({ providedIn: 'root' })
export class WorkflowDesignerService {
  private http = inject(HttpClient);
  private variablesService = inject(WorkflowVariablesService);
}

// ⚠️ OK: Constructor injection (older style)
@Injectable({ providedIn: 'root' })
export class WorkflowDesignerService {
  constructor(
    private http: HttpClient,
    private variablesService: WorkflowVariablesService
  ) {}
}
```

### Return Types

Always specify return types:

```typescript
// ✅ Good: Explicit return types
addNode(node: WorkflowNode): void {
  this.nodes.update(nodes => [...nodes, node]);
}

getNodeById(id: string): WorkflowNode | null {
  return this.nodes().find(n => n.id === id) || null;
}

// ❌ Bad: Implicit any
addNode(node) {
  this.nodes.update(nodes => [...nodes, node]);
}
```

## 🎯 Type Safety

### Use Interfaces

```typescript
// ✅ Good: Proper interfaces
export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  params: Record<string, any>;
}

// ❌ Bad: Inline types
function updateNode(node: { id: string; label: string; ... }) { }
```

### Avoid `any`

```typescript
// ✅ Good: Specific types
params: Record<string, string | number | boolean>

// ⚠️ OK: With comment explaining why
params: any  // Dynamic structure from API, validated at runtime

// ❌ Bad: Lazy any
data: any
```

## 📝 Documentation

### Component Documentation

```typescript
/**
 * GenericSelectorComponent
 * 
 * A reusable, configurable selector component that can fetch data from any endpoint
 * and display it in a search-and-add pattern.
 * 
 * @example
 * ```html
 * <app-generic-selector
 *   [endpoint]="'/api/users'"
 *   [valueField]="'id'"
 *   [primaryDisplayField]="'name'"
 *   (selectionChange)="handleChange($event)">
 * </app-generic-selector>
 * ```
 */
@Component({ ... })
export class GenericSelectorComponent { }
```

### Method Documentation

```typescript
/**
 * Adds a new node to the workflow canvas
 * @param type - Node type identifier (e.g., 'action.sms')
 * @param opts - Optional node properties
 */
addNode(type: string, opts: Partial<WorkflowNode> = {}): void {
  // ...
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('WorkflowDesignerService', () => {
  let service: WorkflowDesignerService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowDesignerService);
  });
  
  it('should add a node', () => {
    const initialCount = service.nodes().length;
    service.addNode('action.sms');
    expect(service.nodes().length).toBe(initialCount + 1);
  });
  
  it('should remove a node and its connected edges', () => {
    const node = service.addNode('action.sms');
    service.addEdge(node.id, 'other-node');
    
    service.removeNode(node.id);
    
    expect(service.nodes()).not.toContain(node);
    expect(service.edges().find(e => e.from === node.id)).toBeUndefined();
  });
});
```

## 🚀 Performance

### Computed Signals for Derived Data

```typescript
// ✅ Good: Computed signal (cached)
selectedNode = computed(() => {
  const id = this.selectedNodeId();
  return this.nodes().find(n => n.id === id) || null;
});

// ❌ Bad: Getter (re-computed every access)
get selectedNode() {
  return this.nodes().find(n => n.id === this.selectedNodeId());
}
```

### Debounce Rapid Changes

```typescript
import { debounce } from 'lodash-es';

// ✅ Good: Debounce save operations
private debouncedSave = debounce(() => {
  this.saveWorkflow();
}, 500);

onFieldChange(value: string) {
  this.updateLocalState(value);
  this.debouncedSave();
}
```

## 🔐 Security

### Sanitize User Input

```typescript
import { DomSanitizer } from '@angular/platform-browser';

// ✅ Good: Sanitize HTML
constructor(private sanitizer: DomSanitizer) {}

getSafeHtml(html: string): SafeHtml {
  return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
}

// ❌ Bad: Direct innerHTML
innerHTML = userInput;  // XSS vulnerability
```

### Validate API Responses

```typescript
// ✅ Good: Validate structure
loadWorkflow(id: string) {
  this.http.get<ApiWorkflow>(`/api/workflows/${id}`).subscribe({
    next: (data) => {
      if (this.isValidWorkflow(data)) {
        this.loadWorkflowData(data);
      } else {
        console.error('Invalid workflow data structure');
      }
    }
  });
}

private isValidWorkflow(data: any): data is ApiWorkflow {
  return data && 
         Array.isArray(data.nodes) && 
         Array.isArray(data.edges);
}
```

## 📦 Code Organization

### File Structure

```
component-name/
├── component-name.component.ts      // Component logic
├── component-name.component.html    // Template
├── component-name.component.css     // Styles
├── component-name.component.spec.ts // Tests
└── README.md                        // Component docs
```

### Barrel Exports

```typescript
// index.ts
export { WorkflowInspectorComponent } from './workflow-inspector.component';
export { NodePropertiesComponent } from './node-properties.component';
export { NodeFieldsEditorComponent } from './node-fields-editor.component';

// Usage
import { 
  WorkflowInspectorComponent,
  NodePropertiesComponent 
} from './components/inspector';
```

## 🐛 Error Handling

### User-Friendly Error Messages

```typescript
// ✅ Good: Informative error handling
loadWorkflow(id: string) {
  this.http.get<ApiWorkflow>(`/api/workflows/${id}`).subscribe({
    next: (data) => this.loadWorkflowData(data),
    error: (err) => {
      if (err.status === 404) {
        this.error = 'Workflow not found';
      } else if (err.status === 403) {
        this.error = 'You do not have permission to access this workflow';
      } else {
        this.error = 'Failed to load workflow. Please try again.';
      }
      console.error('Load workflow error:', err);
    }
  });
}

// ❌ Bad: Generic error
.subscribe({
  error: (err) => {
    this.error = 'Error';  // Not helpful
  }
});
```

## 🔄 Git Workflow

### Commit Messages

```bash
# ✅ Good: Descriptive commits
git commit -m "feat(workflow): add generic selector component"
git commit -m "fix(inspector): resolve z-index stacking issue"
git commit -m "docs(readme): update component usage examples"

# ❌ Bad: Vague commits
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### Branch Names

```bash
# ✅ Good: Descriptive branches
feature/generic-selector
fix/connection-points-ui
docs/component-guides

# ❌ Bad: Vague branches
dev
my-changes
temp
```

## 📚 Additional Resources

- [Getting Started Guide](./getting-started.md)
- [Node Configuration](./node-configuration.md)
- [Architecture Overview](../technical/architecture.md)

---

**Remember**: Write code for humans first, computers second!
