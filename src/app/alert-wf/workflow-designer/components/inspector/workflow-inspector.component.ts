import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowDesignerService } from '../../workflow-designer.service';
import { WorkflowVariablesService } from '../../workflow-variables.service';
import { WorkflowNodesConfigService } from '../../workflow-nodes-config.service';
import { NodeFieldConfig } from '../../workflow-designer.interfaces';

// Import child components
import { NodePropertiesComponent } from './node-properties.component';
import { WorkflowPropertiesComponent } from './workflow-properties.component';
import { WorkflowVariablesComponent } from './workflow-variables.component';
import { InspectorTabsComponent } from './inspector-tabs.component';
import type { InspectorTab } from './inspector-tabs.component';

@Component({
  selector: 'app-workflow-inspector',
  standalone: true,
  imports: [
    CommonModule,
    NodePropertiesComponent,
    WorkflowPropertiesComponent,
    WorkflowVariablesComponent,
    InspectorTabsComponent
  ],
  template: `
    <!-- Node Properties (when a node is selected) -->
    <app-node-properties
      *ngIf="selectedNode"
      [node]="selectedNode"
      [fields]="fields"
      (onRemove)="removeNode()"
      (onLabelChange)="updateLabelSilent($event)"
      (onLabelBlur)="updateLabel($event)"
      (onFieldChange)="handleFieldChange($event)"
      (onFieldBlur)="handleFieldBlur($event)">
    </app-node-properties>

    <!-- Workflow Properties & Variables (when no node is selected) -->
    <ng-container *ngIf="!selectedNode && currentWorkflow">
      <!-- Tabs Header -->
      <app-inspector-tabs
        [activeTab]="activeTab"
        (tabChange)="activeTab = $event">
      </app-inspector-tabs>

      <!-- Properties Tab Content -->
      <app-workflow-properties
        *ngIf="activeTab === 'properties'"
        [workflow]="currentWorkflow"
        [validation]="workflowValidation"
        (onFieldChange)="handleWorkflowFieldChange($event)"
        (onFieldInput)="handleWorkflowFieldInput($event)"
        (onMetadataFieldChange)="handleMetadataFieldChange($event)"
        (onMetadataFieldInput)="handleMetadataFieldInput($event)"
        (onMetadataFieldBooleanChange)="handleMetadataFieldBooleanChange($event)"
        (onMetadataFieldArrayChange)="handleMetadataFieldArrayChange($event)"
        (onMetadataFieldArrayInput)="handleMetadataFieldArrayInput($event)">
      </app-workflow-properties>

      <!-- Variables Tab Content -->
      <app-workflow-variables
        *ngIf="activeTab === 'variables'"
        [workflow]="currentWorkflow">
      </app-workflow-variables>
    </ng-container>
  `,
  styles: [`
    :host {
      @apply col-[3] row-[2] rounded-xl bg-white border overflow-hidden flex flex-col;
    }
  `]
})
export class WorkflowInspectorComponent {
  activeTab: InspectorTab = 'properties';
  
  constructor(
    public workflowService: WorkflowDesignerService,
    public variablesService: WorkflowVariablesService,
    private configService: WorkflowNodesConfigService
  ) {}

  get selectedNode() {
    return this.workflowService.selectedNode();
  }

  get currentWorkflow() {
    return this.workflowService.currentWorkflow();
  }

  get workflowValidation() {
    return this.workflowService.validateWorkflow();
  }

  get fields(): NodeFieldConfig[] {
    if (!this.selectedNode) return [];
    const config = this.configService.getNodeTypeConfig(this.selectedNode.type);
    return config?.properties || [];
  }

  // ============ Node Methods ============
  
  removeNode() {
    const node = this.selectedNode;
    if (node) {
      this.workflowService.removeNode(node.id);
    }
  }

  updateLabel(event: Event) {
    const target = event.target as HTMLInputElement;
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateNode(node.id, { label: target.value });
    }
  }

  updateLabelSilent(event: Event) {
    const target = event.target as HTMLInputElement;
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateNodeSilent(node.id, { label: target.value });
    }
  }

  handleFieldChange(data: { field: NodeFieldConfig; event: Event }) {
    const target = data.event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any = target.value;
    
    if (data.field.type === 'number') {
      value = value === '' ? null : Number(value);
    }
    
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateParam(node.id, data.field.key, value);
    }
  }

  handleFieldBlur(data: { field: NodeFieldConfig; event: Event }) {
    const target = data.event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any = target.value;
    
    if (data.field.type === 'number') {
      value = value === '' ? null : Number(value);
    }
    
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateParamSilent(node.id, data.field.key, value);
    }
  }

  // ============ Workflow Methods ============

  handleWorkflowFieldChange(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLInputElement | HTMLTextAreaElement;
    this.workflowService.updateWorkflowField(data.field, target.value);
  }

  handleWorkflowFieldInput(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLInputElement | HTMLTextAreaElement;
    this.workflowService.updateWorkflowFieldSilent(data.field, target.value);
  }

  handleMetadataFieldChange(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLInputElement | HTMLSelectElement;
    this.workflowService.updateWorkflowMetadata(data.field, target.value);
  }

  handleMetadataFieldInput(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLInputElement | HTMLSelectElement;
    this.workflowService.updateWorkflowMetadataSilent(data.field, target.value);
  }

  handleMetadataFieldBooleanChange(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLSelectElement;
    const value = target.value === '' ? undefined : target.value === 'true';
    this.workflowService.updateWorkflowMetadata(data.field, value);
  }

  handleMetadataFieldArrayChange(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLInputElement;
    const value = target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    this.workflowService.updateWorkflowMetadata(data.field, value);
  }

  handleMetadataFieldArrayInput(data: { field: string; event: Event }) {
    const target = data.event.target as HTMLInputElement;
    const value = target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    this.workflowService.updateWorkflowMetadataSilent(data.field, value);
  }
}
