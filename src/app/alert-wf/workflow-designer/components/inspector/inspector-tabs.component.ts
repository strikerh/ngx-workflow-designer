import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type InspectorTab = 'properties' | 'variables';

@Component({
  selector: 'app-inspector-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex border-b">
      <button 
        class="flex-1 px-3 py-2 text-sm font-medium transition-colors"
        [class.text-indigo-600]="activeTab === 'properties'"
        [class.border-b-2]="activeTab === 'properties'"
        [class.border-indigo-600]="activeTab === 'properties'"
        [class.text-slate-600]="activeTab !== 'properties'"
        (click)="tabChange.emit('properties')">
        Properties
      </button>
      <button 
        class="flex-1 px-3 py-2 text-sm font-medium transition-colors"
        [class.text-indigo-600]="activeTab === 'variables'"
        [class.border-b-2]="activeTab === 'variables'"
        [class.border-indigo-600]="activeTab === 'variables'"
        [class.text-slate-600]="activeTab !== 'variables'"
        (click)="tabChange.emit('variables')">
        Variables
      </button>
    </div>
  `,
  styles: []
})
export class InspectorTabsComponent {
  @Input({ required: true }) activeTab!: InspectorTab;
  @Output() tabChange = new EventEmitter<InspectorTab>();
}
