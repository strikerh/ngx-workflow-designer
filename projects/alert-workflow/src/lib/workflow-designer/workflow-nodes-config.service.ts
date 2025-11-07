import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NodeTypeConfig, WorkflowNodesConfig, PaletteItem } from './workflow-designer.interfaces';
import { WORKFLOW_NODES_CONFIG } from './config/workflow-nodes-config.data';
import { WORKFLOW_NODE_TYPES } from '../core/workflow-node-types.token';
import { WORKFLOW_LIB_CONFIG, WorkflowDesignerLibConfig } from '../core/workflow-lib.config';

@Injectable({ providedIn: 'root' })
export class WorkflowNodesConfigService {
  private http = inject(HttpClient);
  private libConfig = inject(WORKFLOW_LIB_CONFIG, { optional: true }) as WorkflowDesignerLibConfig | null;

  private nodeTypesConfig = signal<NodeTypeConfig[]>([]);
  private configLoaded = signal<boolean>(false);

  // Optional extra node types provided by host application
  private extraNodeTypes = inject(WORKFLOW_NODE_TYPES, { optional: true }) as NodeTypeConfig[] | null;

  constructor() { this.loadConfiguration(); }

  private async loadConfiguration(): Promise<void> {
    const source = (this.libConfig as any)?.nodesConfig?.source as 'ts' | 'json' | undefined;
    const jsonUrl = (this.libConfig as any)?.nodesConfig?.jsonUrl as string | undefined;
    const providedNodeTypes = (this.libConfig as any)?.palette?.nodeTypes as NodeTypeConfig[] | undefined;

    // Highest precedence: node types provided directly via lib config (palette.nodeTypes)
    if (Array.isArray(providedNodeTypes) && providedNodeTypes.length > 0) {
      this.nodeTypesConfig.set(this.mergeWithExtraTypes(providedNodeTypes));
      this.configLoaded.set(true);
      return;
    }

    if (source === 'json' && jsonUrl) {
      try {
        const config = await firstValueFrom(this.http.get<WorkflowNodesConfig>(jsonUrl));
        this.nodeTypesConfig.set(this.mergeWithExtraTypes(config.nodeTypes));
        this.configLoaded.set(true);
        return;
      } catch (error) {
        console.error('Failed to load workflow nodes configuration from JSON, falling back to TS:', error);
      }
    }

    // Default: TypeScript configuration
    const base = WORKFLOW_NODES_CONFIG;
    this.nodeTypesConfig.set(this.mergeWithExtraTypes(base));
    this.configLoaded.set(true);
  }

  private mergeWithExtraTypes(base: NodeTypeConfig[]): NodeTypeConfig[] {
  const extras = (this.extraNodeTypes as NodeTypeConfig[] | null) || [];
    if (!extras.length) return base;

    const byType = new Map(base.map((c) => [c.type, c] as const));
    for (const ext of extras) {
      const existing = byType.get(ext.type);
      if (existing) byType.set(ext.type, { ...existing, ...ext });
      else byType.set(ext.type, ext);
    }
    return Array.from(byType.values());
  }

  getNodeTypesConfig(): NodeTypeConfig[] {
    return this.nodeTypesConfig();
  }

  getNodeTypeConfig(type: string): NodeTypeConfig | undefined {
    return this.nodeTypesConfig().find(config => config.type === type);
  }

  getPalette = computed<PaletteItem[]>(() =>
    this.nodeTypesConfig().map(config => ({ type: config.type, label: config.label, color: config.color }))
  );

  getTypeIcons = computed<Record<string, string>>(() => {
    const icons: Record<string, string> = {};
    this.nodeTypesConfig().forEach(config => { icons[config.type] = config.icon; });
    return icons;
  });

  getNodeColors = computed<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    this.nodeTypesConfig().forEach(config => { colors[config.type] = config.nodeColor; });
    return colors;
  });

  isConfigLoaded(): boolean { return this.configLoaded(); }

  getNodesByCategory(category: 'trigger' | 'control' | 'action' | 'terminal' | 'utility'): NodeTypeConfig[] {
    return this.nodeTypesConfig().filter(config => config.category === category);
  }
}
