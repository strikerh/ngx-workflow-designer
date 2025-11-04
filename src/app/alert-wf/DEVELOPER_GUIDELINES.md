# Alert Workflow Module - Developer Guidelines

## 🎯 **Copilot Optimization Best Practices**

### **Working with This Module**

1. **Use the Dedicated Workspace**
   ```bash
   # Open the module-specific workspace
   code alert-wf-workspace.code-workspace
   ```

2. **Enable Module Focus Mode**
   - The `.copilotignore` file excludes other modules
   - The workspace settings hide irrelevant folders
   - TypeScript auto-imports are disabled to prevent cross-module pollution

3. **GitHub Copilot Context Management**
   ```typescript
   // ✅ GOOD: Clear, module-specific naming
   export class WorkflowListComponent {
     // Copilot understands this is workflow-related
   }
   
   // ❌ AVOID: Generic naming that confuses context
   export class ListComponent {
     // Copilot might suggest station/user list patterns
   }
   ```

### **Module Isolation Strategies**

#### **1. Import Path Discipline**
```typescript
// ✅ GOOD: Relative imports within module
import { WorkflowApiService } from '../core/services/workflow-api.service';

// ✅ GOOD: Explicit external imports
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';

// ❌ AVOID: Implicit imports that Copilot might auto-suggest incorrectly
import { SomeService } from '../../other-module/services/some.service';
```

#### **2. Component Naming Convention**
```typescript
// Follow this pattern to help Copilot understand context
WorkflowListComponent     // Main list view
WorkflowCardComponent     // Card display
WorkflowFormComponent     // Create/edit form
WorkflowDetailComponent   // Detail view
WorkflowApiService        // API service
WorkflowType             // Type definitions
```

#### **3. File Organization**
```
alert-wf/
├── components/          # UI components
├── core/               # Services, models, types
├── pages/              # Route components
└── shared/             # Shared utilities (module-specific)
```

### **Copilot Prompt Best Practices**

#### **Effective Prompts for This Module**
```
✅ "Create a workflow validation method in WorkflowApiService"
✅ "Add a search filter to the workflow list component"
✅ "Update the workflow card component to show status badges"

❌ "Create a validation method" (too generic)
❌ "Add search functionality" (might suggest station search)
❌ "Update the card component" (ambiguous which card)
```

#### **Context Setting**
```
// Start conversations with clear context
"Working on the alert-wf module - I need to..."
"In the workflow designer component, I want to..."
"For the workflow list page, can you help me..."
```

### **Development Workflow**

1. **Before Starting Work**
   - Open `alert-wf-workspace.code-workspace`
   - Verify `.copilotignore` is active
   - Check that other modules are hidden in explorer

2. **During Development**
   - Use module-specific terminology in Copilot chats
   - Reference the README.md for context
   - Keep imports within module scope when possible

3. **Before Committing**
   - Review for any accidental cross-module imports
   - Ensure naming follows workflow conventions
   - Update this documentation if patterns change

### **Integration Points**

The module integrates with the main application through:
- `admin-routing.module.ts` - Route configuration
- `admin-navigation.service.ts` - Menu items
- `@app/components/page-header` - Shared header component
- `@app/core/guards` - Authentication guards

### **Troubleshooting Copilot Issues**

If Copilot suggests incorrect patterns:

1. **Check Context**: Ensure you're in the workspace and other modules are hidden
2. **Be Specific**: Use full component/service names in prompts
3. **Reset Context**: Close and reopen the workspace if needed
4. **Manual Override**: Sometimes manually typing the correct import helps train context

### **Module Evolution**

As the module grows:
- Update `.copilotignore` if new conflicting patterns emerge
- Expand this documentation with new conventions
- Consider creating sub-workspaces for major features
- Keep the module README.md current with architectural changes

---

**Remember**: The goal is to make Copilot see this as a focused, self-contained workflow management system rather than part of a larger admin platform.