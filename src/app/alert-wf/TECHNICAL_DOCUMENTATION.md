# Alert Workflow Module - Technical Documentation

## 📋 **Table of Contents**
1. [Module Overview](#module-overview)
2. [Architecture & Structure](#architecture--structure)
3. [Core Components](#core-components)
4. [Services & APIs](#services--apis)
5. [Data Models](#data-models)
6. [Component Interactions](#component-interactions)
7. [Integration Points](#integration-points)
8. [Development Patterns](#development-patterns)
9. [Code Examples](#code-examples)
10. [Future Enhancements](#future-enhancements)

---

## 🎯 **Module Overview**

The Alert Workflow Module (`alert-wf`) is a comprehensive Angular standalone module for creating, managing, and executing automated alert workflows. It provides a visual workflow designer and management interface integrated into the admin platform.

### **Key Features:**
- ✅ Visual workflow designer with drag-and-drop interface
- ✅ Workflow list management with search, pagination, and dual views
- ✅ Real-time workflow execution and monitoring
- ✅ Template system for reusable workflows
- ✅ Version control and history tracking
- ✅ Evidence collection and logging

### **Technology Stack:**
- **Frontend**: Angular 17+ with standalone components
- **UI Library**: PrimeNG for data tables, dialogs, and form controls
- **Styling**: Tailwind CSS + Material Icons
- **State Management**: RxJS with local component state
- **Routing**: Angular Router with lazy loading
- **HTTP Client**: Angular HttpClient with typed responses

---

## 🏗️ **Architecture & Structure**

```
alert-wf/
├── 📁 core/                          # Shared business logic
│   ├── 📁 models/                    # Data models and interfaces
│   │   └── evidence.ts               # Evidence collection models
│   └── 📁 services/                  # Business services
│       ├── workflow-api.service.ts   # API communication layer
│       └── evidence.service.ts       # Evidence management
│
├── 📁 workflow-list/                 # Workflow management page
│   ├── workflow-list.component.ts    # List controller & logic
│   ├── workflow-list.component.html  # Card/Table view template
│   └── workflow-list.component.css   # Component-specific styles
│
├── 📁 workflow-designer/             # Visual workflow designer
│   ├── 📁 components/                # Designer sub-components
│   │   ├── workflow-header.component.ts       # Toolbar & actions
│   │   ├── workflow-palette.component.ts      # Node library
│   │   ├── workflow-canvas.component.ts       # Main design area
│   │   ├── workflow-inspector.component.ts    # Property editor
│   │   ├── workflow-logs.component.ts         # Execution logs
│   │   ├── workflow-node.component.ts         # Individual nodes
│   │   └── workflow-history-panel.component.ts # Version history
│   ├── workflow-designer.component.ts         # Main designer controller
│   ├── workflow-designer.component.html       # Grid layout template
│   ├── workflow-designer.interfaces.ts        # Designer type definitions
│   ├── workflow-designer.service.ts           # Designer state management
│   ├── workflow-history.service.ts            # Version control
│   ├── workflow-nodes-config.service.ts       # Node definitions
│   └── workflow-variables.service.ts          # Variable management
│
├── 📄 README.md                      # Module overview & setup
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 .copilotignore                 # Copilot context isolation
├── 📄 DEVELOPER_GUIDELINES.md        # Development best practices
└── 📄 TECHNICAL_DOCUMENTATION.md     # This file
```

### **Architectural Principles:**
1. **Single Responsibility**: Each component handles one specific aspect
2. **Loose Coupling**: Services are injected and interfaces are used
3. **High Cohesion**: Related functionality is grouped together
4. **Reactive Programming**: RxJS observables for data flow
5. **Standalone Components**: No NgModule dependencies

---

## 🧩 **Core Components**

### **1. WorkflowListComponent**
**Purpose**: Main workflow management interface with CRUD operations

**Key Responsibilities:**
- Display workflows in card/table view modes
- Implement search, filtering, and pagination
- Handle workflow creation, editing, and deletion
- Navigate to workflow designer

**Architecture Pattern**: Station-list design pattern
```typescript
// Core structure
export class WorkflowListComponent implements OnInit {
  workflows: ApiWorkflow[] = [];           // Main data source
  filteredData: ApiWorkflow[] = [];        // Search results
  paginatedList: ApiWorkflow[] = [];       // Current page data
  showMode: 'card' | 'table' = 'card';     // View toggle
  actions: HeaderAction[] = [...];         // Header actions config
}
```

**Integration Points:**
- `PageHeaderComponent` for actions and search
- `WorkflowApiService` for data operations
- `PrimeNG Table/Paginator` for data display
- Angular Router for navigation

### **2. WorkflowDesignerComponent**
**Purpose**: Visual workflow design interface with drag-and-drop functionality

**Key Responsibilities:**
- Coordinate designer sub-components
- Handle workflow loading/saving
- Manage designer state
- Route parameter processing

**Architecture Pattern**: Container-Presenter pattern
```typescript
// Main controller orchestrates child components
export class WorkflowDesignerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();  // Cleanup subscription
  loading = false;                         // Loading state
  error: string | null = null;             // Error handling
}
```

**Child Components Layout (CSS Grid):**
```css
.workflow-designer {
  display: grid;
  grid-template-areas: 
    "header header header"
    "palette canvas inspector"
    "logs logs logs";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 250px 1fr 300px;
}
```

### **3. Designer Sub-Components**

#### **WorkflowHeaderComponent**
- **Purpose**: Toolbar with save, load, undo, redo actions
- **Features**: Workflow metadata, action buttons, status indicators

#### **WorkflowPaletteComponent**
- **Purpose**: Draggable node library
- **Features**: Categorized nodes, search, favorites

#### **WorkflowCanvasComponent**
- **Purpose**: Main design surface
- **Features**: Drag-and-drop, zoom, pan, selection, connection drawing

#### **WorkflowInspectorComponent**
- **Purpose**: Property editor for selected elements
- **Features**: Dynamic forms, validation, real-time updates

#### **WorkflowLogsComponent**
- **Purpose**: Execution history and debugging
- **Features**: Real-time logs, filtering, export

---

## 🔧 **Services & APIs**

### **1. WorkflowApiService**
**Purpose**: HTTP API communication layer

**Core Interface:**
```typescript
export interface ApiWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];        // Visual elements
  edges: WorkflowEdge[];        // Connections
  variables?: Record<string, string>;
  metadata?: WorkflowMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}
```

**Key Methods:**
- `getWorkflows(params?)`: Fetch workflows with pagination/search
- `getWorkflow(id)`: Get specific workflow
- `createWorkflow(workflow)`: Create new workflow
- `updateWorkflow(id, workflow)`: Update existing workflow
- `deleteWorkflow(id)`: Remove workflow
- `getTemplates()`: Fetch workflow templates

**Error Handling Pattern:**
```typescript
this.workflowApiService.getWorkflows().subscribe({
  next: (response) => {
    this.workflows = response.data;
    this.loading = false;
  },
  error: (error) => {
    this.error = 'Failed to load workflows';
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load workflows'
    });
  }
});
```

### **2. WorkflowDesignerService**
**Purpose**: State management for workflow designer

**Key Responsibilities:**
- Canvas state (zoom, pan, selection)
- Node/edge management
- Undo/redo functionality
- Validation and error checking

### **3. WorkflowHistoryService**
**Purpose**: Version control and change tracking

**Features:**
- State snapshots
- Diff calculations
- Rollback functionality
- Change annotations

### **4. EvidenceService**
**Purpose**: Evidence collection and management

**Features:**
- Evidence artifact storage
- Metadata management
- Search and retrieval

---

## 📊 **Data Models**

### **Workflow Node Structure:**
```typescript
interface WorkflowNode {
  id: string;                    // Unique identifier
  type: string;                  // Node type (trigger, action, condition)
  position: { x: number; y: number };
  data: {
    label: string;               // Display name
    icon?: string;               // Material icon
    params?: Record<string, any>; // Configuration
  };
}
```

### **Workflow Edge Structure:**
```typescript
interface WorkflowEdge {
  id: string;                    // Unique identifier
  source: string;                // Source node ID
  target: string;                // Target node ID
  data?: Record<string, any>;    // Connection metadata
}
```

### **Metadata Structure:**
```typescript
interface WorkflowMetadata {
  category?: string;             // Grouping category
  priority?: string;             // Execution priority
  author?: string;               // Creator
  version?: string;              // Version number
  approved?: boolean;            // Approval status
  tags?: string[];               // Search tags
}
```

---

## 🔄 **Component Interactions**

### **Data Flow Patterns:**

1. **List → Designer Navigation:**
```typescript
// workflow-list.component.ts
selectWorkflow(workflow: ApiWorkflow) {
  this.router.navigate(['/admin/alert-wf/workflow-designer'], 
    { queryParams: { id: workflow.id } });
}

// workflow-designer.component.ts
ngOnInit() {
  this.route.queryParams.subscribe(queryParams => {
    const workflowId = queryParams['id'];
    if (workflowId && workflowId !== 'new') {
      this.loadWorkflow(workflowId);
    }
  });
}
```

2. **Service → Component Updates:**
```typescript
// Reactive pattern with automatic UI updates
loadWorkflows() {
  this.loading = true;
  this.workflowApiService.getWorkflows().subscribe({
    next: (response) => {
      this.workflows = response.data;
      this.filteredData = [...this.workflows];
      this.updatePaginatedList();
      this.loading = false;
    }
  });
}
```

3. **Header Actions Integration:**
```typescript
// Unified action handling
actions: HeaderAction[] = [
  {
    id: 'refresh',
    kind: 'btn',
    icon: 'refresh',
    onClick: () => this.refreshWorkflows()
  },
  {
    id: 'search',
    kind: 'search',
    onSearch: (query: string) => this.search(query)
  }
];
```

---

## 🔗 **Integration Points**

### **1. Admin Module Integration:**
```typescript
// admin-routing.module.ts
{
  path: 'alert-wf',
  component: RouterLayoutComponent,
  canActivate: [AdminGuard],
  children: [
    { path: '', redirectTo: 'workflow-list', pathMatch: 'full' },
    { path: 'workflow-list', component: WorkflowListComponent },
    { path: 'workflow-designer', component: WorkflowDesignerComponent }
  ]
}
```

### **2. Navigation Integration:**
```typescript
// admin-navigation.service.ts
{
  id: 'alert-workflow',
  label: 'Alert Workflow',
  icon: 'account_tree',
  children: [
    {
      label: 'Workflow List',
      route: '/admin/alert-wf/workflow-list',
      icon: 'list'
    },
    {
      label: 'Workflow Designer', 
      route: '/admin/alert-wf/workflow-designer',
      icon: 'design_services'
    }
  ]
}
```

### **3. Shared Component Usage:**
- `PageHeaderComponent`: Standardized header with actions
- `LoadingComponent`: Consistent loading states
- `RouterLayoutComponent`: Admin layout wrapper

---

## 🔧 **Development Patterns**

### **1. Component State Management:**
```typescript
// Clear state separation
export class WorkflowListComponent {
  // Data state
  workflows: ApiWorkflow[] = [];
  filteredData: ApiWorkflow[] = [];
  
  // UI state
  loading = false;
  showMode: 'card' | 'table' = 'card';
  
  // Configuration
  pageSize: number = 50;
  currentPage: number = 0;
}
```

### **2. Error Handling Strategy:**
```typescript
// Consistent error handling
loadWorkflows() {
  this.loading = true;
  this.error = null;
  
  this.workflowApiService.getWorkflows().subscribe({
    next: (response) => {
      // Success handling
    },
    error: (error) => {
      this.error = 'Failed to load workflows';
      this.messageService.add({
        severity: 'error',
        summary: 'Error', 
        detail: 'Failed to load workflows'
      });
    }
  });
}
```

### **3. Search & Filtering Pattern:**
```typescript
search(query: string) {
  if (!query.trim()) {
    this.filteredData = [...this.workflows];
  } else {
    const searchTerm = query.toLowerCase();
    this.filteredData = this.workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(searchTerm) ||
      workflow.description?.toLowerCase().includes(searchTerm) ||
      workflow.metadata?.category?.toLowerCase().includes(searchTerm)
    );
  }
  this.currentPage = 0;
  this.updatePaginatedList();
}
```

### **4. Pagination Pattern:**
```typescript
onPageChange(event: PaginatorState) {
  this.currentPage = event.page || 0;
  this.pageSize = event.rows || 50;
  this.updatePaginatedList();
}

private updatePaginatedList() {
  const startIndex = this.currentPage * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedList = this.filteredData.slice(startIndex, endIndex);
}
```

---

## 💻 **Code Examples**

### **Creating a New Workflow:**
```typescript
createNewWorkflow() {
  const newWorkflow: Omit<ApiWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'New Workflow',
    description: 'Description here',
    nodes: [],
    edges: [],
    variables: {},
    metadata: {
      category: 'Alert Processing',
      priority: 'Normal',
      author: 'Current User',
      version: '1.0.0',
      approved: false,
      tags: ['new']
    }
  };
  
  this.workflowApiService.createWorkflow(newWorkflow).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Workflow created successfully'
      });
      this.router.navigate(['/admin/alert-wf/workflow-designer'], 
        { queryParams: { id: response.data.id } });
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create workflow'
      });
    }
  });
}
```

### **Header Actions Configuration:**
```typescript
actions: HeaderAction[] = [
  {
    id: 'refresh',
    kind: 'btn',
    tooltip: 'refresh',
    icon: 'refresh',
    onClick: () => this.refreshWorkflows()
  },
  {
    id: 'toggle',
    kind: 'toggleView',
    state: this.showMode == 'card' ? 0 : 1,
    icon: 'grid_view',
    iconToggle: 'view_agenda',
    onToggle: (mode: 0 | 1) => {
      this.changeMode(mode);
    }
  },
  {
    id: 'search',
    kind: 'search',
    placeholder: 'Search workflow',
    onSearch: (query: string) => this.search(query)
  },
  {
    id: 'add',
    kind: 'btn',
    tooltip: 'Create New Workflow',
    icon: 'add',
    onClick: () => this.createNewWorkflow()
  }
];
```

### **Workflow Deletion with Confirmation:**
```typescript
deleteWorkflow(workflowId: string, workflowName: string) {
  this.confirmationService.confirm({
    message: `Are you sure you want to delete workflow "${workflowName}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.workflowApiService.deleteWorkflow(workflowId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Workflow deleted successfully'
          });
          this.loadWorkflows();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete workflow'
          });
        }
      });
    }
  });
}
```

---

## 🚀 **Future Enhancements**

### **Planned Features:**
1. **Real-time Collaboration**: Multiple users editing workflows simultaneously
2. **Advanced Analytics**: Workflow performance metrics and insights
3. **Template Library**: Predefined workflow templates for common scenarios
4. **Integration Hub**: Connectors for external systems and APIs
5. **Mobile Support**: Responsive design for tablet/mobile workflow viewing
6. **Workflow Scheduler**: Time-based and event-driven execution
7. **Advanced Debugging**: Breakpoints, step-through execution
8. **Workflow Testing**: Unit tests and integration tests for workflows
9. **API Documentation**: Auto-generated documentation from workflow definitions
10. **Import/Export**: Workflow exchange with other systems

### **Technical Improvements:**
- State management with NgRx for complex interactions
- WebSocket integration for real-time updates
- Canvas performance optimization for large workflows
- Lazy loading for designer components
- Offline capability with service workers
- Enhanced TypeScript typing and validation
- Automated testing suite expansion

---

## 📝 **Development Notes**

### **Best Practices:**
1. Always use the dedicated workspace for focused development
2. Follow the established naming conventions (Workflow prefix)
3. Keep components focused on single responsibilities
4. Use reactive programming patterns with RxJS
5. Implement proper error handling and user feedback
6. Write clear, self-documenting code with good comments
7. Test integration points thoroughly
8. Update documentation when making architectural changes

### **Common Patterns:**
- **Loading States**: Always show loading indicators for async operations
- **Error Handling**: Consistent error messages and user feedback
- **Navigation**: Use router.navigate() for programmatic navigation
- **State Management**: Local component state with reactive updates
- **Confirmation**: Use ConfirmationService for destructive actions
- **Messaging**: Use MessageService for user notifications

### **Performance Considerations:**
- Implement virtual scrolling for large workflow lists
- Use OnPush change detection where appropriate
- Lazy load designer components
- Optimize canvas rendering for large workflows
- Cache frequently accessed workflow data

---

*Last Updated: October 15, 2025*
*Module Version: 1.0.0*
*Documentation Version: 1.0.0*