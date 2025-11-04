import { Injectable, signal, computed } from '@angular/core';
import { WorkflowHistoryState } from '../../workflow-designer/workflow-designer.interfaces';

/**
 * Service for managing undo/redo history for workflow designer
 * Maintains a stack of workflow states and provides navigation
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowHistoryService {
  // History stack and current position
  private historyStack: WorkflowHistoryState[] = [];
  private historyIndex = signal<number>(-1);
  private readonly MAX_HISTORY_SIZE = 50;
  private isRestoringState = false;

  // Computed properties for UI state
  canUndo = computed(() => this.historyIndex() > 0);
  canRedo = computed(() => this.historyIndex() < this.historyStack.length - 1);

  saveState(state: WorkflowHistoryState, description?: string): void {
    if (this.isRestoringState) return; // Don't save during undo/redo

    const clonedState: WorkflowHistoryState = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
      selectedNodeId: state.selectedNodeId,
      selectedEdgeId: state.selectedEdgeId,
      description: description || state.description,
      timestamp: new Date()
    };

    const currentIndex = this.historyIndex();
    if (currentIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, currentIndex + 1);
    }

    this.historyStack.push(clonedState);

    if (this.historyStack.length > this.MAX_HISTORY_SIZE) {
      this.historyStack.shift();
    } else {
      this.historyIndex.update(idx => idx + 1);
    }
  }

  undo(): WorkflowHistoryState | null {
    if (!this.canUndo()) return null;

    this.isRestoringState = true;
    const newIndex = this.historyIndex() - 1;
    this.historyIndex.set(newIndex);
    const state = this.historyStack[newIndex];
    this.isRestoringState = false;
    return this.cloneState(state);
  }

  redo(): WorkflowHistoryState | null {
    if (!this.canRedo()) return null;

    this.isRestoringState = true;
    const newIndex = this.historyIndex() + 1;
    this.historyIndex.set(newIndex);
    const state = this.historyStack[newIndex];
    this.isRestoringState = false;
    return this.cloneState(state);
  }

  clearHistory(): void {
    this.historyStack = [];
    this.historyIndex.set(-1);
  }

  getHistoryInfo(): { size: number; index: number; canUndo: boolean; canRedo: boolean } {
    return {
      size: this.historyStack.length,
      index: this.historyIndex(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  getHistoryStack(): Array<{ description?: string; timestamp?: Date; index: number; isCurrent: boolean }> {
    return this.historyStack.map((state, index) => ({
      description: state.description,
      timestamp: state.timestamp,
      index,
      isCurrent: index === this.historyIndex()
    }));
  }

  getCurrentDescription(): string | undefined {
    const currentIndex = this.historyIndex();
    if (currentIndex >= 0 && currentIndex < this.historyStack.length) {
      return this.historyStack[currentIndex].description;
    }
    return undefined;
  }

  private cloneState(state: WorkflowHistoryState): WorkflowHistoryState {
    return {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
      selectedNodeId: state.selectedNodeId,
      selectedEdgeId: state.selectedEdgeId,
      description: state.description,
      timestamp: state.timestamp
    };
  }

  isRestoring(): boolean {
    return this.isRestoringState;
  }
}
