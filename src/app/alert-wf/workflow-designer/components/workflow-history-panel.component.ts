import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePageRef, SidePageData, SIDE_PAGE_DATA, SIDE_PAGE_REF } from '../../../core/services/side-page.service';
import { WorkflowDesignerService } from '../workflow-designer.service';

@Component({
  selector: 'app-workflow-history-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Workflow History</h2>
        <button 
          (click)="close()"
          class="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <div *ngIf="historyStack.length === 0" class="text-center text-gray-500 py-8">
          No history available
        </div>

        <div *ngFor="let entry of historyStack; let i = index" 
             class="mb-3 group cursor-pointer"
             (click)="jumpToState(entry.index)"
             [class.bg-blue-50]="entry.isCurrent"
             [class.hover:bg-gray-50]="!entry.isCurrent">
          <div class="flex items-start gap-3 p-3 rounded-lg border"
               [class.border-blue-300]="entry.isCurrent"
               [class.border-gray-200]="!entry.isCurrent">
            
            <!-- Index Badge -->
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                 [class.bg-blue-500]="entry.isCurrent"
                 [class.text-white]="entry.isCurrent"
                 [class.bg-gray-100]="!entry.isCurrent"
                 [class.text-gray-600]="!entry.isCurrent">
              {{ entry.index }}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ entry.description || 'Untitled change' }}
                </span>
                <span *ngIf="entry.isCurrent" 
                      class="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Current
                </span>
              </div>
              <div class="text-xs text-gray-500" *ngIf="entry.timestamp">
                {{ formatTime(entry.timestamp) }}
              </div>
            </div>

            <!-- Arrow indicator for current -->
            <div *ngIf="entry.isCurrent" class="flex-shrink-0 text-blue-500">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <div class="text-xs text-gray-600 space-y-1">
          <p>💡 <strong>Tip:</strong> Click any entry to jump to that state</p>
          <p class="text-gray-500">Total states: {{ historyStack.length }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    /* Custom scrollbar */
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
export class WorkflowHistoryPanelComponent {
  readonly data: SidePageData | null = inject(SIDE_PAGE_DATA, { optional: true });
  readonly ref: SidePageRef<WorkflowHistoryPanelComponent> = inject(SIDE_PAGE_REF, {
    optional: true
  }) || {
    close: () => undefined,
    data: this.data || {}
  };
  
  constructor(private workflowService: WorkflowDesignerService) {}

  get historyStack() {
    return this.workflowService.getHistoryStack();
  }

  formatTime(timestamp: Date): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  jumpToState(targetIndex: number) {
    const historyInfo = this.workflowService.canUndo;
    const currentHistory = this.workflowService.getHistoryStack();
    const currentIndex = currentHistory.findIndex(h => h.isCurrent);
    
    const diff = targetIndex - currentIndex;
    
    if (diff > 0) {
      // Redo multiple times
      for (let i = 0; i < diff; i++) {
        this.workflowService.redo();
      }
    } else if (diff < 0) {
      // Undo multiple times
      for (let i = 0; i < Math.abs(diff); i++) {
        this.workflowService.undo();
      }
    }
  }

  close() {
    this.ref.close();
  }
}
