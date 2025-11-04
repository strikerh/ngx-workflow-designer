import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowDesignerService } from '../workflow-designer.service';

@Component({
  selector: 'app-workflow-logs',
  standalone: true,
  imports: [CommonModule],
  template: `

      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold">Simulation & Logs</h3>
        <div class="flex items-center gap-2">
          <button 
            class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50" 
            (click)="workflowService.runSimulation()">
            Run Simulation
          </button>
          <button 
            class="text-sm px-3 py-1 rounded-md border hover:bg-slate-50" 
            (click)="workflowService.viewLastRun()">
            View Last Run
          </button>
        </div>
      </div>
      <div class="mt-2 h-[120px] rounded-lg border bg-slate-50/60 p-2 text-xs text-slate-600 overflow-auto">
        <p>[12:00:01] Ready. Use Templates → Code Blue to load a sample, then Validate and Export JSON.</p>
        <p>[12:00:05] Tip: Double-click a node while in Connect mode to set source/target quickly.</p>
      </div>

  `,
  styles: [`
      :host {
     @apply col-span-3 row-[3] rounded-xl bg-white border p-3 overflow-hidden flex flex-col;
  }
  `]
})
export class WorkflowLogsComponent {
  constructor(public workflowService: WorkflowDesignerService) {}
}
