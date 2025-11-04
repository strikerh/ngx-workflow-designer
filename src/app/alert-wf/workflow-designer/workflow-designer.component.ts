import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowHeaderComponent } from './components/workflow-header.component';
import { WorkflowPaletteComponent } from './components/workflow-palette.component';
import { WorkflowCanvasComponent } from './components/workflow-canvas.component';
import { WorkflowInspectorComponent } from './components/inspector';
import { WorkflowValidationDialogComponent } from './components/workflow-validation-dialog.component';
import { WorkflowDesignerService } from './workflow-designer.service';

@Component({
  selector: 'app-workflow-designer',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowHeaderComponent,
    WorkflowPaletteComponent,
    WorkflowCanvasComponent,
    WorkflowInspectorComponent,
    WorkflowValidationDialogComponent,
  ],
  templateUrl: './workflow-designer.component.html',
  styleUrls: ['./workflow-designer.component.css']
})
export class WorkflowDesignerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public workflowService: WorkflowDesignerService
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        const workflowId = queryParams['id'];
        
        if (workflowId && workflowId !== 'new') {
          this.loadWorkflow(workflowId);
        } else {
          // New workflow - clear the designer and save empty state
          this.error.set(null);
          this.loading.set(false);
          this.workflowService.resetAll();
          this.workflowService.saveStateToHistory();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadWorkflow(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const success = await this.workflowService.loadWorkflow(id);
      if (!success) {
        this.error.set('Failed to load workflow. It may not exist or be accessible.');
      }
    } catch (error) {
      this.error.set('An error occurred while loading the workflow.');
      console.error('Error loading workflow:', error);
    } finally {
      this.loading.set(false);
    }
  }

  goBackToList() {
    this.router.navigate(['/']);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // ESC key - Cancel connection mode
    if (event.key === 'Escape') {
      if (this.workflowService.isConnectMode()) {
        this.workflowService.cancelConnection();
        event.preventDefault();
      }
      return;
    }
    
    // Delete key - Remove selected node or edge
    if (event.key === 'Delete' /*|| event.key === 'Backspace'*/) {
      const selectedNodeId = this.workflowService.selectedNodeId();
      const selectedEdgeId = this.workflowService.selectedEdgeId();
      
      if (selectedEdgeId) {
        this.workflowService.removeEdge(selectedEdgeId);
        event.preventDefault();
      } else if (selectedNodeId) {
        this.workflowService.removeNode(selectedNodeId);
        event.preventDefault();
      }
    }
  }
}