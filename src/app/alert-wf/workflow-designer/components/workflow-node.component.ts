import { Component, Input, Output, EventEmitter, HostBinding, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowNode } from '../workflow-designer.interfaces';
import { WorkflowDesignerService } from '../workflow-designer.service';
import { WorkflowNodesConfigService } from '../workflow-nodes-config.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      (mousedown)="onMouseDown($event)"
      (dblclick)="onDoubleClick()"
      class="rounded-xl border shadow-sm h-full w-full select-none relative group isolate"
      [class.ring-2]="node.id === workflowService.selectedNodeId()"
      [class.ring-indigo-400]="node.id === workflowService.selectedNodeId()"
      [ngClass]="workflowService.cssForType(node.type)">
      
      <!-- Input connection point (left side) - hidden for trigger nodes -->
      @if (!isTriggerNode()) {
        <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 
                    p-2 cursor-pointer z-[1]"
             (click)="onInputClick($event)"
             title="Input">
          <div class="w-3 h-3 rounded-full bg-white border-2 transition-all duration-200"
               [class.border-red-600]="isInputUnconnected() && !isValidConnectionTarget()"
               [class.bg-red-50]="isInputUnconnected() && !isValidConnectionTarget()"
               [class.border-slate-400]="!isInputUnconnected() && !isValidConnectionTarget()"
               [class.hover:border-indigo-500]="!isInputUnconnected() && !isValidConnectionTarget()"
               [class.hover:bg-indigo-50]="!isInputUnconnected() && !isValidConnectionTarget()"
               [class.border-green-500]="isValidConnectionTarget()"
               [class.bg-green-50]="isValidConnectionTarget()"
               [class.animate-pulse]="isValidConnectionTarget()"
               [class.scale-125]="isValidConnectionTarget()">
          </div>
        </div>
      }

      <!-- Output connection points (right side) -->
      @for (exit of nodeExits(); track exit; let i = $index) {
        <div class="absolute right-0 p-2 z-[1] transition-all duration-200"
             [style.top.px]="getExitPointY(i)"
             [style.transform]="'translate(50%, -50%)'"
             [class.cursor-not-allowed]="isOutputPointDisabled()"
             [class.cursor-pointer]="!isOutputPointDisabled()"
             (click)="onExitClick($event, exit)"
             [title]="isOutputPointDisabled() ? 'Cannot connect output to output' : getExitLabel(exit)">
          <div class="w-3 h-3 rounded-full bg-white border-2 transition-all duration-200"
               [class.border-red-600]="isExitUnconnected(exit) && !isOutputPointDisabled()"
               [class.bg-red-50]="isExitUnconnected(exit) && !isOutputPointDisabled()"
               [class.border-green-500]="!isExitUnconnected(exit) && exit === 'onTrue' && !isOutputPointDisabled()"
               [class.border-red-500]="!isExitUnconnected(exit) && exit === 'onFalse' && !isOutputPointDisabled()"
               [class.border-blue-500]="!isExitUnconnected(exit) && exit === 'next' && !isOutputPointDisabled()"
               [class.border-amber-500]="!isExitUnconnected(exit) && exit === 'default' && !isOutputPointDisabled()"
               [class.border-purple-500]="!isExitUnconnected(exit) && isSwitchCase(exit) && !isOutputPointDisabled()"
               [class.border-gray-300]="isOutputPointDisabled()"
               [class.bg-gray-100]="isOutputPointDisabled()"
               [class.opacity-50]="isOutputPointDisabled()"
               [class.hover:border-indigo-500]="!isOutputPointDisabled() && !isOutputPointActive(exit) && !isExitUnconnected(exit)"
               [class.hover:bg-indigo-50]="!isOutputPointDisabled() && !isOutputPointActive(exit) && !isExitUnconnected(exit)"
               [class.ring-2]="isOutputPointActive(exit)"
               [class.ring-indigo-300]="isOutputPointActive(exit)"
               [class.scale-110]="isOutputPointActive(exit)">
          </div>
          <!-- Label for exit point (only visible when multiple exits) -->
          @if (nodeExits().length > 1 && !isOutputPointDisabled()) {
            <span class="absolute right-full mr-2 top-1/2 -translate-y-1/2 
                         text-[10px] font-medium whitespace-nowrap 
                         bg-white/95 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 
                         pointer-events-none shadow-sm z-[2] max-w-16 truncate">
              {{ getExitLabel(exit) }}
            </span>
          }
        </div>
      }
      
      <div class="h-full w-full p-3 flex flex-col">
        <div class="flex items-center gap-2">
          @if (isHtmlIcon(workflowService.getTypeIcon(node.type))) {
            <div class="text-base select-none flex items-center" [innerHTML]="getSafeIcon(workflowService.getTypeIcon(node.type))"></div>
          } @else {
            <span class="text-base select-none">{{ workflowService.getTypeIcon(node.type) }}</span>
          }
          <span class="font-medium text-sm line-clamp-1">{{ node.label }}</span>
        </div>
        <div class="text-[11px] text-slate-600 mt-1 truncate">
          {{ workflowService.renderSummary(node) }}
        </div>
        <div class="mt-auto flex items-center justify-between text-[11px] text-slate-500">
          <span>ID: {{ node.id.slice(-4) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      z-index: 1; /* Base z-index for nodes */
    }

    /* Selected nodes get higher z-index */
    :host:has(.ring-2) {
      z-index: 2;
    }

    /* Prevent text selection during drag */
    * {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    /* Ensure proper line clamping for node labels */
    .line-clamp-1 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }

    /* Ensure cursor changes for draggable nodes */
    .rounded-xl.border.shadow-sm {
      cursor: move;
    }

    .rounded-xl.border.shadow-sm:hover {
      cursor: grab;
    }

    .rounded-xl.border.shadow-sm:active {
      cursor: grabbing;
    }

    /* Ensure connection point labels don't overflow canvas */
    .absolute.right-full {
      max-width: fit-content;
      overflow: hidden;
    }

    /* Isolate stacking context for each node */
    .isolate {
      isolation: isolate;
    }
  `]
})
export class WorkflowNodeComponent {
  @Input({ required: true }) node!: WorkflowNode;
  @Output() mouseDown = new EventEmitter<{ event: MouseEvent; nodeId: string }>();
  @Output() doubleClick = new EventEmitter<string>();

  @HostBinding('style.left.px') get nodeX() { return this.node.x; }
  @HostBinding('style.top.px') get nodeY() { return this.node.y; }
  @HostBinding('style.width.px') get nodeWidth() { return this.workflowService.NODE_SIZE.w; }
  @HostBinding('style.height.px') get nodeHeight() { return this.workflowService.NODE_SIZE.h; }
 
  // Computed property to get exits for this node type
  nodeExits = computed(() => {
    const config = this.configService.getNodeTypeConfig(this.node.type);
    
    // Special handling for switch nodes - generate dynamic exits based on cases
    if (this.node.type === 'control.switch') {
      return this.getSwitchExits();
    }
    
    return config?.exits || [];
  });

  // Computed property to check if this is a trigger node 
  isTriggerNode = computed(() => {
    const config = this.configService.getNodeTypeConfig(this.node.type);
    return config?.category === 'trigger';
  });

  constructor(
    public workflowService: WorkflowDesignerService,
    private configService: WorkflowNodesConfigService,
    private sanitizer: DomSanitizer
  ) {}

  /**
   * Get dynamic exits for switch nodes based on cases parameter
   */
  private getSwitchExits(): string[] {
    const casesParam = this.node.params?.['cases'];
    
    if (typeof casesParam === 'string' && casesParam.trim()) {
      // Parse comma-separated string
      const cases = casesParam
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      if (cases.length > 0) {
        return [...cases, 'default'];
      }
    } else if (Array.isArray(casesParam) && casesParam.length > 0) {
      // Support array format if provided
      return [...casesParam.map(c => String(c).trim()), 'default'];
    }
    
    // Fallback to just default if no cases defined
    return ['default'];
  }

  /**
   * Check if an exit point is a switch case (not default)
   */
  isSwitchCase(exit: string): boolean {
    return this.node.type === 'control.switch' && exit !== 'default';
  }

  /**
   * Calculate Y position for exit point based on index
   */
  getExitPointY(index: number): number {
    const exits = this.nodeExits();
    if (exits.length === 0) return this.workflowService.NODE_SIZE.h / 2;
    if (exits.length === 1) return this.workflowService.NODE_SIZE.h / 2;
    
    // Distribute exit points evenly, with padding at top and bottom
    const padding = 20;
    const availableHeight = this.workflowService.NODE_SIZE.h - (padding * 2);
    const spacing = exits.length > 1 ? availableHeight / (exits.length - 1) : 0;
    
    return padding + (index * spacing);
  }

  /**
   * Get human-readable label for exit point
   */
  getExitLabel(exitPoint: string): string {
    // For switch nodes, use the case value itself as the label
    if (this.node.type === 'control.switch' && exitPoint !== 'default') {
      return exitPoint; // Show "CRITICAL", "HIGH", etc.
    }
    
    // Standard labels for other node types
    const labels: Record<string, string> = {
      'next': 'Next',
      'onTrue': 'True',
      'onFalse': 'False',
      'cases': 'Cases',
      'default': 'Default',
      'onSuccess': 'Success',
      'onFailure': 'Failure',
      'onTimeout': 'Timeout',
      'onApproved': 'Approved',
      'onRejected': 'Rejected'
    };
    return labels[exitPoint] || exitPoint;
  }

  /**
   * Check if this node is a valid connection target (input point should highlight)
   */
  isValidConnectionTarget(): boolean {
    const connectFrom = this.workflowService.connectFrom();
    const connectFromExitPoint = this.workflowService.connectFromExitPoint();
    const isConnectMode = this.workflowService.isConnectMode();
    
    // Only highlight if:
    // 1. In connect mode
    // 2. Source is set
    // 3. This is NOT the source node
    // 4. Connection was started from an OUTPUT point (exitPoint exists)
    return isConnectMode && 
           connectFrom !== null && 
           connectFrom !== this.node.id &&
           connectFromExitPoint !== null; // Must have started from output
  }

  /**
   * Check if a specific output point is currently active (being used to connect)
   */
  isOutputPointActive(exitPoint: string): boolean {
    const connectFrom = this.workflowService.connectFrom();
    const connectFromExitPoint = this.workflowService.connectFromExitPoint();
    const isConnectMode = this.workflowService.isConnectMode();
    
    // Highlight this output point if it's the one being used for connection
    return isConnectMode && connectFrom === this.node.id && connectFromExitPoint === exitPoint;
  }

  /**
   * Check if output points should be disabled (when connection started from input)
   */
  isOutputPointDisabled(): boolean {
    const connectFrom = this.workflowService.connectFrom();
    const connectFromExitPoint = this.workflowService.connectFromExitPoint();
    const isConnectMode = this.workflowService.isConnectMode();
    
    // Disable output points if connection was started from an input point
    // (connectFrom exists but connectFromExitPoint is null)
    return isConnectMode && connectFrom !== null && connectFromExitPoint === null;
  }

  /**
   * Check if an exit point is unconnected (after validation)
   */
  isExitUnconnected(exitPoint: string): boolean {
    return this.workflowService.isExitUnconnected(this.node.id, exitPoint);
  }

  /**
   * Check if input point is unconnected (after validation)
   */
  isInputUnconnected(): boolean {
    return this.workflowService.isInputUnconnected(this.node.id);
  }

  /**
   * Handle click on input point (target for connection)
   */
  onInputClick(event: MouseEvent): void {
    event.stopPropagation();
    
    // Clear red highlight when input point is clicked
    if (this.isInputUnconnected()) {
      this.workflowService.clearInputHighlight(this.node.id);
    }
    
    const connectFrom = this.workflowService.connectFrom();
    const connectFromExitPoint = this.workflowService.connectFromExitPoint();
    
    // Only complete connection if:
    // 1. In connect mode
    // 2. Have a source node
    // 3. Source is different from this node
    // 4. Connection was started from an OUTPUT point (not input→input)
    if (this.workflowService.isConnectMode() && 
        connectFrom && 
        connectFrom !== this.node.id &&
        connectFromExitPoint !== null) {
      // Call startConnect with target node - it will complete the connection
      this.workflowService.startConnect(this.node.id);
    }
    // If connectFromExitPoint is null, ignore click (can't do input→input)
  }

  /**
   * Handle click on exit point (source for connection)
   */
  onExitClick(event: MouseEvent, exitPoint: string): void {
    event.stopPropagation();
    
    // Clear red highlight when exit point is clicked
    if (this.isExitUnconnected(exitPoint)) {
      this.workflowService.clearExitHighlight(this.node.id, exitPoint);
    }
    
    const connectFrom = this.workflowService.connectFrom();
    const connectFromExitPoint = this.workflowService.connectFromExitPoint();
    
    // If already in connect mode from an OUTPUT point, ignore click (can't do output→output)
    if (this.workflowService.isConnectMode() && connectFrom && connectFromExitPoint !== null) {
      // Already connecting from an output, can't connect to another output
      return;
    }
    
    // Enable connect mode if not already enabled
    if (!this.workflowService.isConnectMode()) {
      this.workflowService.isConnectMode.set(true);
    }
    
    // Start connection with exit point information
    this.workflowService.startConnect(this.node.id, exitPoint);
  }

  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    this.mouseDown.emit({ event, nodeId: this.node.id });
  }

  onDoubleClick(): void {
    this.doubleClick.emit(this.node.id);
  }

  onEditClick(event: MouseEvent): void {
    event.stopPropagation();
    this.workflowService.selectedNodeId.set(this.node.id);
  }

  // Check if icon contains HTML markup
  isHtmlIcon(icon: string): boolean {
    if (!icon) return false;
    return icon.includes('<') || icon.includes('>');
  }

  // Get sanitized HTML icon
  getSafeIcon(icon: string): SafeHtml {
    if (!icon) return '';
    return this.sanitizer.sanitize(1, icon) || '';
  }
}
