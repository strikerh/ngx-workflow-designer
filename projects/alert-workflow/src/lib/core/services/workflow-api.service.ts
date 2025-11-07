import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  variables?: Record<string, string>;
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

@Injectable({ providedIn: 'root' })
export class WorkflowApiService {
  private workflowEndpoint: string;
  private templatesEndpoint: string;
  private headers: HttpHeaders | undefined;

  private http = inject(HttpClient);
  private libConfig = inject(WORKFLOW_LIB_CONFIG, { optional: true }) as WorkflowDesignerLibConfig | null;

  constructor() {
    const baseFromConfig = this.libConfig?.api?.baseUrl;
    const tokenFromConfig = this.libConfig?.api?.token;
    const templatesFromConfig = this.libConfig?.api?.templatesUrl;

    if (!baseFromConfig) {
      throw new Error('WORKFLOW_LIB_CONFIG.api.baseUrl is required for WorkflowApiService');
    }

    const base = baseFromConfig.replace(/\/$/, '');
    this.workflowEndpoint = base;
    this.templatesEndpoint = (templatesFromConfig || base).replace(/\/$/, '');

    const token = tokenFromConfig;
    this.headers = token ? new HttpHeaders({ Authorization: token }) : undefined;
  }

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

  getWorkflow(id: string | number): Observable<ApiResponse<ApiWorkflow>> {
    return this.http.get<ApiResponse<ApiWorkflow>>(`${this.workflowEndpoint}/${id}`, {
      headers: this.headers
    });
  }

  createWorkflow(workflow: Omit<ApiWorkflow, 'workflowId' | 'createdAt' | 'modifiedAt' | 'isDeleted'>): Observable<ApiResponse<ApiWorkflow>> {
    return this.http.post<ApiResponse<ApiWorkflow>>(this.workflowEndpoint, workflow, {
      headers: this.headers
    });
  }

  updateWorkflow(id: string | number, workflow: Partial<Omit<ApiWorkflow, 'workflowId' | 'createdAt' | 'modifiedAt' | 'isDeleted'>>): Observable<ApiResponse<ApiWorkflow>> {
    const payload = { ...workflow, workflowId: id };
    return this.http.put<ApiResponse<ApiWorkflow>>(this.workflowEndpoint, payload, {
      headers: this.headers
    });
  }

  deleteWorkflow(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.workflowEndpoint}/${id}`, {
      headers: this.headers
    });
  }

  getTemplates(): Observable<ApiWorkflow[]> {
    return this.http.get<ApiResponse<any>>(this.templatesEndpoint, { headers: this.headers }).pipe(
      map((response) => {
        const res = response?.results as any;
        if (!res) return [] as ApiWorkflow[];
        const list = Array.isArray(res) ? res : Array.isArray((res as any).data) ? (res as any).data : [];
        return list as ApiWorkflow[];
      })
    );
  }
}
