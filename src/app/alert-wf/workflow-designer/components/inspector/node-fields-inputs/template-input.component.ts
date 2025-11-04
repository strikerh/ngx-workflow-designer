import { Component, forwardRef, input, signal, effect, ElementRef, ViewChild, inject, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkflowVariablesService, TemplateVariable, DEFAULT_TEMPLATE_VARIABLES } from '../../../workflow-variables.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

/**
 * Template Input Component
 * 
 * Advanced text input that supports variable insertion with autocomplete.
 * When user types '{', shows a dropdown of available variables to insert.
 * 
 * Usage:
 * <app-template-input
 *   [(ngModel)]="message"
 *   [multiline]="true"
 *   [placeholder]="Enter message with {variables}">
 * </app-template-input>
 */
@Component({
  selector: 'app-template-input',
  standalone: true,
  imports: [CommonModule, FormsModule, FloatLabelModule, InputTextModule, TextareaModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TemplateInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full mt-2">
      <!-- Single line input -->
      @if (!multiline()) {
        <p-floatlabel variant="on">
          <input
            #inputElement
            pInputText
            type="text"
            [value]="value() "
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
            (blur)="onBlur()"
            (focus)="onFocus()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            class="w-full font-mono text-sm"
            [class.bg-gray-50]="readonly()"
          />
          <label>{{ placeholder() }}</label>
        </p-floatlabel>
      }

      <!-- Multi-line textarea -->
      @if (multiline()) {
        <p-floatlabel variant="on">
          <textarea
            #textareaElement
            pInputTextarea
            [value]="value() || ''"
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
            (blur)="onBlur()"
            (focus)="onFocus()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [rows]="rows()"
            class="w-full font-mono text-sm"
            [class.bg-gray-50]="readonly()"
            [class.cursor-not-allowed]="readonly()"
          ></textarea>
          <label>{{ placeholder() }}</label>
        </p-floatlabel>
      }

      <!-- Variable Autocomplete Dropdown -->
      @if (showAutocomplete() && filteredVariables().length > 0) {
        <div 
          class="fixed z-50 w-full max-w-[330px] bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto"
          [style.top.px]="dropdownPosition().top"
          [style.left.px]="dropdownPosition().left">

          
          <!-- Header -->
          <div class="px-3 py-2 bg-gray-50 border-b sticky top-0">
            <div class="text-xs font-semibold text-gray-700">
              Insert Variable
            </div>
            <div class="text-xs text-gray-500">
              {{ filteredVariables().length }} available
            </div>
          </div>

          <!-- Variable List -->
          <div class="py-1">
            @for (variable of filteredVariables(); track variable.key; let idx = $index) {
              <button
                type="button"
                (click)="insertVariable(variable)"
                (mouseenter)="selectedIndex.set(idx)"
                [class.bg-blue-50]="selectedIndex() === idx"
                class="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 focus:outline-none transition-colors">
                <div class="flex items-start gap-2">
                  <span class="text-blue-600 text-xs mt-0.5">📋</span>
                  <div class="flex-1 min-w-0">
                    <div class="font-mono text-sm font-medium text-gray-900 truncate">
                      {{ '{' }}{{ variable.key }}{{ '}' }}
                    </div>
                    @if (variable.label) {
                      <div class="text-xs text-gray-600">
                        {{ variable.label }}
                      </div>
                    }
                    @if (variable.description) {
                      <div class="text-xs text-gray-500 truncate">
                        {{ variable.description }}
                      </div>
                    }
                  </div>
                  @if (variable.category) {
                    <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {{ variable.category }}
                    </span>
                  }
                </div>
              </button>
            }
          </div>

          <!-- Footer hint -->
          <div class="px-3 py-2 bg-gray-50 border-t sticky bottom-0">
            <div class="text-xs text-gray-500">
              ↑↓ Navigate • Enter to select • Esc to close
            </div>
          </div>
        </div>
      }

      <!-- Helper text showing available variables hint -->
      @if (!showAutocomplete() && allAvailableVariables().length > 0) {
        <div class="mt-1 text-xs text-gray-500">
          Type <span class="font-mono bg-gray-100 px-1 rounded">{{ '{' }}</span> to insert variables
          <span class="ml-2 text-gray-400">({{ allAvailableVariables().length }} available)</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class TemplateInputComponent implements ControlValueAccessor {
  // Services
  private variablesService = inject(WorkflowVariablesService);

  // Inputs
  placeholder = input<string>('');
  multiline = input<boolean>(false);
  rows = input<number>(4);
  readonly = input<boolean>(false); // Add readonly support
  availableVariables = input<TemplateVariable[]>([]);

  // View children
  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('textareaElement') textareaElement?: ElementRef<HTMLTextAreaElement>;

  // State
  value = signal<string>(' ');
  disabled = signal<boolean>(false);
  showAutocomplete = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedIndex = signal<number>(0);
  cursorPosition = signal<number>(0);
  dropdownPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  // Computed - Combine default, workflow, and custom variables
  allAvailableVariables = computed(() => {
    const customVars = this.availableVariables();
    const workflowVars = this.getWorkflowVariables();
    const defaultVars = DEFAULT_TEMPLATE_VARIABLES;

    // Combine all variables (custom takes priority, then workflow, then defaults)
    const combined = [...workflowVars, ...defaultVars, ...customVars];
    
    // Remove duplicates based on key
    const uniqueMap = new Map<string, TemplateVariable>();
    combined.forEach(v => {
      if (!uniqueMap.has(v.key)) {
        uniqueMap.set(v.key, v);
      }
    });

    return Array.from(uniqueMap.values());
  });

  filteredVariables = signal<TemplateVariable[]>([]);

  // Form control callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Watch for search query changes and filter variables
    effect(() => {
      const query = this.searchQuery().toLowerCase();
      const filtered = this.allAvailableVariables().filter(v => 
        v.key.toLowerCase().includes(query) ||
        v.label.toLowerCase().includes(query) ||
        (v.description?.toLowerCase().includes(query) ?? false)
      );
      this.filteredVariables.set(filtered);
      this.selectedIndex.set(0); // Reset selection when filtering
    });
  }

  /**
   * Get variables from workflow variables service
   */
  private getWorkflowVariables(): TemplateVariable[] {
    const variables: TemplateVariable[] = [];

    // Add workflow variables
    this.variablesService.getVariablesArray().forEach(v => {
      variables.push({
        key: v.key,
        label: v.key,
        description: v.description || `Variable: ${v.value}`,
        category: 'Workflow Variables'
      });
    });

    // Add workflow constants
    this.variablesService.getConstantsArray().forEach(c => {
      variables.push({
        key: c.key,
        label: c.key,
        description: c.description || `Constant: ${c.value}`,
        category: 'Workflow Constants'
      });
    });

    return variables;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    setTimeout(() => {
       this.value.set(value || '');
    }, 1);
   
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const newValue = target.value;
    const cursorPos = target.selectionStart ?? 0;

    this.value.set(newValue);
    this.cursorPosition.set(cursorPos);
    this.onChange(newValue);

    // Check if we should show autocomplete
    this.checkForAutocomplete(newValue, cursorPos);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showAutocomplete()) return;

    const filtered = this.filteredVariables();
    const selected = this.selectedIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.set(Math.min(selected + 1, filtered.length - 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.set(Math.max(selected - 1, 0));
        break;

      case 'Enter':
      case 'Tab':
        if (filtered.length > 0) {
          event.preventDefault();
          this.insertVariable(filtered[selected]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.closeAutocomplete();
        break;
    }
  }

  onFocus(): void {
    const element = this.getInputElement();
    if (element) {
      const cursorPos = element.selectionStart ?? 0;
      this.checkForAutocomplete(this.value(), cursorPos);
    }
  }

  onBlur(): void {
    this.onTouched();
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => this.closeAutocomplete(), 200);
  }

  // Autocomplete logic
  private checkForAutocomplete(text: string, cursorPos: number): void {
    // Find the last '{' before cursor position
    const beforeCursor = text.substring(0, cursorPos);
    const lastOpenBrace = beforeCursor.lastIndexOf('{');

    if (lastOpenBrace === -1) {
      this.closeAutocomplete();
      return;
    }

    // Check if there's a closing brace between the open brace and cursor
    const textBetween = text.substring(lastOpenBrace + 1, cursorPos);
    if (textBetween.includes('}')) {
      this.closeAutocomplete();
      return;
    }

    // Extract search query (text between { and cursor)
    const query = textBetween.trim();
    this.searchQuery.set(query);

    // Calculate dropdown position
    this.calculateDropdownPosition();

    // Show autocomplete
    this.showAutocomplete.set(true);
  }

  private calculateDropdownPosition(): void {
    const element = this.getInputElement();
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 264; // max-h-64 = 256px + padding
    const gap = 4; // Gap between input and dropdown
    
    // For single-line input: position below or above the input
    if (!this.multiline()) {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let finalTop: number;
      
      // Check if dropdown fits below the input
      if (spaceBelow >= dropdownHeight + gap) {
        // Position below
        finalTop = rect.bottom + gap;
      } else if (spaceAbove >= dropdownHeight + gap) {
        // Position above
        finalTop = rect.top - dropdownHeight - gap;
      } else {
        // Not enough space either way, prefer below but limit height
        finalTop = rect.bottom + gap;
      }
      
      this.dropdownPosition.set({
        top: finalTop,
        left: rect.left
      });
    } else {
      // For textarea: try to position near cursor
      const lineHeight = 24; // Approximate line height
      const cursorPos = this.cursorPosition();
      const text = this.value().substring(0, cursorPos);
      const lines = text.split('\n').length;
      
      // Calculate approximate vertical position based on line count
      const approximateCursorTop = rect.top + (lines * lineHeight);
      const spaceBelow = viewportHeight - approximateCursorTop;
      const spaceAbove = approximateCursorTop - rect.top;
      
      let finalTop: number;
      
      // Check if dropdown fits below the cursor line
      if (spaceBelow >= dropdownHeight + gap) {
        // Position below cursor
        finalTop = approximateCursorTop + gap;
      } else if (spaceAbove >= dropdownHeight + gap) {
        // Position above cursor
        finalTop = approximateCursorTop - dropdownHeight - gap;
      } else if (spaceBelow > spaceAbove) {
        // More space below, position below
        finalTop = approximateCursorTop + gap;
      } else {
        // More space above, position above
        finalTop = Math.max(approximateCursorTop - dropdownHeight - gap, 10);
      }
      
      this.dropdownPosition.set({
        top: finalTop,
        left: rect.left
      });
    }
  }

  insertVariable(variable: TemplateVariable): void {
    const currentValue = this.value();
    const cursorPos = this.cursorPosition();

    // Find the position of the last '{' before cursor
    const beforeCursor = currentValue.substring(0, cursorPos);
    const lastOpenBrace = beforeCursor.lastIndexOf('{');

    if (lastOpenBrace === -1) {
      this.closeAutocomplete();
      return;
    }

    // Build new value: before '{' + variable + after cursor
    const before = currentValue.substring(0, lastOpenBrace);
    const after = currentValue.substring(cursorPos);
    const variableText = `{${variable.key}}`;
    const newValue = before + variableText + after;

    // Update value
    this.value.set(newValue);
    this.onChange(newValue);

    // Close autocomplete
    this.closeAutocomplete();

    // Set cursor position after the inserted variable
    const newCursorPos = before.length + variableText.length;
    setTimeout(() => {
      const element = this.getInputElement();
      if (element) {
        element.focus();
        element.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }

  private closeAutocomplete(): void {
    this.showAutocomplete.set(false);
    this.searchQuery.set('');
    this.selectedIndex.set(0);
  }

  private getInputElement(): HTMLInputElement | HTMLTextAreaElement | null {
      return this.multiline() 
      ? this.textareaElement?.nativeElement ?? null
      : this.inputElement?.nativeElement ?? null;
  }
}