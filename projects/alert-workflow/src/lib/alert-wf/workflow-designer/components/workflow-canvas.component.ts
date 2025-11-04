import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowDesignerService } from '../workflow-designer.service';
import { WorkflowNodeComponent } from './workflow-node.component';
import { SidePageService } from '../../../core/services/side-page.service';
import { WorkflowHistoryPanelComponent } from './workflow-history-panel.component';

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [CommonModule, WorkflowNodeComponent],
  template: `
        <!-- Connection Mode Indicator Banner (Top-Right) -->
        <div 
            *ngIf="workflowService.isConnectMode()"
            class="absolute top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-pulse text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span class="font-medium">Connection Mode</span>
            <span class="text-blue-100 text-xs">• ESC to cancel</span>
        </div>

        <!-- Unified Toolbar (Fixed position at top-center of canvas) -->
        <div class="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
            <!-- Undo button -->
            <button
                (click)="onUndoClick()"
                [disabled]="!workflowService.canUndo()"
                [class.opacity-50]="!workflowService.canUndo()"
                [class.cursor-not-allowed]="!workflowService.canUndo()"
                class="p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors disabled:hover:bg-transparent disabled:hover:text-gray-600"
                title="Undo (Ctrl+Z)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                </svg>
            </button>

            <!-- Redo button -->
            <button
                (click)="onRedoClick()"
                [disabled]="!workflowService.canRedo()"
                [class.opacity-50]="!workflowService.canRedo()"
                [class.cursor-not-allowed]="!workflowService.canRedo()"
                class="p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors disabled:hover:bg-transparent disabled:hover:text-gray-600"
                title="Redo (Ctrl+Y)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"></path>
                </svg>
            </button>

            <div class="w-px h-6 bg-gray-200"></div>

            <!-- History Panel button -->
            <button
                (click)="onHistoryPanelClick()"
                class="p-2 rounded-md hover:bg-purple-50 hover:text-purple-600 text-gray-600 transition-colors"
                title="Open history panel">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </button>

            <div class="w-px h-6 bg-gray-200"></div>

            <!-- Zoom Controls -->
            <button
                (click)="onZoomOut()"
                class="p-2 rounded-md hover:bg-gray-50 hover:text-gray-800 text-gray-600 transition-colors"
                title="Zoom Out">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                </svg>
            </button>

            <button
                (click)="onZoomIn()"
                class="p-2 rounded-md hover:bg-gray-50 hover:text-gray-800 text-gray-600 transition-colors"
                title="Zoom In">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 00-14 0 7 7 0 0014 0zM10 7v6m3-3H7"></path>
                </svg>
            </button>

            <button
                (click)="onZoomReset()"
                class="p-2 rounded-md hover:bg-gray-50 hover:text-gray-800 text-gray-600 transition-colors text-xs"
                title="Reset Zoom">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>

            <div class="w-px h-6 bg-gray-200"></div>

            <!-- Fullscreen toggle button -->
            <button
                (click)="onFullscreenToggle()"
                class="p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors"
                [title]="workflowService.isFullscreen() ? 'Exit Fullscreen' : 'Enter Fullscreen'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" *ngIf="!workflowService.isFullscreen()">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" *ngIf="workflowService.isFullscreen()">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path>
                </svg>
            </button>

            <!-- Conditional separator and selection tools -->
            <ng-container *ngIf="workflowService.selectedNodeId() || workflowService.selectedEdgeId()">
                <div class="w-px h-6 bg-gray-200"></div>

                <!-- Delete button -->
                <button
                    (click)="onDeleteClick()"
                    class="p-2 rounded-md hover:bg-red-50 hover:text-red-600 text-gray-600 transition-colors"
                    title="Delete selected item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>

                <!-- Duplicate button (only show for nodes) -->
                <button
                    *ngIf="workflowService.selectedNodeId()"
                    (click)="onDuplicateClick()"
                    class="p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors"
                    title="Duplicate selected node">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </button>
            </ng-container>
        </div>

        <!-- Canvas content that moves with pan/zoom (including grid background) -->
        <div
                #canvas
                class="absolute inset-0"
                (mousedown)="onCanvasMouseDown($event)"
                (contextmenu)="onCanvasContextMenu($event)"
                (wheel)="onCanvasWheel($event)"
                [style.transform]="'translate(' + workflowService.panOffsetX() + 'px, ' + workflowService.panOffsetY() + 'px) scale(' + workflowService.zoom() + ')'"
                [style.transform-origin]="'top left'"
                [style.cursor]="workflowService.isConnectMode() ? 'crosshair' : 'default'">

            <!-- Large Grid background that moves with pan -->
            <svg class="absolute" style="left: -5000px; top: -5000px; width: 10000px; height: 10000px;">
                <defs>
                    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>

            <!-- Edges -->
            <svg class="absolute"
                 style="left: -5000px; top: -5000px; width: 10000px; height: 10000px;">
                <g transform="translate(5000, 5000)">
                    <!-- Invisible wider paths for easier clicking -->
                    <path
                            *ngFor="let edge of workflowService.edges()"
                            [attr.d]="workflowService.getEdgePath(edge)"
                            stroke="transparent"
                            stroke-width="12"
                            fill="none"
                            class="cursor-pointer"
                            (click)="onEdgeClick($event, edge.id)"/>
                    <!-- Visible paths -->
                    <path
                            *ngFor="let edge of workflowService.edges()"
                            [attr.d]="workflowService.getEdgePath(edge)"
                            [attr.stroke]="workflowService.selectedEdgeId() === edge.id ? '#3672f3ff' : '#74faffff'"
                            [attr.stroke-width]="workflowService.selectedEdgeId() === edge.id ? '2' : '2'"
                            fill="none"
                            marker-end="url(#arrow)"
                            class="pointer-events-none"/>
                </g>
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
                    </marker>
                </defs>
            </svg>

            <!-- Nodes -->
            <app-workflow-node
                    *ngFor="let node of workflowService.nodes()"
                    [node]="node"
                    (mouseDown)="onMouseDownNode($event.event, $event.nodeId)"
                    (doubleClick)="onNodeDoubleClick($event)">
            </app-workflow-node>
        </div>

    `,
  styles: [
    `
        :host {
            @apply col-[2] row-[2] rounded-xl bg-white border relative overflow-hidden;
        }
    `,
  ],
})
export class WorkflowCanvasComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;

  constructor(
    public workflowService: WorkflowDesignerService,
    private sidePageService: SidePageService,
  ) {
    this.setupMouseListeners();
  }

  onMouseDownNode(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.workflowService.selectedNodeId.set(id);
    this.workflowService.selectedEdgeId.set(null);

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const node = this.workflowService.nodes().find((n: any) => n.id === id);
    if (!rect || !node) return;

    const zoom = this.workflowService.zoom();
    const panX = this.workflowService.panOffsetX();
    const panY = this.workflowService.panOffsetY();

    const offsetX = (event.clientX - rect.left - panX) / zoom - node.x;
    const offsetY = (event.clientY - rect.top - panY) / zoom - node.y;
    this.workflowService.setDragState(id, offsetX, offsetY);
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if (event.button === 2) {
      if (this.workflowService.isConnectMode()) {
        event.preventDefault();
        this.workflowService.cancelConnection();
      }
      return;
    }

    if (this.workflowService.isConnectMode()) {
      this.workflowService.cancelConnection();
    }

    this.workflowService.selectedNodeId.set(null);
    this.workflowService.selectedEdgeId.set(null);
    this.workflowService.startPan(event.clientX, event.clientY);
  }

  onCanvasContextMenu(event: MouseEvent): void {
    if (this.workflowService.isConnectMode()) {
      event.preventDefault();
    }
  }

  onNodeDoubleClick(nodeId: string): void {
    this.workflowService.selectedNodeId.set(nodeId);
  }

  onEdgeClick(event: MouseEvent, edgeId: string): void {
    event.stopPropagation();
    this.workflowService.selectedNodeId.set(null);
    this.workflowService.selectedEdgeId.set(edgeId);
  }

  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const zoom = this.workflowService.zoom();
    const panX = this.workflowService.panOffsetX();
    const panY = this.workflowService.panOffsetY();
    const worldX = screenX / zoom - panX;
    const worldY = screenY / zoom - panY;
    this.workflowService.zoomAt(event.deltaY, worldX, worldY);
  }

  private setupMouseListeners(): void {
    const onMove = (ev: MouseEvent) => {
      const dragState = this.workflowService.getDragState();
      const { draggingId, dx, dy } = dragState;

      if (draggingId) {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        if (!rect) return;

        const zoom = this.workflowService.zoom();
        const panX = this.workflowService.panOffsetX();
        const panY = this.workflowService.panOffsetY();

        const x = ev.clientX - rect.left - panX;
        const y = ev.clientY - rect.top - panY;

        const nx = x / zoom - dx;
        const ny = y / zoom - dy;

        this.workflowService.updateNodePosition(draggingId, nx, ny);
        return;
      }

      if (this.workflowService.isPanning()) {
        this.workflowService.updatePan(ev.clientX, ev.clientY);
      }
    };

    const onUp = () => {
      this.workflowService.clearDragState();
      this.workflowService.stopPan();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  onDeleteClick(): void {
    const selectedNodeId = this.workflowService.selectedNodeId();
    const selectedEdgeId = this.workflowService.selectedEdgeId();

    if (selectedNodeId) {
      this.workflowService.removeNode(selectedNodeId);
    } else if (selectedEdgeId) {
      this.workflowService.removeEdge(selectedEdgeId);
    }
  }

  onDuplicateClick(): void {
    const selectedNodeId = this.workflowService.selectedNodeId();
    if (selectedNodeId) {
      this.workflowService.duplicateNode(selectedNodeId);
    }
  }

  onUndoClick(): void {
    this.workflowService.undo();
  }

  onRedoClick(): void {
    this.workflowService.redo();
  }

  onHistoryPanelClick(): void {
    this.sidePageService.openSidePage('workflow-history', WorkflowHistoryPanelComponent, {
      position: 'end',
      disableClose: false,
      showCloseBtn: false,
      width: '400px',
      maxWidth: '90%',
      minWidth: '300px',
      panelClass: 'history-side-panel',
      backdropClass: '',
      hasBackdrop: true,
      zIndex: 10000,
      data: { title: 'Workflow History' },
    });
  }

  onLogHistoryClick(): void {
    this.workflowService.logHistory();
  }

  onZoomIn(): void {
    this.workflowService.zoomIn();
  }

  onZoomOut(): void {
    this.workflowService.zoomOut();
  }

  onZoomReset(): void {
    this.workflowService.zoom.set(1);
    this.workflowService.panOffsetX.set(0);
    this.workflowService.panOffsetY.set(0);
  }

  onFullscreenToggle(): void {
    this.workflowService.toggleFullscreen();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.workflowService.undo();
    } else if (
      ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
    ) {
      event.preventDefault();
      this.workflowService.redo();
    }
  }
}
