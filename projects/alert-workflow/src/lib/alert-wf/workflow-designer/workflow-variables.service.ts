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

export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'alert.id', label: 'Alert ID', description: 'Unique identifier of the alert', category: 'Alert' },
  { key: 'alert.type', label: 'Alert Type', description: 'Type of alert (e.g., FIRE, MEDICAL)', category: 'Alert' },
  { key: 'alert.severity', label: 'Alert Severity', description: 'Severity level (CRITICAL, HIGH, MEDIUM, LOW)', category: 'Alert' },
  { key: 'alert.message', label: 'Alert Message', description: 'Alert message text', category: 'Alert' },
  { key: 'alert.location', label: 'Alert Location', description: 'Location where alert was triggered', category: 'Alert' },
  { key: 'alert.timestamp', label: 'Alert Timestamp', description: 'When the alert was created', category: 'Alert' },
  { key: 'alert.source', label: 'Alert Source', description: 'Source system or device', category: 'Alert' },
  { key: 'user.id', label: 'User ID', description: 'Current user identifier', category: 'User' },
  { key: 'user.name', label: 'User Name', description: 'Current user full name', category: 'User' },
  { key: 'user.email', label: 'User Email', description: 'Current user email address', category: 'User' },
  { key: 'user.role', label: 'User Role', description: 'Current user role', category: 'User' },
  { key: 'user.department', label: 'User Department', description: 'Current user department', category: 'User' },
  { key: 'workflow.id', label: 'Workflow ID', description: 'Current workflow instance ID', category: 'Workflow' },
  { key: 'workflow.name', label: 'Workflow Name', description: 'Name of the workflow', category: 'Workflow' },
  { key: 'workflow.startTime', label: 'Workflow Start Time', description: 'When workflow execution started', category: 'Workflow' },
  { key: 'system.date', label: 'Current Date', description: 'Current system date', category: 'System' },
  { key: 'system.time', label: 'Current Time', description: 'Current system time', category: 'System' },
  { key: 'system.datetime', label: 'Current DateTime', description: 'Current system date and time', category: 'System' },
  { key: 'system.timezone', label: 'System Timezone', description: 'System timezone', category: 'System' },
  { key: 'node.output', label: 'Previous Node Output', description: 'Output from previous node', category: 'Node Data' },
  { key: 'node.status', label: 'Previous Node Status', description: 'Status of previous node execution', category: 'Node Data' },
];

@Injectable({ providedIn: 'root' })
export class WorkflowVariablesService {
  private _variables = signal<Record<string, string>>({});
  private _constants = signal<Record<string, string>>({});

  variables = computed(() => this._variables());
  constants = computed(() => this._constants());

  getVariablesArray(): WorkflowVariable[] {
    const vars = this._variables();
    return Object.entries(vars).map(([key, value]) => ({ key, value }));
  }

  getConstantsArray(): WorkflowConstant[] {
    const consts = this._constants();
    return Object.entries(consts).map(([key, value]) => ({ key, value }));
  }

  setVariables(variables: Record<string, string>): void {
    this._variables.set(variables || {});
  }

  setConstants(constants: Record<string, string>): void {
    this._constants.set(constants || {});
  }

  setVariable(key: string, value: string): void {
    this._variables.update(vars => ({ ...vars, [key]: value }));
  }

  setConstant(key: string, value: string): void {
    this._constants.update(consts => ({ ...consts, [key]: value }));
  }

  removeVariable(key: string): void {
    this._variables.update(vars => {
      const { [key]: removed, ...rest } = vars;
      return rest;
    });
  }

  removeConstant(key: string): void {
    this._constants.update(consts => {
      const { [key]: removed, ...rest } = consts;
      return rest;
    });
  }

  getVariable(key: string): string | undefined {
    return this._variables()[key];
  }

  getConstant(key: string): string | undefined {
    return this._constants()[key];
  }

  hasVariable(key: string): boolean {
    return key in this._variables();
  }

  hasConstant(key: string): boolean {
    return key in this._constants();
  }

  clearVariables(): void {
    this._variables.set({});
  }

  clearConstants(): void {
    this._constants.set({});
  }

  clearAll(): void {
    this.clearVariables();
    this.clearConstants();
  }

  validateKey(key: string, type: 'variable' | 'constant'): string | undefined {
    if (!key || key.trim().length === 0) return 'Key cannot be empty';
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      return 'Key must start with a letter or underscore and contain only letters, numbers, and underscores';
    }
    const reserved = ['if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'function', 'return', 'var', 'let', 'const'];
    if (reserved.includes(key.toLowerCase())) return `"${key}" is a reserved keyword`;
    return undefined;
  }

  getVariableKeys(): string[] {
    return Object.keys(this._variables());
  }

  getConstantKeys(): string[] {
    return Object.keys(this._constants());
  }

  interpolate(text: string, useConstants: boolean = true): string {
    if (!text) return text;
    let result = text;
    const vars = this._variables();
    Object.entries(vars).forEach(([key, value]) => {
      const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(pattern, value);
    });

    if (useConstants) {
      const consts = this._constants();
      Object.entries(consts).forEach(([key, value]) => {
        const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
        result = result.replace(pattern, value);
      });
    }

    return result;
  }
}
