# Dynamic Select with Conditional Custom Fields

## Overview

The Dynamic Select component now supports **conditional custom fields** - additional input fields that appear based on the selected dropdown value. This is perfect for scenarios like:

- "Custom Message" when user selects a custom template
- "Other" option that shows a text input
- Any scenario where a specific dropdown option requires additional user input

## Feature Details

### When to Use

Use conditional custom fields when:
- ✅ A specific dropdown option requires additional details
- ✅ You want to provide a "Custom" or "Other" option
- ✅ The additional field should only appear conditionally
- ✅ You want to keep the UI clean (hide fields until needed)

### Configuration

The `appendCustomField` option is added to `DynamicSelectOptions`:

```typescript
export interface DynamicSelectOptions {
  // ... existing options ...
  
  appendCustomField?: {
    triggerValue?: string | number | null;  // Value that shows the custom field
    fieldKey: string;                        // Key to store custom field value
    fieldLabel: string;                      // Label for custom field
    fieldType: 'text' | 'textarea';         // Type of custom field
    fieldPlaceholder?: string;              // Placeholder text
    fieldHelpText?: string;                 // Help text below field
  };
}
```

## Example Usage

### SMS Template with Custom Message

```typescript
{
  key: "smsTemplateId",
  label: "SMS Template",
  type: "select",
  required: true,
  placeholder: "Select SMS template",
  icon: "📱",
  options: {
    endpoint: "http://api.example.com/api/templates",
    valueField: "id",
    displayField: "templateName",
    secondaryDisplayField: "templateString",
    showSearch: true,
    responseDataPath: "results",
    appendCustomField: {
      triggerValue: 0,                    // Show when templateId = 0 (Custom)
      fieldKey: "customMessage",          // Stores in node.params.customMessage
      fieldLabel: "Custom Message",
      fieldType: "textarea",
      fieldPlaceholder: "Enter your custom SMS message...",
      fieldHelpText: "SMS content (max 160 characters recommended)"
    }
  } as DynamicSelectOptions
}
```

### Priority with "Other" Option

```typescript
{
  key: "priority",
  label: "Priority Level",
  type: "select",
  required: true,
  options: {
    options: ["Low", "Medium", "High", "Critical", "Other"],
    appendCustomField: {
      triggerValue: "Other",              // Show when "Other" is selected
      fieldKey: "customPriority",
      fieldLabel: "Specify Priority",
      fieldType: "text",
      fieldPlaceholder: "Enter custom priority level"
    }
  } as DynamicSelectOptions
}
```

### Category Selection

```typescript
{
  key: "category",
  label: "Category",
  type: "select",
  options: {
    endpoint: "http://api.example.com/api/categories",
    valueField: "id",
    displayField: "name",
    showSearch: true,
    responseDataPath: "data",
    appendCustomField: {
      triggerValue: -1,                   // Special ID for "Add New Category"
      fieldKey: "newCategoryName",
      fieldLabel: "New Category Name",
      fieldType: "text",
      fieldPlaceholder: "Enter category name",
      fieldHelpText: "This will create a new category"
    }
  } as DynamicSelectOptions
}
```

## Trigger Value Behavior

The `triggerValue` determines when the custom field appears:

| Trigger Value | Behavior |
|---------------|----------|
| `0` | Shows field when dropdown value = 0 |
| `"Other"` | Shows field when dropdown value = "Other" |
| `null` | Shows field when dropdown value = null |
| `undefined` | Shows field whenever ANY value is selected |

### Example: Always Show Custom Field

```typescript
appendCustomField: {
  triggerValue: undefined,  // Always show when something is selected
  fieldKey: "notes",
  fieldLabel: "Additional Notes",
  fieldType: "textarea"
}
```

## How It Works

### 1. User Selects Value

User selects a value from the dropdown (e.g., Template ID = 0 for "Custom Message")

### 2. Custom Field Appears

The component checks if `selectedValue === triggerValue`. If true, the custom field is rendered below the dropdown.

### 3. User Fills Custom Field

User types into the custom field (text input or textarea)

### 4. Values Are Saved

Both values are saved to `node.params`:
- `node.params.smsTemplateId = 0` (the dropdown value)
- `node.params.customMessage = "Hello World"` (the custom field value)

### 5. Workflow Execution

When the workflow executes, both values are available:
```typescript
if (node.params.smsTemplateId === 0) {
  // Use custom message
  sendSMS(node.params.customMessage);
} else {
  // Use template
  const template = getTemplate(node.params.smsTemplateId);
  sendSMS(template.content);
}
```

## UI Behavior

### Before Selection
```
┌─────────────────────────────────────┐
│ SMS Template                ▼       │
│ Select SMS template                 │
└─────────────────────────────────────┘
```

### After Selecting Custom (ID = 0)
```
┌─────────────────────────────────────┐
│ SMS Template                ▼       │
│ Custom Message                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Custom Message                      │
│ ┌─────────────────────────────────┐ │
│ │ Enter your custom SMS message...│ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ SMS content (max 160 characters)    │
└─────────────────────────────────────┘
```

### After Selecting Template
```
┌─────────────────────────────────────┐
│ SMS Template                ▼       │
│ Emergency Alert Template            │
│ "Code {code} at {location}"         │
└─────────────────────────────────────┘

(Custom field is hidden)
```

## Field Types

### Text Input
```typescript
fieldType: 'text'
```
- Single-line text input
- Good for: names, short values, IDs
- Example: custom priority level, category name

### Textarea
```typescript
fieldType: 'textarea'
```
- Multi-line text input (3 rows default)
- Good for: messages, descriptions, long text
- Example: custom SMS message, alert description

## Real-World Examples

### 1. SMS with Template or Custom Message

**Backend Setup:**
- Add a "Custom Message" template with `id = 0` to your templates table
- Or filter it on frontend to show as first option

**Configuration:**
```typescript
{
  key: "smsTemplateId",
  type: "select",
  options: {
    endpoint: "/api/AlertChannelTemplate/by-provider/1",
    appendCustomField: {
      triggerValue: 0,
      fieldKey: "customMessage",
      fieldLabel: "Custom Message",
      fieldType: "textarea"
    }
  }
}
```

**Usage:**
- User selects template → Uses template content
- User selects "Custom Message" → Shows textarea, uses custom content

### 2. Email Template with Override

```typescript
{
  key: "emailTemplateId",
  type: "select",
  options: {
    endpoint: "/api/EmailTemplates/all",
    appendCustomField: {
      triggerValue: -1,
      fieldKey: "customEmailBody",
      fieldLabel: "Custom Email Body",
      fieldType: "textarea",
      fieldPlaceholder: "Enter email content...",
      fieldHelpText: "Supports HTML and variables like {{user.name}}"
    }
  }
}
```

### 3. Notification Recipient

```typescript
{
  key: "recipientType",
  type: "select",
  options: {
    options: ["All Staff", "Department", "User Group", "Custom List"],
    appendCustomField: {
      triggerValue: "Custom List",
      fieldKey: "customRecipients",
      fieldLabel: "Email Addresses",
      fieldType: "textarea",
      fieldPlaceholder: "Enter email addresses (comma-separated)",
      fieldHelpText: "e.g., john@example.com, jane@example.com"
    }
  }
}
```

## Implementation Details

### Component Files Modified

1. **`workflow-designer.interfaces.ts`**
   - Added `appendCustomField` to `DynamicSelectOptions`

2. **`dynamic-select.component.ts`**
   - Added `appendCustomField`, `customFieldValue` inputs
   - Added `customFieldChange` output
   - Added `shouldShowCustomField()` method
   - Added conditional custom field to template

3. **`node-fields-editor.component.ts`**
   - Added `customFieldValue` binding
   - Added `customFieldChange` handler
   - Added `getCustomFieldValue()` method
   - Added `handleCustomFieldChange()` method

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. User selects dropdown value                      │
│    dynamic-select.component emits valueChange       │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 2. node-fields-editor receives valueChange          │
│    Saves to node.params[field.key]                  │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 3. IF selectedValue === triggerValue:               │
│    Custom field appears                             │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 4. User types in custom field                       │
│    dynamic-select.component emits customFieldChange │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 5. node-fields-editor receives customFieldChange    │
│    Saves to node.params[appendCustomField.fieldKey] │
└─────────────────────────────────────────────────────┘
```

## Best Practices

### 1. Use Meaningful Trigger Values

✅ **Good:**
```typescript
triggerValue: 0           // Special ID for custom
triggerValue: "Other"     // Explicit option name
triggerValue: -1          // Reserved ID for new items
```

❌ **Bad:**
```typescript
triggerValue: 999         // Arbitrary number
triggerValue: "xyz"       // Non-descriptive
```

### 2. Provide Clear Labels and Help Text

✅ **Good:**
```typescript
fieldLabel: "Custom Message"
fieldHelpText: "SMS content (max 160 characters recommended)"
```

❌ **Bad:**
```typescript
fieldLabel: "Message"     // Too generic
fieldHelpText: ""         // Missing guidance
```

### 3. Choose Appropriate Field Type

- **Text**: Short values (< 50 chars)
- **Textarea**: Long values, messages, descriptions

### 4. Keep It Simple

- One custom field per dropdown
- Clear trigger conditions
- Consistent behavior across nodes

## Troubleshooting

### Custom Field Not Appearing

**Check:**
1. Is `triggerValue` set correctly?
2. Does the selected value match `triggerValue`?
3. Is `appendCustomField` defined in options?

**Debug:**
```typescript
console.log('Selected:', this.selectedValue);
console.log('Trigger:', this.appendCustomField?.triggerValue);
console.log('Should show:', this.shouldShowCustomField());
```

### Value Not Saving

**Check:**
1. Is `fieldKey` unique and descriptive?
2. Is `handleCustomFieldChange()` being called?
3. Check browser console for errors

### Field Appears at Wrong Time

**Check:**
1. Verify `triggerValue` matches expected dropdown value
2. Check if `triggerValue: undefined` (shows for any selection)

## Future Enhancements

Potential improvements:
- Support multiple custom fields per dropdown
- Conditional logic (AND/OR conditions)
- Field validation (min/max length, regex)
- Dynamic field types based on selection
- Nested custom fields

## Summary

The conditional custom field feature provides:
- ✅ Clean, conditional UI
- ✅ Flexible configuration
- ✅ Easy integration
- ✅ Type-safe implementation
- ✅ Consistent with existing patterns

Perfect for scenarios requiring additional user input based on dropdown selection!
