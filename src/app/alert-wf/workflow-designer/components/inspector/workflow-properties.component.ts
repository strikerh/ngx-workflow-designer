import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ApiWorkflow } from '../../../core/services/workflow-api.service';
import { WorkflowMetadataComponent } from './workflow-metadata.component';

interface WorkflowValidation {
  isValid: boolean;
  errors: string[];
}

@Component({
  selector: 'app-workflow-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, FloatLabelModule, InputTextModule, TextareaModule, WorkflowMetadataComponent],
  template: `
    <h3 class="ps-3 pt-2 text-sm font-semibold">Workflow Properties</h3>
    <div class="p-3 space-y-4 overflow-auto">
      <!-- Workflow ID (Read-only) -->
      <div>
        <p-floatlabel variant="on">
          <input
            pInputText
            id="workflowId"
            class="w-full font-mono"
            [class.text-slate-400]="!workflow.workflowId"
            [class.italic]="!workflow.workflowId"
            [value]="workflow.workflowId || 'Not saved yet'"
            readonly />
          <label for="workflowId">ID</label>
        </p-floatlabel>
      </div>

      <!-- Workflow Name -->
      <div>
        <p-floatlabel variant="on">
          <input
            pInputText
            id="workflowName"
            class="w-full"
            [class.ng-invalid]="!validation.isValid && (!workflow.name || workflow.name.trim() === '')"
            [value]="workflow.name || ''"
            (input)="onFieldInput.emit({ field: 'name', event: $event })"
            (blur)="onFieldChange.emit({ field: 'name', event: $event })" />
          <label for="workflowName">
            Workflow Name <span class="text-red-500">*</span>
          </label>
        </p-floatlabel>
        <p *ngIf="!validation.isValid && (!workflow.name || workflow.name.trim() === '')" 
           class="text-red-500 text-xs mt-1">
          Workflow name is required
        </p>
      </div>

      <!-- Workflow Description -->
      <div>
        <p-floatlabel variant="on">
          <textarea
            pInputTextarea
            id="workflowDescription"
            rows="3"
            class="w-full resize-y"
            [value]="workflow.description || ''"
            (input)="onFieldInput.emit({ field: 'description', event: $event })"
            (blur)="onFieldChange.emit({ field: 'description', event: $event })"></textarea>
          <label for="workflowDescription">Description</label>
        </p-floatlabel>
      </div>

      <!-- Metadata Section -->
      <app-workflow-metadata
        [workflow]="workflow"
        (metadataFieldChange)="handleMetadataChange($event)"
        (metadataFieldInput)="handleMetadataInput($event)"
        (metadataFieldBooleanChange)="handleMetadataBooleanChange($event)"
        (metadataFieldArrayChange)="handleMetadataArrayChange($event)"
        (metadataFieldArrayInput)="handleMetadataArrayInput($event)">
      </app-workflow-metadata>

      <!-- Timestamps -->
      <div class="pt-2 border-t text-[11px] space-y-1">
        <p class="text-slate-500" *ngIf="workflow.createdAt">
          Created: {{ workflow.createdAt | date:'short' }}
        </p>
        <p class="text-slate-500" *ngIf="workflow.modifiedAt">
          Updated: {{ workflow.modifiedAt | date:'short' }}
        </p>
      </div>
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
export class WorkflowPropertiesComponent {
  @Input({ required: true }) workflow!: Partial<ApiWorkflow>;
  @Input({ required: true }) validation!: WorkflowValidation;
  
  @Output() onFieldChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() onFieldInput = new EventEmitter<{ field: string; event: Event }>();
  @Output() onMetadataFieldChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() onMetadataFieldInput = new EventEmitter<{ field: string; event: Event }>();
  @Output() onMetadataFieldBooleanChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() onMetadataFieldArrayChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() onMetadataFieldArrayInput = new EventEmitter<{ field: string; event: Event }>();

  handleMetadataChange(data: { field: string; event: Event }) {
    this.onMetadataFieldChange.emit(data);
  }

  handleMetadataInput(data: { field: string; event: Event }) {
    this.onMetadataFieldInput.emit(data);
  }

  handleMetadataBooleanChange(data: { field: string; event: Event }) {
    this.onMetadataFieldBooleanChange.emit(data);
  }

  handleMetadataArrayChange(data: { field: string; event: Event }) {
    this.onMetadataFieldArrayChange.emit(data);
  }

  handleMetadataArrayInput(data: { field: string; event: Event }) {
    this.onMetadataFieldArrayInput.emit(data);
  }
}
