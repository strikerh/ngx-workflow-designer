import { Component, inject, signal, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkflowDesignerService } from '../workflow-designer.service';
import { ApiWorkflow } from '../../core/services/workflow-api.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { WORKFLOW_LIB_CONFIG, WorkflowDesignerLibConfig } from '../../core/workflow-lib.config';

@Component({
  selector: 'app-workflow-header',
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  template: `
      <p-toast></p-toast>
      <div class="flex items-center gap-2 justify-between w-full">
         <div class="flex items-center gap-2">
        <button *ngIf="showBack"
          class="text-sm px-1 py-1 rounded-md border hover:bg-slate-50 flex items-center gap-1" 
          (click)="goBackToList()"
          title="Back">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <span class="text-sm font-semibold px-2 ">Alert Workflow Designer</span>
       </div>
        
        <div class="flex items-center gap-2">
        <button *ngIf="showNew"
          class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50 flex items-center gap-1" 
          (click)="createNewWorkflow()">
          New
        </button>
               <!-- Templates Dropdown -->
        <div class="relative" *ngIf="showTemplates">
          <button 
            class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50 flex items-center gap-1" 
            (click)="workflowService.toggleTemplatesDropdown()">
            Templates ({{ getWorkflowDisplayName() }}) ▾
          </button>
          <div 
            *ngIf="workflowService.showTemplatesDropdown()" 
            class="absolute mt-1 w-48 rounded-md border bg-white shadow z-10 max-h-72 overflow-auto">
            <ng-container *ngFor="let template of workflowService.getTemplates(); trackBy: trackTemplate">
              <button 
                class="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm flex justify-between items-center"
                [class.bg-indigo-50]="template.workflowId.toString() === workflowService.currentWorkflowId()"
                (click)="selectTemplate(template.workflowId.toString())">
                <span>{{ template.name }}</span>
                <span *ngIf="template.workflowId.toString() === workflowService.currentWorkflowId()" class="text-indigo-500 text-xs">active</span>
              </button>
            </ng-container>
            <div class="border-t mt-1 pt-1 px-3 pb-2 text-[10px] text-slate-400">Click a template to load</div>
          </div>
        </div>
        
        <!-- Workflows Dropdown (optional) -->
        <div class="relative" *ngIf="showWorkflowList">
          <button 
            class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50 flex items-center gap-1" 
            (click)="toggleWorkflowsDropdown()">
            Workflows ▾
          </button>
          <div 
            *ngIf="showWorkflowsDropdown()" 
            class="absolute mt-1 w-56 rounded-md border bg-white shadow z-10 max-h-72 overflow-auto">
            <div *ngIf="loadingWorkflows()" class="px-3 py-2 text-sm text-slate-500">Loading…</div>
            <ng-container *ngIf="!loadingWorkflows()">
              <ng-container *ngFor="let wf of workflows(); trackBy: trackWorkflow">
                <button 
                  class="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm flex justify-between items-center"
                  [class.bg-indigo-50]="wf.workflowId.toString() === workflowService.currentWorkflowId()"
                  (click)="selectWorkflow(wf.workflowId.toString())">
                  <span>{{ wf.name }}</span>
                  <span *ngIf="wf.workflowId.toString() === workflowService.currentWorkflowId()" class="text-indigo-500 text-xs">active</span>
                </button>
              </ng-container>
              <div class="border-t mt-1 pt-1 px-3 pb-2 text-[10px] text-slate-400">Select a workflow to load</div>
            </ng-container>
          </div>
        </div>
        <button 
          class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50 flex items-center gap-1.5" 
          (click)="workflowService.runValidate()"
          title="Validate workflow structure">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Validate
        </button>
        <button *ngIf="showImport" class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50" (click)="importJson()">Import JSON</button>
        <button *ngIf="showExport" class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50" (click)="workflowService.exportJson()">Export JSON</button>
        <button *ngIf="showSave" class="text-sm px-3 py-1 rounded-md border bg-green-50 border-green-300 hover:bg-green-100 text-green-700" (click)="saveToApi()">
          {{ getSaveButtonText() }}
        </button>
        </div>
        <!-- Hidden file input for JSON import -->
        <input 
          #fileInput 
          type="file" 
          accept=".json" 
          (change)="onFileSelected($event)" 
          style="display: none"
        />
      </div>
  `,
  styles: [`
  :host{
      @apply col-span-3 row-[1]   flex items-center justify-between px-3;
  }
  `]
})
export class WorkflowHeaderComponent {
  libConfig = inject(WORKFLOW_LIB_CONFIG, { optional: true }) as WorkflowDesignerLibConfig | undefined;

  constructor(
    public workflowService: WorkflowDesignerService,
    @Optional() private router: Router | null,
    private messageService: MessageService,
  ) {}

  // Feature flag helpers (default true when not provided)
  get showNew() { return this.libConfig?.features?.new ?? true; }
  get showTemplates() { return this.libConfig?.features?.templates ?? true; }
  get showImport() { return this.libConfig?.features?.import ?? true; }
  get showExport() { return this.libConfig?.features?.export ?? true; }
  get showSave() { return this.libConfig?.features?.save ?? true; }
  get showWorkflowList() { return this.libConfig?.features?.workflowList ?? false; }
  get showBack() { return this.libConfig?.features?.backButton ?? true; }

  // Workflows dropdown state (signals for zoneless change detection)
  showWorkflowsDropdown = signal<boolean>(false);
  loadingWorkflows = signal<boolean>(false);
  workflows = signal<ApiWorkflow[]>([]);

  goBackToList() {
    const backUrl = this.libConfig?.features?.backUrl ?? '/';
    if (/^https?:\/\//i.test(backUrl)) {
      window.location.href = backUrl;
      return;
    }
    if (this.router) {
      this.router.navigate([backUrl]);
    }
  }

  async selectTemplate(id: string) {
    try {
      // Close dropdown first
      this.workflowService.showTemplatesDropdown.set(false);
      
      // Check if router has any configured routes
      const hasRoutes = this.router && this.router.config && this.router.config.length > 0;
      
      // If router is available AND has routes, navigate with query params
      if (hasRoutes) {
        this.router!.navigate(['/'], {
          queryParams: { id },
          replaceUrl: true
        });
      } else {
        // If no router or no routes, directly load the workflow
        const success = await this.workflowService.loadWorkflow(id);
        if (!success) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load template.',
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Template loaded successfully.',
            life: 2000
          });
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unexpected error loading workflow template.',
        life: 5000
      });
    }
  }

  async toggleWorkflowsDropdown() {
    this.showWorkflowsDropdown.update(v => !v);
    if (this.showWorkflowsDropdown()) {
      this.workflowService.showTemplatesDropdown.set(false);
      this.loadingWorkflows.set(true);
      await this.loadWorkflows();
    }
  }

  private async loadWorkflows() {
    this.loadingWorkflows.set(true);
    try {
      const list = await this.workflowService.getAllWorkflows();
      this.workflows.set(list);
    } catch (e) {
      console.error('Error loading workflows list:', e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load workflows list.',
        life: 4000
      });
    } finally {
      this.loadingWorkflows.set(false);
    }
  }

  async selectWorkflow(id: string) {
    try {
      // Close dropdown first
      this.showWorkflowsDropdown.set(false);
      
      // Check if router has any configured routes
      const hasRoutes = this.router && this.router.config && this.router.config.length > 0;
      
      // If router is available AND has routes, navigate with query params
      if (hasRoutes) {
        this.router!.navigate(['/'], { queryParams: { id }, replaceUrl: true });
      } else {
        // If no router or no routes, directly load the workflow
        const success = await this.workflowService.loadWorkflow(id);
        if (!success) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load workflow.',
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Workflow loaded successfully.',
            life: 2000
          });
        }
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unexpected error loading workflow.',
        life: 5000
      });
    }
  }

  trackWorkflow = (index: number, wf: ApiWorkflow) => wf.workflowId;

  async saveToApi() {
    const result = await this.workflowService.saveToApi();
    
    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: result.message,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: result.message,
        life: 5000
      });
    }
  }

  trackTemplate = (index: number, template: ApiWorkflow) => template.workflowId;

  getSaveButtonText(): string {
    const currentId = this.workflowService.currentWorkflowId();
    const currentWorkflow = this.workflowService.currentWorkflow();
    
    const isNewWorkflow = !currentId || 
                          currentId === 'workflow' || 
                          currentId === 'new' ||
                          !currentWorkflow?.workflowId;
    
    return isNewWorkflow ? 'Save' : 'Update';
  }

  getWorkflowDisplayName(): string {
    const currentId = this.workflowService.currentWorkflowId();
    if (currentId === 'workflow') {
      return 'New Workflow';
    }
    
    const templates = this.workflowService.getTemplates();
    const currentTemplate = templates.find(t => t.workflowId.toString() === currentId);
    return currentTemplate ? currentTemplate.name : currentId;
  }

  createNewWorkflow() {
    const hasRoutes = this.router && this.router.config && this.router.config.length > 0;
    
    if (hasRoutes) {
      this.router!.navigate(['/'], { queryParams: { id: 'new' } });
    } else {
      // If no router or no routes, reset to create new workflow
      this.workflowService.resetAll();
      this.workflowService.saveStateToHistory();
    }
  }

  importJson() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const workflowData = JSON.parse(jsonContent);
        
        this.workflowService.importJson(workflowData);
        
        const nodesCount = this.workflowService.nodes().length;
        const edgesCount = this.workflowService.edges().length;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Import Successful',
          detail: `Loaded ${nodesCount} node(s) and ${edgesCount} edge(s)`,
          life: 3000
        });
      } catch (error) {
        console.error('❌ Error importing JSON:', error);
        let errorMessage = 'Failed to import JSON. Please ensure the file is valid.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Import Failed',
          detail: errorMessage,
          life: 5000
        });
      }
    };

    reader.onerror = () => {
      console.error('❌ Error reading file');
      this.messageService.add({
        severity: 'error',
        summary: 'File Read Error',
        detail: 'Failed to read the file. Please try again.',
        life: 5000
      });
    };

    reader.readAsText(file);
    
    input.value = '';
  }
}
