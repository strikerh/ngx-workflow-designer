# Alert Workflow Module

## Overview
This module provides comprehensive workflow design and management capabilities for the alert system. Build visual, drag-and-drop workflows with configurable nodes, dynamic connections, and powerful execution logic.

## 🚀 Quick Start

### For New Users
1. **Browse Workflows**: Navigate to `/admin/alert-wf/workflow-list`
2. **Create Workflow**: Click "New Workflow" button
3. **Design**: Drag nodes, make connections, configure properties
4. **Save**: Save and execute your workflow

### For Developers
- **Start Here**: [Getting Started Guide](./docs/guides/getting-started.md)
- **API Reference**: [Node Configuration](./docs/guides/node-configuration.md)
- **Technical Deep Dive**: [Architecture Overview](./docs/technical/architecture.md)

## 📂 Architecture

### Core Structure
```
alert-wf/
├── core/                      # Shared business logic
│   ├── models/               # Data models and interfaces
│   └── services/             # API and business services
├── workflow-list/            # Workflow management UI
├── workflow-designer/        # Visual workflow builder
│   ├── components/           # Designer sub-components
│   │   ├── inspector/       # Property editing panel
│   │   └── ...
│   └── workflow-designer.service.ts  # State management
└── docs/                     # Comprehensive documentation
    ├── components/           # Component-specific guides
    ├── guides/              # How-to guides
    └── technical/           # Technical references
```

### Key Components
- **WorkflowListComponent**: Browse and manage workflows
- **WorkflowDesignerComponent**: Visual workflow builder
- **WorkflowInspectorComponent**: Property editing panel
- **WorkflowApiService**: Backend API communication
- **WorkflowDesignerService**: Reactive state management with signals

### Routing
- `/admin/alert-wf/` → Workflow List (default)
- `/admin/alert-wf/workflow-list` → Workflow List  
- `/admin/alert-wf/workflow-designer?id=<workflow-id>` → Designer

## 📚 Documentation

### 📖 Comprehensive Guides

**Getting Started**:
- [Quick Start Guide](./docs/guides/getting-started.md) - Build your first workflow
- [Node Configuration](./docs/guides/node-configuration.md) - Configure node types and fields
- [Development Best Practices](./docs/guides/development.md) - Coding standards and patterns

**Components**:
- [Inspector Components](./docs/components/inspector.md) - Property editing system
- [Generic Selector](./docs/components/generic-selector.md) - Multi-select API-driven component
- [Dynamic Select](./docs/components/dynamic-select.md) - Single-select dropdown
- [Template Input](./docs/components/template-input.md) - Variable-aware input fields

**Technical References**:
- [System Architecture](./docs/technical/architecture.md) - Design patterns and data flow
- [Node Exit Points](./docs/technical/node-exit-points.md) - Connection system
- [API Integration](./docs/technical/api-integration.md) - Backend communication

**Legacy Documentation**:
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Comprehensive legacy docs
- [Developer Guidelines](./DEVELOPER_GUIDELINES.md) - Development practices

## 🛠️ Technology Stack

- **Angular 17+**: Standalone components with signals
- **PrimeNG**: UI component library
- **Tailwind CSS**: Utility-first styling
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development

## ✨ Features

### Visual Workflow Designer
- Drag-and-drop node placement
- Visual connection drawing
- Pan and zoom canvas
- Undo/redo support
- Real-time validation

### Configurable Nodes
- Triggers (Manual, Webhook, Schedule)
- Control Flow (If/Else, Switch, Loop)
- Actions (SMS, Email, HTTP, Database)
- Terminals (End, Error)
- Dynamic exit points
- Custom field types

### Inspector Panel
- Node property editing
- Workflow settings
- Variable management
- Metadata configuration
- Template-based inputs with autocomplete

### State Management
- Angular signals for reactivity
- History service for undo/redo
- Centralized workflow state
- Optimistic updates

## 🧪 Development

### Code Style
- Angular standalone components
- Reactive patterns with signals
- TypeScript strict mode
- Single responsibility principle

### Testing
- Unit tests for services
- Component tests for UI
- Integration tests for workflows
- E2E tests for critical flows

### API Integration
- RESTful backend API
- Typed responses
- Error handling with user feedback
- Optimistic UI updates