import { Injectable } from '@angular/core';

export interface MarkerContext {
  workflowId?: string;
  userId?: string;
  organizationId?: string;
  timestamp?: Date;
  [key: string]: any;
}

export type MarkerProcessor = (context?: MarkerContext) => any;

@Injectable({ providedIn: 'root' })
export class SpecialMarkersService {
  private readonly markers: Record<string, MarkerProcessor> = {
    'AUTO_GENERATE_UUID': () => {
      const uuid = this.generateUUID();
      return `/api/workflow/${uuid}`;
    },
    'UUID': () => this.generateUUID(),
    'CURRENT_TIMESTAMP': () => new Date().toISOString(),
    'CURRENT_DATE': () => new Date().toISOString().split('T')[0],
    'WORKFLOW_ID': (context?: MarkerContext) => context?.workflowId ?? '',
    'USER_ID': (context?: MarkerContext) => context?.userId ?? '',
    'ORGANIZATION_ID': (context?: MarkerContext) => context?.organizationId ?? '',
    'RANDOM_NUMBER': () => Math.floor(Math.random() * 9000) + 1000,
    'EMPTY_STRING': () => '',
    'NULL': () => null
  };

  processValue(value: any, context?: MarkerContext): any {
    if (!this.isSpecialMarker(value)) return value;
    const markerName = value.slice(2, -2).trim();
    const processor = this.markers[markerName];
    return processor ? processor(context) : value;
  }

  processNodeDefaults(properties: any[], context?: MarkerContext): Record<string, any> {
    const defaults: Record<string, any> = {};
    properties.forEach(field => {
      if (field?.default !== undefined) {
        defaults[field.key] = this.processValue(field.default, context);
      }
    });
    return defaults;
  }

  processObject(obj: Record<string, any>, context?: MarkerContext): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.processObject(value, context);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => typeof item === 'object' ? this.processObject(item, context) : this.processValue(item, context));
      } else {
        result[key] = this.processValue(value, context);
      }
    }
    return result;
  }

  isSpecialMarker(value: any): boolean {
    return typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}') && value.length > 4;
  }

  getAvailableMarkers(): string[] {
    return Object.keys(this.markers);
  }

  hasMarker(markerName: string): boolean {
    return markerName in this.markers;
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  registerMarker(name: string, processor: MarkerProcessor): void {
    this.markers[name] = processor;
  }
}
