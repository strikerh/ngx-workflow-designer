import { Provider } from '@angular/core';
import { WORKFLOW_LIB_CONFIG, WorkflowDesignerLibConfig } from './workflow-lib.config';
import { WORKFLOW_NODE_TYPES } from './workflow-node-types.token';
import type { NodeTypeConfig } from '../workflow-designer/workflow-designer.interfaces';

/** Helper to wire library configuration and optional node types in the host app. */
export function provideAlertWorkflow(
  config: WorkflowDesignerLibConfig,
  extraNodeTypes: NodeTypeConfig[] = []
): Provider[] {
  return [
    { provide: WORKFLOW_LIB_CONFIG, useValue: config },
    { provide: WORKFLOW_NODE_TYPES, useValue: extraNodeTypes }
  ];
}
