import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { WorkflowDesignerService } from '../workflow-designer.service';

@Component({
  selector: 'app-workflow-validation-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="isVisible"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="validation-dialog"
      [style]="{ width: '500px', maxWidth: '90vw' }">
      
      <!-- Header -->
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          @if (validationResult()?.success) {
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          } @else {
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
          <span class="text-lg font-semibold">
            {{ validationResult()?.success ? 'Validation Passed' : 'Validation Failed' }}
          </span>
        </div>
      </ng-template>
      
      <!-- Content -->
      <div class="py-2">
        @if (validationResult()?.success) {
          <!-- Success Message -->
          <div class="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <p class="font-medium text-green-900">All validation checks passed!</p>
              <p class="text-sm text-green-700 mt-1">Your workflow is ready to be saved and executed.</p>
            </div>
          </div>
        } @else {
          <!-- Error List -->
          <div class="space-y-2">
            <p class="text-sm text-slate-600 mb-3">
              Found {{ validationResult()?.errors?.length || 0 }} issue(s) that need to be fixed:
            </p>
            
            @for (error of validationResult()?.errors || []; track error) {
              <div class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <svg class="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span class="text-sm text-red-900">{{ error }}</span>
              </div>
            }
          </div>
        }
      </div>
      
      <!-- Footer -->
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          @if (validationResult()?.success) {
            <button 
              pButton 
              label="Close" 
              icon="pi pi-check"
              class="p-button-success"
              (click)="closeDialog()">
            </button>
          } @else {
            <button 
              pButton 
              label="Close" 
              icon="pi pi-times"
              class="p-button-secondary"
              (click)="closeDialog()">
            </button>
          }
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .validation-dialog {
      .p-dialog-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .p-dialog-content {
        padding: 1.5rem;
      }
      
      .p-dialog-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
      }
    }
  `]
})
export class WorkflowValidationDialogComponent {
  constructor(public workflowService: WorkflowDesignerService) {}

  get isVisible(): boolean {
    return this.workflowService.showValidationDialog();
  }

  set isVisible(value: boolean) {
    this.workflowService.showValidationDialog.set(value);
  }

  get validationResult() {
    return this.workflowService.validationResult;
  }

  closeDialog(): void {
    this.workflowService.showValidationDialog.set(false);
  }
}
