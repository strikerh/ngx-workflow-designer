import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { WorkflowNode, NodeFieldConfig, GenericSelectorOptions, DynamicSelectOptions, FieldCondition } from '../../workflow-designer.interfaces';
import { 
  SwitchCasesEditorComponent, 
  UserSelectorComponent,
  UserGroupSelectorComponent,
  GenericSelectorComponent,
  DynamicSelectComponent,
  TemplateInputComponent
} from './node-fields-inputs';
import { MarkdownHelpPipe } from './markdown-help.pipe';
import { WorkflowDesignerService } from '../../workflow-designer.service';

@Component({
  selector: 'app-node-fields-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FloatLabelModule,
    InputTextModule,
    SwitchCasesEditorComponent, 
    UserSelectorComponent,
    UserGroupSelectorComponent,
    GenericSelectorComponent,
    DynamicSelectComponent,
    TemplateInputComponent,
    MarkdownHelpPipe
  ],
  template: `
    @for (field of fields; track field.key) {
      @if (shouldShowField(field)) {
        <div class="" [class.field-invalid]="field.required && isFieldInvalid(field.key)">
          
          @switch (field.type) {
          <!-- Select Dropdown (using Dynamic Select) -->
          @case ('select') {
            <app-dynamic-select
              [label]="field.label"
              [placeholder]="field.placeholder || 'Select...'"
              [showSearch]="getDynamicSelectOptions(field).showSearch !== undefined ? getDynamicSelectOptions(field).showSearch! : (getDynamicSelectOptions(field).options?.length || 0) > 5"
              [icon]="field.icon"
              [options]="getDynamicSelectOptions(field).options"
              [endpoint]="getDynamicSelectOptions(field).endpoint"
              [valueField]="getDynamicSelectOptions(field).valueField || 'id'"
              [displayField]="getDynamicSelectOptions(field).displayField || 'name'"
              [secondaryDisplayField]="getDynamicSelectOptions(field).secondaryDisplayField"
              [responseDataPath]="getDynamicSelectOptions(field).responseDataPath"
              [appendOptions]="getDynamicSelectOptions(field).appendOptions"
              [currentValue]="getFieldValue(field.key)"
              (valueChange)="handleDynamicSelectChange($event, field)">
            </app-dynamic-select>
          }
          
          <!-- Switch Cases Editor -->
          @case ('switch-cases') {
        <label class="block text-xs text-slate-600 mb-1">{{ field.label }}</label>

            <app-switch-cases-editor
              [nodeId]="node.id"
              [currentCases]="getFieldValue('cases')"
              (casesChange)="handleSwitchCasesChange($event)">
            </app-switch-cases-editor>
          }
          
          <!-- User Selector (users only) -->
          @case ('user-selector') {
            <app-user-selector
              [nodeId]="node.id"
              [title]="field.label"
              [currentValue]="getFieldValue(field.key)"
              (selectionChange)="handleUserSelectorChange($event, field)">
            </app-user-selector>
          }
          
          <!-- User Group Selector (groups only) -->
          @case ('user-group-selector') {
            <app-user-group-selector
              [nodeId]="node.id"
              [title]="field.label"
              [currentValue]="getFieldValue(field.key)"
              (selectionChange)="handleUserGroupSelectorChange($event, field)">
            </app-user-group-selector>
          }
          
          <!-- Generic Selector (configurable endpoint) -->
          @case ('generic-selector') {
            <app-generic-selector 
              [nodeId]="node.id"
              [title]="field.label"
              [endpoint]="getGenericOptions(field).endpoint || ''"
              [valueField]="getGenericOptions(field).valueField || 'id'"
              [primaryDisplayField]="getGenericOptions(field).primaryDisplayField || 'name'"
              [secondaryDisplayField]="getGenericOptions(field).secondaryDisplayField"
              [searchFields]="getGenericOptions(field).searchFields"
              [icon]="field.icon"
              [searchLabel]="getGenericOptions(field).searchLabel"
              [searchPlaceholder]="getGenericOptions(field).searchPlaceholder || field.placeholder"
              [selectedLabel]="getGenericOptions(field).selectedLabel"
              [emptyStateMessage]="getGenericOptions(field).emptyStateMessage"
              [responseDataPath]="getGenericOptions(field).responseDataPath"
              [currentValue]="getFieldValue(field.key)"
              (selectionChange)="handleGenericSelectorChange($event, field)">
            </app-generic-selector>
          }
          
          <!-- Textarea with Template Support -->
          @case ('textarea') {
            <app-template-input
              [multiline]="true"
              [rows]="4"
              [readonly]="field.readonly || false"
              [placeholder]="field.label + (field.icon ? ' ' + field.icon : '')"
              [(ngModel)]="node.params[field.key]"
              (ngModelChange)="handleTemplateInputChange(field, $event)">
            </app-template-input>
          }
          
          <!-- Number Input -->
          @case ('number') {
            <p-floatlabel variant="on">
              <input
                pInputText
                type="number"
                id="numberField-{{field.key}}"
                class="w-full"
                [class.ng-invalid]="field.required && isFieldInvalid(field.key)"
                [value]="getFieldValue(field.key) ?? ''"
                [readonly]="field.readonly || false"
                [class.bg-gray-50]="field.readonly"
                [class.cursor-not-allowed]="field.readonly"
                (input)="handleFieldInput(field, $event)"
                (blur)="handleFieldChange(field, $event)" />
              <label for="numberField-{{field.key}}">
                {{ field.label }}
                @if (field.required && isFieldInvalid(field.key)) {
                  <span class="text-red-500">*</span>
                }
              </label>
            </p-floatlabel>
          }
          
          <!-- Text Input with Template Support (Default) -->
          @default {
            <app-template-input
              [multiline]="false"
              [readonly]="field.readonly || false"
              [placeholder]="field.label + (field.icon ? ' ' + field.icon : '')"
              [(ngModel)]="node.params[field.key]"
              (ngModelChange)="handleTemplateInputChange(field, $event)">
            </app-template-input>
          }
        }
        
          <!-- Help Text with Markdown Support -->
          @if (field.help || field.helpText) {
            <div 
              class="text-[10px] text-slate-400 mt-1 leading-relaxed"
              [innerHTML]="(field.help || field.helpText) | markdownHelp">
            </div>
          }
        </div>
      }
    }
  `,
  styles: [`
    :host ::ng-deep .field-invalid input,
    :host ::ng-deep .field-invalid textarea,
    :host ::ng-deep .field-invalid .p-select,
    :host ::ng-deep .field-invalid .border {
      border-color: #ef4444 !important;
      border-width: 2px !important;
    }
    
    :host ::ng-deep .field-invalid label {
      color: #ef4444;
    }
  `]
})
export class NodeFieldsEditorComponent {
  @Input({ required: true }) node!: WorkflowNode;
  @Input({ required: true }) fields: NodeFieldConfig[] = [];
  
  @Output() fieldChange = new EventEmitter<{ field: NodeFieldConfig; event: Event }>();
  @Output() fieldBlur = new EventEmitter<{ field: NodeFieldConfig; event: Event }>();

  constructor(private workflowService: WorkflowDesignerService) {}

  /**
   * Check if a field is invalid (after validation)
   */
  isFieldInvalid(fieldKey: string): boolean {
    return this.workflowService.isFieldInvalid(this.node.id, fieldKey);
  }

  /**
   * Check if field should be shown based on conditional visibility rules
   */
  shouldShowField(field: NodeFieldConfig): boolean {
    if (!field.showIf) return true; // No conditions, always show
    
    // Handle both single condition and array of conditions
    const conditions = Array.isArray(field.showIf) ? field.showIf : [field.showIf];
    
    // All conditions must be met (AND logic)
    return conditions.every(condition => this.evaluateCondition(condition));
  }

  /**
   * Evaluate a single field condition
   */
  private evaluateCondition(condition: FieldCondition): boolean {
    const watchFieldValue = this.getFieldValue(condition.watchField);
    
    switch (condition.operator) {
      case 'equals':
        return watchFieldValue === condition.value;
      
      case 'notEquals':
        return watchFieldValue !== condition.value;
      
      case 'includes':
        // Check if value is in array (works for both arrays and strings)
        if (Array.isArray(condition.value)) {
          return condition.value.includes(watchFieldValue);
        }
        return String(watchFieldValue).includes(String(condition.value));
      
      case 'notIncludes':
        // Check if value is NOT in array (works for both arrays and strings)
        if (Array.isArray(condition.value)) {
          return !condition.value.includes(watchFieldValue);
        }
        return !String(watchFieldValue).includes(String(condition.value));
      
      case 'greaterThan':
        return Number(watchFieldValue) > Number(condition.value);
      
      case 'lessThan':
        return Number(watchFieldValue) < Number(condition.value);
      
      default:
        console.warn(`Unknown condition operator: ${condition.operator}`);
        return false;
    }
  }

  getFieldValue(key: string): any {
    const value = this.node.params?.[key];
    
    // Check field type
    const field = this.fields.find(f => f.key === key);
    
    // Handle user-selector (users only - array of numbers)
    if (field?.type === 'user-selector' && typeof value === 'string' && value) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    // Handle user-group-selector (groups only - array of numbers)
    if (field?.type === 'user-group-selector' && typeof value === 'string' && value) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    // Handle generic-selector (array of numbers or strings)
    if (field?.type === 'generic-selector' && typeof value === 'string' && value) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    // If no value exists and field has a default, use the default
    if ((value === undefined || value === null || value === '') && field?.default !== undefined) {
      return field.default;
    }
    
    return value ?? '';
  }

  handleFieldInput(field: NodeFieldConfig, event: Event) {
    // Clear red highlight when user starts typing
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // Emit for silent updates (no history)
    this.fieldBlur.emit({ field, event });
  }

  handleFieldChange(field: NodeFieldConfig, event: Event) {
    // Clear red highlight when field changes
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // Emit for final updates (with history)
    this.fieldChange.emit({ field, event });
  }

  handleSwitchCasesChange(casesString: string) {
    // Create a synthetic event for switch cases
    const syntheticEvent = {
      target: { value: casesString }
    } as any;
    
    const casesField = this.fields.find(f => f.key === 'cases');
    if (casesField) {
      // Clear red highlight when cases change
      if (this.isFieldInvalid(casesField.key)) {
        this.workflowService.clearFieldHighlight(this.node.id, casesField.key);
      }
      
      this.fieldChange.emit({ field: casesField, event: syntheticEvent });
    }
  }
  
  handleUserSelectorChange(userIds: number[], field: NodeFieldConfig) {
    // Clear red highlight when user selection changes
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // Serialize the user IDs array
    const serialized = JSON.stringify(userIds);
    
    const syntheticEvent = {
      target: { value: serialized }
    } as any;
    
    this.fieldChange.emit({ field, event: syntheticEvent });
  }
  
  handleUserGroupSelectorChange(groupIds: number[], field: NodeFieldConfig) {
    // Clear red highlight when group selection changes
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // Serialize the group IDs array
    const serialized = JSON.stringify(groupIds);
    
    const syntheticEvent = {
      target: { value: serialized }
    } as any;
    
    this.fieldChange.emit({ field, event: syntheticEvent });
  }
  
  handleGenericSelectorChange(values: (number | string)[], field: NodeFieldConfig) {
    // Clear red highlight when generic selector changes
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // Serialize the values array (can be numbers or strings)
    const serialized = JSON.stringify(values);
    
    const syntheticEvent = {
      target: { value: serialized }
    } as any;
    
    this.fieldChange.emit({ field, event: syntheticEvent });
  }

  handleDynamicSelectChange(value: string | number, field: NodeFieldConfig) {
    // Clear red highlight when dynamic select changes
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // For dynamic select, value is a single string or number
    const syntheticEvent = {
      target: { value: value }
    } as any;
    
    this.fieldChange.emit({ field, event: syntheticEvent });
    
    // Check if this select has auto-set field rules
    const options = this.getDynamicSelectOptions(field);
    if (options.autoSetFields && options.autoSetFields.length > 0) {
      // Find matching rule for the selected value
      const matchingRule = options.autoSetFields.find(rule => rule.triggerValue === value);
      
      if (matchingRule && matchingRule.fieldUpdates) {
        // Auto-set other fields based on the rule
        Object.entries(matchingRule.fieldUpdates).forEach(([fieldKey, fieldValue]) => {
          // Find the field configuration
          const targetField = this.fields.find(f => f.key === fieldKey);
          
          if (targetField) {
            // Create synthetic event for each field update
            const autoSetEvent = {
              target: { value: fieldValue }
            } as any;
            
            // Emit the field change event
            this.fieldChange.emit({ field: targetField, event: autoSetEvent });
          }
        });
      }
    }
  }

  handleTemplateInputChange(field: NodeFieldConfig, value: string) {
    // Clear red highlight when template input changes
    if (this.isFieldInvalid(field.key)) {
      this.workflowService.clearFieldHighlight(this.node.id, field.key);
    }
    
    // For template input, value is a string with template variables
    const syntheticEvent = {
      target: { value: value }
    } as any;
    
    this.fieldChange.emit({ field, event: syntheticEvent });
  }

  // Helper method to get generic selector options from field
  getGenericOptions(field: NodeFieldConfig): GenericSelectorOptions {
    return (field.options as GenericSelectorOptions) || {} as GenericSelectorOptions;
  }

  // Helper method to get dynamic select options from field
  getDynamicSelectOptions(field: NodeFieldConfig): DynamicSelectOptions {
    return (field.options as DynamicSelectOptions) || {} as DynamicSelectOptions;
  }
}
