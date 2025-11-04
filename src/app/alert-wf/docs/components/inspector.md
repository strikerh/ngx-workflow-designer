# Workflow Inspector Components

The Inspector is a modular component system for editing workflow properties, node configurations, and managing variables.

## 📦 Component Architecture

```
WorkflowInspectorComponent (Main Orchestrator)
├── NodePropertiesComponent (When node selected)
│   └── NodeFieldsEditorComponent
│       ├── SwitchCasesEditorComponent
│       ├── UserSelectorComponent
│       ├── UserGroupSelectorComponent
│       ├── GenericSelectorComponent
│       ├── DynamicSelectComponent
│       └── TemplateInputComponent
└── InspectorTabsComponent (When no node selected)
    ├── WorkflowPropertiesComponent
    │   └── WorkflowMetadataComponent
    └── WorkflowVariablesComponent
```

## 🎯 Component Responsibilities

### WorkflowInspectorComponent
**Location**: `workflow-designer/components/inspector/workflow-inspector.component.ts`

**Purpose**: Main orchestrator that coordinates all inspector functionality.

**Key Features**:
- Manages tab state (Properties vs Variables)
- Routes events to services
- Computes selected node and fields
- Handles service interactions

**Usage**:
```typescript
import { WorkflowInspectorComponent } from './components/inspector';

// In template
<app-workflow-inspector></app-workflow-inspector>
```

### NodePropertiesComponent
**Purpose**: Displays and edits properties for the selected node.

**Features**:
- Node label editing
- Remove node button
- Dynamic field rendering via NodeFieldsEditorComponent

**Inputs**: None (uses signals from service)
**Outputs**: Emits label changes and remove events

### NodeFieldsEditorComponent
**Purpose**: Dynamically renders form fields based on node type configuration.

**Supported Field Types**:
- `text` - Single-line text input
- `textarea` - Multi-line text input (with template support)
- `number` - Numeric input
- `select` - Dropdown (via DynamicSelectComponent)
- `switch-cases` - Switch case editor
- `user-selector` - User selection
- `user-group-selector` - User group selection
- `generic-selector` - Configurable API-driven selector

**Example Configuration**:
```typescript
const fields: NodeFieldConfig[] = [
  {
    key: 'message',
    label: 'Message',
    type: 'textarea',
    placeholder: 'Enter message...',
    help: 'Supports {variables}'
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: {
      options: ['Low', 'Medium', 'High', 'Critical']
    } as DynamicSelectOptions
  }
];
```

### SwitchCasesEditorComponent
**Purpose**: Manages case values for switch nodes.

**Features**:
- Add/remove cases dynamically
- Inline editing with auto-save
- Comma-separated string output

**Usage**:
```html
<app-switch-cases-editor
  [nodeId]="node.id"
  [currentCases]="'CRITICAL,HIGH,MEDIUM,LOW'"
  (casesChange)="handleCasesChange($event)">
</app-switch-cases-editor>
```

### WorkflowPropertiesComponent
**Purpose**: Edits workflow-level settings.

**Fields**:
- Workflow ID (readonly)
- Name (editable)
- Description (textarea)
- Created/Updated timestamps (readonly)

**Features**:
- Integrates WorkflowMetadataComponent
- Auto-save on blur
- Validation display

### WorkflowMetadataComponent
**Purpose**: Manages workflow metadata fields.

**Fields**:
- Category
- Priority (select dropdown)
- Author
- Version
- Approved (checkbox)
- Tags (comma-separated)

### WorkflowVariablesComponent
**Purpose**: Manages workflow variables and constants.

**Features**:
- Add/remove variables
- Key-value pair editing
- Auto-save on blur
- Syncs with WorkflowVariablesService

**Variable Types**:
- **Variables**: Mutable values that can change during execution
- **Constants**: Immutable values (future feature)

### InspectorTabsComponent
**Purpose**: Simple tab navigation UI.

**Tabs**:
- Properties - Workflow-level settings
- Variables - Workflow variables management

## 🔄 Data Flow

### Event Flow (Bottom-Up)
```
User Action (input change)
    ↓
Child Component (emits event)
    ↓
Parent Component (receives event)
    ↓
Service Method Call
    ↓
Signal Update
    ↓
UI Re-renders
```

### Example: Editing Node Label
```typescript
// 1. User types in NodePropertiesComponent
<input (input)="onLabelChange.emit($event)" />

// 2. WorkflowInspectorComponent receives event
(onLabelChange)="updateLabelSilent($event)"

// 3. Service updates node
updateLabelSilent(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.workflowService.updateNodeSilent(nodeId, { label: value });
}

// 4. Signal updates
this.workflowService.nodes.update(nodes => 
  nodes.map(n => n.id === nodeId ? { ...n, label: value } : n)
);

// 5. UI reflects change (reactive)
```

## 🧩 Adding New Components

To add a specialized input component:

1. **Create Component** in `node-fields-inputs/`
```typescript
@Component({
  selector: 'app-my-custom-input',
  standalone: true,
  template: `...`
})
export class MyCustomInputComponent {
  @Input() currentValue: any;
  @Output() valueChange = new EventEmitter<any>();
}
```

2. **Export from index.ts**
```typescript
export { MyCustomInputComponent } from './my-custom-input.component';
```

3. **Import in NodeFieldsEditorComponent**
```typescript
import { MyCustomInputComponent } from './node-fields-inputs';
```

4. **Add to template switch**
```typescript
@case ('my-custom') {
  <app-my-custom-input
    [currentValue]="getFieldValue(field.key)"
    (valueChange)="handleChange($event, field)">
  </app-my-custom-input>
}
```

5. **Configure in node definition**
```typescript
{
  key: 'myField',
  label: 'My Field',
  type: 'my-custom',
  // ... options
}
```

## 📝 Best Practices

### Component Design
- Keep components focused on single responsibility
- Use signals for reactive state
- Emit events, don't call services directly
- Use TypeScript interfaces for type safety

### Event Handling
- Use descriptive event names
- Always type event payloads
- Handle errors gracefully
- Provide user feedback

### Performance
- Use `OnPush` change detection when possible
- Avoid unnecessary re-renders
- Use computed signals for derived data
- Debounce rapid input changes

## 🔍 Troubleshooting

### Issue: Component not updating
**Solution**: Check if signals are being used correctly in computed properties.

### Issue: Fields not rendering
**Solution**: Verify field configuration matches expected interface.

### Issue: Events not firing
**Solution**: Check @Output EventEmitter is properly connected in template.

---

**Related Docs**:
- [Generic Selector](./generic-selector.md)
- [Dynamic Select](./dynamic-select.md)
- [Template Input](./template-input.md)
