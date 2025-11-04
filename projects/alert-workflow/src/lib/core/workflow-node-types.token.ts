import { InjectionToken } from '@angular/core';
import type { NodeTypeConfig } from '../workflow-designer/workflow-designer.interfaces';

/**
 * Provide this token with an array of NodeTypeConfig to override or extend
 * the default node types at runtime. Types are matched by `type` string.
 * - If a provided type matches an existing one, it will shallow-merge over it.
 * - If it is new, it will be added to the palette.
 */
export const WORKFLOW_NODE_TYPES = new InjectionToken<NodeTypeConfig[]>(
  'WORKFLOW_NODE_TYPES'
);
