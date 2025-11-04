# Alert Workflow Module - Documentation

Welcome to the Alert Workflow Module documentation! This directory contains comprehensive documentation for developers working with the workflow designer and management system.

## 📂 Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── components/                  # Component-specific documentation
│   ├── inspector.md            # Workflow Inspector components
│   ├── generic-selector.md     # Generic Selector component
│   ├── dynamic-select.md       # Dynamic Select component
│   └── template-input.md       # Template Input component
├── guides/                      # Developer guides
│   ├── getting-started.md      # Quick start guide
│   ├── node-configuration.md   # How to configure workflow nodes
│   └── development.md          # Development best practices
└── technical/                   # Technical references
    ├── architecture.md         # System architecture
    ├── node-exit-points.md     # Node output/exit points system
    └── api-integration.md      # Backend API integration
```

## 🚀 Quick Navigation

### For New Developers
1. Start with [Getting Started Guide](./guides/getting-started.md)
2. Read [Development Best Practices](./guides/development.md)
3. Explore [Architecture Overview](./technical/architecture.md)

### For Component Development
- [Inspector Components](./components/inspector.md) - Property editing UI
- [Generic Selector](./components/generic-selector.md) - API-driven selector
- [Dynamic Select](./components/dynamic-select.md) - Flexible dropdown
- [Template Input](./components/template-input.md) - Variable-aware input

### For Node Configuration
- [Node Configuration Guide](./guides/node-configuration.md)
- [Node Exit Points Reference](./technical/node-exit-points.md)

### For Technical Deep Dive
- [Architecture & Data Flow](./technical/architecture.md)
- [API Integration](./technical/api-integration.md)

## 📚 Key Concepts

### Workflow Designer
Visual drag-and-drop interface for creating alert workflows with configurable nodes, connections, and execution logic.

### Inspector Panel
Right-side panel for editing node properties, workflow settings, and managing variables.

### Node System
Extensible node types (triggers, controls, actions, terminals) with dynamic fields and exit points.

### Variables Service
Centralized management of workflow variables and constants with template support.

## 🔗 Related Documentation

- [Main Module README](../README.md) - Module overview
- [Developer Guidelines](../DEVELOPER_GUIDELINES.md) - Coding standards
- [Technical Documentation](../TECHNICAL_DOCUMENTATION.md) - Legacy comprehensive docs

## 📝 Contributing to Docs

When updating documentation:
1. Keep docs concise and focused
2. Use clear examples and diagrams
3. Update related docs when changing features
4. Follow the existing structure and style

---

**Last Updated**: October 19, 2025  
**Module Version**: 1.0  
**Maintained by**: Alert Workflow Team
