import { Injectable, inject } from '@angular/core';

/**
 * Special Markers Service
 * 
 * Handles processing of special marker strings in workflow configurations.
 * Special markers are placeholder strings (e.g., {{AUTO_GENERATE_UUID}}) 
 * that get replaced with dynamic values at runtime.
 * 
 * This service provides:
 * - Extensible marker registry for easy addition of new markers
 * - Context-aware processing (can pass workflow/user context)
 * - Type-safe marker definitions
 * - Bulk processing for node configurations
 * 
 * Usage Examples:
 * 
 * 1. Simple marker processing:
 *    const value = markersService.processValue("{{AUTO_GENERATE_UUID}}");
 *    // Returns: "/api/workflow/550e8400-e29b-41d4-a716-446655440000"
 * 
 * 2. Context-aware processing:
 *    const value = markersService.processValue("{{WORKFLOW_ID}}", { workflowId: "123" });
 *    // Returns: "123"
 * 
 * 3. Process all defaults in a node configuration:
 *    const defaults = markersService.processNodeDefaults(nodeConfig.properties);
 *    // Returns: { endpoint: "/api/workflow/uuid...", method: "POST" }
 * 
 * Adding New Markers:
 * Simply add a new entry to the 'markers' registry with a processor function.
 */

export interface MarkerContext {
  workflowId?: string;
  userId?: string;
  organizationId?: string;
  timestamp?: Date;
  [key: string]: any; // Allow custom context properties
}

export type MarkerProcessor = (context?: MarkerContext) => any;

@Injectable({
  providedIn: 'root'
})
export class SpecialMarkersService {
  
  /**
   * Registry of all available special markers
   * Key: Marker name (without {{ }})
   * Value: Function that returns the processed value
   */
  private readonly markers: Record<string, MarkerProcessor> = {
    /**
     * AUTO_GENERATE_UUID
     * Generates a unique UUID and formats it as a webhook endpoint path
     * Use for: Webhook endpoints, unique identifiers
     */
    'AUTO_GENERATE_UUID': () => {
      const uuid = this.generateUUID();
      return `/api/workflow/${uuid}`;
    },
    
    /**
     * UUID
     * Generates a raw UUID without any formatting
     * Use for: Generic unique identifiers
     */
    'UUID': () => {
      return this.generateUUID();
    },
    
    /**
     * CURRENT_TIMESTAMP
     * Returns the current date/time as ISO string
     * Use for: Default timestamps, audit fields
     */
    'CURRENT_TIMESTAMP': () => {
      return new Date().toISOString();
    },
    
    /**
     * CURRENT_DATE
     * Returns the current date in YYYY-MM-DD format
     * Use for: Date fields
     */
    'CURRENT_DATE': () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    },
    
    /**
     * WORKFLOW_ID
     * Returns the current workflow ID from context
     * Use for: Parent workflow references, logging
     */
    'WORKFLOW_ID': (context?: MarkerContext) => {
      return context?.workflowId ?? '';
    },
    
    /**
     * USER_ID
     * Returns the current user ID from context
     * Use for: User tracking, audit fields
     */
    'USER_ID': (context?: MarkerContext) => {
      return context?.userId ?? '';
    },
    
    /**
     * ORGANIZATION_ID
     * Returns the current organization ID from context
     * Use for: Multi-tenant scenarios
     */
    'ORGANIZATION_ID': (context?: MarkerContext) => {
      return context?.organizationId ?? '';
    },
    
    /**
     * RANDOM_NUMBER
     * Generates a random integer between 1000 and 9999
     * Use for: Testing, demo data, random IDs
     */
    'RANDOM_NUMBER': () => {
      return Math.floor(Math.random() * 9000) + 1000;
    },
    
    /**
     * EMPTY_STRING
     * Returns an empty string
     * Use for: Forcing empty defaults, clearing fields
     */
    'EMPTY_STRING': () => {
      return '';
    },
    
    /**
     * NULL
     * Returns null value
     * Use for: Clearing optional fields
     */
    'NULL': () => {
      return null;
    }
  };

  constructor() {
    console.log('[SpecialMarkersService] Initialized with markers:', Object.keys(this.markers));
  }

  /**
   * Process a single value that might contain a special marker
   * 
   * @param value - The value to process (string, number, object, etc.)
   * @param context - Optional context for context-aware markers
   * @returns The processed value (marker replaced) or original value if not a marker
   * 
   * @example
   * processValue("{{AUTO_GENERATE_UUID}}") // Returns: "/api/workflow/uuid..."
   * processValue("Hello") // Returns: "Hello" (unchanged)
   * processValue(123) // Returns: 123 (unchanged)
   */
  processValue(value: any, context?: MarkerContext): any {
    // Only process strings that match marker pattern
    if (!this.isSpecialMarker(value)) {
      return value;
    }

    // Extract marker name (remove {{ and }})
    const markerName = value.slice(2, -2).trim();
    
    // Find and execute the marker processor
    const processor = this.markers[markerName];
    
    if (processor) {
      const result = processor(context);
      console.log(`[SpecialMarkersService] Processed marker {{${markerName}}}:`, result);
      return result;
    } else {
      console.warn(`[SpecialMarkersService] Unknown marker: {{${markerName}}}. Returning original value.`);
      return value; // Return original if marker not found
    }
  }

  /**
   * Process all default values in a node field configuration array
   * Returns an object with processed default values keyed by field key
   * 
   * @param properties - Array of node field configurations
   * @param context - Optional context for context-aware markers
   * @returns Object mapping field keys to their processed default values
   * 
   * @example
   * processNodeDefaults([
   *   { key: 'endpoint', default: '{{AUTO_GENERATE_UUID}}' },
   *   { key: 'method', default: 'POST' }
   * ])
   * // Returns: { endpoint: '/api/workflow/uuid...', method: 'POST' }
   */
  processNodeDefaults(properties: any[], context?: MarkerContext): Record<string, any> {
    const defaults: Record<string, any> = {};
    
    properties.forEach(field => {
      if (field.default !== undefined) {
        defaults[field.key] = this.processValue(field.default, context);
      }
    });
    
    console.log('[SpecialMarkersService] Processed node defaults:', defaults);
    return defaults;
  }

  /**
   * Process multiple values in an object (recursively)
   * Useful for processing entire configuration objects
   * 
   * @param obj - Object to process
   * @param context - Optional context for context-aware markers
   * @returns New object with all special markers processed
   * 
   * @example
   * processObject({
   *   endpoint: '{{AUTO_GENERATE_UUID}}',
   *   created: '{{CURRENT_TIMESTAMP}}',
   *   nested: { id: '{{UUID}}' }
   * })
   */
  processObject(obj: Record<string, any>, context?: MarkerContext): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively process nested objects
        result[key] = this.processObject(value, context);
      } else if (Array.isArray(value)) {
        // Process arrays
        result[key] = value.map(item => 
          typeof item === 'object' ? this.processObject(item, context) : this.processValue(item, context)
        );
      } else {
        // Process primitive values
        result[key] = this.processValue(value, context);
      }
    }
    
    return result;
  }

  /**
   * Check if a value is a special marker string
   * 
   * @param value - Value to check
   * @returns True if value is a special marker pattern
   * 
   * @example
   * isSpecialMarker("{{AUTO_GENERATE_UUID}}") // true
   * isSpecialMarker("Hello") // false
   * isSpecialMarker(123) // false
   */
  isSpecialMarker(value: any): boolean {
    return typeof value === 'string' && 
           value.startsWith('{{') && 
           value.endsWith('}}') &&
           value.length > 4; // At least {{X}}
  }

  /**
   * Get list of all available marker names
   * Useful for documentation or validation
   * 
   * @returns Array of marker names (without {{ }})
   */
  getAvailableMarkers(): string[] {
    return Object.keys(this.markers);
  }

  /**
   * Check if a marker name exists in the registry
   * 
   * @param markerName - Name to check (without {{ }})
   * @returns True if marker exists
   */
  hasMarker(markerName: string): boolean {
    return markerName in this.markers;
  }

  /**
   * Generate a UUID using crypto API
   * Falls back to custom implementation if crypto.randomUUID is not available
   * 
   * @returns UUID string
   */
  private generateUUID(): string {
    // Use native crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback: Generate UUID v4 manually
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Add a custom marker at runtime (advanced usage)
   * Allows dynamic registration of new markers
   * 
   * @param name - Marker name (without {{ }})
   * @param processor - Function that returns the processed value
   * 
   * @example
   * markersService.registerMarker('CUSTOM_ID', () => `custom-${Date.now()}`);
   */
  registerMarker(name: string, processor: MarkerProcessor): void {
    if (this.markers[name]) {
      console.warn(`[SpecialMarkersService] Overwriting existing marker: ${name}`);
    }
    this.markers[name] = processor;
    console.log(`[SpecialMarkersService] Registered new marker: ${name}`);
  }
}
