import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WorkflowNode, NodeFieldConfig } from '../../workflow-designer.interfaces';
import { NodeFieldsEditorComponent } from './node-fields-editor.component';
import { WorkflowDesignerService } from '../../workflow-designer.service';

@Component({
  selector: 'app-node-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, FloatLabelModule, ButtonModule, TooltipModule, NodeFieldsEditorComponent],
  template: `
    <div class="h-full p-4 overflow-y-auto flex flex-col">
      <div class="flex items-center justify-between min-h-9 mb-2">
        <div class="flex items-center gap-2">
          @if (isHtmlIcon(getNodeIcon())) {
            <div class="text-lg flex items-center" [innerHTML]="getSafeIcon(getNodeIcon())"></div>
          } @else {
            <span class="text-lg">{{ getNodeIcon() }}</span>
          }
          <h3 class="text-base font-semibold">{{ node.label }}</h3>
        </div>
        <p-button 
          severity="danger"
          size="small"
          [outlined]="true"
          [text]="true"
          icon="pi pi-trash"
          label="Remove"
          (onClick)="onRemove.emit()"
          [pTooltip]="'Remove this node'"
          tooltipPosition="left">
        </p-button>
      </div>
      
      <div class="mt-3 space-y-4">
        <!-- Label -->
        <div>
          <p-floatlabel variant="on">
            <input
              pInputText
              class="w-full"
              [value]="node.label"
              (input)="onLabelChange.emit($event)"
              (blur)="onLabelBlur.emit($event)" />
            <label>Label</label>
          </p-floatlabel>
        </div>
        <!-- Dynamic Fields -->
        <app-node-fields-editor
        class=" flex flex-col gap-4"
          [node]="node"
          [fields]="fields"
          (fieldChange)="onFieldChange.emit($event)"
          (fieldBlur)="onFieldBlur.emit($event)">
        </app-node-fields-editor>

        <!-- Node Info -->
        <div class="pt-2 border-t text-[11px] space-y-1">
          <!-- <p class="text-slate-500">ID: {{ node.id }}</p> -->
          <p class="text-slate-500">Type: {{ node.type }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      @apply flex flex-col h-full;
    }

    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class NodePropertiesComponent {
  @Input({ required: true }) node!: WorkflowNode;
  @Input({ required: true }) fields: NodeFieldConfig[] = [];
  
  @Output() onRemove = new EventEmitter<void>();
  @Output() onLabelChange = new EventEmitter<Event>();
  @Output() onLabelBlur = new EventEmitter<Event>();
  @Output() onFieldChange = new EventEmitter<{ field: NodeFieldConfig; event: Event }>();
  @Output() onFieldBlur = new EventEmitter<{ field: NodeFieldConfig; event: Event }>();

  constructor(
    private workflowService: WorkflowDesignerService,
    private sanitizer: DomSanitizer
  ) {}

  getNodeIcon(): string {
    return this.workflowService.getTypeIcon(this.node.type);
  }

  // Check if icon contains HTML markup
  isHtmlIcon(icon: string): boolean {
    if (!icon) return false;
    return icon.includes('<') || icon.includes('>');
  }

  // Get sanitized HTML icon
  getSafeIcon(icon: string): SafeHtml {
    if (!icon) return '';
    return this.sanitizer.sanitize(1, icon) || '';
  }
}
