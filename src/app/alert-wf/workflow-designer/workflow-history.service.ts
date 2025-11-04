import { Injectable, signal, computed } from '@angular/core';
import { WorkflowHistoryState } from './workflow-designer.interfaces';

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

  /**
   * Save a new state to history
   * @param state - The workflow state to save
   * @param description - Optional description of the change
   */
  saveState(state: WorkflowHistoryState, description?: string): void {
    if (this.isRestoringState) return; // Don't save during undo/redo

    // Deep clone to prevent reference issues
    const clonedState: WorkflowHistoryState = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
      selectedNodeId: state.selectedNodeId,
      selectedEdgeId: state.selectedEdgeId,
      description: description || state.description,
      timestamp: new Date()
    };

    // Remove any states after current index (when undoing then making new change)
    const currentIndex = this.historyIndex();
    if (currentIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, currentIndex + 1);
    }

    // Add new state
    this.historyStack.push(clonedState);

    // Limit history size
    if (this.historyStack.length > this.MAX_HISTORY_SIZE) {
      this.historyStack.shift();
    } else {
      this.historyIndex.update(idx => idx + 1);
    }
  }

  /**
   * Undo the last action
   * @returns The previous state, or null if can't undo
   */
  undo(): WorkflowHistoryState | null {
    if (!this.canUndo()) return null;

    this.isRestoringState = true;
    
    const newIndex = this.historyIndex() - 1;
    this.historyIndex.set(newIndex);
    
    const state = this.historyStack[newIndex];
    
    this.isRestoringState = false;
    
    // Return deep clone to prevent modification
    return this.cloneState(state);
  }

  /**
   * Redo the previously undone action
   * @returns The next state, or null if can't redo
   */
  redo(): WorkflowHistoryState | null {
    if (!this.canRedo()) return null;

    this.isRestoringState = true;
    
    const newIndex = this.historyIndex() + 1;
    this.historyIndex.set(newIndex);
    
    const state = this.historyStack[newIndex];
    
    this.isRestoringState = false;
    
    // Return deep clone to prevent modification
    return this.cloneState(state);
  }

  /**
   * Clear all history (e.g., when loading a new workflow)
   */
  clearHistory(): void {
    this.historyStack = [];
    this.historyIndex.set(-1);
  }

  /**
   * Get current history statistics
   * @returns Object with history info
   */
  getHistoryInfo(): { size: number; index: number; canUndo: boolean; canRedo: boolean } {
    return {
      size: this.historyStack.length,
      index: this.historyIndex(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Get history stack with descriptions (for debugging or UI)
   * @returns Array of history entries with metadata
   */
  getHistoryStack(): Array<{ description?: string; timestamp?: Date; index: number; isCurrent: boolean }> {
    return this.historyStack.map((state, index) => ({
      description: state.description,
      timestamp: state.timestamp,
      index,
      isCurrent: index === this.historyIndex()
    }));
  }

  /**
   * Get the current state's description
   */
  getCurrentDescription(): string | undefined {
    const currentIndex = this.historyIndex();
    if (currentIndex >= 0 && currentIndex < this.historyStack.length) {
      return this.historyStack[currentIndex].description;
    }
    return undefined;
  }

  /**
   * Deep clone a state object
   */
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

  /**
   * Check if currently restoring state (prevents recursive saves)
   */
  isRestoring(): boolean {
    return this.isRestoringState;
  }
}
