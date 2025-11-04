# Node Exit Points System

Technical reference for the node output/exit points system that enables workflow connections.

## 🎯 Overview

Exit points are output connection points on nodes that determine where workflow execution can flow next. They enable the visual flow-based programming model of the workflow designer.

## 🔌 How Exit Points Work

### 1. Configuration-Driven

Exit points are defined in node type configuration:

```typescript
{
  type: "control.if",
  exits: ["onTrue", "onFalse"]
}
```

```typescript
{
  type: "action.sms",
  exits: ["onSuccess", "onFailure"]
}
```

### 2. Visual Representation

Exit points appear as colored circles on the right side of nodes:

```
┌─────────────────────┐
│                     │
│    If Severity      │●─── onTrue (green)
│    == CRITICAL      │
│                     │●─── onFalse (red)
└─────────────────────┘
```

### 3. Connection Storage

Connections store which exit point was used:

```typescript
interface WorkflowEdge {
  id: string;
  from: string;           // Source node ID
  to: string;             // Target node ID
  exitPoint?: string;     // Which exit: 'onTrue', 'onFalse', etc.
}
```

## 📋 Standard Exit Points

### Single Exit (Sequential)

**Used by**: Triggers, simple actions

```typescript
exits: ["next"]
```

**Meaning**: Single path forward

**Visual**: Blue circle

**Example**:
```
┌─────────────────┐
│ Manual Trigger  │●─── next
└─────────────────┘
```

### Binary Exits (Conditional)

**Used by**: If/Else nodes

```typescript
exits: ["onTrue", "onFalse"]
```

**Meaning**: Two paths based on condition

**Visual**: 
- Green circle for onTrue
- Red circle for onFalse

**Example**:
```
┌──────────────────┐
│  If Condition    │●─── onTrue (green)
│                  │●─── onFalse (red)
└──────────────────┘
```

### Success/Failure Exits

**Used by**: Actions (SMS, Email, HTTP, etc.)

```typescript
exits: ["onSuccess", "onFailure"]
```

**Meaning**: Different paths for success/failure

**Visual**:
- Green circle for onSuccess
- Red circle for onFailure

**Example**:
```
┌─────────────┐
│  Send SMS   │●─── onSuccess (green)
│             │●─── onFailure (red)
└─────────────┘
```

### No Exits (Terminal)

**Used by**: End nodes

```typescript
exits: []
```

**Meaning**: Workflow terminates here

**Example**:
```
┌─────────┐
│   End   │  (no connection points)
└─────────┘
```

## 🔀 Dynamic Exit Points (Switch Nodes)

Switch nodes generate exit points dynamically based on case values.

### Configuration

```typescript
{
  type: "control.switch",
  properties: [
    {
      key: 'expression',
      label: 'Switch Expression',
      type: 'text',
      placeholder: '{alert.severity}'
    },
    {
      key: 'cases',
      label: 'Case Values',
      type: 'switch-cases',
      placeholder: 'CRITICAL,HIGH,MEDIUM,LOW'
    }
  ],
  exits: []  // Empty - dynamically generated
}
```

### Exit Generation Logic

```typescript
private getSwitchExits(): string[] {
  const casesParam = this.node.params?.['cases'];
  
  if (typeof casesParam === 'string' && casesParam.trim()) {
    const cases = casesParam.split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    if (cases.length > 0) {
      return [...cases, 'default'];
    }
  }
  
  return ['default'];
}
```

**Example**:

User input: `CRITICAL,HIGH,MEDIUM,LOW`

Generated exits:
```typescript
["CRITICAL", "HIGH", "MEDIUM", "LOW", "default"]
```

**Visual**:
```
┌─────────────────────┐
│ Switch: severity    │●─── CRITICAL (purple)
│                     │●─── HIGH (purple)
│                     │●─── MEDIUM (purple)
│                     │●─── LOW (purple)
│                     │●─── default (purple)
└─────────────────────┘
```

## 🎨 Visual Styling

### Exit Point Colors

Defined in `workflow-node.component.ts`:

```typescript
<div class="exit-point"
     [class.border-green-500]="exit === 'onTrue' || exit === 'onSuccess'"
     [class.border-red-500]="exit === 'onFalse' || exit === 'onFailure'"
     [class.border-blue-500]="exit === 'next'"
     [class.border-purple-500]="isSwitchCase(exit)"
     (click)="onExitClick($event, exit)">
```

| Exit Type | Color | CSS Class |
|-----------|-------|-----------|
| `onTrue`, `onSuccess` | Green | `border-green-500` |
| `onFalse`, `onFailure` | Red | `border-red-500` |
| `next` | Blue | `border-blue-500` |
| Switch cases, `default` | Purple | `border-purple-500` |

### Exit Point Labels

Labels appear on hover/always visible:

```html
<span class="exit-label">
  {{ getExitLabel(exit) }}
</span>
```

Label generation:
```typescript
getExitLabel(exit: string): string {
  const labels: Record<string, string> = {
    'next': '→',
    'onTrue': '✓',
    'onFalse': '✗',
    'onSuccess': '✓',
    'onFailure': '✗',
    'default': '...'
  };
  
  return labels[exit] || exit;
}
```

## 🔗 Connection Flow

### 1. Starting a Connection

User clicks on an exit point:

```typescript
onExitClick(event: MouseEvent, exitPoint: string): void {
  event.stopPropagation();
  this.workflowService.startConnect(this.node.id, exitPoint);
}
```

Service state:
```typescript
startConnect(nodeId: string, exitPoint: string): void {
  this.connectFrom.set(nodeId);
  this.connectFromExitPoint.set(exitPoint);
  this.isConnectMode.set(true);
}
```

### 2. Completing a Connection

User clicks on target node's input point:

```typescript
onNodeClick(): void {
  if (this.workflowService.isConnectMode()) {
    this.completeConnection();
  }
}
```

Service creates edge:
```typescript
completeConnection(targetNodeId: string): void {
  const sourceId = this.connectFrom();
  const exitPoint = this.connectFromExitPoint();
  
  if (sourceId && targetNodeId) {
    this.addEdge(sourceId, targetNodeId, exitPoint);
  }
  
  this.cancelConnect();
}
```

Edge creation:
```typescript
addEdge(from: string, to: string, exitPoint?: string): void {
  const edge: WorkflowEdge = {
    id: this.uid('edge'),
    from,
    to,
    exitPoint
  };
  
  this.edges.update(edges => [...edges, edge]);
  this.saveStateToHistory('Added connection');
}
```

### 3. Edge Rendering

Canvas component renders edges with exit point info:

```typescript
<svg>
  @for (edge of workflowService.edges(); track edge.id) {
    <path
      [attr.d]="getEdgePath(edge)"
      [class.stroke-green-500]="edge.exitPoint === 'onTrue'"
      [class.stroke-red-500]="edge.exitPoint === 'onFalse'"
      [class.stroke-blue-500]="edge.exitPoint === 'next'"
      (click)="selectEdge(edge.id)">
    </path>
  }
</svg>
```

## 🧩 Node Component Integration

### Exit Points Rendering

In `workflow-node.component.ts`:

```typescript
// Get exit points from configuration
nodeExits = computed(() => {
  const config = this.configService.getNodeTypeConfig(this.node.type);
  
  // Special case: Switch nodes
  if (this.node.type === 'control.switch') {
    return this.getSwitchExits();
  }
  
  // Standard exits from config
  return config?.exits || [];
});

// Template rendering
@for (exit of nodeExits(); track exit; let i = $index) {
  <div class="exit-point"
       [style.top.px]="getExitPosition(i, nodeExits().length)"
       (click)="onExitClick($event, exit)">
    <span class="exit-label">{{ getExitLabel(exit) }}</span>
  </div>
}
```

### Exit Point Positioning

Vertical distribution of exit points:

```typescript
getExitPosition(index: number, total: number): number {
  const nodeHeight = 92; // NODE_SIZE.h
  const spacing = nodeHeight / (total + 1);
  return (index + 1) * spacing;
}
```

## 📊 Exit Point Validation

### Preventing Invalid Connections

```typescript
canConnect(sourceId: string, targetId: string): boolean {
  // Can't connect node to itself
  if (sourceId === targetId) return false;
  
  // Can't create duplicate connections
  const existing = this.edges().find(
    e => e.from === sourceId && e.to === targetId
  );
  if (existing) return false;
  
  // Can't create cycles (optional)
  if (this.wouldCreateCycle(sourceId, targetId)) return false;
  
  return true;
}
```

### Exit Point Usage Tracking

Track which exit points are already connected:

```typescript
getUsedExits(nodeId: string): string[] {
  return this.edges()
    .filter(e => e.from === nodeId)
    .map(e => e.exitPoint || 'next');
}

isExitUsed(nodeId: string, exitPoint: string): boolean {
  return this.getUsedExits(nodeId).includes(exitPoint);
}
```

## 🎯 Best Practices

### 1. Consistent Exit Naming

```typescript
// ✅ Good: Standard naming
exits: ["onSuccess", "onFailure"]  // All actions
exits: ["onTrue", "onFalse"]       // All conditionals

// ❌ Bad: Inconsistent
exits: ["success", "error"]   // Different from other actions
exits: ["yes", "no"]          // Different from other conditionals
```

### 2. Meaningful Labels

```typescript
// ✅ Good: Clear purpose
exits: ["onTimeout", "onComplete"]

// ❌ Bad: Unclear
exits: ["exit1", "exit2"]
```

### 3. Limit Exit Count

```typescript
// ✅ Good: Manageable
exits: ["onTrue", "onFalse"]  // 2 exits
exits: ["onSuccess", "onFailure", "onTimeout"]  // 3 exits

// ⚠️ Avoid: Too many static exits
exits: ["case1", "case2", "case3", "case4", "case5", "case6"]  // Use switch instead
```

### 4. Use Dynamic Exits for Variability

```typescript
// ✅ Good: Dynamic based on user input
type: "control.switch"
exits: []  // Generated from cases

// ❌ Bad: Hardcoding variable cases
exits: ["CRITICAL", "HIGH", "MEDIUM", "LOW"]  // User might want different values
```

## 🐛 Troubleshooting

### Issue: Exit points not appearing

**Cause**: Node config not loaded or exits array empty

**Solution**: Check `workflow-nodes-config.json` or `.data.ts`:
```typescript
{
  type: "action.sms",
  exits: ["onSuccess", "onFailure"]  // ← Make sure this exists
}
```

### Issue: Can't connect nodes

**Cause**: Connection validation failing or connect mode not active

**Solution**: Verify:
1. `isConnectMode()` is true
2. Source and target are different nodes
3. No duplicate edge exists

### Issue: Wrong exit point stored

**Cause**: Exit point not passed during edge creation

**Solution**: Ensure exit point is passed:
```typescript
// ✅ Correct
this.addEdge(sourceId, targetId, exitPoint);

// ❌ Wrong
this.addEdge(sourceId, targetId);  // exitPoint undefined
```

### Issue: Switch exits not updating

**Cause**: Cases parameter not changing or not triggering recomputation

**Solution**: Use signals and computed:
```typescript
nodeExits = computed(() => {
  // Will recompute when node.params changes
  return this.getSwitchExits();
});
```

## 📚 Related Documentation

- [Architecture Overview](./architecture.md)
- [Node Configuration Guide](../guides/node-configuration.md)
- [Development Best Practices](../guides/development.md)

---

**The exit points system enables the visual flow-based programming that makes the workflow designer intuitive and powerful!** 🎉
