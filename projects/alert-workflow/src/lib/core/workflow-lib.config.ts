import { InjectionToken } from '@angular/core';
import type { PaletteCategoryConfig, NodeTypeConfig } from '../workflow-designer/workflow-designer.interfaces';

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
    /**
     * Optional: Provide node type configurations directly from the host app.
     * If provided, these take precedence over JSON/TS defaults and will be
     * merged with WORKFLOW_NODE_TYPES (if any) by type.
     */
    nodeTypes?: NodeTypeConfig[];
  };
}

export const WORKFLOW_LIB_CONFIG = new InjectionToken<WorkflowDesignerLibConfig>(
  'WORKFLOW_LIB_CONFIG'
);
