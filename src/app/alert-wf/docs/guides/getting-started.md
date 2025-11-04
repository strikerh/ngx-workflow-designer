# Getting Started with Alert Workflow Module

Welcome to the Alert Workflow Module! This guide will help you get up and running quickly.

## 📋 Prerequisites

- Angular 17+ knowledge
- TypeScript familiarity
- Basic understanding of reactive programming (RxJS, Signals)
- PrimeNG library (included in project)

## 🚀 Quick Start

### 1. Access the Workflow Module

Navigate to the workflow management interface:

```
/admin/alert-wf/workflow-list
```

### 2. Create Your First Workflow

1. Click "**New Workflow**" button
2. Enter workflow name and description
3. Click "**Create**" to open the designer

### 3. Add Nodes to Canvas

**From Palette** (left panel):
1. Find the node type you want
2. Click on it
3. Node appears on canvas

**Node Categories**:
- **Triggers** - Start points (Manual, Webhook, Schedule)
- **Control Flow** - Logic (If/Else, Switch, Loop)
- **Actions** - Operations (SMS, Email, HTTP, Database)
- **Terminals** - End points (End, Error)

### 4. Configure Nodes

**Select a node** → Right panel (Inspector) shows:
- **Label** - Node display name
- **Type** - Node type (readonly)
- **Fields** - Configuration specific to node type

**Example: SMS Node**
- To: Recipients (user selector)
- Message: SMS text (supports {variables})

### 5. Connect Nodes

**Create Connection**:
1. Click on **output point** (colored circle on right side of node)
2. Click on **input point** (circle on left side of target node)
3. Connection line appears

**Connection Types**:
- **Blue** (next) - Continue to next node
- **Green** (onTrue) - If condition is true
- **Red** (onFalse) - If condition is false
- **Purple** (cases) - Switch case branches

### 6. Add Workflow Variables

**When no node selected**, click "**Variables**" tab:
1. Click "**Add Variable**"
2. Enter key (e.g., `severity`)
3. Enter value (e.g., `CRITICAL`)
4. Click outside to save

**Use in templates**:
```
Message: Alert severity is {severity}
```

### 7. Save Workflow

1. Click "**Save**" in header
2. Confirm workflow name
3. Workflow is saved and can be executed

## 🎨 Canvas Controls

| Action | Method |
|--------|--------|
| **Pan** | Click and drag on empty space |
| **Zoom In/Out** | Mouse wheel |
| **Select Node** | Click on node |
| **Move Node** | Drag node |
| **Delete Node** | Select node → Press `Delete` key |
| **Delete Edge** | Select edge → Press `Delete` key |

## 📝 Example: Simple Alert Workflow

Let's create a workflow that sends SMS for critical alerts:

### Step 1: Add Trigger
1. Click "**Manual Trigger**" from palette
2. Label it "**Alert Received**"

### Step 2: Add Condition
1. Click "**If / Else**" from palette
2. Set Condition: `{alert.severity} == 'CRITICAL'`
3. Connect **Trigger** → **If/Else** (from "next" point)

### Step 3: Add SMS Action
1. Click "**SMS**" from palette
2. Set To: Select on-call users
3. Set Message: `CRITICAL ALERT: {alert.type} at {alert.location}`
4. Connect **If/Else** "onTrue" → **SMS**

### Step 4: Add End Node
1. Click "**End**" from palette twice (for true and false paths)
2. Connect **SMS** → **End**
3. Connect **If/Else** "onFalse" → **End**

### Step 5: Save
1. Click "**Save**"
2. Name: "Critical Alert Notification"
3. Description: "Sends SMS for critical alerts"

Your first workflow is ready! 🎉

## 🔧 Common Tasks

### Editing Workflow Properties
1. Deselect all nodes (click empty canvas)
2. Inspector shows workflow properties
3. Edit name, description, metadata
4. Changes auto-save on blur

### Copying Workflows
1. Open workflow
2. Click "**Save As**" in header
3. Enter new name
4. New copy created

### Using Templates
1. Create a workflow with common pattern
2. Save it
3. Use "**Template**" dropdown to load it
4. Modify for specific use case

### Undo/Redo
- **Undo**: Ctrl+Z (or icon in header)
- **Redo**: Ctrl+Y (or icon in header)

## 📚 Next Steps

### Learn More About:
- [Node Configuration](./node-configuration.md) - Configure node types
- [Inspector Components](../components/inspector.md) - Understand the UI
- [Development Guide](./development.md) - Best practices

### Explore Components:
- [Generic Selector](../components/generic-selector.md) - Multi-select from APIs
- [Dynamic Select](../components/dynamic-select.md) - Single-select dropdowns
- [Template Input](../components/template-input.md) - Variable-aware inputs

### Technical Details:
- [Architecture](../technical/architecture.md) - System design
- [Node Exit Points](../technical/node-exit-points.md) - Connection system
- [API Integration](../technical/api-integration.md) - Backend communication

## 💡 Tips & Tricks

### Tip 1: Use Descriptive Labels
```
✅ Good: "Check Alert Severity"
❌ Bad: "If Node 1"
```

### Tip 2: Group Related Nodes
Arrange nodes visually by function:
- Top → Triggers
- Middle → Logic and Actions
- Bottom → End states

### Tip 3: Use Variables for Reusability
Instead of hardcoding values, use workflow variables:
```
✅ Good: {hospitalName}, {emergencyContact}
❌ Bad: "General Hospital", "+1-555-0100"
```

### Tip 4: Test Incrementally
- Build workflow in stages
- Test after adding each section
- Use workflow logs to debug

### Tip 5: Keyboard Shortcuts
- `Delete` - Remove selected node/edge
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- Mouse wheel - Zoom

## ❓ FAQ

**Q: Can I have multiple start nodes?**  
A: Yes, but only one will be active based on trigger conditions.

**Q: How do I see workflow execution logs?**  
A: Click "Logs" panel at bottom of designer.

**Q: Can I import/export workflows?**  
A: Yes, use Save/Load functionality (JSON format).

**Q: Are there workflow templates?**  
A: Yes, use the Template dropdown in header.

**Q: Can I test workflows without saving?**  
A: Yes, use "Test Run" button (if available).

## 🆘 Getting Help

### Resources
- [Technical Documentation](../../TECHNICAL_DOCUMENTATION.md)
- [Developer Guidelines](../../DEVELOPER_GUIDELINES.md)
- Component-specific docs in `/docs/components/`

### Common Issues
- **Nodes not connecting**: Check that exit point types match
- **Variables not working**: Ensure proper `{variable}` syntax
- **Workflow not saving**: Check for validation errors in inspector

---

**Ready to build?** Start with the [Node Configuration Guide](./node-configuration.md) to learn about all available node types!
