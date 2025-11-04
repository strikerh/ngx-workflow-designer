import {Component, Inject, Optional, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WorkflowDesignerService} from '../workflow-designer.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PALETTE_CATEGORIES } from '../workflow-nodes-config.data';
import { PaletteCategoryConfig } from '../workflow-designer.interfaces';
import { WORKFLOW_LIB_CONFIG, WorkflowDesignerLibConfig } from '../../core/workflow-lib.config';

@Component({
    selector: 'app-workflow-palette',
    standalone: true,
    imports: [CommonModule],
    template: `
            <div class="px-3 pt-3 pb-2 border-b">
                <h3 class="text-sm font-semibold">Palette</h3>
                <p class="text-xs text-slate-500">Click to add a node</p>
            </div>
            <div class="p-3 space-y-4 overflow-auto">
                @for (category of this.categories; track category.id) {
                    <div>
                        <h4 class="text-xs font-semibold mb-2 px-1" [ngClass]="category.headerClass">
                            {{ category.icon }} {{ category.label }}
                        </h4>
                        <div class="space-y-1">
                            <button
                                    *ngFor="let item of category.nodes"
                                    (click)="workflowService.addNode(item.type)"
                                    class="w-full text-left px-3 py-2 rounded-lg border hover:bg-white/60 text-sm flex items-center gap-2"
                                    [ngClass]="item.color">
                                @if (isHtmlIcon(workflowService.getTypeIcon(item.type))) {
                                    <div class="flex items-center smaller-icon" [innerHTML]="getSafeIcon(workflowService.getTypeIcon(item.type))"></div>
                                } @else {
                                    {{ workflowService.getTypeIcon(item.type) }}
                                }
                                {{ item.label }}
                            </button>
                        </div>
                    </div>
                }
            </div>
    `,
    styles: [`
        :host {
            @apply col-[1] row-[2] rounded-xl bg-white border overflow-hidden flex flex-col;
            }
        ::ng-deep .smaller-icon .material-icons {
                    font-size: 1.2rem !important;
                }
            `]

})
export class WorkflowPaletteComponent {
    workflowService = inject(WorkflowDesignerService);
    private sanitizer = inject(DomSanitizer);
    constructor(@Optional() @Inject(WORKFLOW_LIB_CONFIG) private libConfig?: WorkflowDesignerLibConfig) {}

    // Dynamic categories configuration from centralized data
    get categories() {
        const categories = this.libConfig?.palette?.categories ?? PALETTE_CATEGORIES;
        return categories.map(category => ({
            ...category,
            nodes: this.getNodesForCategory(category)
        })).filter(category => category.nodes.length > 0); // Only show categories with nodes
    }

    // Helper method to get nodes for a specific category
    private getNodesForCategory(category: PaletteCategoryConfig) {
        const prefixes = Array.isArray(category.filterPrefix) 
            ? category.filterPrefix 
            : [category.filterPrefix];
        
        return this.workflowService.PALETTE().filter(item => 
            prefixes.some(prefix => item.type.startsWith(prefix))
        );
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
