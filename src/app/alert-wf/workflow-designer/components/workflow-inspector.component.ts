import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { WorkflowDesignerService } from '../workflow-designer.service';
import { WorkflowVariablesService } from '../workflow-variables.service';
import { WorkflowNodesConfigService } from '../workflow-nodes-config.service';
import { NodeFieldConfig } from '../workflow-designer.interfaces';

@Component({
  selector: 'app-workflow-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, FloatLabelModule],
  template: `

      <div class="h-full p-4 overflow-y-auto" *ngIf="selectedNode; else noSelection">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">{{ selectedNode.label }}</h3>
          <button 
            class="text-red-600 text-xs" 
            (click)="removeNode()">
            Remove
          </button>
        </div>
        
        <div class="mt-3 space-y-4">
          <!-- Label -->
          <div>
            <p-floatlabel variant="on">
              <input
                pInputText
                class="w-full"
                [value]="selectedNode.label"
                (input)="updateLabelSilent($event)"
                (blur)="updateLabel($event)" />
              <label>Label</label>
            </p-floatlabel>
          </div>

          <!-- Dynamic parameter fields -->
          <ng-container *ngFor="let field of fields; trackBy: trackField">
            <div>
              <label class="block text-xs text-slate-600 mb-1">{{ field.label }}</label>
              <ng-container [ngSwitch]="field.type">
                <select *ngSwitchCase="'select'"
                        class="w-full rounded-md border px-2 py-1 text-sm"
                        [value]="selectedNodeParams[field.key] ?? ''"
                        (change)="updateField(field, $event)">
                  <option value="" disabled *ngIf="!selectedNodeParams[field.key]">-- select --</option>
                  <option *ngFor="let opt of field.options" [value]="opt">{{ opt }}</option>
                </select>
                
                <!-- Dynamic Switch Cases Builder -->
                <div *ngSwitchCase="'switch-cases'" class="space-y-2">
                  <div *ngFor="let caseValue of getSwitchCases(); let i = index; trackBy: trackByIndex" 
                       class="flex items-center gap-2">
                    <input type="text"
                           class="flex-1 rounded-md border px-2 py-1 text-sm"
                           [value]="caseValue"
                           (input)="updateSwitchCase(i, $event)"
                           (blur)="saveSwitchCases()"
                           placeholder="Case value" />
                    <button type="button"
                            class="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                            (click)="removeSwitchCase(i)"
                            title="Remove case">
                      ✕
                    </button>
                  </div>
                  <button type="button"
                          class="w-full px-2 py-1 border border-dashed border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50"
                          (click)="addSwitchCase()">
                    + Add Case
                  </button>
                </div>
                
                <textarea *ngSwitchCase="'textarea'"
                          rows="3"
                          class="w-full rounded-md border px-2 py-1 text-sm resize-y"
                          [placeholder]="field.placeholder || ''"
                          (input)="updateFieldSilent(field, $event)"
                          (blur)="updateField(field, $event)">{{ selectedNodeParams[field.key] || '' }}</textarea>
                <input *ngSwitchCase="'number'"
                       type="number"
                       class="w-full rounded-md border px-2 py-1 text-sm"
                       [placeholder]="field.placeholder || ''"
                       [value]="selectedNodeParams[field.key] ?? ''"
                       (input)="updateFieldSilent(field, $event)"
                       (blur)="updateField(field, $event)" />
                <input *ngSwitchDefault
                       type="text"
                       class="w-full rounded-md border px-2 py-1 text-sm"
                       [placeholder]="field.placeholder || ''"
                       [value]="selectedNodeParams[field.key] ?? ''"
                       (input)="updateFieldSilent(field, $event)"
                       (blur)="updateField(field, $event)" />
              </ng-container>
              <p *ngIf="field.help" class="text-[10px] text-slate-400 mt-1">{{ field.help }}</p>
            </div>
          </ng-container>

          <div class="pt-2 border-t text-[11px] space-y-1">
            <p class="text-slate-500">ID: {{ selectedNode.id }}</p>
            <p class="text-slate-500">Type: {{ selectedNode.type }}</p>
          </div>
        </div>
      </div>

      <ng-template #noSelection>
        <!-- Tabs Header -->
        <div class="flex border-b">
          <button 
            class="flex-1 px-3 py-2 text-sm font-medium transition-colors"
            [class.text-indigo-600]="activeTab === 'properties'"
            [class.border-b-2]="activeTab === 'properties'"
            [class.border-indigo-600]="activeTab === 'properties'"
            [class.text-slate-600]="activeTab !== 'properties'"
            (click)="activeTab = 'properties'">
            Properties
          </button>
          <button 
            class="flex-1 px-3 py-2 text-sm font-medium transition-colors"
            [class.text-indigo-600]="activeTab === 'variables'"
            [class.border-b-2]="activeTab === 'variables'"
            [class.border-indigo-600]="activeTab === 'variables'"
            [class.text-slate-600]="activeTab !== 'variables'"
            (click)="activeTab = 'variables'">
            Variables
          </button>
        </div>

        <!-- Properties Tab Content -->
        <div class="p-3 space-y-4 overflow-auto" *ngIf="currentWorkflow && activeTab === 'properties'">

               <!-- Workflow ID (Read-only) -->
            <div>
              <label class="block text-xs text-slate-600 mb-1">ID</label>
              <div class="w-full rounded-md border px-2 py-1 bg-slate-50 font-mono text-xs"
                   [class.text-slate-400]="!currentWorkflow.workflowId"
                   [class.italic]="!currentWorkflow.workflowId">
                {{ currentWorkflow.workflowId || 'Not saved yet' }}
              </div>
            </div>


            
            <!-- Workflow Name -->
            <div>
              <label class="block text-xs text-slate-600 mb-1">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full rounded-md border px-2 py-1 text-sm"
                [class.border-red-300]="!workflowValidation.isValid && (!currentWorkflow.name || currentWorkflow.name.trim() === '')"
                [value]="currentWorkflow.name || ''"
                (input)="updateWorkflowFieldSilent('name', $event)"
                (blur)="updateWorkflowField('name', $event)"
                placeholder="Enter workflow name (required)" />
              <p *ngIf="!workflowValidation.isValid && (!currentWorkflow.name || currentWorkflow.name.trim() === '')" 
                 class="text-red-500 text-xs mt-1">
                Workflow name is required
              </p>
            </div>       

            <!-- Workflow Description -->
            <div>
              <label class="block text-xs text-slate-600 mb-1">Description</label>
              <textarea
                rows="3"
                class="w-full rounded-md border px-2 py-1 text-sm resize-y"
                [value]="currentWorkflow.description || ''"
                (input)="updateWorkflowFieldSilent('description', $event)"
                (blur)="updateWorkflowField('description', $event)"
                placeholder="Enter workflow description"></textarea>
            </div>

            <!-- Metadata Section -->
            <div class="space-y-3">
              <h4 class="text-sm font-medium text-slate-700 pt-2 border-t">Metadata</h4>
              
              <div>
                <label class="block text-xs text-slate-600 mb-1">Category</label>
                <input
                  class="w-full rounded-md border px-2 py-1 text-sm"
                  [value]="currentWorkflow.metadata?.category || ''"
                  (input)="updateMetadataFieldSilent('category', $event)"
                  (blur)="updateMetadataField('category', $event)"
                  placeholder="Enter category" />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">Priority</label>
                <select
                  class="w-full rounded-md border px-2 py-1 text-sm"
                  [value]="currentWorkflow.metadata?.priority || ''"
                  (change)="updateMetadataField('priority', $event)">
                  <option value="">-- Select Priority --</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">Author</label>
                <input
                  class="w-full rounded-md border px-2 py-1 text-sm"
                  [value]="currentWorkflow.metadata?.author || ''"
                  (input)="updateMetadataFieldSilent('author', $event)"
                  (blur)="updateMetadataField('author', $event)"
                  placeholder="Enter author name" />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">Version</label>
                <input
                  class="w-full rounded-md border px-2 py-1 text-sm"
                  [value]="currentWorkflow.metadata?.version || ''"
                  (input)="updateMetadataFieldSilent('version', $event)"
                  (blur)="updateMetadataField('version', $event)"
                  placeholder="e.g., 1.0.0" />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">Approval Status</label>
                <select
                  class="w-full rounded-md border px-2 py-1 text-sm"
                  [value]="currentWorkflow.metadata?.approved ?? ''"
                  (change)="updateMetadataFieldBoolean('approved', $event)">
                  <option value="">-- Select Status --</option>
                  <option value="true">✅ Approved</option>
                  <option value="false">⏳ Pending</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">Tags</label>
                <input
                  class="w-full rounded-md border px-2 py-1 text-sm"
                  [value]="(currentWorkflow.metadata?.tags || []).join(', ')"
                  (input)="updateMetadataFieldArraySilent('tags', $event)"
                  (blur)="updateMetadataFieldArray('tags', $event)"
                  placeholder="Enter tags separated by commas" />
              </div>
            </div>

            <!-- Timestamps -->
            <div class="pt-2 border-t text-[11px] space-y-1">
              <p class="text-slate-500" *ngIf="currentWorkflow.createdAt">
                Created: {{ currentWorkflow.createdAt | date:'short' }}
              </p>
              <p class="text-slate-500" *ngIf="currentWorkflow.modifiedAt">
                Updated: {{ currentWorkflow.modifiedAt | date:'short' }}
              </p>
            </div>
          </div>

        <!-- Variables Tab Content -->
        <div class="p-3 space-y-3 overflow-auto" *ngIf="currentWorkflow && activeTab === 'variables'">
          <div class="text-xs text-slate-600 mb-2">
            Define global variables that can be referenced throughout the workflow.
          </div>

          <!-- Variables List -->
          <div class="space-y-2">
            <div *ngFor="let varEntry of getWorkflowVariables(); let i = index; trackBy: trackByIndex" 
                 class="flex items-center gap-2 min-w-0">
              <!-- Variable Name -->
              <input type="text"
                     class="flex-1 min-w-0 rounded-md border px-2 py-1 text-sm font-mono"
                     [value]="varEntry.key"
                     (input)="updateVariableKey(i, $event)"
                     (blur)="saveVariables()"
                     placeholder="variableName" />
              <!-- Variable Value -->
              <input type="text"
                     class="flex-1 min-w-0 rounded-md border px-2 py-1 text-sm"
                     [value]="varEntry.value"
                     (input)="updateVariableValue(i, $event)"
                     (blur)="saveVariables()"
                     placeholder="value" />
              <!-- Remove Button -->
              <button type="button"
                      class="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      (click)="removeVariable(i)"
                      title="Remove variable">
                ✕
              </button>
            </div>
          </div>

          <!-- Add Variable Button -->
          <button type="button"
                  class="w-full px-2 py-1 border border-dashed border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50"
                  (click)="addVariable()">
            + Add Variable
          </button>
        </div>

      </ng-template>

  `,
  styles: [`
      :host {
          @apply col-[3] row-[2] rounded-xl bg-white border overflow-hidden flex flex-col;
      }
    /* Custom scrollbar for inspector panel */
    .overflow-auto::-webkit-scrollbar {
      width: 6px;
    }

    .overflow-auto::-webkit-scrollbar-track {
      background: transparent;
    }

    .overflow-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .overflow-auto::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class WorkflowInspectorComponent {
  activeTab: 'properties' | 'variables' = 'properties';
  
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

  get selectedNodeParams() {
    const node = this.selectedNode;
    return node ? (node.params || {}) : {};
  }

  get fields(): NodeFieldConfig[] {
    if (!this.selectedNode) return [];
    const config = this.configService.getNodeTypeConfig(this.selectedNode.type);
    return config?.properties || [];
  }

  trackField(index: number, field: NodeFieldConfig) { return field.key; }

  trackByIndex(index: number) { return index; }

  removeNode() {
    const node = this.selectedNode;
    if (node) {
      this.workflowService.removeNode(node.id);
    }
  }

  updateLabel(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateNode(node.id, { label: target.value });
    }
  }

  updateLabelSilent(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateNodeSilent(node.id, { label: target.value });
    }
  }

  updateField(field: NodeFieldConfig, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any = target.value;
    if (field.type === 'number') {
      value = value === '' ? null : Number(value);
    }
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateParam(node.id, field.key, value);
    }
  }

  updateFieldSilent(field: NodeFieldConfig, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any = target.value;
    if (field.type === 'number') {
      value = value === '' ? null : Number(value);
    }
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateParamSilent(node.id, field.key, value);
    }
  }

  updateWorkflowField(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    this.workflowService.updateWorkflowField(field, value);
  }

  updateWorkflowFieldSilent(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    this.workflowService.updateWorkflowFieldSilent(field, value);
  }

  updateMetadataField(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value;
    this.workflowService.updateWorkflowMetadata(field, value);
  }

  updateMetadataFieldSilent(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value;
    this.workflowService.updateWorkflowMetadataSilent(field, value);
  }

  updateMetadataFieldBoolean(field: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value === '' ? undefined : target.value === 'true';
    this.workflowService.updateWorkflowMetadata(field, value);
  }

  updateMetadataFieldArray(field: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    this.workflowService.updateWorkflowMetadata(field, value);
  }

  updateMetadataFieldArraySilent(field: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    this.workflowService.updateWorkflowMetadataSilent(field, value);
  }

  // Keeping original method for compatibility if referenced elsewhere
  updateParam(paramName: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const node = this.selectedNode;
    if (node) {
      this.workflowService.updateParam(node.id, paramName, target.value);
    }
  }

  // ============ Switch Cases Management ============
  
  private switchCasesTemp: string[] = [];
  private lastNodeId: string | null = null;
  private switchCasesInitialized = false;

  /**
   * Get current switch cases as an array
   */
  getSwitchCases(): string[] {
    const node = this.selectedNode;
    if (!node) {
      this.switchCasesInitialized = false;
      return [];
    }
    
    // Reset temp array if we switched to a different node
    if (this.lastNodeId !== node.id) {
      this.switchCasesTemp = [];
      this.lastNodeId = node.id;
      this.switchCasesInitialized = false;
    }
    
    const casesValue = node.params?.['cases'];
    
    // Initialize temp array ONLY on first access or after node change
    if (!this.switchCasesInitialized) {
      if (!casesValue) {
        this.switchCasesTemp = [''];
      } else if (typeof casesValue === 'string') {
        this.switchCasesTemp = casesValue
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0);
        if (this.switchCasesTemp.length === 0) {
          this.switchCasesTemp = [''];
        }
      } else if (Array.isArray(casesValue)) {
        this.switchCasesTemp = [...casesValue];
      }
      this.switchCasesInitialized = true;
    }
    
    return this.switchCasesTemp;
  }

  /**
   * Update a specific case value (real-time)
   */
  updateSwitchCase(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    this.switchCasesTemp[index] = target.value;
  }

  /**
   * Save switch cases to node (on blur)
   */
  saveSwitchCases() {
    const node = this.selectedNode;
    if (!node) return;

    // Filter out empty values
    const validCases = this.switchCasesTemp.filter(c => c.trim().length > 0);
    const casesString = validCases.join(', ');

    this.workflowService.updateParam(node.id, 'cases', casesString);
  }

  /**
   * Add a new empty case
   */
  addSwitchCase() {
    this.switchCasesTemp.push('');
    // Force Angular to detect change
    this.switchCasesTemp = [...this.switchCasesTemp];
  }

  /**
   * Remove a case by index
   */
  removeSwitchCase(index: number) {
    const node = this.selectedNode;
    if (!node) return;

    this.switchCasesTemp.splice(index, 1);
    
    // Ensure at least one empty case
    if (this.switchCasesTemp.length === 0) {
      this.switchCasesTemp = [''];
    }

    // Save immediately after removal
    const validCases = this.switchCasesTemp.filter(c => c.trim().length > 0);
    const casesString = validCases.join(', ');
    
    this.workflowService.updateParam(node.id, 'cases', casesString);
  }

  // ============ Workflow Variables Management ============

  private variablesTemp: Array<{ key: string; value: string }> = [];
  private variablesInitialized = false;
  private lastWorkflowId: number | string | null | undefined = null; // Track workflow changes

  /**
   * Get workflow variables as an array of key-value pairs
   * Now reads from the variables service
   */
  getWorkflowVariables(): Array<{ key: string; value: string }> {
    const workflow = this.currentWorkflow;
    if (!workflow) {
      this.variablesInitialized = false;
      this.lastWorkflowId = null;
      return [];
    }

    // Re-initialize if workflow changed
    const workflowChanged = this.lastWorkflowId !== workflow.workflowId;
    if (workflowChanged) {
      this.variablesInitialized = false;
      this.lastWorkflowId = workflow.workflowId;
    }

    // Initialize temp array ONLY on first access or after workflow change
    if (!this.variablesInitialized) {
      // Get variables from the service instead of workflow object
      this.variablesTemp = this.variablesService.getVariablesArray();
      
      // Always show at least one empty row
      if (this.variablesTemp.length === 0) {
        this.variablesTemp = [{ key: '', value: '' }];
      }
      this.variablesInitialized = true;
    }

    return this.variablesTemp;
  }

  /**
   * Update a variable key (real-time)
   */
  updateVariableKey(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    this.variablesTemp[index].key = target.value;
  }

  /**
   * Update a variable value (real-time)
   */
  updateVariableValue(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    this.variablesTemp[index].value = target.value;
  }

  /**
   * Save variables to workflow (on blur)
   * Now updates both the service and the workflow
   */
  saveVariables() {
    const workflow = this.currentWorkflow;
    if (!workflow) return;

    // Filter out entries with empty keys, convert to object
    const validVariables = this.variablesTemp
      .filter(v => v.key.trim().length > 0)
      .reduce((obj, v) => {
        obj[v.key.trim()] = v.value;
        return obj;
      }, {} as Record<string, string>);

    console.log('🔧 Inspector: Saving variables to workflow:', validVariables);
    
    // Update the workflow (which will also update the service)
    this.workflowService.updateWorkflowVariables(validVariables);
  }

  /**
   * Add a new empty variable
   */
  addVariable() {
    this.variablesTemp.push({ key: '', value: '' });
    // Force Angular to detect change
    this.variablesTemp = [...this.variablesTemp];
  }

  /**
   * Remove a variable by index
   */
  removeVariable(index: number) {
    this.variablesTemp.splice(index, 1);
    
    // Ensure at least one empty row
    if (this.variablesTemp.length === 0) {
      this.variablesTemp = [{ key: '', value: '' }];
    }

    // Save immediately after removal
    this.saveVariables();
  }
}
