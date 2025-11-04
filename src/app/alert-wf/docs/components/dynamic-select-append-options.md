# Append Static Options to Dynamic Select

## Overview

The Dynamic Select component now supports **appending static options** (like "Other", "Custom", "Add New") to the end of options fetched from an API endpoint.

## Perfect For

- ✅ Adding "Custom Message" after template list
- ✅ Adding "Other" option for user input
- ✅ Adding "Add New Category" option
- ✅ Mixing predefined + custom options

## Visual Example

### What Users See

```
┌──────────────────────────────────────┐
│ SMS Template                  ▼      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Emergency Alert Template         │ │  ← From API
│ │ Code Blue Template               │ │  ← From API
│ │ Fire Alarm Template              │ │  ← From API
│ │ ──────────────────────────────── │ │  ← Separator
│ │ ✏️ Custom Message                │ │  ← Static option
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

When user selects "Custom Message":
```
┌──────────────────────────────────────┐
│ SMS Template                  ▼      │
│ ✏️ Custom Message                    │
│ Write your own SMS message           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Custom Message                       │
│ ┌──────────────────────────────────┐ │
│ │ Enter your custom SMS message... │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ SMS content (max 160 characters)     │
└──────────────────────────────────────┘
```

## Configuration

### Basic Example

```typescript
{
  key: "smsTemplateId",
  type: "select",
  options: {
    endpoint: "/api/AlertChannelTemplate/by-provider/1",
    valueField: "id",
    displayField: "templateName",
    
    // Add "Custom Message" at the end
    appendOptions: [
      {
        value: 0,                              // ID for custom message
        label: "Custom Message",               // What user sees
        secondaryLabel: "Write your own SMS",  // Subtitle
        separator: true                        // Show separator line
      }
    ]
  }
}
```

### With Conditional Custom Field

```typescript
{
  key: "smsTemplateId",
  type: "select",
  options: {
    endpoint: "/api/templates",
    
    // Add static option
    appendOptions: [
      {
        value: 0,
        label: "Custom Message",
        separator: true
      }
    ],
    
    // Show textarea when custom message selected
    appendCustomField: {
      triggerValue: 0,  // Matches the append option value
      fieldKey: "customMessage",
      fieldLabel: "Custom Message",
      fieldType: "textarea"
    }
  }
}
```

## appendOptions Configuration

Each option in `appendOptions` array:

```typescript
{
  value: string | number;      // Value to store (required)
  label: string;               // Display text (required)
  secondaryLabel?: string;     // Subtitle/description (optional)
  icon?: string;               // Icon emoji or HTML (optional)
  separator?: boolean;         // Show separator before (optional)
}
```

### Property Details

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `value` | `string\|number` | Value saved to node params | `0`, `"custom"`, `-1` |
| `label` | `string` | Main text shown in dropdown | `"Custom Message"` |
| `secondaryLabel` | `string?` | Subtitle below label | `"Write your own"` |
| `icon` | `string?` | Icon (emoji or HTML) | `"✏️"`, `"📝"` |
| `separator` | `boolean?` | Show divider line before | `true` |

## Real-World Examples

### 1. SMS Template with Custom Option

```typescript
{
  key: "smsTemplateId",
  label: "SMS Template",
  type: "select",
  options: {
    endpoint: "/api/AlertChannelTemplate/by-provider/1",
    valueField: "id",
    displayField: "templateName",
    secondaryDisplayField: "templateString",
    showSearch: true,
    responseDataPath: "results",
    
    appendOptions: [
      {
        value: 0,
        label: "Custom Message",
        secondaryLabel: "Write your own SMS message",
        icon: "✏️",
        separator: true
      }
    ],
    
    appendCustomField: {
      triggerValue: 0,
      fieldKey: "customMessage",
      fieldLabel: "Custom Message",
      fieldType: "textarea",
      fieldPlaceholder: "Enter your custom SMS message...",
      fieldHelpText: "SMS content (max 160 characters)"
    }
  }
}
```

**Result:**
- Lists all SMS templates from API
- Separator line
- "✏️ Custom Message" option at bottom
- When selected, shows textarea for custom input

### 2. Category Selection with "Add New"

```typescript
{
  key: "categoryId",
  label: "Category",
  type: "select",
  options: {
    endpoint: "/api/categories",
    valueField: "id",
    displayField: "name",
    showSearch: true,
    
    appendOptions: [
      {
        value: -1,
        label: "➕ Add New Category",
        separator: true
      }
    ],
    
    appendCustomField: {
      triggerValue: -1,
      fieldKey: "newCategoryName",
      fieldLabel: "New Category Name",
      fieldType: "text",
      fieldPlaceholder: "Enter category name"
    }
  }
}
```

### 3. Priority with "Other"

```typescript
{
  key: "priority",
  label: "Priority Level",
  type: "select",
  options: {
    endpoint: "/api/priorities",
    
    appendOptions: [
      {
        value: "other",
        label: "Other",
        secondaryLabel: "Specify custom priority"
      }
    ],
    
    appendCustomField: {
      triggerValue: "other",
      fieldKey: "customPriority",
      fieldLabel: "Custom Priority",
      fieldType: "text"
    }
  }
}
```

### 4. Multiple Static Options

```typescript
{
  key: "recipient",
  label: "Send To",
  type: "select",
  options: {
    endpoint: "/api/user-groups",
    
    appendOptions: [
      {
        value: "all",
        label: "All Users",
        separator: true
      },
      {
        value: "custom",
        label: "Custom List",
        icon: "📧"
      }
    ],
    
    appendCustomField: {
      triggerValue: "custom",
      fieldKey: "customRecipients",
      fieldLabel: "Email Addresses",
      fieldType: "textarea",
      fieldPlaceholder: "Enter emails (comma-separated)"
    }
  }
}
```

## How It Works

### 1. Component Loads

```typescript
// Fetch from API endpoint
GET /api/AlertChannelTemplate/by-provider/1

Response: {
  results: [
    { id: 1, templateName: "Emergency Alert", ... },
    { id: 2, templateName: "Code Blue", ... },
    { id: 3, templateName: "Fire Alarm", ... }
  ]
}
```

### 2. Append Static Options

```typescript
// Component automatically appends configured options
displayOptions = [
  ...apiResults,              // Options from API
  {
    id: 0,                    // Converted to match valueField
    templateName: "Custom Message",  // Converted to match displayField
    templateString: "Write your own SMS message",  // secondaryLabel
    _separator: true          // Internal marker
  }
]
```

### 3. User Selects

```typescript
// When user selects "Custom Message"
selectedValue = 0

// Component checks for custom field
if (selectedValue === appendCustomField.triggerValue) {
  // Show custom field
}
```

### 4. Values Saved

```typescript
node.params = {
  smsTemplateId: 0,                    // Selected option
  customMessage: "Hello from custom!"  // Custom field value
}
```

## Separator Feature

The `separator` property adds a visual divider before the option:

```typescript
appendOptions: [
  {
    value: 0,
    label: "Custom Message",
    separator: true  // ← Adds line before this option
  }
]
```

**Visual Result:**
```
┌────────────────────────┐
│ Template 1             │
│ Template 2             │
│ Template 3             │
│ ────────────────────── │  ← Separator line
│ Custom Message         │
└────────────────────────┘
```

## Integration with Custom Fields

Perfect combo: `appendOptions` + `appendCustomField`

```typescript
{
  options: {
    endpoint: "/api/items",
    
    // Step 1: Add option to list
    appendOptions: [{
      value: 0,
      label: "Custom"
    }],
    
    // Step 2: Show field when selected
    appendCustomField: {
      triggerValue: 0,  // ← Same as appendOptions value
      fieldKey: "customValue",
      fieldType: "text"
    }
  }
}
```

## Common Patterns

### Pattern 1: Custom Input Option
```typescript
appendOptions: [{ value: 0, label: "Custom", separator: true }]
appendCustomField: { triggerValue: 0, ... }
```

### Pattern 2: "Other" Option
```typescript
appendOptions: [{ value: "other", label: "Other" }]
appendCustomField: { triggerValue: "other", ... }
```

### Pattern 3: "Add New" Option
```typescript
appendOptions: [{ value: -1, label: "➕ Add New", separator: true }]
appendCustomField: { triggerValue: -1, ... }
```

### Pattern 4: Special Actions
```typescript
appendOptions: [
  { value: "all", label: "Select All", separator: true },
  { value: "none", label: "Clear Selection" }
]
```

## Best Practices

### ✅ DO

1. **Use separator for clarity**
   ```typescript
   separator: true  // Clearly separates static from dynamic options
   ```

2. **Use meaningful values**
   ```typescript
   value: 0          // For "Custom"
   value: -1         // For "Add New"
   value: "other"    // For "Other"
   ```

3. **Add icons for visual appeal**
   ```typescript
   icon: "✏️"   // Custom
   icon: "➕"   // Add
   icon: "📧"   // Email
   ```

4. **Provide descriptive secondary labels**
   ```typescript
   secondaryLabel: "Write your own message"
   ```

### ❌ DON'T

1. **Don't use conflicting values**
   ```typescript
   // ❌ BAD: Value 1 might exist in API results
   appendOptions: [{ value: 1, label: "Custom" }]
   
   // ✅ GOOD: Use 0, -1, or string that won't conflict
   appendOptions: [{ value: 0, label: "Custom" }]
   ```

2. **Don't add too many static options**
   ```typescript
   // ❌ BAD: Too cluttered
   appendOptions: [...10 different options]
   
   // ✅ GOOD: 1-3 key options
   appendOptions: [{ value: 0, label: "Custom" }]
   ```

## Troubleshooting

### Options Don't Appear

**Check:**
1. Is `appendOptions` array defined?
2. Does each option have `value` and `label`?
3. Check browser console for errors

**Debug:**
```typescript
console.log('Display options:', this.displayOptions);
console.log('Append options:', this.appendOptions);
```

### Separator Not Showing

Currently, the `_separator` property is added to the option object but requires PrimeNG template customization to display. This is a UI enhancement that can be added later.

### Values Conflict with API

**Solution:** Use values that won't exist in API:
- `0` - Usually safe (IDs start from 1)
- `-1` - Commonly used for "new/custom"
- `"custom"`, `"other"` - String values

## Summary

The `appendOptions` feature provides:

✅ **Flexibility** - Mix API data with static options
✅ **Clean UI** - Options appear seamlessly in dropdown
✅ **Easy Config** - Simple array of option objects
✅ **Type Safe** - Full TypeScript support
✅ **Extensible** - Works with all other features

Perfect for adding "Custom", "Other", or "Add New" options to any dynamic dropdown!
