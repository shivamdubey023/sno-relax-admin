import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    const serverUrl = process.env.NODE_ENV === 'production'
      ? 'https://sno-relax-server.onrender.com'
      : 'http://localhost:5000';

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Admin WebSocket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Admin WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Admin WebSocket connection error:', error);
      this.isConnected = false;
    });

    // Listen for real-time updates
    this.socket.on('statsUpdate', (data) => {
      this.emit('statsUpdate', data);
    });

    this.socket.on('userActivity', (data) => {
      this.emit('userActivity', data);
    });

    this.socket.on('newUser', (data) => {
      this.emit('newUser', data);
    });

    this.socket.on('newContent', (data) => {
      this.emit('newContent', data);
    });

    this.socket.on('chatActivity', (data) => {
      this.emit('chatActivity', data);
    });

    this.socket.on('communityUpdate', (data) => {
      this.emit('communityUpdate', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event emitter pattern
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Send admin commands
  sendAdminCommand(command, data) {
    if (this.socket?.connected) {
      this.socket.emit('adminCommand', { command, data });
    }
  }

  // Request real-time stats
  requestStats() {
    if (this.socket?.connected) {
      this.socket.emit('requestStats');
    }
  }

  // Join admin room for real-time updates
  joinAdminRoom(adminId) {
    if (this.socket?.connected) {
      this.socket.emit('joinAdminRoom', { adminId });
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;