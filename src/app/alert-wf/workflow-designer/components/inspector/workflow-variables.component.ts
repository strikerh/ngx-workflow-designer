import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowVariablesService } from '../../workflow-variables.service';
import { ApiWorkflow } from '../../../core/services/workflow-api.service';

@Component({
  selector: 'app-workflow-variables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-3 space-y-3 overflow-auto">
      <div class="text-xs text-slate-600 mb-2">
        Define global variables that can be referenced throughout the workflow.
      </div>

      <!-- Variables List -->
      <div class="space-y-2">
        <div *ngFor="let varEntry of variables; let i = index; trackBy: trackByIndex" 
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
  `,
  styles: [`
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
export class WorkflowVariablesComponent implements OnChanges {
  @Input({ required: true }) workflow!: Partial<ApiWorkflow>;

  variables: Array<{ key: string; value: string }> = [];
  private variablesInitialized = false;
  private lastWorkflowId: number | string | null | undefined = null;

  constructor(private variablesService: WorkflowVariablesService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workflow']) {
      const workflowChanged = this.lastWorkflowId !== this.workflow?.workflowId;
      if (workflowChanged) {
        this.variablesInitialized = false;
        this.lastWorkflowId = this.workflow?.workflowId;
        this.initializeVariables();
      }
    }
  }

  private initializeVariables() {
    if (!this.workflow) {
      this.variables = [];
      return;
    }

    if (!this.variablesInitialized) {
      this.variables = this.variablesService.getVariablesArray();
      
      if (this.variables.length === 0) {
        this.variables = [{ key: '', value: '' }];
      }
      this.variablesInitialized = true;
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  updateVariableKey(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    this.variables[index].key = target.value;
  }

  updateVariableValue(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    this.variables[index].value = target.value;
  }

  saveVariables() {
    if (!this.workflow) return;

    const validVariables = this.variables
      .filter(v => v.key.trim().length > 0)
      .reduce((obj, v) => {
        obj[v.key.trim()] = v.value;
        return obj;
      }, {} as Record<string, string>);

    console.log('🔧 Variables Component: Saving variables:', validVariables);
    this.variablesService.setVariables(validVariables);
  }

  addVariable() {
    this.variables.push({ key: '', value: '' });
    this.variables = [...this.variables];
  }

  removeVariable(index: number) {
    this.variables.splice(index, 1);
    
    if (this.variables.length === 0) {
      this.variables = [{ key: '', value: '' }];
    }

    this.saveVariables();
  }
}
