// Alert Workflow Designer Interfaces - migrated to library

export interface NodeSize {
  w: number;
  h: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  params: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  exitPoint?: string; // Which output point: 'next', 'onTrue', 'onFalse', 'case1', etc.
}

export interface PaletteItem {
  type: string;
  label: string;
  color: string;
}

export interface PaletteCategoryConfig {
  id: string;
  label: string;
  icon: string;
  headerClass: string;
  filterPrefix: string | string[]; // Type prefix(es) to filter nodes (e.g., 'trigger.' or ['var.', 'audit.', 'utility.'])
}

export interface NodeProperty {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'json';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  default?: any;
}

export interface NodeTypeConfig {
  type: string;
  category: 'trigger' | 'control' | 'action' | 'terminal' | 'utility';
  label: string;
  description: string;
  icon: string; // Icon for node type - emoji (e.g., '⚡', '📧') or HTML markup (e.g., '<i class="fa fa-bolt"></i>', '<svg>...</svg>')
  color: string;
  nodeColor: string;
  properties: NodeFieldConfig[];
  exits: string[];
}

export interface WorkflowNodesConfig {
  nodeTypes: NodeTypeConfig[];
}

export interface DragState {
  draggingId: string | null;
  dx: number;
  dy: number;
}

export interface WorkflowExport {
  workflowId: string;
  version: number;
  nodes: {
    id: string;
    type: string;
    label: string;
    params: Record<string, any>;
    next: string[];
  }[];
  variables: Record<string, any>;
}

// Generic options interface for field-specific configurations
export interface GenericSelectorOptions {
  endpoint: string; // API endpoint URL
  valueField?: string; // Field to use as value (default: 'id')
  primaryDisplayField?: string; // Field to display as primary text (default: 'name')
  secondaryDisplayField?: string; // Optional field for secondary text
  searchFields?: string[]; // Fields to search on
  searchLabel?: string; // Label for search field
  searchPlaceholder?: string; // Placeholder for search field
  selectedLabel?: string; // Label for selected items list
  emptyStateMessage?: string; // Message when no items selected
  responseDataPath?: string; // Path to data in response (e.g., 'results', 'data.items')
}

export interface DynamicSelectOptions {
  // Mode 1: Static array
  options?: string[] | any[]; // Static options array
  
  // Mode 2: Dynamic endpoint
  endpoint?: string; // API endpoint URL
  valueField?: string; // Field to use as value (default: 'id')
  displayField?: string; // Field to display as text (default: 'name')
  secondaryDisplayField?: string; // Optional field for secondary text
  responseDataPath?: string; // Path to data in response (e.g., 'results', 'data.items')
  
  // Append static options to endpoint results (e.g., "Other", "Custom")
  appendOptions?: Array<{
    value: string | number;           // Value to store
    label: string;                     // Display text
    secondaryLabel?: string;           // Optional secondary text
    icon?: string;                     // Optional icon
    separator?: boolean;               // Show separator before this option
  }>;
  
  // Auto-set other field values when specific option is selected
  autoSetFields?: Array<{
    triggerValue: string | number;    // When this value is selected
    fieldUpdates: Record<string, any>; // Fields to update: { fieldKey: value }
  }>;
  
  // Common options
  showSearch?: boolean; // Enable search/filter (default: false)
}

// Conditional visibility configuration for any field
export interface FieldCondition {
  watchField: string; // The field key to watch for changes
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'greaterThan' | 'lessThan'; // Comparison operator
  value: any; // Value to compare against (can be single value or array for 'includes'/'notIncludes')
}

// Base interface for node field configuration
export interface NodeFieldConfig<T = any> {
  // Required/Common fields (used by all field types)
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'switch-cases' | 'user-selector' | 'user-group-selector' | 'generic-selector';
  
  // Optional common fields
  required?: boolean;
  placeholder?: string;
  help?: string;
  helpText?: string; // Alias for 'help' (for compatibility with NodeProperty)
  icon?: string; // Icon to display - emoji (e.g., '📋', '👤') or HTML markup (e.g., '<i class="fa fa-user"></i>', '<svg>...</svg>')
  default?: any;
  readonly?: boolean; // Make field read-only (user cannot edit). Useful for auto-generated values like UUIDs.
  
  // Type-specific options (generic)
  options?: T;
  
  // Conditional visibility - show/hide field based on other field values
  showIf?: FieldCondition | FieldCondition[]; // Single condition or array of conditions (AND logic)
}

export const NODE_SIZE: NodeSize = { w: 220, h: 92 };

// Undo/Redo History State
export interface WorkflowHistoryState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  description?: string; // Optional description of the change
  timestamp?: Date; // Optional timestamp when state was saved
}
