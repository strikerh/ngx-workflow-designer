import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ApiWorkflow } from '../../../core/services/workflow-api.service';

@Component({
  selector: 'app-workflow-metadata',
  standalone: true,
  imports: [CommonModule, FormsModule, FloatLabelModule, InputTextModule, SelectModule],
  template: `
    <div class="space-y-3">
      <h4 class="text-sm font-medium text-slate-700 pt-2 border-t">Metadata</h4>
      
      <!-- Category -->
      <div>
        <p-floatlabel variant="on">
          <input
            pInputText
            id="metadataCategory"
            class="w-full"
            [value]="workflow.metadata?.category || ''"
            (input)="metadataFieldInput.emit({ field: 'category', event: $event })"
            (blur)="metadataFieldChange.emit({ field: 'category', event: $event })" />
          <label for="metadataCategory">Category</label>
        </p-floatlabel>
      </div>

      <!-- Priority -->
      <div>
        <p-floatlabel variant="on">
          <p-select
            id="metadataPriority"
            styleClass="w-full"
            [options]="priorityOptions"
            optionLabel="label"
            optionValue="value"
            [ngModel]="workflow.metadata?.priority || ''"
            (ngModelChange)="onPriorityChange($event)"
            placeholder="">
          </p-select>
          <label for="metadataPriority">Priority</label>
        </p-floatlabel>
      </div>

      <!-- Author -->
      <div>
        <p-floatlabel variant="on">
          <input
            pInputText
            id="metadataAuthor"
            class="w-full"
            [value]="workflow.metadata?.author || ''"
            (input)="metadataFieldInput.emit({ field: 'author', event: $event })"
            (blur)="metadataFieldChange.emit({ field: 'author', event: $event })" />
          <label for="metadataAuthor">Author</label>
        </p-floatlabel>
      </div>

      <!-- Version -->
      <div>
        <p-floatlabel variant="on">
          <input
            pInputText
            id="metadataVersion"
            class="w-full"
            [value]="workflow.metadata?.version || ''"
            (input)="metadataFieldInput.emit({ field: 'version', event: $event })"
            (blur)="metadataFieldChange.emit({ field: 'version', event: $event })" />
          <label for="metadataVersion">Version</label>
        </p-floatlabel>
      </div>

      <!-- Approval Status -->
      <div>
        <p-floatlabel variant="on">
          <p-select
            id="metadataApproval"
            styleClass="w-full"
            [options]="approvalOptions"
            optionLabel="label"
            optionValue="value"
            [ngModel]="workflow.metadata?.approved ?? ''"
            (ngModelChange)="onApprovalChange($event)"
            placeholder="">
          </p-select>
          <label for="metadataApproval">Approval Status</label>
        </p-floatlabel>
      </div>

      <!-- Tags -->
      <div>
        <p-floatlabel variant="on">
          <input
            pInputText
            id="metadataTags"
            class="w-full"
            [value]="(workflow.metadata?.tags || []).join(', ')"
            (input)="metadataFieldArrayInput.emit({ field: 'tags', event: $event })"
            (blur)="metadataFieldArrayChange.emit({ field: 'tags', event: $event })" />
          <label for="metadataTags">Tags (comma separated)</label>
        </p-floatlabel>
      </div>
    </div>
  `,
  styles: []
})
export class WorkflowMetadataComponent {
  @Input({ required: true }) workflow!: Partial<ApiWorkflow>;
  
  @Output() metadataFieldChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() metadataFieldInput = new EventEmitter<{ field: string; event: Event }>();
  @Output() metadataFieldBooleanChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() metadataFieldArrayChange = new EventEmitter<{ field: string; event: Event }>();
  @Output() metadataFieldArrayInput = new EventEmitter<{ field: string; event: Event }>();

  constructor() {
    console.log(this.workflow)
  }
  priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
  ];

  approvalOptions = [
    { label: '✅ Approved', value: 'true' },
    { label: '⏳ Pending', value: 'false' }
  ];

  onPriorityChange(value: string) {
    // Create a synthetic event object
    const syntheticEvent = {
      target: { value },
      type: 'change'
    } as any;
    this.metadataFieldChange.emit({ field: 'priority', event: syntheticEvent });
  }

  onApprovalChange(value: string) {
    // Create a synthetic event object
    const syntheticEvent = {
      target: { value },
      type: 'change'
    } as any;
    this.metadataFieldBooleanChange.emit({ field: 'approved', event: syntheticEvent });
  }
}
