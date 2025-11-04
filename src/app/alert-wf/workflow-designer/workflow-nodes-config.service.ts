import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NodeTypeConfig, WorkflowNodesConfig, PaletteItem } from './workflow-designer.interfaces';
import { WORKFLOW_NODES_CONFIG } from './workflow-nodes-config.data';
import { firstValueFrom } from 'rxjs';

/**
 * ============================================
 * DEVELOPMENT FLAG - CONFIGURATION SOURCE
 * ============================================
 * 
 * Set to TRUE to use TypeScript configuration (workflow-nodes-config.data.ts)
 * - Pros: Full type safety, IDE autocomplete, faster loading (no HTTP request)
 * - Cons: Requires rebuild to change configuration
 * 
 * Set to FALSE to use JSON configuration (public/workflow-nodes-config.json)
 * - Pros: Hot-reloadable without rebuild, easier for non-developers
 * - Cons: No compile-time type checking, HTTP request overhead
 */
const USE_TYPESCRIPT_CONFIG = true;

@Injectable({
  providedIn: 'root'
})
export class WorkflowNodesConfigService {
  private http = inject(HttpClient);
  
  // Node configuration loaded from JSON or TypeScript
  private nodeTypesConfig = signal<NodeTypeConfig[]>([]);
  private configLoaded = signal<boolean>(false);
  
  constructor() {
    this.loadConfiguration();
  }
  
  /**
   * Load node configuration from TypeScript or JSON file
   */
  private async loadConfiguration(): Promise<void> {
    if (USE_TYPESCRIPT_CONFIG) {
      // Use TypeScript configuration (immediate, type-safe)
      console.log('📦 Loading workflow configuration from TypeScript module');
      this.nodeTypesConfig.set(WORKFLOW_NODES_CONFIG);
      this.configLoaded.set(true);
    } else {
      // Use JSON configuration (hot-reloadable)
      try {
        console.log('📦 Loading workflow configuration from JSON file');
        const config = await firstValueFrom(
          this.http.get<WorkflowNodesConfig>('/workflow-nodes-config.json')
        );
        this.nodeTypesConfig.set(config.nodeTypes);
        this.configLoaded.set(true);
      } catch (error) {
        console.error('Failed to load workflow nodes configuration, using fallback:', error);
        // Use fallback configuration if file loading fails
        this.nodeTypesConfig.set(this.getFallbackConfiguration());
        this.configLoaded.set(true);
      }
    }
  }

  /**
   * Fallback configuration when external file is not available
   */
  private getFallbackConfiguration(): NodeTypeConfig[] {
    return [
      {
        type: "trigger.manual",
        category: "trigger",
        label: "Manual Trigger",
        description: "Start workflow manually",
        icon: "play_arrow",
        color: "bg-amber-100 border-amber-300 text-amber-800",
        nodeColor: "bg-amber-50 border-amber-200",
        properties: [],
        exits: ["next"]
      },
      {
        type: "control.if",
        category: "control",
        label: "If / Else",
        description: "Conditional branching",
        icon: "call_split",
        color: "bg-sky-100 border-sky-300 text-sky-800",
        nodeColor: "bg-sky-50 border-sky-200",
        properties: [
          {
            key: "condition",
            label: "Condition",
            type: "text",
            required: true,
            placeholder: "alert.severity == 'CRITICAL'"
          }
        ],
        exits: ["onTrue", "onFalse"]
      },
      {
        type: "control.switch",
        category: "control",
        label: "Switch",
        description: "Multi-way branching",
        icon: "alt_route",
        color: "bg-sky-100 border-sky-300 text-sky-800",
        nodeColor: "bg-sky-50 border-sky-200",
        properties: [
          {
            key: "expression",
            label: "Switch Expression",
            type: "text",
            required: true,
            placeholder: "alert.severity"
          },
          {
            key: "cases",
            label: "Case Values",
            type: "text",
            required: true,
            placeholder: "CRITICAL,HIGH,MEDIUM,LOW"
          }
        ],
        exits: []
      },
      {
        type: "action.sms",
        category: "action",
        label: "SMS",
        description: "Send SMS message",
        icon: "sms",
        color: "bg-emerald-100 border-emerald-300 text-emerald-800",
        nodeColor: "bg-emerald-50 border-emerald-200",
        properties: [
          {
            key: "to",
            label: "Recipients",
            type: "text",
            required: true,
            placeholder: "OnCall.Nurses"
          },
          {
            key: "message",
            label: "Message",
            type: "textarea",
            required: true,
            placeholder: "Alert message"
          }
        ],
        exits: ["onSuccess", "onFailure"]
      },
      {
        type: "end.terminate",
        category: "terminal",
        label: "End",
        description: "Terminate workflow",
        icon: "stop",
        color: "bg-slate-100 border-slate-300 text-slate-800",
        nodeColor: "bg-slate-50 border-slate-200",
        properties: [],
        exits: []
      }
    ];
  }
  
  /**
   * Get all node type configurations
   */
  getNodeTypesConfig(): NodeTypeConfig[] {
    return this.nodeTypesConfig();
  }
  
  /**
   * Get configuration for a specific node type
   */
  getNodeTypeConfig(type: string): NodeTypeConfig | undefined {
    return this.nodeTypesConfig().find(config => config.type === type);
  }
  
  /**
   * Get palette items (computed from configuration)
   */
  getPalette = computed<PaletteItem[]>(() => {
    return this.nodeTypesConfig().map(config => ({
      type: config.type,
      label: config.label,
      color: config.color
    }));
  });
  
  /**
   * Get type icons map (computed from configuration)
   */
  getTypeIcons = computed<Record<string, string>>(() => {
    const icons: Record<string, string> = {};
    this.nodeTypesConfig().forEach(config => {
      icons[config.type] = config.icon;
    });
    return icons;
  });
  
  /**
   * Get node colors map (computed from configuration)
   */
  getNodeColors = computed<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    this.nodeTypesConfig().forEach(config => {
      colors[config.type] = config.nodeColor;
    });
    return colors;
  });
  
  /**
   * Check if configuration is loaded
   */
  isConfigLoaded(): boolean {
    return this.configLoaded();
  }
  
  /**
   * Get node categories
   */
  getNodesByCategory(category: 'trigger' | 'control' | 'action' | 'terminal' | 'utility'): NodeTypeConfig[] {
    return this.nodeTypesConfig().filter(config => config.category === category);
  }
}
