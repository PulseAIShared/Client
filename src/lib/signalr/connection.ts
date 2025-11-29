import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getToken } from '@/lib/api-client';
import { env } from '@/config/env';

class SignalRConnection {
  private connection: HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private reconnectedHandlers: Array<() => void> = [];

  async connect(): Promise<HubConnection> {
    if (this.connection?.state === 'Connected') {
      return this.connection;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve, reject) => {
        const maxWait = 10000; // 10 seconds max wait
        const startTime = Date.now();
        
        const checkConnection = () => {
          if (this.connection?.state === 'Connected') {
            resolve(this.connection);
          } else if (Date.now() - startTime > maxWait) {
            reject(new Error('Connection attempt timeout'));
          } else if (!this.isConnecting) {
            reject(new Error('Connection attempt failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;
    const token = getToken();
    
    if (!token) {
      this.isConnecting = false;
      throw new Error('No authentication token available');
    }

    try {
      console.log('SignalR: Connecting to notification hub...');
      
      this.connection = new HubConnectionBuilder()
        .withUrl(`${env.API_URL}hubs/notifications`, {
          accessTokenFactory: () => token,
          withCredentials: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      await this.connection.start();
      console.log('SignalR: Connected successfully');
      
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      
      // Join user group after connection
      await this.connection.invoke('JoinUserGroup');
      
      return this.connection;
    } catch (error) {
      console.error('SignalR: Connection failed:', error);
      this.isConnecting = false;
      this.handleReconnect();
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    this.connection.onclose(async (error) => {
      console.warn('SignalR: Connection closed:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.connection.onreconnecting((error) => {
      console.warn('SignalR: Reconnecting:', error);
      this.isConnecting = true;
    });

    this.connection.onreconnected(async () => {
      console.log('SignalR: Reconnected');
      this.isConnecting = false;
      try {
        await this.connection!.invoke('JoinUserGroup');
        this.reconnectedHandlers.forEach((handler) => {
          try {
            handler();
          } catch (error) {
            console.error('SignalR: Reconnected handler failed', error);
          }
        });
      } catch (error) {
        console.error('SignalR: Failed to rejoin user group:', error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('SignalR: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`SignalR: Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('SignalR: Reconnection failed:', error);
      }
    }, delay);
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (this.connection?.state === 'Connected') {
      this.connection.on(eventName, callback);
    } else {
      // Store for later registration after connection
      this.connect().then(() => {
        this.connection?.on(eventName, callback);
      }).catch(error => {
        console.error('SignalR: Failed to register event handler:', error);
      });
    }
  }

  off(eventName: string, callback: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.invoke('LeaveUserGroup');
      } catch (error) {
        console.warn('SignalR: Failed to leave user group:', error);
      }
      
      await this.connection.stop();
      this.connection = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  get connectionState() {
    return this.connection?.state || 'Disconnected';
  }

  get isConnected() {
    return this.connection?.state === 'Connected';
  }

  async invoke(methodName: string, ...args: any[]) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (this.connection?.state === 'Connected') {
      return await this.connection.invoke(methodName, ...args);
    } else {
      throw new Error('SignalR connection is not active');
    }
  }

  // Support-specific methods
  async joinSupportSession(sessionId: string): Promise<void> {
    await this.invoke('JoinSupportSession', sessionId);
  }

  async sendMessage(sessionId: string, content: string): Promise<void> {
    await this.invoke('SendMessage', sessionId, content);
  }

  async setTypingIndicator(sessionId: string, isTyping: boolean): Promise<void> {
    await this.invoke('TypingIndicator', sessionId, isTyping);
  }

  async pickupSupportSession(sessionId: string): Promise<void> {
    await this.invoke('PickupSupportSession', sessionId);
  }

  async getActiveSessions(): Promise<void> {
    await this.invoke('GetActiveSessions');
  }

  onReconnected(callback: () => void) {
    this.reconnectedHandlers.push(callback);
    return () => {
      this.reconnectedHandlers = this.reconnectedHandlers.filter((cb) => cb !== callback);
    };
  }
}

// Single shared connection instance
export const signalRConnection = new SignalRConnection();
