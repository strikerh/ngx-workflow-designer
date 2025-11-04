import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { WORKFLOW_LIB_CONFIG, WorkflowDesignerLibConfig } from '../workflow-lib.config';

export interface ApiWorkflow {
  workflowId: number;
  name: string;
  description?: string;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      icon?: string;
      params?: Record<string, any>;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data?: Record<string, any>;
  }>;
  variables?: Record<string, string>; // Simple key-value pairs for workflow variables
  metadata?: {
    category?: string;
    priority?: string;
    author?: string;
    version?: string;
    approved?: boolean;
    tags?: string[];
  };
  createdAt: string;
  modifiedAt: string;
  isDeleted: boolean;
}

export interface ApiResponse<T> {
  errors: string[];
  totalRecords: number;
  results: T;
}

export interface WorkflowQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowApiService {

  private workflowEndpoint: string;
  private templatesEndpoint: string;
  private headers: HttpHeaders | undefined;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(WORKFLOW_LIB_CONFIG) private libConfig?: WorkflowDesignerLibConfig
  ) {
    const baseFromConfig = this.libConfig?.api?.baseUrl;
    const tokenFromConfig = this.libConfig?.api?.token;

  const base = (baseFromConfig || (environment.workflowApiUrl + '/workflow') || 'http://localhost:3001/api/workflow').replace(/\/$/, '');
  this.workflowEndpoint = base;
  // templates endpoint can be different; fallback to base
  const templatesFromConfig = this.libConfig?.api?.templatesUrl;
  this.templatesEndpoint = (templatesFromConfig || base).replace(/\/$/, '');

    const token = tokenFromConfig || environment.workflowApiToken;
    this.headers = token ? new HttpHeaders({ Authorization: token }) : undefined;

    console.log('WorkflowApiService initialized with baseUrl:', this.workflowEndpoint);
  }

  /**
   * Get all workflows with optional pagination and search
   */
  getWorkflows(params?: WorkflowQueryParams): Observable<ApiResponse<ApiWorkflow[]>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

  return this.http.get<ApiResponse<ApiWorkflow[]>>(this.workflowEndpoint, {
      params: httpParams,
      headers: this.headers
    });
  }

  /**
   * Get a specific workflow by ID
   */
  getWorkflow(id: string | number): Observable<ApiResponse<ApiWorkflow>> {
  return this.http.get<ApiResponse<ApiWorkflow>>(`${this.workflowEndpoint}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Create a new workflow
   */
  createWorkflow(workflow: Omit<ApiWorkflow, 'workflowId' | 'createdAt' | 'modifiedAt' | 'isDeleted'>): Observable<ApiResponse<ApiWorkflow>> {
    return this.http.post<ApiResponse<ApiWorkflow>>(this.workflowEndpoint, workflow, {
      headers: this.headers
    });
  }

  /**
   * Update an existing workflow
   */
  updateWorkflow(id: string | number, workflow: Partial<Omit<ApiWorkflow, 'workflowId' | 'createdAt' | 'modifiedAt' | 'isDeleted'>>): Observable<ApiResponse<ApiWorkflow>> {
    const payload = { ...workflow, workflowId: id }; // Ensure workflowId is set
    return this.http.put<ApiResponse<ApiWorkflow>>(this.workflowEndpoint, payload, {
      headers: this.headers
    });
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.workflowEndpoint}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Get workflow templates (same as getWorkflows but for templates)
   */
  getTemplates(): Observable<ApiWorkflow[]> {
    return this.http.get<ApiResponse<any>>(this.templatesEndpoint, { headers: this.headers }).pipe(
      map((response) => {
        const res = response?.results as any;
        if (!res) return [] as ApiWorkflow[];
        // Support two shapes: results is array OR object with data array
        const list = Array.isArray(res) ? res : Array.isArray((res as any).data) ? (res as any).data : [];
        return list as ApiWorkflow[];
      })
    );
  }
}
