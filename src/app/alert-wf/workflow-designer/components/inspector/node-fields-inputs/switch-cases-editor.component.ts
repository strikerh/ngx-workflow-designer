import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-switch-cases-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2">
      <!-- Case Inputs -->
      <div *ngFor="let caseValue of cases; let i = index; trackBy: trackByIndex" 
           class="flex items-center gap-2">
        <input type="text"
               class="flex-1 rounded-md border px-2 py-1 text-sm"
               [value]="caseValue"
               (input)="updateCase(i, $event)"
               (blur)="saveCases()"
               placeholder="Case value" />
        <button type="button"
                class="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                (click)="removeCase(i)"
                title="Remove case">
          ✕
        </button>
      </div>
      
      <!-- Add Case Button -->
      <button type="button"
              class="w-full px-2 py-1 border border-dashed border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50"
              (click)="addCase()">
        + Add Case
      </button>
    </div>
  `,
  styles: []
})
export class SwitchCasesEditorComponent implements OnChanges {
  @Input() nodeId: string = '';
  @Input() currentCases: string | string[] = '';
  
  @Output() casesChange = new EventEmitter<string>();

  cases: string[] = [''];
  private lastNodeId: string = '';

  ngOnChanges(changes: SimpleChanges) {
    // Re-initialize when node changes or initial load
    if (changes['nodeId'] || changes['currentCases']) {
      if (this.lastNodeId !== this.nodeId) {
        this.initializeCases();
        this.lastNodeId = this.nodeId;
      }
    }
  }

  private initializeCases() {
    if (!this.currentCases) {
      this.cases = [''];
    } else if (typeof this.currentCases === 'string') {
      this.cases = this.currentCases
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      if (this.cases.length === 0) {
        this.cases = [''];
      }
    } else if (Array.isArray(this.currentCases)) {
      this.cases = [...this.currentCases];
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  updateCase(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    this.cases[index] = target.value;
  }

  saveCases() {
    const validCases = this.cases.filter(c => c.trim().length > 0);
    const casesString = validCases.join(', ');
    this.casesChange.emit(casesString);
  }

  addCase() {
    this.cases.push('');
    this.cases = [...this.cases]; // Trigger change detection
  }

  removeCase(index: number) {
    this.cases.splice(index, 1);
    
    if (this.cases.length === 0) {
      this.cases = [''];
    }

    this.saveCases();
  }
}
