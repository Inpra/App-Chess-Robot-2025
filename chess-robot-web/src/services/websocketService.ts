/**
 * WebSocket Service for Robot Chess Server Connection
 * Manages WebSocket connection to TCP Server for real-time communication
 */

type MessageHandler = (data: any) => void;

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private isManualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isManualClose = false;
        this.socket = new WebSocket(this.config.url);

        this.socket.onopen = () => {
          console.log('[WebSocket] Connected to server:', this.config.url);
          this.reconnectAttempts = 0;
          this.notifyHandlers('connection', { status: 'connected' });
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Received:', data);

            // Notify specific type handlers
            if (data.type) {
              this.notifyHandlers(data.type, data);
            }

            // Notify all message handlers
            this.notifyHandlers('message', data);
          } catch (error) {
            console.error('[WebSocket] Parse error:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.notifyHandlers('error', { error });
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.notifyHandlers('connection', { status: 'disconnected' });

          if (!this.isManualClose) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Send message to server
   */
  send(data: any): boolean {
    if (!this.isConnected()) {
      console.warn('[WebSocket] Cannot send - not connected');
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket!.send(message);
      console.log('[WebSocket] Sent:', data);
      return true;
    } catch (error) {
      console.error('[WebSocket] Send error:', error);
      return false;
    }
  }

  /**
   * Register message handler for specific type
   */
  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  /**
   * Remove message handler
   */
  off(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Notify all handlers for a message type
   */
  private notifyHandlers(type: string, data: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Handler error for type '${type}':`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.isManualClose) {
      return;
    }

    const maxAttempts = this.config.maxReconnectAttempts || 5;

    if (this.reconnectAttempts >= maxAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this.notifyHandlers('connection', {
        status: 'failed',
        message: 'Max reconnection attempts reached'
      });
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting... (${this.reconnectAttempts}/${maxAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnect failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Get connection status
   */
  getStatus(): string {
    if (!this.socket) return 'disconnected';

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Create singleton instance
const wsService = new WebSocketService({
  url: 'ws://100.73.130.46:8081/', // Robot Chess Server WebSocket URL (port 8081, no /ws path)
});

export default wsService;
