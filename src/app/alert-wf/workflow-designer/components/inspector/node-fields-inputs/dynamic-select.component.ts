import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslocoPipe } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * DynamicSelectComponent
 * 
 * A flexible single-select dropdown that supports:
 * - Static array of options
 * - Dynamic data from API endpoint
 * - Optional search/filter functionality
 * - Configurable display fields
 * - Append static options to endpoint results (e.g., "Other", "Custom")
 * 
 * Example Usage with Static Array:
 * ```typescript
 * <app-dynamic-select
 *   [label]="'Method'"
 *   [options]="['GET', 'POST', 'PUT', 'DELETE']"
 *   [showSearch]="false"
 *   [currentValue]="'POST'"
 *   (valueChange)="handleChange($event)">
 * </app-dynamic-select>
 * ```
 * 
 * Example Usage with API Endpoint:
 * ```typescript
 * <app-dynamic-select
 *   [label]="'Select User'"
 *   [endpoint]="'https://api.example.com/users'"
 *   [valueField]="'id'"
 *   [displayField]="'name'"
 *   [showSearch]="true"
 *   [currentValue]="5"
 *   (valueChange)="handleChange($event)">
 * </app-dynamic-select>
 * ```
 * 
 * Example Usage with Appended Options:
 * ```typescript
 * <app-dynamic-select
 *   [label]="'SMS Template'"
 *   [endpoint]="'api/templates'"
 *   [appendOptions]="[{value: 0, label: 'Custom Message', separator: true}]"
 *   (valueChange)="handleChange($event)">
 * </app-dynamic-select>
 * ```
 */
@Component({
  selector: 'app-dynamic-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    FloatLabelModule,
    TranslocoPipe
  ],
  template: `
    <div class="w-full mt-2">
      <p-floatlabel variant="on">
        <p-select 
          [options]="displayOptions" 
          [(ngModel)]="selectedValue"
          [filter]="showSearch"
          [showClear]="false"
          [placeholder]="placeholder || 'Select...'"
          (onChange)="onValueChange()"
          [optionLabel]="isEndpointMode ? displayField : undefined"
          [optionValue]="isEndpointMode ? valueField : undefined"
          class="w-full"
          appendTo="body">
          
          @if (isEndpointMode && (displayField || secondaryDisplayField)) {
            <ng-template #item let-item>
              <div class="flex items-center gap-2 py-1">
                @if (icon) {
                  @if (isHtmlIcon()) {
                    <span class="text-lg" [innerHTML]="getSafeIcon()"></span>
                  } @else {
                    <span class="text-lg">{{ icon }}</span>
                  }
                }
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ getNestedProperty(item, displayField) }}</div>
                  @if (secondaryDisplayField && getNestedProperty(item, secondaryDisplayField)) {
                    <div class="text-xs text-slate-500">{{ getNestedProperty(item, secondaryDisplayField) }}</div>
                  }
                </div>
              </div>
            </ng-template>
          }
        </p-select>
        <label>{{ label || 'Select' | transloco }}</label>
      </p-floatlabel>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class DynamicSelectComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  // Configuration inputs
  @Input() label: string = 'Select';
  @Input() placeholder: string = 'Select...';
  @Input() showSearch: boolean = false;
  @Input() icon?: string;

  // Static array mode
  @Input() options?: string[] | any[];

  // Endpoint mode
  @Input() endpoint?: string;
  @Input() valueField: string = 'id';
  @Input() displayField: string = 'name';
  @Input() secondaryDisplayField?: string;
  @Input() responseDataPath?: string;
  
  // Append static options to endpoint results
  @Input() appendOptions?: Array<{
    value: string | number;
    label: string;
    secondaryLabel?: string;
    icon?: string;
    separator?: boolean;
  }>;

  // Current value
  @Input() currentValue?: string | number;

  // Output
  @Output() valueChange = new EventEmitter<string | number>();

  // Internal state
  selectedValue: string | number | undefined;
  displayOptions: any[] = [];
  isEndpointMode: boolean = false;

  ngOnInit() {
    // Determine mode
    this.isEndpointMode = !!this.endpoint;

    // Initialize selected value
    this.selectedValue = this.currentValue;

    // Load data
    if (this.isEndpointMode) {
      this.loadFromEndpoint();
    } else if (this.options) {
      this.loadFromStaticArray();
    }
  }

  /**
   * Load options from static array
   */
  private loadFromStaticArray() {
    if (!this.options) {
      this.displayOptions = [];
      return;
    }

    // Check if options are simple strings or objects
    if (this.options.length > 0 && typeof this.options[0] === 'string') {
      // Simple string array - use as-is
      this.displayOptions = this.options;
    } else {
      // Array of objects - use as-is
      this.displayOptions = this.options;
    }
  }

  /**
   * Load options from API endpoint
   */
  private loadFromEndpoint() {
    if (!this.endpoint) {
      console.warn('DynamicSelect: endpoint mode but no endpoint provided');
      return;
    }

    this.http.get<any>(this.endpoint).subscribe({
      next: (response) => {
        // Extract data from response using path if provided
        let data = response;
        if (this.responseDataPath) {
          data = this.getNestedProperty(response, this.responseDataPath);
        }

        // Ensure data is an array
        if (Array.isArray(data)) {
          this.displayOptions = data;
          
          // Append static options if provided
          this.appendStaticOptions();
        } else {
          console.error('DynamicSelect: API response is not an array', data);
          this.displayOptions = [];
        }
      },
      error: (error) => {
        console.error('DynamicSelect: Failed to load options from endpoint', error);
        this.displayOptions = [];
      }
    });
  }

  /**
   * Append static options to the list (e.g., "Other", "Custom")
   */
  private appendStaticOptions() {
    if (!this.appendOptions || this.appendOptions.length === 0) return;
    
    // Convert appendOptions to match the endpoint format
    const staticOptions = this.appendOptions.map(option => {
      const obj: any = {};
      obj[this.valueField] = option.value;
      obj[this.displayField] = option.label;
      if (option.secondaryLabel && this.secondaryDisplayField) {
        obj[this.secondaryDisplayField] = option.secondaryLabel;
      }
      // Add separator marker if needed
      if (option.separator) {
        obj._separator = true;
      }
      return obj;
    });
    
    // Append to display options
    this.displayOptions = [...this.displayOptions, ...staticOptions];
  }

  /**
   * Handle value change
   */
  onValueChange() {
    this.valueChange.emit(this.selectedValue);
  }

  /**
   * Get nested property from object using dot notation
   * e.g., getNestedProperty(obj, 'user.profile.name')
   */
  getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) return '';
    
    return path.split('.').reduce((current, prop) => {
      return current?.[prop];
    }, obj) || '';
  }

  /**
   * Check if icon is HTML markup (contains < or >)
   */
  isHtmlIcon(): boolean {
    if (!this.icon) return false;
    return this.icon.includes('<') || this.icon.includes('>');
  }

  /**
   * Get sanitized HTML for icon
   */
  getSafeIcon(): SafeHtml {
    if (!this.icon) return '';
    return this.sanitizer.sanitize(1, this.icon) || '';
  }
}
