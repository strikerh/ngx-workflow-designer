# Template Input Component

Advanced text input component with variable autocomplete functionality for creating dynamic, template-based content.

## Features

✅ **Variable Autocomplete** - Type `{` to trigger variable suggestions  
✅ **Single & Multi-line** - Works as textbox or textarea  
✅ **Keyboard Navigation** - Arrow keys + Enter to select variables  
✅ **Search/Filter** - Real-time filtering as you type  
✅ **Type Safety** - Full TypeScript support  
✅ **Workflow Variables** - Automatically integrates with WorkflowVariablesService  
✅ **Default Variables** - Pre-configured system and context variables  
✅ **Form Integration** - Works with Angular Forms (ngModel/ReactiveFor ms)  
✅ **Smart Categorization** - Variables grouped by source/type

## Usage

### Basic Example (Single Line)

```typescript
<app-template-input
  [(ngModel)]="message"
  [placeholder]="'Enter message with {variables}'">
</app-template-input>
```

### Textarea Example (Multi-line)

```typescript
<app-template-input
  [(ngModel)]="description"
  [multiline]="true"
  [rows]="6"
  [placeholder]="'Enter description...'">
</app-template-input>
```

### With Custom Placeholder

```typescript
<app-template-input
  [(ngModel)]="smsMessage"
  [multiline]="true"
  [rows]="4"
  [placeholder]="'Alert: {alert.type} at {alert.location}'">
</app-template-input>
```

## Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `placeholder` | `string` | `''` | Placeholder text with example variables |
| `multiline` | `boolean` | `false` | Use textarea instead of input |
| `rows` | `number` | `4` | Number of rows (when multiline) |
| `availableVariables` | `TemplateVariable[]` | Auto-loaded | Custom variables to override defaults |

## How It Works

### User Interaction Flow

1. **User types `{`** → Autocomplete dropdown appears
2. **User types search query** → Variables filtered in real-time  
   - Example: `{ale` → filters to `{alert.*}` variables
3. **User navigates with ↑ ↓** → Highlight desired variable
4. **User presses Enter/Tab** → Variable inserted as `{variable.key}`
5. **User presses Esc** → Dropdown closes

### Example Session

```
User types: "Alert severity is {"
  ↓ Autocomplete shows all variables
  
User types: "Alert severity is {ale"
  ↓ Filtered to show only:
    - {alert.severity}
    - {alert.type}
    - {alert.location}
    - etc.

User presses ↓ to select "{alert.severity}"
User presses Enter
  ↓ Input now shows: "Alert severity is {alert.severity}"
```

## Variable Sources

The component automatically combines variables from three sources:

### 1. Workflow Variables (Highest Priority)
User-defined mutable values specific to the workflow.

**Category**: "Workflow Variables"  
**Source**: `WorkflowVariablesService.getVariablesArray()`  
**Example**:
```typescript
// User defined in workflow:
severity: "CRITICAL"
location: "ER-3"
maxRetries: "3"

// Available as:
{severity} - Variable: CRITICAL
{location} - Variable: ER-3
{maxRetries} - Variable: 3
```

### 2. Workflow Constants
User-defined immutable values.

**Category**: "Workflow Constants"  
**Source**: `WorkflowVariablesService.getConstantsArray()`  
**Example**:
```typescript
// User defined:
hospitalName: "General Hospital"
emergencyContact: "+1-555-0100"

// Available as:
{hospitalName} - Constant: General Hospital
{emergencyContact} - Constant: +1-555-0100
```

### 3. Default Template Variables (Lowest Priority)
System-provided context variables.

**Categories**: Alert, User, Workflow, System, Node Data  
**Source**: `DEFAULT_TEMPLATE_VARIABLES` from `workflow-variables.service.ts`

## Default Variables Reference

### Alert Context

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{alert.id}` | Unique alert identifier | `"alert_abc123"` |
| `{alert.type}` | Type of alert | `"Equipment Failure"` |
| `{alert.severity}` | Alert severity level | `"CRITICAL"` |
| `{alert.message}` | Alert message | `"MRI Scanner offline"` |
| `{alert.location}` | Alert location | `"Building A, Room 301"` |
| `{alert.timestamp}` | When alert occurred | `"2025-10-19T14:30:00Z"` |
| `{alert.source}` | Alert source system | `"Monitoring System"` |
| `{alert.priority}` | Alert priority | `"High"` |

### User Context

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{user.id}` | Current user ID | `"user_123"` |
| `{user.name}` | User full name | `"Dr. Sarah Johnson"` |
| `{user.email}` | User email address | `"sarah.johnson@hospital.com"` |
| `{user.role}` | User role | `"Physician"` |
| `{user.department}` | User department | `"Emergency"` |

### Workflow Context

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{workflow.id}` | Workflow instance ID | `"wf_xyz789"` |
| `{workflow.name}` | Workflow name | `"Critical Alert Response"` |
| `{workflow.startTime}` | Workflow start time | `"2025-10-19T14:30:05Z"` |
| `{workflow.status}` | Current workflow status | `"running"` |

### System Context

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{system.currentTime}` | Current timestamp | `"2025-10-19T14:35:00Z"` |
| `{system.date}` | Current date | `"2025-10-19"` |
| `{system.time}` | Current time | `"14:35:00"` |

### Node Data (Previous Node Outputs)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{node.output}` | Previous node output | `"success"` |
| `{node.result}` | Previous node result data | `{ "sent": true }` |

## Integration in Node Configuration

### In NodeFieldConfig

```typescript
{
  key: 'message',
  label: 'Message',
  type: 'textarea',  // Uses TemplateInputComponent
  placeholder: 'Alert: {alert.type} - Severity: {alert.severity}',
  icon: '💬',
  help: 'Type { to see available variables'
}
```

### Auto-Integration

The `NodeFieldsEditorComponent` automatically uses `TemplateInputComponent` for:
- `type: 'textarea'` - Multi-line template input
- `type: 'text'` (default) - Single-line template input

```typescript
<!-- Automatic rendering in NodeFieldsEditorComponent -->
@case ('textarea') {
  <app-template-input
    [multiline]="true"
    [rows]="4"
    [placeholder]="field.label + (field.icon ? ' ' + field.icon : '')"
    [(ngModel)]="node.params[field.key]"
    (ngModelChange)="handleTemplateInputChange(field, $event)">
  </app-template-input>
}

@default {
  <app-template-input
    [multiline]="false"
    [placeholder]="field.label + (field.icon ? ' ' + field.icon : '')"
    [(ngModel)]="node.params[field.key]"
    (ngModelChange)="handleTemplateInputChange(field, $event)">
  </app-template-input>
}
```

## Real-World Examples

### Example 1: SMS Message Template

```typescript
{
  key: 'message',
  label: 'SMS Message',
  type: 'textarea',
  placeholder: 'ALERT: {alert.type}\nLocation: {alert.location}\nSeverity: {alert.severity}',
  icon: '💬',
  help: 'Use {variables} for dynamic content'
}
```

**User Input**:
```
ALERT: {alert.type}
Location: {alert.location}
Priority: {alert.priority}
Time: {system.currentTime}
```

**Runtime Output**:
```
ALERT: Equipment Failure
Location: Building A, Room 301
Priority: High
Time: 2025-10-19T14:35:00Z
```

### Example 2: Email Subject

```typescript
{
  key: 'subject',
  label: 'Email Subject',
  type: 'text',
  placeholder: '[{alert.severity}] {alert.type} - {alert.location}',
  icon: '✉️'
}
```

**User Input**: `[{alert.severity}] {alert.type} at {alert.location}`  
**Runtime Output**: `[CRITICAL] Equipment Failure at Building A, Room 301`

### Example 3: Notification with Workflow Variables

```typescript
// User defines workflow variable: patientName = "John Doe"

{
  key: 'notification',
  label: 'Notification Text',
  type: 'textarea',
  placeholder: 'Patient {patientName} requires attention...'
}
```

**User Input**:
```
Patient {patientName} in room {location} requires immediate attention.
Alert type: {alert.type}
Assigned to: {user.name}
```

**Runtime Output**:
```
Patient John Doe in room ER-3 requires immediate attention.
Alert type: Equipment Failure
Assigned to: Dr. Sarah Johnson
```

## Advanced Features

### Custom Variables

Override default variables with custom ones:

```typescript
import { TemplateVariable } from '../../../workflow-variables.service';

const customVariables: TemplateVariable[] = [
  {
    key: 'patient.mrn',
    label: 'Patient MRN',
    description: 'Medical Record Number',
    category: 'Patient'
  },
  {
    key: 'bed.number',
    label: 'Bed Number',
    description: 'Hospital bed identifier',
    category: 'Location'
  }
];

// In template
<app-template-input
  [(ngModel)]="message"
  [availableVariables]="customVariables">
</app-template-input>
```

### Reactive Updates

Variables automatically update when workflow variables change:

```typescript
// Component uses computed signal
allAvailableVariables = computed(() => {
  const workflowVars = this.getWorkflowVariables();  // Reactive!
  const defaultVars = DEFAULT_TEMPLATE_VARIABLES;
  const customVars = this.availableVariables();
  
  return [...workflowVars, ...defaultVars, ...customVars];
});
```

**Result**: When user adds/updates workflow variables, autocomplete immediately reflects changes.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `{` | Open autocomplete |
| `↑` `↓` | Navigate suggestions |
| `Enter` | Insert selected variable |
| `Tab` | Insert selected variable |
| `Esc` | Close autocomplete |
| `Type` | Filter suggestions |

## Styling & Customization

The component uses Tailwind CSS classes and can be customized via global styles:

```css
/* Autocomplete dropdown */
.autocomplete-dropdown {
  @apply border rounded-md shadow-lg bg-white z-50;
  max-height: 200px;
  overflow-y: auto;
}

/* Variable item */
.variable-item {
  @apply px-3 py-2 cursor-pointer hover:bg-slate-50;
}

/* Selected variable */
.variable-item.selected {
  @apply bg-blue-50;
}
```

## Best Practices

### 1. Provide Clear Placeholders

```typescript
// ✅ Good: Show example with variables
placeholder: 'Alert {alert.type} at {alert.location}'

// ❌ Bad: Generic placeholder
placeholder: 'Enter message'
```

### 2. Use Help Text

```typescript
// ✅ Good: Guide users
help: 'Type { to see available variables'

// ✅ Good: Show common pattern
help: 'Example: ALERT: {alert.type} - {alert.severity}'
```

### 3. Choose Appropriate Input Type

```typescript
// ✅ Good: Multi-line for long content
type: 'textarea'  // SMS messages, emails

// ✅ Good: Single-line for short content
type: 'text'  // Subject lines, titles
```

### 4. Leverage Workflow Variables

```typescript
// ✅ Good: Use workflow variables for reusability
// Define once in variables: hospitalName, emergencyPhone
// Use everywhere: {hospitalName}, {emergencyPhone}

// ❌ Bad: Hardcode values
'Contact General Hospital at +1-555-0100'
```

## Troubleshooting

### Issue: Autocomplete not appearing
**Solution**: Ensure you're typing `{` character.

### Issue: Variables not updating
**Solution**: Check WorkflowVariablesService is properly injected and has data.

### Issue: Custom variables not showing
**Solution**: Verify `availableVariables` input is bound correctly.

### Issue: Dropdown appears off-screen
**Solution**: Component auto-positions, but check parent container overflow settings.

---

**Related Docs**:
- [Inspector Components](./inspector.md)
- [Workflow Variables](../guides/node-configuration.md#workflow-variables)
- [Node Configuration Guide](../guides/node-configuration.md)
