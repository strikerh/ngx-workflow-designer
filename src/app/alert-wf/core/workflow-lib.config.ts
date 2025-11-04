import { InjectionToken } from '@angular/core';
import { PaletteCategoryConfig } from '../workflow-designer/workflow-designer.interfaces';

export interface WorkflowDesignerFeatureFlags {
  import: boolean;
  export: boolean;
  new: boolean;
  templates: boolean;
  save: boolean;
  workflowList: boolean; // if you embed a list view elsewhere
  /** Show/Hide the Back button in the header */
  backButton?: boolean;
  /** Route URL to navigate when Back is clicked (defaults to '/') */
  backUrl?: string;
}

export interface WorkflowDesignerApiConfig {
  baseUrl: string; // e.g. https://demo.quexlo.com:8443/api/workflow
  token?: string;  // Bearer ...
  /** Optional separate endpoint for templates listing */
  templatesUrl?: string;
}

export interface WorkflowDesignerLibConfig {
  features: WorkflowDesignerFeatureFlags;
  api: WorkflowDesignerApiConfig;
  // Optional extension point for custom nodes/types; shape kept generic to avoid coupling
  nodesConfig?: unknown;
  // Optional palette configuration (categories, order, labels)
  palette?: {
    categories?: PaletteCategoryConfig[];
  };
}

export const WORKFLOW_LIB_CONFIG = new InjectionToken<WorkflowDesignerLibConfig>(
  'WORKFLOW_LIB_CONFIG'
);
