import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WorkflowNode, WorkflowEdge, PaletteItem, DragState, WorkflowExport, WorkflowHistoryState, NODE_SIZE, NodeTypeConfig, WorkflowNodesConfig } from './workflow-designer.interfaces';
import { WorkflowApiService, ApiWorkflow } from '../core/services/workflow-api.service';
import { WorkflowHistoryService } from './workflow-history.service';
import { WorkflowNodesConfigService } from './workflow-nodes-config.service';
import { WorkflowVariablesService } from './workflow-variables.service';
import { SpecialMarkersService } from './special-markers.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowDesignerService {
  // State management with Angular signals
  nodes = signal<WorkflowNode[]>([]);
  edges = signal<WorkflowEdge[]>([]);
  selectedNodeId = signal<string | null>(null);
  selectedEdgeId = signal<string | null>(null);
  connectFrom = signal<string | null>(null);
  connectFromExitPoint = signal<string | null>(null); // Track which exit point was clicked
  isConnectMode = signal<boolean>(false);
  zoom = signal<number>(1);
  showTemplatesDropdown = signal<boolean>(false);
  panOffsetX = signal<number>(0);
  panOffsetY = signal<number>(0);
  currentWorkflowId = signal<string>('workflow');
  currentWorkflow = signal<Partial<ApiWorkflow> | null>(null);
  templateIds = signal<string[]>([]);
  templates = signal<ApiWorkflow[]>([]);
  isFullscreen = signal<boolean>(false);
  
  // Validation state
  showValidationDialog = signal<boolean>(false);
  validationResult = signal<{ success: boolean; errors: string[] } | null>(null);
  invalidFields = signal<Map<string, string[]>>(new Map()); // Map of nodeId -> array of invalid field keys
  unconnectedExits = signal<Map<string, string[]>>(new Map()); // Map of nodeId -> array of unconnected exit point names
  unconnectedInputs = signal<Set<string>>(new Set()); // Set of nodeIds with unconnected input points

  // Drag state
  private dragState: DragState = { draggingId: null, dx: 0, dy: 0 };
  private panState = { isPanning: false, startX: 0, startY: 0, lastPanX: 0, lastPanY: 0 };

  // Zoom constraints
  private readonly MIN_ZOOM = 0.25;
  private readonly MAX_ZOOM = 2.5;
  private readonly ZOOM_STEP = 1.1; // multiplicative step

  // Constants
  readonly NODE_SIZE = NODE_SIZE;
  
  // Computed properties from configuration service
  readonly PALETTE = computed<PaletteItem[]>(() => {
    if (this.configService.isConfigLoaded()) {
      return this.configService.getPalette();
    }
    // Fallback palette if config not loaded
    return [
      { type: "trigger.manual", label: "Manual Trigger", color: "bg-amber-100 border-amber-300" },
      { type: "control.if", label: "If / Else", color: "bg-sky-100 border-sky-300" },
      { type: "control.switch", label: "Switch", color: "bg-sky-100 border-sky-300" },
      { type: "action.sms", label: "SMS", color: "bg-emerald-100 border-emerald-300" },
      { type: "end.terminate", label: "End", color: "bg-slate-100 border-slate-300" }
    ];
  });

  readonly TYPE_ICONS = computed<Record<string, string>>(() => {
    if (this.configService.isConfigLoaded()) {
      return this.configService.getTypeIcons();
    }
    // Fallback icons if config not loaded
    return {
      "trigger.manual": "⚡",
      "trigger.webhook": "🔗",
      "control.if": "�",
      "control.switch": "🧭",
      "action.sms": "💬",
      "action.email": "✉️",
      "end.terminate": "⛔"
    };
  });

  // Computed properties
  selectedNode = computed(() => {
    const id = this.selectedNodeId();
    return this.nodes().find((n: WorkflowNode) => n.id === id) || null;
  });

  selectedEdge = computed(() => {
    const id = this.selectedEdgeId();
    return this.edges().find((e: WorkflowEdge) => e.id === id) || null;
  });

  constructor(
    private workflowApi: WorkflowApiService,
    private historyService: WorkflowHistoryService,
    private configService: WorkflowNodesConfigService,
    private variablesService: WorkflowVariablesService,
    private specialMarkersService: SpecialMarkersService,
    private router: Router
  ) {
    this.setupMouseListeners();
    this.loadTemplateIds(); // Load template IDs on initialization
    
    // Save initial empty state for undo/redo to work correctly
    this.saveStateToHistory('Initial state');
  }

  // Expose history service capabilities
  canUndo = computed(() => this.historyService.canUndo());
  canRedo = computed(() => this.historyService.canRedo());

  // Conversion methods between API format and internal format
  private convertApiWorkflowToInternal(apiWorkflow: ApiWorkflow, preserveIdentity: boolean = false): void {
    // Convert API nodes to internal WorkflowNode format
    const nodes: WorkflowNode[] = apiWorkflow.nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.data.label,
      x: node.position.x,
      y: node.position.y,
      params: node.data.params || {}
    }));

    // Convert API edges to internal WorkflowEdge format
    const edges: WorkflowEdge[] = apiWorkflow.edges.map(edge => ({
      id: edge.id,
      from: edge.source,
      to: edge.target,
      exitPoint: edge.data?.['exitPoint'] // Extract exitPoint from edge data
    }));

    this.nodes.set(nodes);
    this.edges.set(edges);
    
    // When preserveIdentity is true (for imports), don't change workflowId or name
    if (!preserveIdentity) {
      // Normal load from API - set everything including ID and name
      this.currentWorkflowId.set(apiWorkflow.workflowId.toString());
      this.currentWorkflow.set(apiWorkflow);
    } else {
      // For imports: Only update nodes/edges/variables, don't touch workflow identity
      // Keep the existing currentWorkflow and currentWorkflowId unchanged
      const currentWorkflow = this.currentWorkflow();
      if (currentWorkflow) {
        // Update only the structure parts, preserve identity
        this.currentWorkflow.set({
          ...currentWorkflow,
          // Don't update: workflowId, name, description
          // Only update: metadata if needed
          metadata: apiWorkflow.metadata
        });
      }
      // Note: currentWorkflowId is NOT updated during import
    }
    
    // Load variables into the variables service
    console.log('📥 Loading workflow variables:', apiWorkflow.variables);
    if (apiWorkflow.variables) {
      this.variablesService.setVariables(apiWorkflow.variables);
    } else {
      this.variablesService.clearVariables();
    }
  }

  private convertInternalToApiWorkflow(name: string, description?: string): Omit<ApiWorkflow, 'workflowId' | 'createdAt' | 'modifiedAt' | 'isDeleted'> {
    const currentNodes = this.nodes();
    const currentEdges = this.edges();
    
    // Get variables from the variables service
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
        data: edge.exitPoint ? { exitPoint: edge.exitPoint } : {} // Store exitPoint in edge data
      })),
      variables, // Include variables from the service
      metadata: {
        category: 'user-created',
        priority: 'medium',
        author: 'workflow-designer',
        version: '1.0'
      }
    };
  }

  // Helper methods
  private uid(prefix = 'n'): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  addNode(type: string, opts: Partial<WorkflowNode> = {}): void {
    const meta = this.PALETTE().find((p: PaletteItem) => p.type === type);
    const id = this.uid('node');
    const currentNodes = this.nodes();
    const baseX = 120 + currentNodes.length * 24;
    const baseY = 80 + currentNodes.length * 16;
    
    // Get node type configuration to access default values
    const nodeTypeConfig = this.configService.getNodeTypeConfig(type);
    
    // Process default values with special markers
    let processedDefaults = {};
    if (nodeTypeConfig && nodeTypeConfig.properties) {
      processedDefaults = this.specialMarkersService.processNodeDefaults(
        nodeTypeConfig.properties,
        {
          workflowId: this.currentWorkflowId(),
          timestamp: new Date()
        }
      );
    }
    
    const node: WorkflowNode = {
      id,
      type,
      label: opts.label || meta?.label || type,
      x: opts.x ?? baseX,
      y: opts.y ?? baseY,
      params: { ...processedDefaults, ...(opts.params || {}) } // Merge processed defaults with any provided params
    };
    
    this.nodes.update((nodes: WorkflowNode[]) => [...nodes, node]);
    this.selectedNodeId.set(id);
    this.saveStateToHistory(`Added node: ${node.label}`);
  }

  removeNode(id: string): void {
    const nodeToRemove = this.nodes().find(n => n.id === id);
    const nodeLabel = nodeToRemove?.label || 'node';
    this.nodes.update((nodes: WorkflowNode[]) => nodes.filter((n: WorkflowNode) => n.id !== id));
    this.edges.update((edges: WorkflowEdge[]) => edges.filter((e: WorkflowEdge) => e.from !== id && e.to !== id));
    if (this.selectedNodeId() === id) {
      this.selectedNodeId.set(null);
    }
    this.saveStateToHistory(`Removed node: ${nodeLabel}`);
  }

  duplicateNode(id: string): void {
    const currentNodes = this.nodes();
    const nodeToDuplicate = currentNodes.find((n: WorkflowNode) => n.id === id);
    if (!nodeToDuplicate) return;

    const newId = this.uid('node');
    const duplicatedNode: WorkflowNode = {
      ...nodeToDuplicate,
      id: newId,
      x: nodeToDuplicate.x + 150, // Offset the duplicate
      y: nodeToDuplicate.y + 50,
      label: `${nodeToDuplicate.label} (Copy)`
    };

    this.nodes.update((nodes: WorkflowNode[]) => [...nodes, duplicatedNode]);
    this.selectedNodeId.set(newId);
    this.saveStateToHistory(`Duplicated node: ${nodeToDuplicate.label}`);
  }

  removeEdge(id: string): void {
    this.edges.update((edges: WorkflowEdge[]) => edges.filter((e: WorkflowEdge) => e.id !== id));
    if (this.selectedEdgeId() === id) {
      this.selectedEdgeId.set(null);
    }
    this.saveStateToHistory('Removed connection');
  }

  startConnect(fromId: string, exitPoint?: string): void {
    if (!this.isConnectMode()) return;
    
    const currentConnectFrom = this.connectFrom();
    if (currentConnectFrom && currentConnectFrom !== fromId) {
      // Create edge and exit connect mode
      const currentEdges = this.edges();
      const fromNode = this.nodes().find(n => n.id === currentConnectFrom);
      const toNode = this.nodes().find(n => n.id === fromId);
      
      // Get the exitPoint from the stored connectFromExitPoint signal
      const storedExitPoint = this.connectFromExitPoint();
      
      // Check if connection already exists with the SAME exit point (allow multiple connections with different exit points)
      const sameExitExists = currentEdges.some((e: WorkflowEdge) => 
        e.from === currentConnectFrom && 
        e.to === fromId && 
        e.exitPoint === storedExitPoint
      );
      const reverseExists = currentEdges.some((e: WorkflowEdge) => e.from === fromId && e.to === currentConnectFrom);
      
      if (!sameExitExists && !reverseExists) {
        
        this.edges.update((edges: WorkflowEdge[]) => [...edges, { 
          id: this.uid('edge'), 
          from: currentConnectFrom, 
          to: fromId,
          exitPoint: storedExitPoint || 'next' // Use stored exit point or default to 'next'
        }]);
        const fromLabel = fromNode?.label || 'node';
        const toLabel = toNode?.label || 'node';
        const exitLabel = storedExitPoint ? ` (${storedExitPoint})` : '';
        this.saveStateToHistory(`Connected ${fromLabel}${exitLabel} → ${toLabel}`);
      }
      this.connectFrom.set(null);
      this.connectFromExitPoint.set(null);
      this.isConnectMode.set(false);
      return;
    }
    
    // Store both the node ID and the exit point
    this.connectFrom.set(fromId);
    this.connectFromExitPoint.set(exitPoint || 'next');
  }

  /**
   * Cancel connection mode (ESC key, right-click, etc.)
   */
  cancelConnection(): void {
    this.connectFrom.set(null);
    this.connectFromExitPoint.set(null);
    this.isConnectMode.set(false);
  }

  setDragState(nodeId: string, offsetX: number, offsetY: number): void {
    this.dragState = { draggingId: nodeId, dx: offsetX, dy: offsetY };
  }

  getDragState(): DragState {
    return this.dragState;
  }

  clearDragState(): void {
    const wasDragging = this.dragState.draggingId !== null;
    const draggedNodeId = this.dragState.draggingId;
    this.dragState.draggingId = null;
    
    // Save state after drag completes (node was moved)
    if (wasDragging && draggedNodeId) {
      const movedNode = this.nodes().find(n => n.id === draggedNodeId);
      const nodeLabel = movedNode?.label || 'node';
      this.saveStateToHistory(`Moved ${nodeLabel}`);
    }
  }

  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.nodes.update((nodes: WorkflowNode[]) => 
      nodes.map((n: WorkflowNode) => n.id === nodeId ? { ...n, x, y } : n)
    );
  }

  // Pan methods
  startPan(clientX: number, clientY: number): void {
    this.panState.isPanning = true;
    this.panState.startX = clientX;
    this.panState.startY = clientY;
    this.panState.lastPanX = this.panOffsetX();
    this.panState.lastPanY = this.panOffsetY();
  }

  updatePan(clientX: number, clientY: number): void {
    if (!this.panState.isPanning) return;
    
    const deltaX = clientX - this.panState.startX;
    const deltaY = clientY - this.panState.startY;
    
    this.panOffsetX.set(this.panState.lastPanX + deltaX);
    this.panOffsetY.set(this.panState.lastPanY + deltaY);
  }

  stopPan(): void {
    this.panState.isPanning = false;
  }

  isPanning(): boolean {
    return this.panState.isPanning;
  }

  // New zoom helper keeping cursor focus stable (transform order: translate -> scale)
  zoomAt(deltaY: number, worldX: number, worldY: number): void {
    const current = this.zoom();
    const direction = deltaY < 0 ? 1 : -1; // wheel up => zoom in
    let target = direction > 0 ? current * this.ZOOM_STEP : current / this.ZOOM_STEP;
    target = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, target));
    if (target === current) return;

    const panX = this.panOffsetX();
    const panY = this.panOffsetY();
    const scaleRatio = current / target; // = 1 / (target/current)

    // Keep world point (worldX/worldY) under cursor stable: (world + pan)*z = (world + pan')*z'
    const newPanX = (panX + worldX) * scaleRatio - worldX;
    const newPanY = (panY + worldY) * scaleRatio - worldY;

    this.zoom.set(target);
    this.panOffsetX.set(newPanX);
    this.panOffsetY.set(newPanY);
  }

  // Optional programmatic zoom controls
  zoomIn(centerWorldX = 0, centerWorldY = 0): void { this.zoomAt(-100, centerWorldX, centerWorldY); }
  zoomOut(centerWorldX = 0, centerWorldY = 0): void { this.zoomAt(100, centerWorldX, centerWorldY); }

  private setupMouseListeners(): void {
    // Mouse listeners are now handled by the canvas component
    // This method is kept for backwards compatibility but does nothing
  }

  exportJson(): void {
    const currentNodes = this.nodes();
    const currentEdges = this.edges();
    const workflowId = this.currentWorkflowId() || 'workflow';

    const graph: WorkflowExport = {
      workflowId: workflowId,
      version: 1,
      nodes: currentNodes.map((n: WorkflowNode) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        params: n.params,
        next: currentEdges.filter((e: WorkflowEdge) => e.from === n.id).map((e: WorkflowEdge) => e.to)
      })),
      variables: {}
    };
    
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJson(workflowData: WorkflowExport | ApiWorkflow): void {
    try {
      // Check if it's an API workflow format (has position property in nodes)
      if ('nodes' in workflowData && Array.isArray(workflowData.nodes) && workflowData.nodes.length > 0) {
        const firstNode = workflowData.nodes[0] as any;
        
        // API format has nodes with position: {x, y} and data: {label, params}
        if (firstNode.position && typeof firstNode.position.x === 'number') {
          // It's an ApiWorkflow format - preserve current workflowId and name
          this.convertApiWorkflowToInternal(workflowData as ApiWorkflow, true);
          this.saveStateToHistory('Imported workflow from JSON');
          return;
        }
        
        // Legacy export format has nodes with x, y directly and next array
        if (typeof firstNode.x === 'number' && typeof firstNode.y === 'number') {
          // Clear existing workflow
          this.resetAll();
          
          // Convert nodes from legacy format with positions preserved
          const nodes: WorkflowNode[] = workflowData.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            label: n.label || n.type.split('.').pop() || 'Node',
            params: n.params || {},
            x: n.x || 100,
            y: n.y || 100
          }));
          
          // Convert edges from export format
          const edges: WorkflowEdge[] = [];
          workflowData.nodes.forEach((n: any) => {
            if (n.next && Array.isArray(n.next)) {
              n.next.forEach((targetId: string, index: number) => {
                edges.push({
                  id: `edge_${n.id}_${targetId}_${index}`,
                  from: n.id,
                  to: targetId
                });
              });
            }
          });
          
          this.nodes.set(nodes);
          this.edges.set(edges);
          this.saveStateToHistory('Imported workflow from JSON (legacy format with positions)');
          return;
        }
        
        // Old legacy format without positions
        const exportData = workflowData as WorkflowExport;
        this.resetAll();
        
        const nodes: WorkflowNode[] = exportData.nodes.map((n: any, index: number) => ({
          id: n.id,
          type: n.type,
          label: n.label || n.type.split('.').pop() || 'Node',
          params: n.params || {},
          x: 100 + (index % 3) * 200, // Spread nodes horizontally
          y: 100 + Math.floor(index / 3) * 150 // Spread nodes vertically
        }));
        
        const edges: WorkflowEdge[] = [];
        exportData.nodes.forEach((n: any) => {
          if (n.next && Array.isArray(n.next)) {
            n.next.forEach((targetId: string, index: number) => {
              edges.push({
                id: `edge_${n.id}_${targetId}_${index}`,
                from: n.id,
                to: targetId
              });
            });
          }
        });
        
        this.nodes.set(nodes);
        this.edges.set(edges);
        this.saveStateToHistory('Imported workflow from JSON (legacy format)');
      } else {
        console.error('Invalid workflow format - no nodes found');
        throw new Error('Invalid workflow format');
      }
    } catch (error) {
      console.error('Error importing workflow:', error);
      // Only re-throw if it's a validation error, not an operational error
      if (error instanceof Error && error.message === 'Invalid workflow format') {
        throw error;
      }
      // Otherwise, log but don't throw - the import may have partially succeeded
      console.warn('Import completed with warnings:', error);
    }
  }

  // Toggle fullscreen mode
  toggleFullscreen(): void {
    this.isFullscreen.update(current => !current);
  }

  // Save to API instead of export
  async saveToApi(): Promise<{ success: boolean; message: string }> {
    // Validate workflow first
    const validation = this.validateWorkflow();
    if (!validation.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    const workflow = this.currentWorkflow();
    if (!workflow) {
      return {
        success: false,
        message: 'No workflow data available'
      };
    }

    const success = await this.saveWorkflow(workflow.name || 'Untitled Workflow', workflow.description);
    
    if (success) {
      // Refresh template IDs after successful save
      await this.loadTemplateIds();
      return {
        success: true,
        message: `Workflow "${workflow.name}" saved successfully`
      };
    } else {
      return {
        success: false,
        message: `Failed to save workflow "${workflow.name}"`
      };
    }
  }

  // Public method to refresh template IDs
  async refreshTemplateIds(): Promise<void> {
    await this.loadTemplateIds();
  }

  validate(): string[] {
    const errors: string[] = [];
    const currentNodes = this.nodes();
    const currentEdges = this.edges();
    
    // Rule 1: Must have at least one trigger node
    const triggers = currentNodes.filter((n: WorkflowNode) => n.type.startsWith('trigger.'));
    if (triggers.length === 0) {
      errors.push('No trigger node found. Workflow must start with at least one trigger.');
    }
    
    // Rule 1.1: Maximum one manual trigger allowed
    const manualTriggers = currentNodes.filter((n: WorkflowNode) => n.type === 'trigger.manual');
    if (manualTriggers.length > 1) {
      errors.push(`Multiple manual triggers found (${manualTriggers.length}). Only one trigger.manual is allowed per workflow.`);
    }
    
    // Rule 2: Must have at least one node
    if (currentNodes.length === 0) {
      errors.push('Workflow is empty. Add at least one node to continue.');
      return errors; // No point checking further
    }
    
    // Build adjacency map for reachability checks
    const adjacency = new Map(currentNodes.map((n: WorkflowNode) => [n.id, [] as string[]]));
    currentEdges.forEach((e: WorkflowEdge) => adjacency.get(e.from)?.push(e.to));
    
    // Rule 3: All nodes must be reachable from triggers (no orphan nodes)
    const visited = new Set<string>();
    const queue = [...triggers.map(t => t.id)];
    
    while (queue.length) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const nxt of adjacency.get(cur) || []) {
        queue.push(nxt);
      }
    }
    
    const orphan = currentNodes.filter((n: WorkflowNode) => !visited.has(n.id));
    if (orphan.length > 0) {
      errors.push(`Orphan nodes not connected to any trigger: ${orphan.map(o => o.label).join(', ')}`);
    }
    
    // Rule 3.1: Track nodes with unconnected input points (non-trigger nodes with no incoming edges)
    const unconnectedInputsSet = new Set<string>();
    const nodesWithInputs = currentNodes.filter((n: WorkflowNode) => !n.type.startsWith('trigger.'));
    
    nodesWithInputs.forEach((node: WorkflowNode) => {
      const hasIncomingEdge = currentEdges.some((e: WorkflowEdge) => e.to === node.id);
      if (!hasIncomingEdge) {
        unconnectedInputsSet.add(node.id);
        // Note: We already report these as orphan nodes in Rule 3, so no need to add another error
      }
    });
    
    // Store unconnected inputs for UI highlighting
    this.unconnectedInputs.set(unconnectedInputsSet);
    
    // Rule 4: Check for required fields in node parameters
    const invalidFieldsMap = new Map<string, string[]>();
    
    currentNodes.forEach((node: WorkflowNode) => {
      const config = this.configService.getNodeTypeConfig(node.type);
      if (!config) return;
      
      const requiredFields = config.properties.filter(p => p.required);
      const nodeInvalidFields: string[] = [];
      
      requiredFields.forEach(field => {
        const value = node.params[field.key];
        if (value === undefined || value === null || value === '') {
          errors.push(`Node "${node.label}" is missing required field: ${field.label}`);
          nodeInvalidFields.push(field.key);
        }
      });
      
      if (nodeInvalidFields.length > 0) {
        invalidFieldsMap.set(node.id, nodeInvalidFields);
      }
    });
    
    // Store invalid fields map for UI highlighting
    this.invalidFields.set(invalidFieldsMap);
    
    // Rule 5: Terminal/End nodes should not have outgoing connections
    const terminalNodes = currentNodes.filter((n: WorkflowNode) => n.type.startsWith('end.'));
    terminalNodes.forEach((node: WorkflowNode) => {
      const outgoing = currentEdges.filter((e: WorkflowEdge) => e.from === node.id);
      if (outgoing.length > 0) {
        errors.push(`Terminal node "${node.label}" should not have outgoing connections`);
      }
    });
    
    // Rule 6: Non-terminal nodes should have at least one outgoing connection
    // Rule 6.1: All exit points must be connected
    const unconnectedExitsMap = new Map<string, string[]>();
    
    const nonTerminalNodes = currentNodes.filter((n: WorkflowNode) => 
      !n.type.startsWith('end.') && !n.type.startsWith('trigger.')
    );
    nonTerminalNodes.forEach((node: WorkflowNode) => {
      const outgoing = currentEdges.filter((e: WorkflowEdge) => e.from === node.id);
      const config = this.configService.getNodeTypeConfig(node.type);
      const expectedExits = config?.exits || [];
      
      if (expectedExits.length > 0 && outgoing.length === 0) {
        errors.push(`Node "${node.label}" has no outgoing connections`);
      }
      
      // Check that ALL exit points are connected
      if (expectedExits.length > 0) {
        const connectedExits = new Set(outgoing.map(e => e.exitPoint || 'next'));
        
        const missingExits = expectedExits.filter(exitName => !connectedExits.has(exitName));
        if (missingExits.length > 0) {
          errors.push(`Node "${node.label}" has unconnected exit points: ${missingExits.join(', ')}`);
          unconnectedExitsMap.set(node.id, missingExits);
        }
      }
    });
    
    // Store unconnected exits map for UI highlighting
    this.unconnectedExits.set(unconnectedExitsMap);
    
    // Rule 7: Check for duplicate node labels (optional - warning style)
    const labelCounts = new Map<string, number>();
    currentNodes.forEach((node: WorkflowNode) => {
      const count = labelCounts.get(node.label) || 0;
      labelCounts.set(node.label, count + 1);
    });
    labelCounts.forEach((count, label) => {
      if (count > 1) {
        errors.push(`Duplicate node label "${label}" found ${count} times. Consider using unique labels.`);
      }
    });
    
    // Rule 8: Check for disconnected edges (source or target node deleted)
    currentEdges.forEach((edge: WorkflowEdge) => {
      const sourceExists = currentNodes.some(n => n.id === edge.from);
      const targetExists = currentNodes.some(n => n.id === edge.to);
      
      if (!sourceExists) {
        errors.push(`Edge ${edge.id} has missing source node`);
      }
      if (!targetExists) {
        errors.push(`Edge ${edge.id} has missing target node`);
      }
    });
    
    // Rule 9: Check for circular dependencies (infinite loops)
    const detectCycle = (): boolean => {
      const visited = new Set<string>();
      const recStack = new Set<string>();
      
      const hasCycle = (nodeId: string): boolean => {
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          recStack.add(nodeId);
          
          const neighbors = adjacency.get(nodeId) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && hasCycle(neighbor)) {
              return true;
            } else if (recStack.has(neighbor)) {
              return true;
            }
          }
        }
        recStack.delete(nodeId);
        return false;
      };
      
      for (const node of currentNodes) {
        if (hasCycle(node.id)) {
          return true;
        }
      }
      return false;
    };
    
    if (detectCycle()) {
      errors.push('Circular dependency detected. Workflow contains an infinite loop.');
    }
    
    // Rule 10: Workflow must have at least one terminal/end node
    if (terminalNodes.length === 0) {
      errors.push('No terminal/end node found. Workflow should have at least one end point.');
    }
    
    return errors;
  }

  runValidate(): void {
    const errors = this.validate();
    this.validationResult.set({
      success: errors.length === 0,
      errors: errors
    });
    this.showValidationDialog.set(true);
    
    // Clear invalid fields, unconnected exits, and unconnected inputs if validation passes
    if (errors.length === 0) {
      this.invalidFields.set(new Map());
      this.unconnectedExits.set(new Map());
      this.unconnectedInputs.set(new Set());
    }
  }

  /**
   * Check if a specific field in a node is invalid
   */
  isFieldInvalid(nodeId: string, fieldKey: string): boolean {
    const nodeInvalidFields = this.invalidFields().get(nodeId);
    return nodeInvalidFields ? nodeInvalidFields.includes(fieldKey) : false;
  }

  /**
   * Check if a specific exit point in a node is unconnected
   */
  isExitUnconnected(nodeId: string, exitPoint: string): boolean {
    const nodeUnconnectedExits = this.unconnectedExits().get(nodeId);
    return nodeUnconnectedExits ? nodeUnconnectedExits.includes(exitPoint) : false;
  }

  /**
   * Check if a node's input point is unconnected
   */
  isInputUnconnected(nodeId: string): boolean {
    return this.unconnectedInputs().has(nodeId);
  }

  /**
   * Clear unconnected input highlighting for a specific node
   */
  clearInputHighlight(nodeId: string): void {
    const currentSet = this.unconnectedInputs();
    if (currentSet.has(nodeId)) {
      const newSet = new Set(currentSet);
      newSet.delete(nodeId);
      this.unconnectedInputs.set(newSet);
    }
  }

  /**
   * Clear unconnected exit highlighting for a specific exit point
   */
  clearExitHighlight(nodeId: string, exitPoint: string): void {
    const currentMap = this.unconnectedExits();
    const nodeExits = currentMap.get(nodeId);
    
    if (nodeExits && nodeExits.includes(exitPoint)) {
      const newMap = new Map(currentMap);
      const filteredExits = nodeExits.filter(e => e !== exitPoint);
      
      if (filteredExits.length > 0) {
        newMap.set(nodeId, filteredExits);
      } else {
        newMap.delete(nodeId);
      }
      
      this.unconnectedExits.set(newMap);
    }
  }

  /**
   * Clear invalid field highlighting for a specific field
   */
  clearFieldHighlight(nodeId: string, fieldKey: string): void {
    const currentMap = this.invalidFields();
    const nodeFields = currentMap.get(nodeId);
    
    if (nodeFields && nodeFields.includes(fieldKey)) {
      const newMap = new Map(currentMap);
      const filteredFields = nodeFields.filter(f => f !== fieldKey);
      
      if (filteredFields.length > 0) {
        newMap.set(nodeId, filteredFields);
      } else {
        newMap.delete(nodeId);
      }
      
      this.invalidFields.set(newMap);
    }
  }

  resetAll(): void {
    this.nodes.set([]);
    this.edges.set([]);
    this.selectedNodeId.set(null);
    this.selectedEdgeId.set(null);
    this.connectFrom.set(null);
    this.isConnectMode.set(false);
    this.showTemplatesDropdown.set(false);
    
    // Reset workflow ID for new workflow creation
    this.currentWorkflowId.set('new');
    
    // Clear variables
    this.variablesService.clearAll();
    
    // Initialize empty workflow for new workflow creation
    const newWorkflow = {
      id: 'new-workflow',
      name: '',
      description: '',
      nodes: [],
      edges: [],
      metadata: {
        category: '',
        priority: '',
        author: '',
        version: '',
        approved: undefined,
        tags: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.currentWorkflow.set(newWorkflow);
    
    // Clear history when resetting
    // Note: Caller is responsible for saving state after reset if needed
    this.historyService.clearHistory();
  }

  // Undo/Redo State Management Methods (delegated to WorkflowHistoryService)
  
  /**
   * Capture the current state and add it to history
   * Called after any state-changing operation
   */
  saveStateToHistory(description?: string): void {
    const state: WorkflowHistoryState = {
      nodes: this.nodes(),
      edges: this.edges(),
      selectedNodeId: this.selectedNodeId(),
      selectedEdgeId: this.selectedEdgeId()
    };

    this.historyService.saveState(state, description);
  }

  /**
   * Undo the last action
   */
  undo(): void {
    const state = this.historyService.undo();
    if (state) {
      this.restoreState(state);
    }
  }

  /**
   * Redo the previously undone action
   */
  redo(): void {
    const state = this.historyService.redo();
    if (state) {
      this.restoreState(state);
    }
  }

  /**
   * Get the history stack with descriptions (for debugging or UI)
   */
  getHistoryStack() {
    return this.historyService.getHistoryStack();
  }

  /**
   * Log the complete history to console (useful for debugging)
   */
  logHistory(): void {
    const history = this.historyService.getHistoryStack();
    console.group('📜 Workflow History');
    console.log(`Total entries: ${history.length}`);
    console.table(history.map(h => ({
      '#': h.index,
      Current: h.isCurrent ? '→' : '',
      Description: h.description || '(no description)',
      Timestamp: h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : ''
    })));
    console.groupEnd();
  }

  /**
   * Restore a state from history
   */
  private restoreState(state: WorkflowHistoryState): void {
    this.nodes.set(state.nodes);
    this.edges.set(state.edges);
    this.selectedNodeId.set(state.selectedNodeId);
    this.selectedEdgeId.set(state.selectedEdgeId);
  }

  /**
   * Clear history (e.g., when loading a new workflow)
   */
  clearHistory(): void {
    this.historyService.clearHistory();
  }

  // Replace old loadTemplate implementation
  async loadTemplate(name: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.workflowApi.getWorkflow(name));
      if (response.errors.length === 0 && response.results) {
        // Handle API response - check if data is wrapped in a 'data' property
        const workflow = (response.results as any).data || response.results;
        this.resetAll();
        this.convertApiWorkflowToInternal(workflow);
        // Save initial state after loading
        this.saveStateToHistory(`Loaded template: ${workflow.name || name}`);
      } else {
        console.warn('Template not found:', name, response.errors);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }

  async listTemplateIds(): Promise<string[]> {
    try {
      const response = await firstValueFrom(this.workflowApi.getTemplates());
      return response.map(workflow => workflow.workflowId.toString());
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // Load template IDs and templates data
  private async loadTemplateIds(): Promise<void> {
    try {
      const templates = await firstValueFrom(this.workflowApi.getTemplates());
      this.templates.set(templates);
      this.templateIds.set(templates.map(t => t.workflowId.toString()));
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templateIds.set([]);
      this.templates.set([]);
    }
  }

  // Synchronous getter for template IDs (for use in templates)
  getTemplateIds(): string[] {
    return this.templateIds();
  }

  // Synchronous getter for full templates (for use in templates)
  getTemplates(): ApiWorkflow[] {
    return this.templates();
  }

  // New save/load functionality
  async saveWorkflow(name: string, description?: string): Promise<boolean> {
    debugger
    try {
      const workflowData = this.convertInternalToApiWorkflow(name, description);
      
      // Debug logging
      console.log('💾 Saving workflow with variables:', workflowData.variables);
      
      const currentId = this.currentWorkflowId();
      
      if (currentId && currentId !== 'workflow' && currentId !== 'new') {
        // Update existing workflow
        const response = await firstValueFrom(this.workflowApi.updateWorkflow(currentId, workflowData));
        if (response.errors.length === 0 && response.results) {
          // Handle API response - check if data is wrapped in a 'data' property
          const workflow = (response.results as any).data || response.results;
          this.currentWorkflow.set(workflow);
        }
        return response.errors.length === 0;
      } else {
        // Create new workflow
        const response = await firstValueFrom(this.workflowApi.createWorkflow(workflowData));
        if (response.errors.length === 0 && response.results) {
          // Handle API response - check if data is wrapped in a 'data' property
          const workflow = (response.results as any).data || response.results;
          this.currentWorkflowId.set(workflow.workflowId.toString());
          this.currentWorkflow.set(workflow);
          
          // Update the URL to reflect the new workflow ID (using query parameter)
          this.router.navigate(['/'], { 
            queryParams: { id: workflow.workflowId },
            replaceUrl: true 
          });
        }
        return response.errors.length === 0;
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      return false;
    }
  }

  async loadWorkflow(id: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.workflowApi.getWorkflow(id));
      if (response.errors.length === 0 && response.results) {
        // Handle API response - check if data is wrapped in a 'data' property
        const workflow = (response.results as any).data || response.results;
        this.resetAll();
        this.convertApiWorkflowToInternal(workflow);
        // Save initial state after loading
        this.saveStateToHistory(`Loaded workflow: ${workflow.name || id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading workflow:', error);
      return false;
    }
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.workflowApi.deleteWorkflow(id));
      if (response.errors.length === 0 && this.currentWorkflowId() === id) {
        this.resetAll();
        this.saveStateToHistory(); // Save empty state after deleting current workflow
      }
      return response.errors.length === 0;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  async getAllWorkflows(): Promise<ApiWorkflow[]> {
    try {
      const response = await firstValueFrom(this.workflowApi.getWorkflows({ limit: 100 }));
      return response.errors.length === 0 ? response.results || [] : [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  // Inspector form methods
  updateNode(id: string, patch: Partial<WorkflowNode>): void {
    const node = this.nodes().find(n => n.id === id);
    const nodeLabel = node?.label || 'node';
    this.nodes.update((nodes: WorkflowNode[]) => 
      nodes.map((n: WorkflowNode) => n.id === id ? { ...n, ...patch } : n)
    );
    const fieldName = Object.keys(patch)[0] || 'field';
    this.saveStateToHistory(`Updated ${nodeLabel} ${fieldName}`);
  }

  // Update node without saving to history (for real-time updates)
  updateNodeSilent(id: string, patch: Partial<WorkflowNode>): void {
    this.nodes.update((nodes: WorkflowNode[]) => 
      nodes.map((n: WorkflowNode) => n.id === id ? { ...n, ...patch } : n)
    );
  }

  updateParam(id: string, key: string, value: any): void {
    const node = this.nodes().find(n => n.id === id);
    const nodeLabel = node?.label || 'node';
    this.nodes.update((nodes: WorkflowNode[]) => 
      nodes.map((n: WorkflowNode) => n.id === id ? { ...n, params: { ...n.params, [key]: value } } : n)
    );
    this.saveStateToHistory(`Updated ${nodeLabel} ${key}`);
  }

  // Update param without saving to history (for real-time updates)
  updateParamSilent(id: string, key: string, value: any): void {
    this.nodes.update((nodes: WorkflowNode[]) => 
      nodes.map((n: WorkflowNode) => n.id === id ? { ...n, params: { ...n.params, [key]: value } } : n)
    );
  }

  // UI Helper methods
  cssForType(type: string): string {
    // Try to get from configuration service first
    if (this.configService.isConfigLoaded()) {
      const nodeColors = this.configService.getNodeColors();
      if (nodeColors[type]) {
        return nodeColors[type];
      }
    }
    
    // Fallback to category-based styling
    if (type.startsWith('trigger.')) return 'bg-amber-50 border-amber-200';
    if (type.startsWith('control.')) return 'bg-sky-50 border-sky-200';
    if (type.startsWith('action.')) return 'bg-emerald-50 border-emerald-200';
    if (type.startsWith('end.')) return 'bg-slate-50 border-slate-200';
    if (type.startsWith('var.') || type.startsWith('audit.') || type.startsWith('utility.')) return 'bg-purple-50 border-purple-200';
    return 'bg-white border-slate-200';
  }

  getTypeIcon(type: string): string {
    return this.TYPE_ICONS()[type] || '•';
  }

  renderSummary(node: WorkflowNode): string {
    try {
      switch (node.type) {
        // Triggers
        case 'trigger.manual':
          return node.params?.['initiator'] ? `by: ${node.params['initiator']}` : 'operator-initiated';
        case 'trigger.webhook':
          return `auth: ${node.params?.['auth'] || 'none'}`;
        case 'trigger.schedule':
          return `cron: ${node.params?.['cron'] || '-'}`;
        case 'trigger.threshold':
          return `${node.params?.['metric'] || '-'} ${node.params?.['operator'] || '>'} ${node.params?.['value'] || '-'}`;
        
        // Controls
        case 'control.if':
          return `cond: ${node.params?.['condition'] || '-'}`;
        case 'control.switch':
          return `expr: ${node.params?.['expression'] || '-'}`;
        case 'control.rateLimit':
          return `max: ${node.params?.['max'] || '-'} per ${node.params?.['per'] || '-'}`;
        case 'control.wait':
          return node.params?.['seconds'] ? `wait: ${node.params['seconds']}s` : `until: ${node.params?.['until'] || '-'}`;
        case 'control.approval':
          return `role: ${node.params?.['role'] || '-'} | SLA: ${node.params?.['slaMinutes'] || '-'}m`;
        case 'control.forEach':
          return `each: ${node.params?.['collection'] || '-'} as ${node.params?.['itemAlias'] || 'item'}`;
        case 'control.parallel':
          return `branches: ${node.params?.['branches']?.length || 0}`;
        case 'control.merge':
          return `await: ${node.params?.['await'] || 'all'}`;
        case 'control.transform':
          const setKeys = node.params?.['set'] ? Object.keys(node.params['set']).join(', ') : '-';
          return `set: ${setKeys}`;
        case 'control.dedupe':
          return `key: ${node.params?.['key'] || '-'} | window: ${node.params?.['window'] || '-'}`;
        
        // Actions
        case 'action.sms':
          return `to: ${node.params?.['to'] || '-'}`;
        case 'action.push':
          return `to: ${node.params?.['to'] || '-'} | title: ${node.params?.['title'] || '-'}`;
        case 'action.email':
          return `to: ${node.params?.['to'] || '-'} | subj: ${node.params?.['subject'] || '-'}`;
        case 'action.paging':
          return `to: ${node.params?.['to'] || '-'}`;
        case 'action.pa':
          return `zone: ${node.params?.['zone'] || '-'} | tone: ${node.params?.['tone'] || node.params?.['file'] || '-'}`;
        case 'action.ivr':
          return `to: ${node.params?.['to'] || '-'} | prompt: ${node.params?.['prompt'] || '-'}`;
        case 'action.conference':
          return `participants: ${node.params?.['participants'] || '-'}`;
        case 'action.webhook':
          return `${node.params?.['method'] || 'POST'} ${node.params?.['url'] || '(url)'}`;
        case 'action.ticket':
          return `${node.params?.['system'] || '-'} | ${node.params?.['project'] || '-'}`;
        case 'action.log':
          return `${node.params?.['level'] || 'Info'}: ${node.params?.['message'] || '-'}`;
        
        // Terminals
        case 'end.terminate':
          return 'success';
        case 'end.fail':
          return `reason: ${node.params?.['reason'] || 'unknown'}`;
        
        // Utility
        case 'var.set':
          return `${node.params?.['key'] || '-'} = ${node.params?.['value'] || '-'}`;
        case 'audit.mark':
          return `${node.params?.['tag'] || '-'}: ${node.params?.['note'] || '-'}`;
        
        default:
          return node.type;
      }
    } catch {
      return node.type;
    }
  }

  toggleTemplatesDropdown(): void {
    this.showTemplatesDropdown.update((show: boolean) => !show);
  }

  // Get actual exits for a node (including dynamic switch cases)
  private getNodeExits(node: WorkflowNode): string[] {
    const config = this.configService.getNodeTypeConfig(node.type);
    const exits = config?.exits || [];
    
    // Special handling for switch nodes
    if (node.type === 'control.switch') {
      const casesValue = node.params?.['cases'];
      const cases: string[] = [];
      
      if (casesValue) {
        if (typeof casesValue === 'string') {
          const parsed = casesValue.split(',').map(c => c.trim()).filter(c => c.length > 0);
          cases.push(...parsed);
        } else if (Array.isArray(casesValue)) {
          cases.push(...casesValue);
        }
      }
      
      // Return cases + default
      return [...cases, 'default'];
    }
    
    return exits;
  }

  // Additional methods needed by template
  getEdgePoints(edge: WorkflowEdge): { x1: number; y1: number; x2: number; y2: number; mx: number } | null {
    const fromNode = this.nodes().find((n: WorkflowNode) => n.id === edge.from);
    const toNode = this.nodes().find((n: WorkflowNode) => n.id === edge.to);
    if (!fromNode || !toNode) return null;
    
    // Calculate exit point Y position using actual exits (including dynamic ones)
    const exits = this.getNodeExits(fromNode);
    let exitY = this.NODE_SIZE.h / 2; // Default to center
    
    if (exits.length > 0 && edge.exitPoint) {
      const exitIndex = exits.indexOf(edge.exitPoint);
      if (exitIndex !== -1) {
        if (exits.length === 1) {
          exitY = this.NODE_SIZE.h / 2;
        } else {
          // Match the calculation in workflow-node component
          const padding = 20;
          const availableHeight = this.NODE_SIZE.h - (padding * 2);
          const spacing = availableHeight / (exits.length - 1);
          exitY = padding + (exitIndex * spacing);
        }
      }
    }
    
    const x1 = fromNode.x + this.NODE_SIZE.w;
    const y1 = fromNode.y + exitY;
    const x2 = toNode.x;
    const y2 = toNode.y + this.NODE_SIZE.h / 2; // Input point is always centered
    const mx = (x1 + x2) / 2;
    
    return { x1, y1, x2, y2, mx };
  }

  getEdgePath(edge: WorkflowEdge): string {
    const points = this.getEdgePoints(edge);
    if (!points) return '';
    return `M ${points.x1} ${points.y1} C ${points.mx} ${points.y1}, ${points.mx-20} ${points.y2}, ${points.x2-16} ${points.y2}`;
  }

  // Mock simulation methods
  runSimulation(): void {
    alert('This is a mock. Attach to your engine for live runs.');
  }

  viewLastRun(): void {
    alert('This is a mock log view.');
  }

  // Workflow property update methods
  updateWorkflowField(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const updatedWorkflow = { ...currentWorkflow, [field]: value };
      this.currentWorkflow.set(updatedWorkflow);
      this.saveStateToHistory(`Updated workflow ${field}`);
    }
  }

  // Update workflow field without saving to history (for real-time updates)
  updateWorkflowFieldSilent(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const updatedWorkflow = { ...currentWorkflow, [field]: value };
      this.currentWorkflow.set(updatedWorkflow);
    }
  }

  updateWorkflowMetadata(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const metadata = currentWorkflow.metadata || {};
      const updatedMetadata = { ...metadata, [field]: value };
      const updatedWorkflow = { ...currentWorkflow, metadata: updatedMetadata };
      this.currentWorkflow.set(updatedWorkflow);
      this.saveStateToHistory(`Updated metadata ${field}`);
    }
  }

  // Update workflow metadata without saving to history (for real-time updates)
  updateWorkflowMetadataSilent(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const metadata = currentWorkflow.metadata || {};
      const updatedMetadata = { ...metadata, [field]: value };
      const updatedWorkflow = { ...currentWorkflow, metadata: updatedMetadata };
      this.currentWorkflow.set(updatedWorkflow);
    }
  }

  // Update workflow variables
  updateWorkflowVariables(variables: Record<string, string>): void {
    // Update the variables service
    this.variablesService.setVariables(variables);
    
    // Also update the current workflow signal for consistency
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const updatedWorkflow = { ...currentWorkflow, variables };
      this.currentWorkflow.set(updatedWorkflow);
      this.saveStateToHistory('Updated workflow variables');
    }
  }

  // Validation method for workflow properties
  validateWorkflow(): { isValid: boolean; errors: string[] } {
    const workflow = this.currentWorkflow();
    const errors: string[] = [];

    if (!workflow) {
      errors.push('No workflow data available');
      return { isValid: false, errors };
    }

    // Check required fields
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow name is required');
    }

    // Optional: Check if at least one node exists
    const nodes = this.nodes();
    if (nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
