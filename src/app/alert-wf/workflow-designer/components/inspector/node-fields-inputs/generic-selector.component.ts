import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslocoPipe } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';

/**
 * GenericSelectorComponent
 * 
 * A reusable, configurable selector component that can fetch data from any endpoint
 * and display it in a search-and-add pattern.
 * 
 * Features:
 * - Configurable endpoint URL
 * - Configurable display fields (primary, secondary)
 * - Configurable value field (what gets stored)
 * - Configurable search fields
 * - Auto-filtering (removes selected items from dropdown)
 * - Search-and-add pattern
 * 
 * Example Usage:
 * ```typescript
 * <app-generic-selector
 *   [nodeId]="node.id"
 *   [title]="'Select Items'"
 *   [endpoint]="'https://api.example.com/items'"
 *   [valueField]="'id'"
 *   [primaryDisplayField]="'name'"
 *   [secondaryDisplayField]="'description'"
 *   [searchFields]="['name', 'description', 'code']"
 *   [currentValue]="[1, 2, 3]"
 *   (selectionChange)="handleChange($event)">
 * </app-generic-selector>
 * ```
 */
@Component({
  selector: 'app-generic-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    FloatLabelModule,
    TranslocoPipe
  ],
  template: `
    <div class="space-y-4 border-t pt-2 mt-4">
      <!-- Header -->
      <h3 class="font-semibold text-sm text-slate-700">
        {{ title || 'Select Items' }}
      </h3>

      <!-- Search and Add Items -->
      <div class="space-y-2">
        <!-- <label class="block text-xs text-slate-600">{{ searchLabel || "Search Items" | transloco }}</label> -->
        <p-floatlabel variant="on">
          <p-select 
            [options]="availableItems" 
            [(ngModel)]="selectedItem"
            [filter]="true"
            [showClear]="false"
            (onChange)="onItemSelected()"
            [optionLabel]="primaryDisplayField"
            [optionValue]="valueField"
            class="w-full"
            appendTo="body">
            <ng-template #item let-item>
              <div class="flex items-center gap-2 py-1">
                @if (icon) {
                  @if (isHtmlIcon()) {
                    <span [innerHTML]="getSafeIcon()"></span>
                  } @else {
                    <span class="text-lg">{{ icon }}</span>
                  }
                } @else {
                  <span class="text-lg">📋</span>
                }
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ getNestedProperty(item, primaryDisplayField) }}</div>
                  @if (secondaryDisplayField && getNestedProperty(item, secondaryDisplayField)) {
                    <div class="text-xs text-slate-500">{{ getNestedProperty(item, secondaryDisplayField) }}</div>
                  }
                </div>
              </div>
            </ng-template>
          </p-select>
          <label for="item-select">{{ searchLabel || "Search Items" | transloco }}</label>
        </p-floatlabel>
      </div>

      <!-- Selected Items List -->
      @if (selectedItemIds.length > 0) {
        <div class="space-y-2">
          <label class="block text-xs text-slate-600 font-semibold">{{ selectedLabel || "Selected Items" | transloco }} ({{ selectedItemIds.length }})</label>
          <div class="border rounded-md divide-y max-h-64 overflow-y-auto">
            @for (itemId of selectedItemIds; track itemId) {
              <div class="flex items-center justify-between p-3 hover:bg-slate-50">
                <div class="flex items-center gap-2 flex-1">
                  @if (icon) {
                    @if (isHtmlIcon()) {
                      <span [innerHTML]="getSafeIcon()"></span>
                    } @else {
                      <span class="text-lg">{{ icon }}</span>
                    }
                  } @else {
                    <span class="text-lg">📋</span>
                  }
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm truncate">{{ getItemPrimaryDisplay(itemId) }}</div>
                    @if (secondaryDisplayField && getItemSecondaryDisplay(itemId)) {
                      <div class="text-xs text-slate-500 truncate">{{ getItemSecondaryDisplay(itemId) }}</div>
                    }
                  </div>
                </div>
                <button 
                  type="button"
                  (click)="removeItem(itemId)"
                  class="text-red-500 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded">
                  {{ "Remove" | transloco }}
                </button>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-400">
          @if (icon) {
            @if (isHtmlIcon()) {
              <p class="mb-1" [innerHTML]="getSafeIcon()"></p>
            } @else {
              <p class="text-lg mb-1">{{ icon }}</p>
            }
          } @else {
            <p class="text-lg mb-1">📋</p>
          }
          <p>{{ emptyStateMessage || "No items selected" | transloco }}</p>
          <p class="text-xs mt-1">{{ "Search and select items above" | transloco }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class GenericSelectorComponent implements OnInit {
  // Configuration inputs
  @Input() nodeId: string = '';
  @Input() title?: string;
  @Input() endpoint: string = ''; // API endpoint to fetch data
  @Input() valueField: string = 'id'; // Field to use as value (e.g., 'id', 'userId', 'code')
  @Input() primaryDisplayField: string = 'name'; // Field to display as primary text (e.g., 'name', 'title')
  @Input() secondaryDisplayField?: string; // Optional field for secondary text (e.g., 'email', 'description')
  @Input() searchFields?: string[]; // Fields to search on (not used in current filtering, but available for future)
  @Input() icon?: string; // Icon to display (e.g., '📋', '🏢', '👤')
  @Input() searchLabel?: string; // Label for search field
  @Input() searchPlaceholder?: string; // Placeholder for search field
  @Input() selectedLabel?: string; // Label for selected items list
  @Input() emptyStateMessage?: string; // Message when no items selected
  @Input() responseDataPath?: string; // Path to data in response (e.g., 'results', 'data.items')
  @Input() currentValue: number[] | string[] | null = null; // Current selected values
  
  @Output() selectionChange = new EventEmitter<(number | string)[]>();

  // Services
  private _destroyed$ = new Subject<void>();
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  // Data sources
  allItems: any[] = [];

  // Selected items
  selectedItemIds: (number | string)[] = [];

  // Temporary selection holder
  selectedItem: number | string | null = null;

  ngOnInit() {
    this.loadData();
    
    // Initialize with current value if provided
    if (this.currentValue) {
      this.selectedItemIds = this.currentValue;
    }
  }

  private loadData() {
    if (!this.endpoint) {
      console.error('GenericSelectorComponent: endpoint is required');
      return;
    }

    this.http.get<any>(this.endpoint).subscribe({
      next: (response: any) => {
        // Handle nested response data path (e.g., 'results', 'data.items')
        if (this.responseDataPath) {
          this.allItems = this.getNestedProperty(response, this.responseDataPath) || [];
        } else {
          // Try common patterns
          this.allItems = response?.results || response?.data || response || [];
        }

        // Ensure it's an array
        if (!Array.isArray(this.allItems)) {
          console.error('GenericSelectorComponent: Response data is not an array', this.allItems);
          this.allItems = [];
        }
      },
      error: (error) => {
        console.error('GenericSelectorComponent: Error loading data from endpoint', this.endpoint, error);
        this.allItems = [];
      }
    });
  }

  // Computed property - items not yet selected
  get availableItems(): any[] {
    return this.allItems.filter(item => {
      const itemValue = this.getNestedProperty(item, this.valueField);
      return !this.selectedItemIds.includes(itemValue);
    });
  }

  onItemSelected() {
    if (this.selectedItem !== null && !this.selectedItemIds.includes(this.selectedItem)) {
      this.selectedItemIds.push(this.selectedItem);
      this.selectedItem = null; // Clear selection
      this.onSelectionChange();
    }
  }

  removeItem(itemId: number | string) {
    this.selectedItemIds = this.selectedItemIds.filter(id => id !== itemId);
    this.onSelectionChange();
  }

  // Helper method to get primary display text
  getItemPrimaryDisplay(itemId: number | string): string {
    const item = this.allItems.find(i => this.getNestedProperty(i, this.valueField) === itemId);
    return item ? this.getNestedProperty(item, this.primaryDisplayField) : 'Unknown';
  }

  // Helper method to get secondary display text
  getItemSecondaryDisplay(itemId: number | string): string {
    if (!this.secondaryDisplayField) return '';
    const item = this.allItems.find(i => this.getNestedProperty(i, this.valueField) === itemId);
    return item ? this.getNestedProperty(item, this.secondaryDisplayField) : '';
  }

  // Utility method to get nested object properties (e.g., 'user.profile.name')
  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  onSelectionChange() {
    this.selectionChange.emit(this.selectedItemIds);
  }

  // Public method to validate
  isValid(): boolean {
    return true; // Always valid, can be empty
  }

  // Public method to get all values
  getValue(): (number | string)[] {
    return this.selectedItemIds;
  }

  // Check if icon contains HTML markup
  isHtmlIcon(): boolean {
    if (!this.icon) return false;
    return this.icon.includes('<') || this.icon.includes('>');
  }

  // Get sanitized HTML icon
  getSafeIcon(): SafeHtml {
    if (!this.icon) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.icon);
  }
}
