# API Integration Guide

Complete reference for backend API integration with the workflow system.

## 🌐 API Overview

The workflow module communicates with the backend through the `WorkflowApiService`, which handles all HTTP requests and response transformations.

## 🔧 WorkflowApiService

### Service Configuration

```typescript
@Injectable({ providedIn: 'root' })
export class WorkflowApiService {
  private baseUrl = 'https://api.example.com';  // From environment
  private http = inject(HttpClient);
  
  constructor() {
    // Initialize from environment configuration
    this.baseUrl = environment.apiUrl;
  }
}
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/workflows` | List all workflows |
| GET | `/api/workflows/:id` | Get specific workflow |
| POST | `/api/workflows` | Create new workflow |
| PUT | `/api/workflows/:id` | Update existing workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| POST | `/api/workflows/:id/execute` | Execute workflow |
| GET | `/api/workflows/:id/logs` | Get execution logs |

## 📋 API Data Structures

### Workflow (Request/Response)

```typescript
interface ApiWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: ApiNode[];
  edges: ApiEdge[];
  variables?: Record<string, any>;
  metadata?: WorkflowMetadata;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

### Node

```typescript
interface ApiNode {
  id: string;
  type: string;  // e.g., "action.sms", "control.if"
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    icon?: string;
    params: Record<string, any>;
  };
}
```

### Edge

```typescript
interface ApiEdge {
  id: string;
  source: string;  // Source node ID
  target: string;  // Target node ID
  data?: {
    exitPoint?: string;  // Which exit: 'onTrue', 'onSuccess', etc.
  };
}
```

### Metadata

```typescript
interface WorkflowMetadata {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  author?: string;
  version?: string;
  tags?: string[];
  approved?: boolean;
}
```

## 🔄 API Methods

### List Workflows

```typescript
getWorkflows(): Observable<ApiWorkflow[]> {
  return this.http.get<ApiWorkflow[]>(`${this.baseUrl}/api/workflows`);
}
```

**Response**:
```json
[
  {
    "id": "workflow_123",
    "name": "Critical Alert Response",
    "description": "Handles critical alert notifications",
    "nodes": [...],
    "edges": [...],
    "createdAt": "2025-10-19T10:00:00Z",
    "updatedAt": "2025-10-19T14:30:00Z"
  }
]
```

### Get Workflow

```typescript
getWorkflow(id: string): Observable<ApiWorkflow> {
  return this.http.get<ApiWorkflow>(`${this.baseUrl}/api/workflows/${id}`);
}
```

**Response**: Single `ApiWorkflow` object

### Create Workflow

```typescript
createWorkflow(
  workflow: Omit<ApiWorkflow, 'id' | 'createdAt' | 'updatedAt'>
): Observable<ApiWorkflow> {
  return this.http.post<ApiWorkflow>(
    `${this.baseUrl}/api/workflows`,
    workflow
  );
}
```

**Request Body**:
```json
{
  "name": "New Workflow",
  "description": "Description here",
  "nodes": [
    {
      "id": "node_abc123",
      "type": "trigger.manual",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Start",
        "params": {}
      }
    }
  ],
  "edges": [],
  "variables": {
    "severity": "CRITICAL"
  },
  "metadata": {
    "category": "alerts",
    "priority": "high",
    "author": "user_123"
  }
}
```

**Response**: Complete `ApiWorkflow` with generated `id`, `createdAt`, `updatedAt`

### Update Workflow

```typescript
updateWorkflow(
  id: string,
  workflow: Partial<ApiWorkflow>
): Observable<ApiWorkflow> {
  return this.http.put<ApiWorkflow>(
    `${this.baseUrl}/api/workflows/${id}`,
    workflow
  );
}
```

**Request Body**: Partial workflow object (only changed fields)

### Delete Workflow

```typescript
deleteWorkflow(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/api/workflows/${id}`);
}
```

## 🔄 Data Transformation

### Internal to API Format

The `WorkflowDesignerService` handles conversion:

```typescript
private convertInternalToApiWorkflow(
  name: string,
  description?: string
): Omit<ApiWorkflow, 'id' | 'createdAt' | 'updatedAt'> {
  const currentNodes = this.nodes();
  const currentEdges = this.edges();
  const variables = this.variablesService.variables();

  return {
    name,
    description,
    nodes: currentNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: { x: node.x, y: node.y },
      data: {
        label: node.label,
        icon: this.getTypeIcon(node.type),
        params: node.params
      }
    })),
    edges: currentEdges.map(edge => ({
      id: edge.id,
      source: edge.from,
      target: edge.to,
      data: edge.exitPoint ? { exitPoint: edge.exitPoint } : {}
    })),
    variables,
    metadata: {
      category: 'user-created',
      priority: 'medium',
      author: 'workflow-designer',
      version: '1.0'
    }
  };
}
```

### API to Internal Format

```typescript
private convertApiWorkflowToInternal(apiWorkflow: ApiWorkflow): void {
  // Convert nodes
  const nodes: WorkflowNode[] = apiWorkflow.nodes.map(node => ({
    id: node.id,
    type: node.type,
    label: node.data.label,
    x: node.position.x,
    y: node.position.y,
    params: node.data.params || {}
  }));

  // Convert edges
  const edges: WorkflowEdge[] = apiWorkflow.edges.map(edge => ({
    id: edge.id,
    from: edge.source,
    to: edge.target,
    exitPoint: edge.data?.exitPoint
  }));

  // Update state
  this.nodes.set(nodes);
  this.edges.set(edges);
  this.currentWorkflowId.set(apiWorkflow.id);
  this.currentWorkflow.set(apiWorkflow);
  
  // Load variables
  if (apiWorkflow.variables) {
    this.variablesService.setVariables(apiWorkflow.variables);
  }
}
```

## 🔐 Authentication & Headers

### HTTP Interceptor

The module uses an HTTP interceptor to add authentication headers:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

## ⚠️ Error Handling

### Service-Level Error Handling

```typescript
loadWorkflow(id: string): Promise<boolean> {
  return firstValueFrom(
    this.workflowApi.getWorkflow(id).pipe(
      catchError(error => {
        console.error('Failed to load workflow:', error);
        
        if (error.status === 404) {
          this.error = 'Workflow not found';
        } else if (error.status === 403) {
          this.error = 'Access denied';
        } else {
          this.error = 'Failed to load workflow';
        }
        
        return of(null);
      })
    )
  ).then(workflow => {
    if (workflow) {
      this.convertApiWorkflowToInternal(workflow);
      return true;
    }
    return false;
  });
}
```

### HTTP Error Responses

Expected error format:

```typescript
interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  status: number;
  statusText: string;
}
```

**Example**:
```json
{
  "error": {
    "message": "Workflow not found",
    "code": "WORKFLOW_NOT_FOUND"
  },
  "status": 404,
  "statusText": "Not Found"
}
```

## 🚀 Workflow Execution

### Execute Workflow

```typescript
executeWorkflow(id: string, input?: Record<string, any>): Observable<ExecutionResult> {
  return this.http.post<ExecutionResult>(
    `${this.baseUrl}/api/workflows/${id}/execute`,
    { input }
  );
}
```

**Request**:
```json
{
  "input": {
    "alert": {
      "id": "alert_456",
      "type": "Equipment Failure",
      "severity": "CRITICAL"
    }
  }
}
```

**Response**:
```json
{
  "executionId": "exec_789",
  "workflowId": "workflow_123",
  "status": "running",
  "startedAt": "2025-10-19T14:35:00Z",
  "steps": [
    {
      "nodeId": "node_abc",
      "status": "completed",
      "output": "SMS sent successfully"
    }
  ]
}
```

### Get Execution Logs

```typescript
getExecutionLogs(workflowId: string, executionId?: string): Observable<LogEntry[]> {
  const url = executionId
    ? `${this.baseUrl}/api/workflows/${workflowId}/logs/${executionId}`
    : `${this.baseUrl}/api/workflows/${workflowId}/logs`;
    
  return this.http.get<LogEntry[]>(url);
}
```

**Response**:
```json
[
  {
    "timestamp": "2025-10-19T14:35:01Z",
    "level": "info",
    "nodeId": "node_abc",
    "message": "Starting SMS node",
    "data": {}
  },
  {
    "timestamp": "2025-10-19T14:35:02Z",
    "level": "success",
    "nodeId": "node_abc",
    "message": "SMS sent successfully",
    "data": {
      "recipients": 3,
      "messageId": "msg_xyz"
    }
  }
]
```

## 🔄 Real-Time Updates (WebSocket)

### WebSocket Connection

```typescript
connectToWorkflowUpdates(workflowId: string): Observable<WorkflowUpdate> {
  const ws = new WebSocket(`wss://api.example.com/workflows/${workflowId}/stream`);
  
  return new Observable(observer => {
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      observer.next(update);
    };
    
    ws.onerror = (error) => observer.error(error);
    ws.onclose = () => observer.complete();
    
    return () => ws.close();
  });
}
```

**Update Message**:
```json
{
  "type": "node_completed",
  "workflowId": "workflow_123",
  "executionId": "exec_789",
  "nodeId": "node_abc",
  "status": "success",
  "output": { ... }
}
```

## 📊 Pagination & Filtering

### List Workflows with Pagination

```typescript
getWorkflows(
  page: number = 1,
  pageSize: number = 20,
  filters?: WorkflowFilters
): Observable<PaginatedWorkflows> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
    
  if (filters?.category) {
    params = params.set('category', filters.category);
  }
  
  if (filters?.search) {
    params = params.set('search', filters.search);
  }
  
  return this.http.get<PaginatedWorkflows>(
    `${this.baseUrl}/api/workflows`,
    { params }
  );
}
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## 🧪 Testing API Integration

### Mock Service for Testing

```typescript
@Injectable()
export class MockWorkflowApiService extends WorkflowApiService {
  getWorkflows(): Observable<ApiWorkflow[]> {
    return of([
      {
        id: 'test_1',
        name: 'Test Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }
}
```

### Unit Test Example

```typescript
describe('WorkflowApiService', () => {
  let service: WorkflowApiService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkflowApiService]
    });
    
    service = TestBed.inject(WorkflowApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch workflows', () => {
    const mockWorkflows: ApiWorkflow[] = [...];
    
    service.getWorkflows().subscribe(workflows => {
      expect(workflows.length).toBe(2);
      expect(workflows[0].name).toBe('Test Workflow');
    });
    
    const req = httpMock.expectOne('/api/workflows');
    expect(req.request.method).toBe('GET');
    req.flush(mockWorkflows);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
});
```

## 📚 Best Practices

### 1. Use TypeScript Interfaces

Always type API responses:
```typescript
// ✅ Good
getWorkflow(id: string): Observable<ApiWorkflow>

// ❌ Bad
getWorkflow(id: string): Observable<any>
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good
.pipe(
  catchError(error => {
    console.error('API Error:', error);
    return of(null);  // Fallback value
  })
)
```

### 3. Transform Data at Service Boundary

Keep components clean by handling transformations in services:
```typescript
// ✅ Good: Transform in service
getWorkflows(): Observable<Workflow[]> {
  return this.http.get<ApiWorkflow[]>('/api/workflows').pipe(
    map(workflows => workflows.map(this.apiToInternal))
  );
}
```

### 4. Use Environment Configuration

```typescript
// ✅ Good
private baseUrl = environment.apiUrl;

// ❌ Bad
private baseUrl = 'https://hardcoded-url.com';
```

## 🔍 Troubleshooting

### Issue: CORS Errors

**Solution**: Configure backend CORS headers or use proxy in development

### Issue: 401 Unauthorized

**Solution**: Check authentication token is being sent in headers

### Issue: Data not updating

**Solution**: Verify observables are subscribed to and signals are updating

---

**Related Docs**:
- [Architecture Overview](./architecture.md)
- [Development Best Practices](../guides/development.md)
