import { Component } from '@angular/core';
import { WorkflowDesignerComponent } from 'ngx-workflow-designer';

@Component({
  selector: 'app-workflow-page',
  standalone: true,
  imports: [WorkflowDesignerComponent],
  template: `
    <div class="workflow-page-container">
      <workflow-designer></workflow-designer>
    </div>
  `,
  styles: [`
    .workflow-page-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class WorkflowPageComponent {}
