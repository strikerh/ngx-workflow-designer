import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderAction } from './header-action.model';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900" *ngIf="title">{{ title }}</h1>
          <p class="text-gray-600 mt-1" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3" *ngIf="actions && actions.length > 0">
          @for (action of actions; track trackAction($index, action)) {
            @switch (action.kind) {
              @case ('btn') {
                <button
                  type="button"
                  (click)="handleClick(action)"
                  [disabled]="action.disabled"
                  [ngClass]="action.class || 'bg-blue-600 hover:bg-blue-700 text-white'"
                  class="px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  [attr.title]="action.tooltip || null"
                >
                  <i class="material-icons text-sm mr-2" *ngIf="action.icon">{{ action.icon }}</i>
                  <span *ngIf="action.label">{{ action.label }}</span>
                </button>
              }
              @case ('toggleView') {
                <button
                  type="button"
                  class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                  [disabled]="action.disabled"
                  (click)="toggleAction(action)"
                  [attr.title]="action.tooltip || null"
                >
                  <span class="material-icons text-base">{{ resolveToggleIcon(action) }}</span>
                </button>
              }
              @case ('search') {
                <label class="relative flex items-center">
                  <span class="material-icons absolute left-3 text-gray-400 text-base">search</span>
                  <input
                    type="search"
                    class="pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [placeholder]="action.placeholder || 'Search'"
                    (input)="onSearch(action, $any($event.target).value)"
                  />
                </label>
              }
              @case ('spliter') {
                <span class="w-px h-6 bg-gray-300" aria-hidden="true"></span>
              }
              @default {
                <button
                  type="button"
                  class="px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                  [disabled]="action.disabled"
                  (click)="handleClick(action)"
                >
                  <i class="material-icons text-sm mr-2" *ngIf="action.icon">{{ action.icon }}</i>
                  <span *ngIf="action.label">{{ action.label }}</span>
                </button>
              }
            }
          }
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() actions: HeaderAction[] = [];

  trackAction(index: number, action: HeaderAction): string | number {
    return action.id ?? action.label ?? action.icon ?? index;
  }

  handleClick(action: HeaderAction): void {
    action.onClick?.();
  }

  toggleAction(action: HeaderAction): void {
    const next = action.state === 1 ? 0 : 1;
    action.state = next;
    action.onToggle?.(next as 0 | 1);
  }

  onSearch(action: HeaderAction, value: string): void {
    action.onSearch?.(value);
  }

  resolveToggleIcon(action: HeaderAction): string {
    if (action.state === 1) {
      return action.iconToggle || action.icon || 'view_list';
    }
    return action.icon || action.iconToggle || 'grid_view';
  }
}