# Generic Selector Component

A highly configurable, reusable selector component that can fetch data from any API endpoint and display it in a search-and-add pattern.

## Features

✅ **Configurable API Endpoint** - Point to any REST API  
✅ **Flexible Field Mapping** - Map any field as value, primary display, or secondary display  
✅ **Search & Filter** - Built-in PrimeNG select with search capability  
✅ **Auto-filtering** - Selected items automatically removed from dropdown  
✅ **Nested Data Support** - Access nested object properties (e.g., `user.profile.name`)  
✅ **Type Flexibility** - Supports both numeric and string IDs  
✅ **Icon Support** - Display custom icons (emoji or HTML)  
✅ **Customizable UI** - Configure labels, placeholders, and messages

## Basic Usage

### Step 1: Define Field Configuration

```typescript
// In workflow-nodes-config.data.ts or similar
{
  key: 'departments',
  label: 'Select Departments',
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

### Step 2: Component Renders Automatically

The `NodeFieldsEditorComponent` automatically renders the generic selector based on configuration.

## Configuration Interface

```typescript
export interface GenericSelectorOptions {
  // Required
  endpoint: string;                 // API endpoint URL
  
  // Field Mapping (optional, defaults shown)
  valueField?: string;              // Default: 'id'
  primaryDisplayField?: string;     // Default: 'name'
  secondaryDisplayField?: string;   // Optional secondary text
  searchFields?: string[];          // Fields to search on
  
  // UI Customization (optional)
  searchLabel?: string;             // Label for search field
  searchPlaceholder?: string;       // Placeholder for search
  selectedLabel?: string;           // Label for selected items list
  emptyStateMessage?: string;       // Empty state message
  
  // Response Parsing (optional)
  responseDataPath?: string;        // Path to data array in response
}
```

## Real-World Examples

### Example 1: Department Selector

```typescript
{
  key: 'selectedDepartments',
  label: 'Departments',
  type: 'generic-selector',
  icon: '🏢',
  options: {
    endpoint: '/api/departments',
    valueField: 'departmentId',
    primaryDisplayField: 'departmentName',
    secondaryDisplayField: 'location',
    searchLabel: 'Search Departments',
    selectedLabel: 'Selected Departments',
    emptyStateMessage: 'No departments selected',
    responseDataPath: 'results'
  } as GenericSelectorOptions
}
```

**Expected API Response**:
```json
{
  "results": [
    {
      "departmentId": 1,
      "departmentName": "Emergency",
      "location": "Building A, Floor 1"
    },
    {
      "departmentId": 2,
      "departmentName": "ICU",
      "location": "Building B, Floor 3"
    }
  ]
}
```

**Stored Value**: `[1, 2]` (array of departmentId values)

### Example 2: Equipment Selector

```typescript
{
  key: 'equipment',
  label: 'Select Equipment',
  type: 'generic-selector',
  icon: '🔧',
  options: {
    endpoint: 'https://api.hospital.com/equipment',
    valueField: 'equipmentCode',        // String IDs supported
    primaryDisplayField: 'name',
    secondaryDisplayField: 'status',
    searchLabel: 'Search Equipment',
    responseDataPath: 'data.equipment'  // Nested response path
  } as GenericSelectorOptions
}
```

**Expected API Response**:
```json
{
  "data": {
    "equipment": [
      {
        "equipmentCode": "MRI-001",
        "name": "MRI Scanner A",
        "status": "Available"
      },
      {
        "equipmentCode": "XRAY-045",
        "name": "X-Ray Machine 45",
        "status": "In Use"
      }
    ]
  }
}
```

**Stored Value**: `["MRI-001", "XRAY-045"]`

### Example 3: User Selector (Simple)

```typescript
{
  key: 'assignedUsers',
  label: 'Assign To',
  type: 'generic-selector',
  icon: '👤',
  options: {
    endpoint: '/api/users',
    valueField: 'userId',
    primaryDisplayField: 'fullName',
    secondaryDisplayField: 'email',
    searchLabel: 'Search Users'
  } as GenericSelectorOptions
}
```

**API Response** (direct array):
```json
[
  {
    "userId": 123,
    "fullName": "John Doe",
    "email": "john.doe@hospital.com"
  },
  {
    "userId": 456,
    "fullName": "Jane Smith",
    "email": "jane.smith@hospital.com"
  }
]
```

## Advanced Features

### Nested Property Access

The component supports dot notation for nested properties:

```typescript
{
  endpoint: '/api/staff',
  valueField: 'id',
  primaryDisplayField: 'profile.fullName',      // Nested!
  secondaryDisplayField: 'department.name'      // Nested!
}
```

**API Response**:
```json
[
  {
    "id": 1,
    "profile": {
      "fullName": "Dr. Sarah Johnson"
    },
    "department": {
      "name": "Cardiology"
    }
  }
]
```

### Response Data Path Auto-Detection

If `responseDataPath` is not specified, the component tries:
1. `response.results`
2. `response.data`
3. `response` (direct array)

### Custom Icons

Icons can be emoji or HTML:

```typescript
// Emoji icon
icon: '🏥'

// HTML icon (will be rendered as SafeHtml)
icon: '<i class="fa fa-hospital"></i>'

// SVG icon
icon: '<svg>...</svg>'
```

## Component Template

```html
<app-generic-selector
  [nodeId]="node.id"
  [title]="field.label"
  [endpoint]="getGenericOptions(field).endpoint || ''"
  [valueField]="getGenericOptions(field).valueField || 'id'"
  [primaryDisplayField]="getGenericOptions(field).primaryDisplayField || 'name'"
  [secondaryDisplayField]="getGenericOptions(field).secondaryDisplayField"
  [searchFields]="getGenericOptions(field).searchFields"
  [icon]="field.icon"
  [searchLabel]="getGenericOptions(field).searchLabel"
  [searchPlaceholder]="getGenericOptions(field).searchPlaceholder || field.placeholder"
  [selectedLabel]="getGenericOptions(field).selectedLabel"
  [emptyStateMessage]="getGenericOptions(field).emptyStateMessage"
  [responseDataPath]="getGenericOptions(field).responseDataPath"
  [currentValue]="getFieldValue(field.key)"
  (selectionChange)="handleGenericSelectorChange($event, field)">
</app-generic-selector>
```

## Data Storage Format

Selected values are stored as JSON array:

```json
{
  "nodeId": "node_abc123",
  "params": {
    "departments": "[1, 2, 5]",           // Numeric IDs
    "equipment": "[\"MRI-001\",\"XRAY-045\"]"  // String IDs
  }
}
```

## Comparison with Specialized Selectors

| Feature | GenericSelector | UserSelector | UserGroupSelector |
|---------|----------------|--------------|-------------------|
| **Endpoint** | Configurable | Fixed | Fixed |
| **Fields** | Configurable | Fixed | Fixed |
| **Icons** | Configurable | Fixed (👤) | Fixed (👥) |
| **Use Case** | Any API | Users only | Groups only |
| **Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

**When to use GenericSelector**:
- Working with custom endpoints
- Need flexible field mapping
- Building reusable node types
- Prototyping new features

**When to use specialized selectors**:
- Specific, known use cases (users, groups)
- Simpler configuration needed
- Domain-specific UI requirements

## Integration in Node Configuration

### TypeScript Configuration

```typescript
// In workflow-nodes-config.data.ts
{
  type: "action.notify_department",
  category: "action",
  label: "Notify Department",
  properties: [
    {
      key: 'departments',
      label: 'Select Departments',
      type: 'generic-selector',
      icon: '🏢',
      required: true,
      options: {
        endpoint: '/api/departments',
        valueField: 'id',
        primaryDisplayField: 'name',
        secondaryDisplayField: 'description'
      } as GenericSelectorOptions
    }
  ]
}
```

### JSON Configuration

```json
{
  "type": "action.notify_department",
  "category": "action",
  "label": "Notify Department",
  "properties": [
    {
      "key": "departments",
      "label": "Select Departments",
      "type": "generic-selector",
      "icon": "🏢",
      "required": true,
      "endpoint": "/api/departments",
      "valueField": "id",
      "primaryDisplayField": "name",
      "secondaryDisplayField": "description"
    }
  ]
}
```

## Best Practices

### 1. Always Specify Endpoint
```typescript
// ✅ Good
endpoint: '/api/departments'

// ❌ Bad
endpoint: ''  // Will fail
```

### 2. Use Descriptive Labels
```typescript
// ✅ Good
searchLabel: 'Search Departments'
selectedLabel: 'Selected Departments'
emptyStateMessage: 'No departments selected yet'

// ❌ Bad
searchLabel: 'Search'  // Too generic
```

### 3. Match Field Types
```typescript
// If API returns numeric IDs
valueField: 'id'  // ✅ Correct

// If API returns string codes
valueField: 'equipmentCode'  // ✅ Correct
```

### 4. Specify Response Path for Nested Data
```typescript
// API: { data: { items: [...] } }
responseDataPath: 'data.items'  // ✅ Correct
```

## Troubleshooting

### Issue: No data showing
- **Check**: API endpoint is correct and accessible
- **Check**: `responseDataPath` matches actual response structure
- **Check**: Browser console for HTTP errors

### Issue: Wrong values stored
- **Check**: `valueField` matches the ID field in API response
- **Check**: Field exists in all returned items

### Issue: Display looks wrong
- **Check**: `primaryDisplayField` and `secondaryDisplayField` match API fields
- **Check**: Fields contain the expected data type (string, not object)

### Issue: Search not working
- **Check**: PrimeNG select's built-in filter is enabled (it is by default)
- **Check**: `primaryDisplayField` contains searchable text

---

**Related Docs**:
- [Inspector Components](./inspector.md)
- [Dynamic Select](./dynamic-select.md)
- [Node Configuration Guide](../guides/node-configuration.md)
