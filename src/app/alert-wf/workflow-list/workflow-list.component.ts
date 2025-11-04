import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { WorkflowApiService, ApiWorkflow } from '../core/services/workflow-api.service';
import { Ripple } from 'primeng/ripple';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoPipe, TranslocoService } from '../../core/i18n/transloco.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { fadeInUp } from '../../core/animation/fade-animations';
import { LoadingComponent } from '../../components/loading/loading.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { HeaderAction } from '../../components/page-header/header-action.model';

@Component({
  selector: 'app-workflow-list',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    NgIf,
    Ripple,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TooltipModule,
    TranslocoPipe,
    PaginatorModule,
    LoadingComponent,
    PageHeaderComponent,
    FormsModule
  ],
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.css'],
  animations: [fadeInUp],
  providers: [ConfirmationService, MessageService]
})
export class WorkflowListComponent implements OnInit {
  workflows: ApiWorkflow[] = [];
  loading = false;
  error: string | null = null;

  filteredData: ApiWorkflow[] = [];
  pageSize: number = 50;
  currentPage: number = 0;
  paginatedList: ApiWorkflow[] = [];
  title = 'Workflows';
  showMode: 'card' | 'table' = 'card';

  actions: HeaderAction[] = [
    {
      id: 'refresh',
      kind: 'btn',
      tooltip: 'refresh',
      icon: 'refresh',
      onClick: () => this.refreshWorkflows()
    },
    {
      id: 'toggle',
      kind: 'toggleView',
      state: this.showMode == 'card' ? 0 : 1,
      icon: 'grid_view',
      iconToggle: 'view_agenda',
      onToggle: (m: 0 | 1) => {
        this.changeMode(m);
      }
    },
    {
      id: 'search', 
      kind: 'search',
      placeholder: 'Search workflow',
      onSearch: (q: string) => this.search(q)
    },
    {
      id: 's1',
      kind: 'spliter',
    },
    {
      id: 'add',
      kind: 'btn',
      tooltip: 'Create New Workflow',
      icon: 'add',
      onClick: () => this.createNewWorkflow()
    }
  ];

  constructor(
    private workflowApiService: WorkflowApiService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit() {
    this.loadWorkflows();
  }

  loadWorkflows() {
    this.loading = true;
    this.error = null;
    
    this.workflowApiService.getWorkflows().subscribe({
      next: (response) => {
        this.workflows = response.results;
        this.filteredData = [...this.workflows];
        this.updatePaginatedList();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load workflows';
        this.loading = false;
        console.error('Error loading workflows:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load workflows'
        });
      }
    });
  }

  refreshWorkflows() {
    this.loadWorkflows();
  }

  selectWorkflow(workflow: ApiWorkflow) {
    // Navigate to workflow designer with the selected workflow ID as query parameter
    this.router.navigate(['/admin/alert-wf/workflow-designer'], { queryParams: { id: workflow.workflowId } });
  }

  editWorkflow(workflow: ApiWorkflow) {
    // Navigate to workflow designer for editing
    this.router.navigate(['/admin/alert-wf/workflow-designer'], { queryParams: { id: workflow.workflowId } });
  }

  createNewWorkflow() {
    // Navigate to workflow designer for creating a new workflow
    this.router.navigate(['/admin/alert-wf/workflow-designer'], { queryParams: { id: 'new' } });
  }

  deleteWorkflow(workflowId: string, workflowName: string) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete workflow "${workflowName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.workflowApiService.deleteWorkflow(workflowId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Workflow deleted successfully'
            });
            this.loadWorkflows();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete workflow'
            });
            console.error('Error deleting workflow:', error);
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getWorkflowCategory(workflow: ApiWorkflow): string {
    return workflow.metadata?.category || 'Uncategorized';
  }

  getWorkflowPriority(workflow: ApiWorkflow): string {
    return workflow.metadata?.priority || 'Normal';
  }

  changeMode(mode: 0 | 1) {
    this.showMode = mode === 0 ? 'card' : 'table';
  }

  search(query: string) {
    if (!query.trim()) {
      this.filteredData = [...this.workflows];
    } else {
      const searchTerm = query.toLowerCase();
      this.filteredData = this.workflows.filter(workflow =>
        workflow.name.toLowerCase().includes(searchTerm) ||
        workflow.description?.toLowerCase().includes(searchTerm) ||
        workflow.metadata?.category?.toLowerCase().includes(searchTerm) ||
        workflow.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    this.currentPage = 0;
    this.updatePaginatedList();
  }

  onPageChange(event: PaginatorState) {
    this.currentPage = event.page || 0;
    this.pageSize = event.rows || 50;
    this.updatePaginatedList();
  }

  private updatePaginatedList() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedList = this.filteredData.slice(startIndex, endIndex);
  }
}