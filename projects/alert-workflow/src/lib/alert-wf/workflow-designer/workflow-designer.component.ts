import { Component, OnInit, OnDestroy, HostListener, signal, Optional, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowHeaderComponent } from './components/workflow-header.component';
import { WorkflowPaletteComponent } from './components/workflow-palette.component';
import { WorkflowCanvasComponent } from './components/workflow-canvas.component';
import { WorkflowInspectorComponent } from './components/workflow-inspector.component';
import { WorkflowValidationDialogComponent } from './components/workflow-validation-dialog.component';
import { WorkflowDesignerService } from './workflow-designer.service';

@Component({
  selector: 'workflow-designer',
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
  styleUrls: ['./workflow-designer.component.css'],
})
export class WorkflowDesignerComponent implements OnInit, OnDestroy {
  @Input() workflowId?: string;
  
  private destroy$ = new Subject<void>();
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    @Optional() private route: ActivatedRoute | null,
    @Optional() private router: Router | null,
    public workflowService: WorkflowDesignerService,
  ) {}

  ngOnInit() {
    // Support for Input workflowId (when used without router)
    if (this.workflowId) {
      this.loadWorkflow(this.workflowId);
      return;
    }

    // Support for route-based loading (when used with router)
    if (this.route) {
      this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((queryParams) => {
        const workflowId = queryParams['id'];

        if (workflowId && workflowId !== 'new') {
          this.loadWorkflow(workflowId);
        } else {
          this.error.set(null);
          this.loading.set(false);
          this.workflowService.resetAll();
          this.workflowService.saveStateToHistory();
        }
      });
    } else {
      // No router - try to parse URL query params manually
      const urlParams = new URLSearchParams(window.location.search);
      const workflowId = urlParams.get('id');
      
      if (workflowId && workflowId !== 'new') {
        this.loadWorkflow(workflowId);
      } else {
        this.error.set(null);
        this.loading.set(false);
        this.workflowService.resetAll();
        this.workflowService.saveStateToHistory();
      }
    }
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
    if (this.router) {
      this.router.navigate(['/']);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.workflowService.isConnectMode()) {
        this.workflowService.cancelConnection();
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'Delete') {
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
