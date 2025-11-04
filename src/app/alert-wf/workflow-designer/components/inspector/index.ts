/**
 * Inspector Module - Barrel Export
 * 
 * This module contains all the refactored components for the workflow inspector.
 * The inspector has been split into focused, reusable components for better maintainability.
 */

export { WorkflowInspectorComponent } from './workflow-inspector.component';
export { NodePropertiesComponent } from './node-properties.component';
export { NodeFieldsEditorComponent } from './node-fields-editor.component';
export { SwitchCasesEditorComponent } from './node-fields-inputs';
export { WorkflowPropertiesComponent } from './workflow-properties.component';
export { WorkflowMetadataComponent } from './workflow-metadata.component';
export { WorkflowVariablesComponent } from './workflow-variables.component';
export { InspectorTabsComponent } from './inspector-tabs.component';
export type { InspectorTab } from './inspector-tabs.component';
