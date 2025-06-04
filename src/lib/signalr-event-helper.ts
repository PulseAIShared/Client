// src/lib/signalr-event-helper.ts
import { signalRConnection } from './signalr-connection';

/**
 * Helper to register SignalR event handlers with multiple naming conventions
 */
export class SignalREventHelper {
  private static registeredHandlers = new Map<string, { handler: (...args: unknown[]) => void; eventNames: string[] }>();

  /**
   * Register a handler for multiple possible event name formats
   */
  static registerHandler(
    baseEventName: string, 
    handler: (...args: unknown[]) => void,
    customEventNames?: string[]
  ) {
    // Generate all possible event name formats
    const eventNames = customEventNames || this.generateEventNameVariants(baseEventName);
    
    // Register the handler for all possible event names
    eventNames.forEach(eventName => {
      signalRConnection.on(eventName, handler);
    });

    // Store for cleanup
    this.registeredHandlers.set(baseEventName, { handler, eventNames });
    
    console.log(`Registered SignalR handler for ${baseEventName} with variants:`, eventNames);
  }

  /**
   * Unregister a handler and all its variants
   */
  static unregisterHandler(baseEventName: string) {
    const registered = this.registeredHandlers.get(baseEventName);
    if (registered) {
      registered.eventNames.forEach(eventName => {
        signalRConnection.off(eventName, registered.handler);
      });
      this.registeredHandlers.delete(baseEventName);
    }
  }

  /**
   * Unregister all handlers
   */
  static unregisterAll() {
    for (const [baseEventName] of this.registeredHandlers) {
      this.unregisterHandler(baseEventName);
    }
  }

  /**
   * Generate common event name variants
   */
  private static generateEventNameVariants(baseEventName: string): string[] {
    // Convert PascalCase to different formats
    const variants = new Set<string>();
    
    // Original name
    variants.add(baseEventName);
    
    // camelCase (first letter lowercase)
    variants.add(baseEventName.charAt(0).toLowerCase() + baseEventName.slice(1));
    
    // snake_case
    variants.add(this.toSnakeCase(baseEventName));
    
    // kebab-case
    variants.add(this.toKebabCase(baseEventName));
    
    // lowercase
    variants.add(baseEventName.toLowerCase());
    
    // UPPERCASE
    variants.add(baseEventName.toUpperCase());

    return Array.from(variants);
  }

  /**
   * Convert PascalCase to snake_case
   */
  private static toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  /**
   * Convert PascalCase to kebab-case
   */
  private static toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  /**
   * Get all registered event names for debugging
   */
  static getRegisteredEvents(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [baseEventName, { eventNames }] of this.registeredHandlers) {
      result[baseEventName] = eventNames;
    }
    return result;
  }
}

// Specific event registration functions
export const registerNotificationEvents = {
  newNotification: (handler: (notification: unknown) => void) => {
    SignalREventHelper.registerHandler('NewNotification', handler);
  },
  
  importCompleted: (handler: (data: unknown) => void) => {
    SignalREventHelper.registerHandler('ImportCompleted', handler);
  },
  
  importProgress: (handler: (data: unknown) => void) => {
    SignalREventHelper.registerHandler('ImportProgress', handler);
  },
  
  customerUpdated: (handler: (data: unknown) => void) => {
    SignalREventHelper.registerHandler('CustomerUpdated', handler);
  },
  
  unreadCountChanged: (handler: (count: number) => void) => {
    SignalREventHelper.registerHandler('UnreadCountChanged', handler as (...args: unknown[]) => void);
  }
};

export const unregisterNotificationEvents = {
  newNotification: () => SignalREventHelper.unregisterHandler('NewNotification'),
  importCompleted: () => SignalREventHelper.unregisterHandler('ImportCompleted'),
  importProgress: () => SignalREventHelper.unregisterHandler('ImportProgress'),
  customerUpdated: () => SignalREventHelper.unregisterHandler('CustomerUpdated'),
  unreadCountChanged: () => SignalREventHelper.unregisterHandler('UnreadCountChanged'),
  all: () => SignalREventHelper.unregisterAll()
};