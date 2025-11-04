import { Component, signal } from '@angular/core';
import { WorkflowPageComponent } from './pages/workflow-page.component';

@Component({
  selector: 'app-root',
  imports: [WorkflowPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('workflow-ui');
}
