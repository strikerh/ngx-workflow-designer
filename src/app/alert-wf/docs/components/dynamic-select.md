# Dynamic Select Component

A flexible single-select dropdown component that supports both static arrays and dynamic API endpoints with optional search functionality.

## Features

✅ **Dual Mode** - Works with static arrays OR dynamic API endpoints  
✅ **Single Selection** - One value at a time (not multi-select)  
✅ **Optional Search** - Enable/disable search functionality  
✅ **Flexible Display** - Configure value and display fields  
✅ **Type Safe** - Full TypeScript support with typed options  
✅ **PrimeNG Integration** - Uses p-select component  
✅ **Nested Properties** - Supports dot notation for deep object access  
✅ **Auto-Search** - Automatically enables search for lists > 5 items

## Configuration Interface

```typescript
export interface DynamicSelectOptions {
  // Mode 1: Static array
  options?: string[] | any[];
  
  // Mode 2: Dynamic endpoint
  endpoint?: string;
  valueField?: string;              // Default: 'id'
  displayField?: string;            // Default: 'name'
  secondaryDisplayField?: string;   // Optional secondary text
  responseDataPath?: string;        // Path to data in response
  
  // Common options
  showSearch?: boolean;             // Enable search (default: auto)
}
```

## Usage Examples

### Example 1: Static String Array

Perfect for predefined options like HTTP methods, status types, or priority levels.

```typescript
{
  key: 'method',
  label: 'HTTP Method',
  type: 'select',
  placeholder: 'Select HTTP method',
  icon: '🌐',
  options: {
    options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    showSearch: false  // Disabled for short list
  } as DynamicSelectOptions
}
```

**Result**: Simple dropdown with 5 static options, no search bar.

### Example 2: Static Array with Search

For longer static lists where search is helpful.

```typescript
{
  key: 'priority',
  label: 'Priority Level',
  type: 'select',
  placeholder: 'Select priority',
  icon: '⚡',
  options: {
    options: [
      'Low',
      'Medium',
      'High',
      'Urgent',
      'Critical',
      'Emergency'
    ],
    showSearch: true  // Enabled for easier selection
  } as DynamicSelectOptions
}
```

**Result**: Dropdown with search enabled for 6 items.

### Example 3: Dynamic Endpoint (Simple)

Load options from an API endpoint.

```typescript
{
  key: 'userId',
  label: 'Select User',
  type: 'select',
  placeholder: 'Search for a user',
  icon: '👤',
  options: {
    endpoint: '/api/users',
    valueField: 'id',
    displayField: 'fullName',
    showSearch: true
  } as DynamicSelectOptions
}
```

**Expected API Response**:
```json
[
  { "id": 1, "fullName": "John Doe" },
  { "id": 2, "fullName": "Jane Smith" },
  { "id": 3, "fullName": "Bob Johnson" }
]
```

**Stored Value**: `1` (single ID)  
**Displayed**: "John Doe"

### Example 4: Dynamic Endpoint with Secondary Display

Show additional information for each option.

```typescript
{
  key: 'targetUser',
  label: 'Target User',
  type: 'select',
  placeholder: 'Search for a user',
  icon: '👤',
  options: {
    endpoint: '/api/notification-users',
    valueField: 'notificationID',
    displayField: 'name',
    secondaryDisplayField: 'description',
    responseDataPath: 'results',
    showSearch: true
  } as DynamicSelectOptions
}
```

**Expected API Response**:
```json
{
  "results": [
    {
      "notificationID": 123,
      "name": "John Doe",
      "description": "Emergency Contact"
    },
    {
      "notificationID": 456,
      "name": "Jane Smith",
      "description": "On-Call Nurse"
    }
  ]
}
```

**Result**: Each option shows:
- **Primary**: "John Doe" (bold)
- **Secondary**: "Emergency Contact" (gray, smaller)

### Example 5: Nested Response Data

Handle API responses with nested data structures.

```typescript
{
  key: 'department',
  label: 'Department',
  type: 'select',
  icon: '🏢',
  options: {
    endpoint: '/api/departments',
    valueField: 'id',
    displayField: 'name',
    responseDataPath: 'data.departments',  // Nested path
    showSearch: true
  } as DynamicSelectOptions
}
```

**API Response**:
```json
{
  "success": true,
  "data": {
    "departments": [
      { "id": 1, "name": "Emergency" },
      { "id": 2, "name": "ICU" }
    ]
  }
}
```

### Example 6: Object Array (Static)

Use objects with custom value/display fields.

```typescript
{
  key: 'status',
  label: 'Status',
  type: 'select',
  icon: '📊',
  options: {
    options: [
      { id: 'active', label: 'Active' },
      { id: 'paused', label: 'Paused' },
      { id: 'stopped', label: 'Stopped' }
    ],
    valueField: 'id',
    displayField: 'label',
    showSearch: false
  } as DynamicSelectOptions
}
```

**Stored Value**: `'active'`  
**Displayed**: "Active"

## Auto-Search Feature

The component automatically enables search for lists with more than 5 items:

```typescript
// Auto-enabled search
showSearch: (options?.length || 0) > 5

// You can override this
showSearch: true   // Always show
showSearch: false  // Always hide
```

## Component Template Usage

```html
<app-dynamic-select
  [label]="field.label"
  [placeholder]="field.placeholder || 'Select...'"
  [showSearch]="getDynamicSelectOptions(field).showSearch !== undefined 
    ? getDynamicSelectOptions(field).showSearch! 
    : (getDynamicSelectOptions(field).options?.length || 0) > 5"
  [icon]="field.icon"
  [options]="getDynamicSelectOptions(field).options"
  [endpoint]="getDynamicSelectOptions(field).endpoint"
  [valueField]="getDynamicSelectOptions(field).valueField || 'id'"
  [displayField]="getDynamicSelectOptions(field).displayField || 'name'"
  [secondaryDisplayField]="getDynamicSelectOptions(field).secondaryDisplayField"
  [responseDataPath]="getDynamicSelectOptions(field).responseDataPath"
  [currentValue]="getFieldValue(field.key)"
  (valueChange)="handleDynamicSelectChange($event, field)">
</app-dynamic-select>
```

## Data Storage Format

Selected value is stored directly (not as array):

```json
{
  "nodeId": "node_abc123",
  "params": {
    "method": "POST",              // String value
    "userId": 123,                 // Numeric value
    "status": "active"             // String value
  }
}
```

## Comparison: Dynamic Select vs Generic Selector

| Feature | DynamicSelect | GenericSelector |
|---------|---------------|-----------------|
| **Selection** | Single | Multiple |
| **Data Type** | String or number | Array |
| **Use Case** | Choose one option | Select many items |
| **UI Pattern** | Dropdown | Search & add list |
| **Storage** | `"value"` | `"[1,2,3]"` |

**Use DynamicSelect for**:
- Priority levels
- Status selections
- HTTP methods
- Single user/department selection
- Enum-like choices

**Use GenericSelector for**:
- Multiple users/departments
- Tags/categories
- Recipients lists
- Multi-item selections

## Integration in Node Configuration

### TypeScript Configuration

```typescript
// In workflow-nodes-config.data.ts
{
  type: "action.http_request",
  category: "action",
  label: "HTTP Request",
  properties: [
    {
      key: 'method',
      label: 'HTTP Method',
      type: 'select',
      icon: '🌐',
      required: true,
      placeholder: 'Select method',
      options: {
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        showSearch: false
      } as DynamicSelectOptions
    },
    {
      key: 'targetUser',
      label: 'Target User',
      type: 'select',
      icon: '👤',
      required: true,
      placeholder: 'Search for a user',
      options: {
        endpoint: '/api/users',
        valueField: 'id',
        displayField: 'fullName',
        secondaryDisplayField: 'email',
        showSearch: true
      } as DynamicSelectOptions
    }
  ]
}
```

### JSON Configuration

```json
{
  "type": "action.http_request",
  "properties": [
    {
      "key": "method",
      "label": "HTTP Method",
      "type": "select",
      "icon": "🌐",
      "options": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "key": "targetUser",
      "label": "Target User",
      "type": "select",
      "icon": "👤",
      "endpoint": "/api/users",
      "valueField": "id",
      "displayField": "fullName",
      "secondaryDisplayField": "email"
    }
  ]
}
```

## Best Practices

### 1. Choose the Right Mode

```typescript
// ✅ Good: Static list for known options
options: ['Low', 'Medium', 'High']

// ✅ Good: Dynamic for user data
endpoint: '/api/users'

// ❌ Bad: Hardcoding user data
options: [{ id: 1, name: 'John' }]  // Use endpoint instead
```

### 2. Enable Search for Long Lists

```typescript
// ✅ Good: Auto or explicit for 6+ items
showSearch: true

// ✅ Good: Disable for short lists
showSearch: false  // For 3-4 items

// ⚠️ OK: Let auto-detect
// Omit showSearch for lists > 5
```

### 3. Provide Clear Labels

```typescript
// ✅ Good
label: 'HTTP Method'
placeholder: 'Select method'

// ❌ Bad
label: 'Method'  // Too vague
placeholder: 'Select'  // Not descriptive
```

### 4. Use Icons for Visual Clarity

```typescript
// ✅ Good
icon: '🌐'  // HTTP methods
icon: '👤'  // Users
icon: '⚡'  // Priority

// ⚠️ OK: No icon (acceptable but less visual)
```

## Troubleshooting

### Issue: Dropdown shows [object Object]
**Solution**: Specify `displayField` when using object arrays.

```typescript
// ❌ Missing displayField
options: [{ id: 1, name: 'Item' }]

// ✅ Fixed
options: [{ id: 1, name: 'Item' }],
displayField: 'name'
```

### Issue: Selected value not persisting
**Solution**: Check that `valueField` matches the property you want to store.

```typescript
// API: { userId: 123, name: "John" }
valueField: 'userId'  // ✅ Correct
// NOT 'id'
```

### Issue: No data loading from endpoint
**Solution**: 
1. Check endpoint URL is correct
2. Verify `responseDataPath` matches API structure
3. Check browser console for HTTP errors

### Issue: Search not working
**Solution**: Ensure `showSearch` is true or omitted for auto-detection.

---

**Related Docs**:
- [Generic Selector](./generic-selector.md) - For multi-select
- [Inspector Components](./inspector.md)
- [Node Configuration Guide](../guides/node-configuration.md)
