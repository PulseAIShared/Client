// src/lib/signalr-connection.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getToken } from '@/lib/api-client';

class SignalRConnectionManager {
  private connection: HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  async connect(): Promise<HubConnection> {
    if (this.connection?.state === 'Connected') {
      return this.connection;
    }

    const token = getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7126/hubs/notifications', {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000);
        }
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      console.log('SignalR Connected');
      this.reconnectAttempts = 0;
      
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

    this.connection.onreconnected(() => {
      console.log('SignalR Reconnected');
      this.reregisterListeners();
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

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);

    if (this.connection?.state === 'Connected') {
      this.connection.on(eventName, callback);
    }
  }

  off(eventName: string, callback: (...args: any[]) => void) {
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
      await this.connection.stop();
      this.connection = null;
      this.listeners.clear();
    }
  }

  get connectionState() {
    return this.connection?.state || 'Disconnected';
  }
}

// Singleton instance
export const signalRConnection = new SignalRConnectionManager();