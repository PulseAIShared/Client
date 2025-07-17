// src/lib/signalr-connection.ts (updated for your backend)
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getToken } from '@/lib/api-client';
import { env } from '@/config/env';
class SignalRConnectionManager {
  private connection: HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  async connect(): Promise<HubConnection> {
    if (this.connection?.state === 'Connected') {
      return this.connection;
    }

    const token = getToken();
    if (!token) {
      console.warn('SignalR: No authentication token available, cannot connect');
      throw new Error('No authentication token available');
    }

    console.log('SignalR: Connecting to NotificationHub...');

    // Updated to match your backend hub path exactly
    this.connection = new HubConnectionBuilder()
      .withUrl(`${env.API_URL}hubs/notifications`, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000);
        }
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      console.log('SignalR Connected to NotificationHub');
      this.reconnectAttempts = 0;
      
      // Join user group after connection (as per your backend)
      await this.connection.invoke('JoinUserGroup');
      
      // Re-register all listeners after reconnection
      this.reregisterListeners();
      
      return this.connection;
    } catch (error) {
      console.error('SignalR Connection failed:', error);
      await this.handleReconnect();
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    this.connection.onclose(async (error) => {
      console.warn('SignalR Connection closed:', error);
      await this.handleReconnect();
    });

    this.connection.onreconnecting((error) => {
      console.warn('SignalR Reconnecting:', error);
    });

    this.connection.onreconnected(async () => {
      console.log('SignalR Reconnected');
      // Rejoin user group after reconnection
      try {
        await this.connection!.invoke('JoinUserGroup');
        this.reregisterListeners();
      } catch (error) {
        console.error('Failed to rejoin user group:', error);
      }
    });
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  private reregisterListeners() {
    if (!this.connection) return;

    this.listeners.forEach((callbacks, eventName) => {
      callbacks.forEach(callback => {
        this.connection!.on(eventName, callback);
      });
    });
  }

  on(eventName: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);

    if (this.connection?.state === 'Connected') {
      this.connection.on(eventName, callback);
    }
  }

  off(eventName: string, callback: (...args: unknown[]) => void) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventName);
      }
    }

    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        // Leave user group before disconnecting
        await this.connection.invoke('LeaveUserGroup');
      } catch (error) {
        console.warn('Failed to leave user group:', error);
      }
      
      await this.connection.stop();
      this.connection = null;
      this.listeners.clear();
    }
  }

  get connectionState() {
    return this.connection?.state || 'Disconnected';
  }

  // Method to invoke hub methods
  async invoke(methodName: string, ...args: unknown[]) {
    if (this.connection?.state === 'Connected') {
      return await this.connection.invoke(methodName, ...args);
    } else {
      throw new Error('SignalR connection is not active');
    }
  }

  // Method to manually join user group (useful for testing)
  async joinUserGroup() {
    if (this.connection?.state === 'Connected') {
      try {
        await this.connection.invoke('JoinUserGroup');
        console.log('Joined user group');
      } catch (error) {
        console.error('Failed to join user group:', error);
      }
    }
  }

  // Method to manually leave user group
  async leaveUserGroup() {
    if (this.connection?.state === 'Connected') {
      try {
        await this.connection.invoke('LeaveUserGroup');
        console.log('Left user group');
      } catch (error) {
        console.error('Failed to leave user group:', error);
      }
    }
  }
}

// Singleton instance
export const signalRConnection = new SignalRConnectionManager();