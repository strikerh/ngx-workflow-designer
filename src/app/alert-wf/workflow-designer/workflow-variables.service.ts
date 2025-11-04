import { Injectable, signal, computed } from '@angular/core';

export interface WorkflowVariable {
  key: string;
  value: string;
  description?: string;
}

export interface WorkflowConstant {
  key: string;
  value: string;
  description?: string;
}

export interface TemplateVariable {
  key: string;           // Variable key (e.g., 'alert.id', 'user.name')
  label: string;         // Display label
  description?: string;  // Optional description/help text
  category?: string;     // Optional category for grouping
}

/**
 * Default template variables available in workflow contexts
 * These are system-provided variables that are always available
 */
export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Alert context
  { key: 'alert.id', label: 'Alert ID', description: 'Unique identifier of the alert', category: 'Alert' },
  { key: 'alert.type', label: 'Alert Type', description: 'Type of alert (e.g., FIRE, MEDICAL)', category: 'Alert' },
  { key: 'alert.severity', label: 'Alert Severity', description: 'Severity level (CRITICAL, HIGH, MEDIUM, LOW)', category: 'Alert' },
  { key: 'alert.message', label: 'Alert Message', description: 'Alert message text', category: 'Alert' },
  { key: 'alert.location', label: 'Alert Location', description: 'Location where alert was triggered', category: 'Alert' },
  { key: 'alert.timestamp', label: 'Alert Timestamp', description: 'When the alert was created', category: 'Alert' },
  { key: 'alert.source', label: 'Alert Source', description: 'Source system or device', category: 'Alert' },

  // User context
  { key: 'user.id', label: 'User ID', description: 'Current user identifier', category: 'User' },
  { key: 'user.name', label: 'User Name', description: 'Current user full name', category: 'User' },
  { key: 'user.email', label: 'User Email', description: 'Current user email address', category: 'User' },
  { key: 'user.role', label: 'User Role', description: 'Current user role', category: 'User' },
  { key: 'user.department', label: 'User Department', description: 'Current user department', category: 'User' },

  // Workflow context
  { key: 'workflow.id', label: 'Workflow ID', description: 'Current workflow instance ID', category: 'Workflow' },
  { key: 'workflow.name', label: 'Workflow Name', description: 'Name of the workflow', category: 'Workflow' },
  { key: 'workflow.startTime', label: 'Workflow Start Time', description: 'When workflow execution started', category: 'Workflow' },

  // System context
  { key: 'system.date', label: 'Current Date', description: 'Current system date', category: 'System' },
  { key: 'system.time', label: 'Current Time', description: 'Current system time', category: 'System' },
  { key: 'system.datetime', label: 'Current DateTime', description: 'Current system date and time', category: 'System' },
  { key: 'system.timezone', label: 'System Timezone', description: 'System timezone', category: 'System' },

  // Previous node outputs (examples)
  { key: 'node.output', label: 'Previous Node Output', description: 'Output from previous node', category: 'Node Data' },
  { key: 'node.status', label: 'Previous Node Status', description: 'Status of previous node execution', category: 'Node Data' },
];

/**
 * Service for managing workflow variables and constants
 * Variables: Mutable values that can change during workflow execution
 * Constants: Immutable configuration values defined at design time
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowVariablesService {
  // Private signals for internal state
  private _variables = signal<Record<string, string>>({});
  private _constants = signal<Record<string, string>>({});

  // Public read-only computed signals
  variables = computed(() => this._variables());
  constants = computed(() => this._constants());

  /**
   * Get variables as an array of key-value pairs for UI binding
   */
  getVariablesArray(): WorkflowVariable[] {
    const vars = this._variables();
    return Object.entries(vars).map(([key, value]) => ({ key, value }));
  }

  /**
   * Get constants as an array of key-value pairs for UI binding
   */
  getConstantsArray(): WorkflowConstant[] {
    const consts = this._constants();
    return Object.entries(consts).map(([key, value]) => ({ key, value }));
  }

  /**
   * Set all variables at once (used when loading workflow)
   */
  setVariables(variables: Record<string, string>): void {
    this._variables.set(variables || {});
  }

  /**
   * Set all constants at once (used when loading workflow)
   */
  setConstants(constants: Record<string, string>): void {
    this._constants.set(constants || {});
  }

  /**
   * Add or update a single variable
   */
  setVariable(key: string, value: string): void {
    this._variables.update(vars => ({ ...vars, [key]: value }));
  }

  /**
   * Add or update a single constant
   */
  setConstant(key: string, value: string): void {
    this._constants.update(consts => ({ ...consts, [key]: value }));
  }

  /**
   * Remove a variable by key
   */
  removeVariable(key: string): void {
    this._variables.update(vars => {
      const { [key]: removed, ...rest } = vars;
      return rest;
    });
  }

  /**
   * Remove a constant by key
   */
  removeConstant(key: string): void {
    this._constants.update(consts => {
      const { [key]: removed, ...rest } = consts;
      return rest;
    });
  }

  /**
   * Get a variable value by key
   */
  getVariable(key: string): string | undefined {
    return this._variables()[key];
  }

  /**
   * Get a constant value by key
   */
  getConstant(key: string): string | undefined {
    return this._constants()[key];
  }

  /**
   * Check if a variable exists
   */
  hasVariable(key: string): boolean {
    return key in this._variables();
  }

  /**
   * Check if a constant exists
   */
  hasConstant(key: string): boolean {
    return key in this._constants();
  }

  /**
   * Clear all variables
   */
  clearVariables(): void {
    this._variables.set({});
  }

  /**
   * Clear all constants
   */
  clearConstants(): void {
    this._constants.set({});
  }

  /**
   * Clear both variables and constants
   */
  clearAll(): void {
    this.clearVariables();
    this.clearConstants();
  }

  /**
   * Validate a variable/constant key
   * Returns error message if invalid, undefined if valid
   */
  validateKey(key: string, type: 'variable' | 'constant'): string | undefined {
    if (!key || key.trim().length === 0) {
      return 'Key cannot be empty';
    }

    // Check for valid identifier pattern (alphanumeric, underscore, no spaces)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      return 'Key must start with a letter or underscore and contain only letters, numbers, and underscores';
    }

    // Check for reserved keywords
    const reserved = ['if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'function', 'return', 'var', 'let', 'const'];
    if (reserved.includes(key.toLowerCase())) {
      return `"${key}" is a reserved keyword`;
    }

    return undefined;
  }

  /**
   * Get all variable keys
   */
  getVariableKeys(): string[] {
    return Object.keys(this._variables());
  }

  /**
   * Get all constant keys
   */
  getConstantKeys(): string[] {
    return Object.keys(this._constants());
  }

  /**
   * Replace variable placeholders in a string
   * Example: "Alert level: ${severity}" -> "Alert level: CRITICAL"
   */
  interpolate(text: string, useConstants: boolean = true): string {
    if (!text) return text;

    let result = text;

    // Replace variables ${variableName}
    const vars = this._variables();
    Object.entries(vars).forEach(([key, value]) => {
      const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(pattern, value);
    });

    // Replace constants ${constantName} if enabled
    if (useConstants) {
      const consts = this._constants();
      Object.entries(consts).forEach(([key, value]) => {
        const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
        result = result.replace(pattern, value);
      });
    }

    return result;
  }

  /**
   * Find all variable references in a text
   * Returns array of variable keys found
   */
  findVariableReferences(text: string): string[] {
    if (!text) return [];

    const pattern = /\$\{(\w+)\}/g;
    const matches = text.matchAll(pattern);
    const keys = new Set<string>();

    for (const match of matches) {
      keys.add(match[1]);
    }

    return Array.from(keys);
  }

  /**
   * Check if all variable references in text are defined
   * Returns array of missing variable keys
   */
  findMissingReferences(text: string): string[] {
    const references = this.findVariableReferences(text);
    const missing: string[] = [];

    references.forEach(key => {
      if (!this.hasVariable(key) && !this.hasConstant(key)) {
        missing.push(key);
      }
    });

    return missing;
  }

  /**
   * Export variables and constants as JSON
   */
  exportToJSON(): { variables: Record<string, string>; constants: Record<string, string> } {
    return {
      variables: { ...this._variables() },
      constants: { ...this._constants() }
    };
  }

  /**
   * Import variables and constants from JSON
   */
  importFromJSON(data: { variables?: Record<string, string>; constants?: Record<string, string> }): void {
    if (data.variables) {
      this.setVariables(data.variables);
    }
    if (data.constants) {
      this.setConstants(data.constants);
    }
  }

  /**
   * Get variable/constant count
   */
  getVariableCount(): number {
    return Object.keys(this._variables()).length;
  }

  getConstantCount(): number {
    return Object.keys(this._constants()).length;
  }
}
