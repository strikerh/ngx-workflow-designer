import { Injectable, signal, computed, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  WorkflowNode,
  WorkflowEdge,
  PaletteItem,
  DragState,
  WorkflowExport,
  WorkflowHistoryState,
  NODE_SIZE,
} from '../../workflow-designer/workflow-designer.interfaces';
import { WorkflowApiService, ApiWorkflow } from '../core/services/workflow-api.service';
import { WorkflowHistoryService } from './workflow-history.service';
import { WorkflowNodesConfigService } from './workflow-nodes-config.service';
import { WorkflowVariablesService } from './workflow-variables.service';
import { SpecialMarkersService } from './special-markers.service';

@Injectable({ providedIn: 'root' })
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
  invalidFields = signal<Map<string, string[]>>(new Map());
  unconnectedExits = signal<Map<string, string[]>>(new Map());
  unconnectedInputs = signal<Set<string>>(new Set());

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
    return [
      { type: 'trigger.manual', label: 'Manual Trigger', color: 'bg-amber-100 border-amber-300' },
      { type: 'control.if', label: 'If / Else', color: 'bg-sky-100 border-sky-300' },
      { type: 'control.switch', label: 'Switch', color: 'bg-sky-100 border-sky-300' },
      { type: 'action.sms', label: 'SMS', color: 'bg-emerald-100 border-emerald-300' },
      { type: 'end.terminate', label: 'End', color: 'bg-slate-100 border-slate-300' },
    ];
  });

  readonly TYPE_ICONS = computed<Record<string, string>>(() => {
    if (this.configService.isConfigLoaded()) {
      return this.configService.getTypeIcons();
    }
    return {
      'trigger.manual': '⚡',
      'trigger.webhook': '🔗',
      'control.if': '�',
      'control.switch': '🧭',
      'action.sms': '💬',
      'action.email': '✉️',
      'end.terminate': '⛔',
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
    @Optional() private router: Router | null,
  ) {
    this.setupMouseListeners();
    this.loadTemplateIds();
    this.saveStateToHistory('Initial state');
  }

  // History service capabilities
  canUndo = computed(() => this.historyService.canUndo());
  canRedo = computed(() => this.historyService.canRedo());

  // Conversion methods between API and internal formats
  private convertApiWorkflowToInternal(apiWorkflow: ApiWorkflow, preserveIdentity: boolean = false): void {
    const nodes: WorkflowNode[] = apiWorkflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.data.label,
      x: node.position.x,
      y: node.position.y,
      params: node.data.params || {},
    }));

    const edges: WorkflowEdge[] = apiWorkflow.edges.map((edge) => ({
      id: edge.id,
      from: edge.source,
      to: edge.target,
      exitPoint: edge.data?.['exitPoint'],
    }));

    this.nodes.set(nodes);
    this.edges.set(edges);

    if (!preserveIdentity) {
      this.currentWorkflowId.set(apiWorkflow.workflowId.toString());
      this.currentWorkflow.set(apiWorkflow);
    } else {
      const currentWorkflow = this.currentWorkflow();
      if (currentWorkflow) {
        this.currentWorkflow.set({
          ...currentWorkflow,
          metadata: apiWorkflow.metadata,
        });
      }
    }

    if (apiWorkflow.variables) {
      this.variablesService.setVariables(apiWorkflow.variables);
    } else {
      this.variablesService.clearVariables();
    }
  }

  private convertInternalToApiWorkflow(
    name: string,
    description?: string,
  ): Omit<ApiWorkflow, 'workflowId' | 'createdAt' | 'modifiedAt' | 'isDeleted'> {
    const currentNodes = this.nodes();
    const currentEdges = this.edges();
    const variables = this.variablesService.variables();

    return {
      name,
      description,
      nodes: currentNodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          icon: this.getTypeIcon(node.type),
          params: node.params,
        },
      })),
      edges: currentEdges.map((edge) => ({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        data: edge.exitPoint ? { exitPoint: edge.exitPoint } : {},
      })),
      variables,
      metadata: {
        category: 'user-created',
        priority: 'medium',
        author: 'workflow-designer',
        version: '1.0',
      },
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

    const nodeTypeConfig = this.configService.getNodeTypeConfig(type);

    let processedDefaults = {} as Record<string, any>;
    if (nodeTypeConfig && nodeTypeConfig.properties) {
      processedDefaults = this.specialMarkersService.processNodeDefaults(nodeTypeConfig.properties, {
        workflowId: this.currentWorkflowId(),
        timestamp: new Date(),
      });
    }

    const node: WorkflowNode = {
      id,
      type,
      label: opts.label || meta?.label || type,
      x: opts.x ?? baseX,
      y: opts.y ?? baseY,
      params: { ...processedDefaults, ...(opts.params || {}) },
    };

    this.nodes.update((nodes: WorkflowNode[]) => [...nodes, node]);
    this.selectedNodeId.set(id);
    this.saveStateToHistory(`Added node: ${node.label}`);
  }

  removeNode(id: string): void {
    const nodeToRemove = this.nodes().find((n) => n.id === id);
    const nodeLabel = nodeToRemove?.label || 'node';
    this.nodes.update((nodes: WorkflowNode[]) => nodes.filter((n) => n.id !== id));
    this.edges.update((edges: WorkflowEdge[]) => edges.filter((e) => e.from !== id && e.to !== id));
    if (this.selectedNodeId() === id) {
      this.selectedNodeId.set(null);
    }
    this.saveStateToHistory(`Removed node: ${nodeLabel}`);
  }

  duplicateNode(id: string): void {
    const currentNodes = this.nodes();
    const nodeToDuplicate = currentNodes.find((n) => n.id === id);
    if (!nodeToDuplicate) return;

    const newId = this.uid('node');
    const duplicatedNode: WorkflowNode = {
      ...nodeToDuplicate,
      id: newId,
      x: nodeToDuplicate.x + 150,
      y: nodeToDuplicate.y + 50,
      label: `${nodeToDuplicate.label} (Copy)`,
    };

    this.nodes.update((nodes: WorkflowNode[]) => [...nodes, duplicatedNode]);
    this.selectedNodeId.set(newId);
    this.saveStateToHistory(`Duplicated node: ${nodeToDuplicate.label}`);
  }

  removeEdge(id: string): void {
    this.edges.update((edges: WorkflowEdge[]) => edges.filter((e) => e.id !== id));
    if (this.selectedEdgeId() === id) {
      this.selectedEdgeId.set(null);
    }
    this.saveStateToHistory('Removed connection');
  }

  startConnect(fromId: string, exitPoint?: string): void {
    if (!this.isConnectMode()) return;

    const currentConnectFrom = this.connectFrom();
    if (currentConnectFrom && currentConnectFrom !== fromId) {
      const currentEdges = this.edges();
      const fromNode = this.nodes().find((n) => n.id === currentConnectFrom);
      const toNode = this.nodes().find((n) => n.id === fromId);

      const storedExitPoint = this.connectFromExitPoint();

      const sameExitExists = currentEdges.some(
        (e: WorkflowEdge) => e.from === currentConnectFrom && e.to === fromId && e.exitPoint === storedExitPoint,
      );
      const reverseExists = currentEdges.some((e: WorkflowEdge) => e.from === fromId && e.to === currentConnectFrom);

      if (!sameExitExists && !reverseExists) {
        this.edges.update((edges: WorkflowEdge[]) => [
          ...edges,
          {
            id: this.uid('edge'),
            from: currentConnectFrom,
            to: fromId,
            exitPoint: storedExitPoint || 'next',
          },
        ]);
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

    this.connectFrom.set(fromId);
    this.connectFromExitPoint.set(exitPoint || 'next');
  }

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

    if (wasDragging && draggedNodeId) {
      const movedNode = this.nodes().find((n) => n.id === draggedNodeId);
      const nodeLabel = movedNode?.label || 'node';
      this.saveStateToHistory(`Moved ${nodeLabel}`);
    }
  }

  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.nodes.update((nodes: WorkflowNode[]) => nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
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

  // New zoom helper keeping cursor focus stable
  zoomAt(deltaY: number, worldX: number, worldY: number): void {
    const current = this.zoom();
    const direction = deltaY < 0 ? 1 : -1; // wheel up => zoom in
    let target = direction > 0 ? current * this.ZOOM_STEP : current / this.ZOOM_STEP;
    target = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, target));
    if (target === current) return;

    const panX = this.panOffsetX();
    const panY = this.panOffsetY();
    const scaleRatio = current / target;

    const newPanX = (panX + worldX) * scaleRatio - worldX;
    const newPanY = (panY + worldY) * scaleRatio - worldY;

    this.zoom.set(target);
    this.panOffsetX.set(newPanX);
    this.panOffsetY.set(newPanY);
  }

  zoomIn(centerWorldX = 0, centerWorldY = 0): void {
    this.zoomAt(-100, centerWorldX, centerWorldY);
  }
  zoomOut(centerWorldX = 0, centerWorldY = 0): void {
    this.zoomAt(100, centerWorldX, centerWorldY);
  }

  private setupMouseListeners(): void {
    // kept for backwards compatibility; canvas handles listeners
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
        next: currentEdges.filter((e: WorkflowEdge) => e.from === n.id).map((e: WorkflowEdge) => e.to),
      })),
      variables: {},
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
      if ('nodes' in workflowData && Array.isArray(workflowData.nodes) && workflowData.nodes.length > 0) {
        const firstNode = workflowData.nodes[0] as any;

        if (firstNode.position && typeof firstNode.position.x === 'number') {
          this.convertApiWorkflowToInternal(workflowData as ApiWorkflow, true);
          this.saveStateToHistory('Imported workflow from JSON');
          return;
        }

        if (typeof firstNode.x === 'number' && typeof firstNode.y === 'number') {
          this.resetAll();

          const nodes: WorkflowNode[] = workflowData.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            label: n.label || n.type.split('.').pop() || 'Node',
            params: n.params || {},
            x: n.x || 100,
            y: n.y || 100,
          }));

          const edges: WorkflowEdge[] = [];
          (workflowData as any).nodes.forEach((n: any) => {
            if (n.next && Array.isArray(n.next)) {
              n.next.forEach((targetId: string, index: number) => {
                edges.push({ id: `edge_${n.id}_${targetId}_${index}`, from: n.id, to: targetId });
              });
            }
          });

          this.nodes.set(nodes);
          this.edges.set(edges);
          this.saveStateToHistory('Imported workflow from JSON (legacy format with positions)');
          return;
        }

        const exportData = workflowData as WorkflowExport;
        this.resetAll();

        const nodes: WorkflowNode[] = exportData.nodes.map((n: any, index: number) => ({
          id: n.id,
          type: n.type,
          label: n.label || n.type.split('.').pop() || 'Node',
          params: n.params || {},
          x: 100 + (index % 3) * 200,
          y: 100 + Math.floor(index / 3) * 150,
        }));

        const edges: WorkflowEdge[] = [];
        exportData.nodes.forEach((n: any) => {
          if (n.next && Array.isArray(n.next)) {
            n.next.forEach((targetId: string, index: number) => {
              edges.push({ id: `edge_${n.id}_${targetId}_${index}`, from: n.id, to: targetId });
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
      if (error instanceof Error && error.message === 'Invalid workflow format') {
        throw error;
      }
      console.warn('Import completed with warnings:', error);
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen.update((current) => !current);
  }

  async saveToApi(): Promise<{ success: boolean; message: string }> {
    const validation = this.validateWorkflow();
    if (!validation.isValid) {
      return { success: false, message: `Validation failed: ${validation.errors.join(', ')}` };
    }

    const workflow = this.currentWorkflow();
    if (!workflow) return { success: false, message: 'No workflow data available' };

    const success = await this.saveWorkflow(workflow.name || 'Untitled Workflow', workflow.description);

    if (success) {
      await this.loadTemplateIds();
      return { success: true, message: `Workflow "${workflow.name}" saved successfully` };
    } else {
      return { success: false, message: `Failed to save workflow "${workflow.name}"` };
    }
  }

  async refreshTemplateIds(): Promise<void> {
    await this.loadTemplateIds();
  }

  validate(): string[] {
    const errors: string[] = [];
    const currentNodes = this.nodes();
    const currentEdges = this.edges();

    const triggers = currentNodes.filter((n: WorkflowNode) => n.type.startsWith('trigger.'));
    if (triggers.length === 0) errors.push('No trigger node found. Workflow must start with at least one trigger.');

    const manualTriggers = currentNodes.filter((n: WorkflowNode) => n.type === 'trigger.manual');
    if (manualTriggers.length > 1) errors.push(`Multiple manual triggers found (${manualTriggers.length}). Only one trigger.manual is allowed per workflow.`);

    if (currentNodes.length === 0) {
      errors.push('Workflow is empty. Add at least one node to continue.');
      return errors;
    }

    const adjacency = new Map(currentNodes.map((n: WorkflowNode) => [n.id, [] as string[]]));
    currentEdges.forEach((e: WorkflowEdge) => adjacency.get(e.from)?.push(e.to));

    const visited = new Set<string>();
    const queue = [...triggers.map((t) => t.id)];

    while (queue.length) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const nxt of adjacency.get(cur) || []) queue.push(nxt);
    }

    const orphan = currentNodes.filter((n: WorkflowNode) => !visited.has(n.id));
    if (orphan.length > 0) errors.push(`Orphan nodes not connected to any trigger: ${orphan.map((o) => o.label).join(', ')}`);

    const unconnectedInputsSet = new Set<string>();
    const nodesWithInputs = currentNodes.filter((n: WorkflowNode) => !n.type.startsWith('trigger.'));
    nodesWithInputs.forEach((node: WorkflowNode) => {
      const hasIncomingEdge = currentEdges.some((e: WorkflowEdge) => e.to === node.id);
      if (!hasIncomingEdge) unconnectedInputsSet.add(node.id);
    });
    this.unconnectedInputs.set(unconnectedInputsSet);

    const invalidFieldsMap = new Map<string, string[]>();
    currentNodes.forEach((node: WorkflowNode) => {
      const config = this.configService.getNodeTypeConfig(node.type);
      if (!config) return;
      const requiredFields = (config.properties || []).filter((p) => p.required);
      const nodeInvalidFields: string[] = [];
      requiredFields.forEach((field) => {
        const value = node.params[field.key];
        if (value === undefined || value === null || value === '') {
          errors.push(`Node "${node.label}" is missing required field: ${field.label}`);
          nodeInvalidFields.push(field.key);
        }
      });
      if (nodeInvalidFields.length > 0) invalidFieldsMap.set(node.id, nodeInvalidFields);
    });
    this.invalidFields.set(invalidFieldsMap);

    const terminalNodes = currentNodes.filter((n: WorkflowNode) => n.type.startsWith('end.'));
    terminalNodes.forEach((node: WorkflowNode) => {
      const outgoing = currentEdges.filter((e: WorkflowEdge) => e.from === node.id);
      if (outgoing.length > 0) errors.push(`Terminal node "${node.label}" should not have outgoing connections`);
    });

    const unconnectedExitsMap = new Map<string, string[]>();
    const nonTerminalNodes = currentNodes.filter((n: WorkflowNode) => !n.type.startsWith('end.') && !n.type.startsWith('trigger.'));
    nonTerminalNodes.forEach((node: WorkflowNode) => {
      const outgoing = currentEdges.filter((e: WorkflowEdge) => e.from === node.id);
      const config = this.configService.getNodeTypeConfig(node.type);
      const expectedExits = config?.exits || [];
      if (expectedExits.length > 0 && outgoing.length === 0) errors.push(`Node "${node.label}" has no outgoing connections`);
      if (expectedExits.length > 0) {
        const connectedExits = new Set(outgoing.map((e) => e.exitPoint || 'next'));
        const missingExits = expectedExits.filter((exitName) => !connectedExits.has(exitName));
        if (missingExits.length > 0) {
          errors.push(`Node "${node.label}" has unconnected exit points: ${missingExits.join(', ')}`);
          unconnectedExitsMap.set(node.id, missingExits);
        }
      }
    });
    this.unconnectedExits.set(unconnectedExitsMap);

    const labelCounts = new Map<string, number>();
    currentNodes.forEach((node: WorkflowNode) => {
      const count = labelCounts.get(node.label) || 0;
      labelCounts.set(node.label, count + 1);
    });
    labelCounts.forEach((count, label) => {
      if (count > 1) errors.push(`Duplicate node label "${label}" found ${count} times. Consider using unique labels.`);
    });

    currentEdges.forEach((edge: WorkflowEdge) => {
      const sourceExists = currentNodes.some((n) => n.id === edge.from);
      const targetExists = currentNodes.some((n) => n.id === edge.to);
      if (!sourceExists) errors.push(`Edge ${edge.id} has missing source node`);
      if (!targetExists) errors.push(`Edge ${edge.id} has missing target node`);
    });

    const detectCycle = (): boolean => {
      const visited = new Set<string>();
      const recStack = new Set<string>();
      const hasCycle = (nodeId: string): boolean => {
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          recStack.add(nodeId);
          const neighbors = adjacency.get(nodeId) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && hasCycle(neighbor)) return true;
            else if (recStack.has(neighbor)) return true;
          }
        }
        recStack.delete(nodeId);
        return false;
      };
      for (const node of currentNodes) if (hasCycle(node.id)) return true;
      return false;
    };

    if (detectCycle()) errors.push('Circular dependency detected. Workflow contains an infinite loop.');

    if (terminalNodes.length === 0) errors.push('No terminal/end node found. Workflow should have at least one end point.');

    return errors;
  }

  runValidate(): void {
    const errors = this.validate();
    this.validationResult.set({ success: errors.length === 0, errors });
    this.showValidationDialog.set(true);
    if (errors.length === 0) {
      this.invalidFields.set(new Map());
      this.unconnectedExits.set(new Map());
      this.unconnectedInputs.set(new Set());
    }
  }

  isFieldInvalid(nodeId: string, fieldKey: string): boolean {
    const nodeInvalidFields = this.invalidFields().get(nodeId);
    return nodeInvalidFields ? nodeInvalidFields.includes(fieldKey) : false;
  }

  isExitUnconnected(nodeId: string, exitPoint: string): boolean {
    const nodeUnconnectedExits = this.unconnectedExits().get(nodeId);
    return nodeUnconnectedExits ? nodeUnconnectedExits.includes(exitPoint) : false;
  }

  isInputUnconnected(nodeId: string): boolean {
    return this.unconnectedInputs().has(nodeId);
  }

  clearInputHighlight(nodeId: string): void {
    const currentSet = this.unconnectedInputs();
    if (currentSet.has(nodeId)) {
      const newSet = new Set(currentSet);
      newSet.delete(nodeId);
      this.unconnectedInputs.set(newSet);
    }
  }

  clearExitHighlight(nodeId: string, exitPoint: string): void {
    const currentMap = this.unconnectedExits();
    const nodeExits = currentMap.get(nodeId);
    if (nodeExits && nodeExits.includes(exitPoint)) {
      const newMap = new Map(currentMap);
      const filteredExits = nodeExits.filter((e) => e !== exitPoint);
      if (filteredExits.length > 0) newMap.set(nodeId, filteredExits);
      else newMap.delete(nodeId);
      this.unconnectedExits.set(newMap);
    }
  }

  clearFieldHighlight(nodeId: string, fieldKey: string): void {
    const currentMap = this.invalidFields();
    const nodeFields = currentMap.get(nodeId);
    if (nodeFields && nodeFields.includes(fieldKey)) {
      const newMap = new Map(currentMap);
      const filteredFields = nodeFields.filter((f) => f !== fieldKey);
      if (filteredFields.length > 0) newMap.set(nodeId, filteredFields);
      else newMap.delete(nodeId);
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

    this.currentWorkflowId.set('new');

    this.variablesService.clearAll();

    const newWorkflow = {
      id: 'new-workflow',
      name: '',
      description: '',
      nodes: [],
      edges: [],
      metadata: { category: '', priority: '', author: '', version: '', approved: undefined, tags: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    this.currentWorkflow.set(newWorkflow);

    this.historyService.clearHistory();
  }

  saveStateToHistory(description?: string): void {
    const state: WorkflowHistoryState = {
      nodes: this.nodes(),
      edges: this.edges(),
      selectedNodeId: this.selectedNodeId(),
      selectedEdgeId: this.selectedEdgeId(),
    };
    this.historyService.saveState(state, description);
  }

  undo(): void {
    const state = this.historyService.undo();
    if (state) this.restoreState(state);
  }

  redo(): void {
    const state = this.historyService.redo();
    if (state) this.restoreState(state);
  }

  getHistoryStack() {
    return this.historyService.getHistoryStack();
  }

  logHistory(): void {
    const history = this.historyService.getHistoryStack();
    console.group('📜 Workflow History');
    console.log(`Total entries: ${history.length}`);
    console.table(
      history.map((h) => ({ '#': h.index, Current: h.isCurrent ? '→' : '', Description: h.description || '(no description)', Timestamp: h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : '' })),
    );
    console.groupEnd();
  }

  private restoreState(state: WorkflowHistoryState): void {
    this.nodes.set(state.nodes);
    this.edges.set(state.edges);
    this.selectedNodeId.set(state.selectedNodeId);
    this.selectedEdgeId.set(state.selectedEdgeId);
  }

  clearHistory(): void {
    this.historyService.clearHistory();
  }

  async loadTemplate(name: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.workflowApi.getWorkflow(name));
      if (response.errors.length === 0 && response.results) {
        const workflow = (response.results as any).data || response.results;
        this.resetAll();
        this.convertApiWorkflowToInternal(workflow);
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
      return response.map((workflow) => workflow.workflowId.toString());
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  private async loadTemplateIds(): Promise<void> {
    try {
      const templates = await firstValueFrom(this.workflowApi.getTemplates());
      this.templates.set(templates);
      this.templateIds.set(templates.map((t) => t.workflowId.toString()));
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templateIds.set([]);
      this.templates.set([]);
    }
  }

  getTemplateIds(): string[] {
    return this.templateIds();
  }

  getTemplates(): ApiWorkflow[] {
    return this.templates();
  }

  async saveWorkflow(name: string, description?: string): Promise<boolean> {
    try {
      const workflowData = this.convertInternalToApiWorkflow(name, description);
      const currentId = this.currentWorkflowId();

      if (currentId && currentId !== 'workflow' && currentId !== 'new') {
        const response = await firstValueFrom(this.workflowApi.updateWorkflow(currentId, workflowData));
        if (response.errors.length === 0 && response.results) {
          const workflow = (response.results as any).data || response.results;
          this.currentWorkflow.set(workflow);
        }
        return response.errors.length === 0;
      } else {
        const response = await firstValueFrom(this.workflowApi.createWorkflow(workflowData));
        if (response.errors.length === 0 && response.results) {
          const workflow = (response.results as any).data || response.results;
          this.currentWorkflowId.set(workflow.workflowId.toString());
          this.currentWorkflow.set(workflow);
          // Update URL if router is available
          if (this.router) {
            this.router.navigate(['/'], { queryParams: { id: workflow.workflowId }, replaceUrl: true });
          }
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
        const workflow = (response.results as any).data || response.results;
        this.resetAll();
        this.convertApiWorkflowToInternal(workflow);
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
        this.saveStateToHistory();
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
      if (response.errors.length !== 0) return [];
      let results: any = response.results;
      if (results && Array.isArray(results.data)) results = results.data;
      return (Array.isArray(results) ? results : []) as ApiWorkflow[];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  updateNode(id: string, patch: Partial<WorkflowNode>): void {
    const node = this.nodes().find((n) => n.id === id);
    const nodeLabel = node?.label || 'node';
    this.nodes.update((nodes: WorkflowNode[]) => nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    const fieldName = Object.keys(patch)[0] || 'field';
    this.saveStateToHistory(`Updated ${nodeLabel} ${fieldName}`);
  }

  updateNodeSilent(id: string, patch: Partial<WorkflowNode>): void {
    this.nodes.update((nodes: WorkflowNode[]) => nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  updateParam(id: string, key: string, value: any): void {
    const node = this.nodes().find((n) => n.id === id);
    const nodeLabel = node?.label || 'node';
    this.nodes.update((nodes: WorkflowNode[]) => nodes.map((n) => (n.id === id ? { ...n, params: { ...n.params, [key]: value } } : n)));
    this.saveStateToHistory(`Updated ${nodeLabel} ${key}`);
  }

  updateParamSilent(id: string, key: string, value: any): void {
    this.nodes.update((nodes: WorkflowNode[]) => nodes.map((n) => (n.id === id ? { ...n, params: { ...n.params, [key]: value } } : n)));
  }

  cssForType(type: string): string {
    if (this.configService.isConfigLoaded()) {
      const nodeColors = this.configService.getNodeColors();
      if (nodeColors[type]) return nodeColors[type];
    }
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
      // 1) Dynamic summary from node type config: look for first field marked showInNode
      const cfg = this.configService.getNodeTypeConfig(node.type);
      if (cfg && Array.isArray(cfg.properties)) {
        const field = cfg.properties.find((p: any) => p && (p as any).showInNode === true) as any;
        if (field && field.key) {
          const raw = node.params?.[field.key];
          if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
            const val = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
            // Truncate to keep node compact
            const short = val.length > 40 ? val.slice(0, 37) + '…' : val;
            return `<b>${field.label || field.key}</b>: ${short}`;
          }
        }
      }

      // 2) Smarter generic fallback when no showInNode field is configured
      // Prefer the first param (excluding 'label') with a non-empty value; else use the node label
      const params = node.params || {};
      const firstEntry = Object.entries(params).find(([k, v]) => k !== 'label' && v !== undefined && v !== null && String(v).trim() !== '');
      if (firstEntry) {
        const [k, v] = firstEntry;
        const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
        const short = val.length > 40 ? val.slice(0, 37) + '…' : val;
        return `<b>${k}</b>: ${short}`;
      } 
      return node.label || node.type;
    } catch {
      return node.type;
    }
  }

  toggleTemplatesDropdown(): void {
    this.showTemplatesDropdown.update((show: boolean) => !show);
  }

  private getNodeExits(node: WorkflowNode): string[] {
    const config = this.configService.getNodeTypeConfig(node.type);
    const exits = config?.exits || [];
    if (node.type === 'control.switch') {
      const casesValue = node.params?.['cases'];
      const cases: string[] = [];
      if (casesValue) {
        if (typeof casesValue === 'string') {
          const parsed = casesValue.split(',').map((c) => c.trim()).filter((c) => c.length > 0);
          cases.push(...parsed);
        } else if (Array.isArray(casesValue)) {
          cases.push(...casesValue);
        }
      }
      return [...cases, 'default'];
    }
    return exits;
  }

  getEdgePoints(edge: WorkflowEdge): { x1: number; y1: number; x2: number; y2: number; mx: number } | null {
    const fromNode = this.nodes().find((n: WorkflowNode) => n.id === edge.from);
    const toNode = this.nodes().find((n: WorkflowNode) => n.id === edge.to);
    if (!fromNode || !toNode) return null;

    const exits = this.getNodeExits(fromNode);
    let exitY = this.NODE_SIZE.h / 2;
    if (exits.length > 0 && edge.exitPoint) {
      const exitIndex = exits.indexOf(edge.exitPoint);
      if (exitIndex !== -1) {
        if (exits.length === 1) exitY = this.NODE_SIZE.h / 2;
        else {
          const padding = 20;
          const availableHeight = this.NODE_SIZE.h - padding * 2;
          const spacing = availableHeight / (exits.length - 1);
          exitY = padding + exitIndex * spacing;
        }
      }
    }
    const x1 = fromNode.x + this.NODE_SIZE.w;
    const y1 = fromNode.y + exitY;
    const x2 = toNode.x;
    const y2 = toNode.y + this.NODE_SIZE.h / 2;
    const mx = (x1 + x2) / 2;
    return { x1, y1, x2, y2, mx };
  }

  getEdgePath(edge: WorkflowEdge): string {
    const points = this.getEdgePoints(edge);
    if (!points) return '';
    return `M ${points.x1} ${points.y1} C ${points.mx} ${points.y1}, ${points.mx - 20} ${points.y2}, ${points.x2 - 16} ${points.y2}`;
  }

  runSimulation(): void {
    alert('This is a mock. Attach to your engine for live runs.');
  }

  viewLastRun(): void {
    alert('This is a mock log view.');
  }

  updateWorkflowField(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const updatedWorkflow = { ...currentWorkflow, [field]: value } as any;
      this.currentWorkflow.set(updatedWorkflow);
      this.saveStateToHistory(`Updated workflow ${field}`);
    }
  }

  updateWorkflowFieldSilent(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const updatedWorkflow = { ...currentWorkflow, [field]: value } as any;
      this.currentWorkflow.set(updatedWorkflow);
    }
  }

  updateWorkflowMetadata(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const metadata = (currentWorkflow as any).metadata || {};
      const updatedMetadata = { ...metadata, [field]: value };
      const updatedWorkflow = { ...currentWorkflow, metadata: updatedMetadata } as any;
      this.currentWorkflow.set(updatedWorkflow);
      this.saveStateToHistory(`Updated metadata ${field}`);
    }
  }

  updateWorkflowMetadataSilent(field: string, value: any): void {
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const metadata = (currentWorkflow as any).metadata || {};
      const updatedMetadata = { ...metadata, [field]: value };
      const updatedWorkflow = { ...currentWorkflow, metadata: updatedMetadata } as any;
      this.currentWorkflow.set(updatedWorkflow);
    }
  }

  updateWorkflowVariables(variables: Record<string, string>): void {
    this.variablesService.setVariables(variables);
    const currentWorkflow = this.currentWorkflow();
    if (currentWorkflow) {
      const updatedWorkflow = { ...currentWorkflow, variables } as any;
      this.currentWorkflow.set(updatedWorkflow);
      this.saveStateToHistory('Updated workflow variables');
    }
  }

  validateWorkflow(): { isValid: boolean; errors: string[] } {
    const workflow = this.currentWorkflow();
    const errors: string[] = [];
    if (!workflow) return { isValid: false, errors: ['No workflow data available'] };
    if (!workflow.name || (workflow.name as string).trim() === '') errors.push('Workflow name is required');
    const nodes = this.nodes();
    if (nodes.length === 0) errors.push('Workflow must contain at least one node');
    return { isValid: errors.length === 0, errors };
  }
}
