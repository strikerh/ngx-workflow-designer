# Node Configuration Guide

Complete guide to configuring workflow nodes and understanding node types, fields, and exit points.

## 📦 Node Configuration System

Nodes are configured using either:
- **TypeScript**: `workflow-nodes-config.data.ts` (type-safe, faster)
- **JSON**: `public/workflow-nodes-config.json` (hot-reloadable)

Toggle between them in `workflow-nodes-config.service.ts`:
```typescript
const USE_TYPESCRIPT_CONFIG = true;  // false for JSON
```

## 🏗️ Node Type Structure

```typescript
export interface NodeTypeConfig {
  type: string;                    // Unique identifier (e.g., "action.sms")
  category: 'trigger' | 'control' | 'action' | 'terminal' | 'utility';
  label: string;                   // Display name
  description: string;             // Help text
  icon: string;                    // Emoji or HTML icon
  color: string;                   // Tailwind classes for palette
  nodeColor: string;               // Tailwind classes for canvas node
  properties: NodeFieldConfig[];   // Configuration fields
  exits: string[];                 // Output connection points
}
```

## 🎨 Node Categories

### Triggers (Start Points)
```typescript
{
  type: "trigger.manual",
  category: "trigger",
  label: "Manual Trigger",
  description: "Start workflow manually",
  icon: "play_arrow",  // Material icon name
  exits: ["next"]
}
```

**Common Trigger Types**:
- `trigger.manual` - Manual start
- `trigger.webhook` - HTTP webhook
- `trigger.schedule` - Time-based (cron)
- `trigger.event` - Event-driven

### Control Flow (Logic)
```typescript
{
  type: "control.if",
  category: "control",
  label: "If / Else",
  description: "Conditional branching",
  icon: "call_split",
  exits: ["onTrue", "onFalse"]
}
```

**Common Control Types**:
- `control.if` - If/else branching
- `control.switch` - Multi-way branching
- `control.loop` - Iteration
- `control.parallel` - Concurrent execution

### Actions (Operations)
```typescript
{
  type: "action.sms",
  category: "action",
  label: "Send SMS",
  description: "Send SMS message",
  icon: "sms",
  exits: ["onSuccess", "onFailure"]
}
```

**Common Action Types**:
- `action.sms` - Send SMS
- `action.email` - Send email
- `action.http` - HTTP request
- `action.database` - Database operation
- `action.notification` - System notification

### Terminals (End Points)
```typescript
{
  type: "end.terminate",
  category: "terminal",
  label: "End",
  description: "Workflow completion",
  icon: "stop",
  exits: []  // No exits
}
```

## 🔧 Node Field Configuration

### Field Types

#### Text Input
```typescript
{
  key: 'url',
  label: 'URL',
  type: 'text',
  required: true,
  placeholder: 'https://api.example.com',
  icon: '🌐',
  help: 'Enter the full URL including protocol'
}
```

#### Textarea (with Template Support)
```typescript
{
  key: 'message',
  label: 'Message',
  type: 'textarea',
  required: true,
  placeholder: 'Alert: {alert.type}',
  icon: '💬',
  help: 'Type { to see available variables'
}
```

#### Number Input
```typescript
{
  key: 'timeout',
  label: 'Timeout (seconds)',
  type: 'number',
  required: false,
  placeholder: '30',
  default: 30,
  help: 'Request timeout in seconds'
}
```

#### Select (Static Options)
```typescript
{
  key: 'priority',
  label: 'Priority',
  type: 'select',
  required: true,
  icon: '⚡',
  options: {
    options: ['Low', 'Medium', 'High', 'Critical'],
    showSearch: false
  } as DynamicSelectOptions
}
```

#### Select (Dynamic API)
```typescript
{
  key: 'userId',
  label: 'Target User',
  type: 'select',
  icon: '👤',
  options: {
    endpoint: '/api/users',
    valueField: 'id',
    displayField: 'fullName',
    secondaryDisplayField: 'email',
    showSearch: true
  } as DynamicSelectOptions
}
```

#### User Selector (Multi-select)
```typescript
{
  key: 'assignedUsers',
  label: 'Assign To Users',
  type: 'user-selector',
  icon: '👤',
  help: 'Select one or more users'
}
```

#### User Group Selector (Multi-select)
```typescript
{
  key: 'notificationGroups',
  label: 'Notification Groups',
  type: 'user-group-selector',
  icon: '👥',
  help: 'Select notification groups'
}
```

#### Generic Selector (Configurable Multi-select)
```typescript
{
  key: 'departments',
  label: 'Departments',
  type: 'generic-selector',
  icon: '🏢',
  options: {
    endpoint: '/api/departments',
    valueField: 'id',
    primaryDisplayField: 'name',
    secondaryDisplayField: 'description',
    searchLabel: 'Search Departments',
    responseDataPath: 'results'
  } as GenericSelectorOptions
}
```

#### Switch Cases Editor
```typescript
{
  key: 'cases',
  label: 'Case Values',
  type: 'switch-cases',
  required: true,
  placeholder: 'CRITICAL,HIGH,MEDIUM,LOW',
  help: 'Comma-separated case values'
}
```

## 🔌 Exit Points System

Exit points determine where workflow execution can go next.

### Standard Exit Points

| Exit Point | Color | Used By | Meaning |
|------------|-------|---------|---------|
| `next` | Blue | Triggers, Actions | Continue to next |
| `onTrue` | Green | If/Else | Condition is true |
| `onFalse` | Red | If/Else | Condition is false |
| `onSuccess` | Green | Actions | Operation succeeded |
| `onFailure` | Red | Actions | Operation failed |
| `default` | Purple | Switch | Default case (no match) |

### Dynamic Exit Points (Switch Nodes)

Switch nodes generate exits based on the `cases` parameter:

```typescript
// User sets cases: "CRITICAL,HIGH,MEDIUM,LOW"

// Generated exits:
exits: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "default"]
```

**Configuration**:
```typescript
{
  type: "control.switch",
  properties: [
    {
      key: 'expression',
      label: 'Switch Expression',
      type: 'text',
      required: true,
      placeholder: '{alert.severity}'
    },
    {
      key: 'cases',
      label: 'Case Values',
      type: 'switch-cases',  // Special editor
      required: true
    }
  ],
  exits: []  // Empty - dynamically generated
}
```

## 📋 Complete Node Examples

### Example 1: SMS Action Node

```typescript
{
  type: "action.sms",
  category: "action",
  label: "Send SMS",
  description: "Send SMS message to users or groups",
  icon: "sms",
  color: "bg-emerald-100 border-emerald-300 text-emerald-800",
  nodeColor: "bg-emerald-50 border-emerald-200",
  properties: [
    {
      key: 'to',
      label: 'Recipients',
      type: 'user-selector',
      required: true,
      icon: '👤',
      help: 'Select users to receive SMS'
    },
    {
      key: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      placeholder: 'Alert: {alert.type} at {alert.location}',
      icon: '💬',
      help: 'SMS message content. Use {variables} for dynamic content.'
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      required: false,
      icon: '⚡',
      options: {
        options: ['Low', 'Normal', 'High', 'Urgent'],
        showSearch: false
      } as DynamicSelectOptions,
      default: 'Normal'
    }
  ],
  exits: ["onSuccess", "onFailure"]
}
```

### Example 2: HTTP Request Node

```typescript
{
  type: "action.http",
  category: "action",
  label: "HTTP Request",
  description: "Make HTTP API request",
  icon: "public",
  color: "bg-indigo-100 border-indigo-300 text-indigo-800",
  nodeColor: "bg-indigo-50 border-indigo-200",
  properties: [
    {
      key: 'method',
      label: 'HTTP Method',
      type: 'select',
      required: true,
      icon: '🌐',
      options: {
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        showSearch: false
      } as DynamicSelectOptions,
      default: 'POST'
    },
    {
      key: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      placeholder: 'https://api.example.com/endpoint',
      icon: '🔗',
      help: 'Full URL including protocol'
    },
    {
      key: 'headers',
      label: 'Headers (JSON)',
      type: 'textarea',
      required: false,
      placeholder: '{"Content-Type": "application/json"}',
      icon: '📋',
      help: 'Optional HTTP headers as JSON object'
    },
    {
      key: 'body',
      label: 'Request Body',
      type: 'textarea',
      required: false,
      placeholder: '{"alert": "{alert.id}", "severity": "{alert.severity}"}',
      icon: '📦',
      help: 'Request body. Use {variables} for dynamic data.'
    },
    {
      key: 'timeout',
      label: 'Timeout (seconds)',
      type: 'number',
      required: false,
      default: 30,
      help: 'Request timeout'
    }
  ],
  exits: ["onSuccess", "onFailure"]
}
```

### Example 3: If/Else Control Node

```typescript
{
  type: "control.if",
  category: "control",
  label: "If / Else",
  description: "Conditional branching based on expression",
  icon: "call_split",
  color: "bg-sky-100 border-sky-300 text-sky-800",
  nodeColor: "bg-sky-50 border-sky-200",
  properties: [
    {
      key: 'condition',
      label: 'Condition',
      type: 'text',
      required: true,
      placeholder: '{alert.severity} == "CRITICAL"',
      icon: '🔍',
      help: 'JavaScript expression that evaluates to true/false'
    }
  ],
  exits: ["onTrue", "onFalse"]
}
```

### Example 4: Department Notification Node (Custom)

```typescript
{
  type: "action.notify_department",
  category: "action",
  label: "Notify Department",
  description: "Send notification to specific departments",
  icon: "business",
  color: "bg-purple-100 border-purple-300 text-purple-800",
  nodeColor: "bg-purple-50 border-purple-200",
  properties: [
    {
      key: 'departments',
      label: 'Select Departments',
      type: 'generic-selector',
      required: true,
      icon: '🏢',
      options: {
        endpoint: '/api/departments',
        valueField: 'departmentId',
        primaryDisplayField: 'name',
        secondaryDisplayField: 'location',
        searchLabel: 'Search Departments',
        selectedLabel: 'Selected Departments',
        responseDataPath: 'results'
      } as GenericSelectorOptions
    },
    {
      key: 'message',
      label: 'Notification Message',
      type: 'textarea',
      required: true,
      placeholder: 'Alert in {alert.location}: {alert.message}',
      icon: '📢',
      help: 'Message to send to department staff'
    },
    {
      key: 'includeManagers',
      label: 'Include Managers',
      type: 'select',
      required: false,
      icon: '👔',
      options: {
        options: ['Yes', 'No'],
        showSearch: false
      } as DynamicSelectOptions,
      default: 'Yes'
    }
  ],
  exits: ["onSuccess", "onFailure"]
}
```

## 🎯 Best Practices

### 1. Naming Conventions
```typescript
// ✅ Good: Descriptive, hierarchical
type: "action.sms"
type: "action.email"
type: "control.if"
type: "trigger.webhook"

// ❌ Bad: Generic, flat
type: "sms"
type: "email"
type: "if"
type: "webhook"
```

### 2. Exit Point Consistency
```typescript
// ✅ Good: Consistent naming
exits: ["onSuccess", "onFailure"]  // All actions
exits: ["onTrue", "onFalse"]       // All conditionals

// ❌ Bad: Inconsistent
exits: ["success", "error"]  // Different from other actions
exits: ["yes", "no"]         // Different from other conditionals
```

### 3. Field Defaults
```typescript
// ✅ Good: Provide sensible defaults
{
  key: 'timeout',
  type: 'number',
  default: 30
}

// ✅ Good: Require critical fields
{
  key: 'recipient',
  type: 'user-selector',
  required: true
}
```

### 4. Help Text
```typescript
// ✅ Good: Clear, with examples
help: 'JavaScript expression that evaluates to true/false. Example: {alert.severity} == "CRITICAL"'

// ❌ Bad: Too vague
help: 'Enter a condition'
```

## 🔍 Validation

Node field validation happens automatically:

```typescript
{
  required: true,  // Empty values not allowed
  type: 'number',  // Must be numeric
  type: 'select',  // Must match options
}
```

Custom validation can be added in service layer.

## 📚 Additional Resources

- [Generic Selector Component](../components/generic-selector.md)
- [Dynamic Select Component](../components/dynamic-select.md)
- [Template Input Component](../components/template-input.md)
- [Node Exit Points Technical Reference](../technical/node-exit-points.md)

---

**Next**: Learn about [Development Best Practices](./development.md)
