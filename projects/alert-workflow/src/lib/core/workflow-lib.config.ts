import { InjectionToken } from '@angular/core';
import type { PaletteCategoryConfig } from '../workflow-designer/workflow-designer.interfaces';

export interface WorkflowDesignerFeatureFlags {
  import: boolean;
  export: boolean;
  new: boolean;
  templates: boolean;
  save: boolean;
  workflowList: boolean;
  backButton?: boolean;
  backUrl?: string;
}

export interface WorkflowDesignerApiConfig {
  baseUrl: string;
  token?: string;
  templatesUrl?: string;
}

export interface WorkflowNodesConfigOptions {
  source?: 'ts' | 'json';
  jsonUrl?: string;
}

export interface WorkflowDesignerLibConfig {
  features: WorkflowDesignerFeatureFlags;
  api: WorkflowDesignerApiConfig;
  nodesConfig?: WorkflowNodesConfigOptions;
  palette?: {
    categories?: PaletteCategoryConfig[];
  };
}

export const WORKFLOW_LIB_CONFIG = new InjectionToken<WorkflowDesignerLibConfig>(
  'WORKFLOW_LIB_CONFIG'
);
