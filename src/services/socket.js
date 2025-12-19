import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isMockMode = true; // Enable mock mode since backend isn't running
  }

  connect() {
    if (this.isMockMode) {
      console.log('Socket in mock mode - backend not required');
      // Return a mock socket object
      const mockSocket = {
        on: (event, callback) => {
          if (event === 'connect') {
            setTimeout(() => callback(), 100); // Simulate connection
          }
          if (event === 'new-incident') {
            // Set up interval to simulate new incidents in mock mode
            setInterval(() => {
              if (Math.random() > 0.7) {
                const mockIncident = {
                  id: Date.now(),
                  title: ['Traffic Accident', 'Medical Emergency', 'Power Outage', 'Flood Warning'][Math.floor(Math.random() * 4)],
                  description: 'Emergency situation reported in the area.',
                  location: ['Downtown', 'North Side', 'East District', 'West End'][Math.floor(Math.random() * 4)],
                  priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                  status: 'new'
                };
                callback(mockIncident);
              }
            }, 8000);
          }
          return mockSocket;
        },
        off: () => mockSocket,
        emit: () => {},
        disconnect: () => {
          console.log('Mock socket disconnected');
        }
      };
      this.socket = mockSocket;
      this.isConnected = true;
      return mockSocket;
    }

    if (!this.socket) {
      try {
        this.socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          auth: {
            token: localStorage.getItem('authToken')
          },
          reconnectionAttempts: 3,
          timeout: 5000
        });

        this.socket.on('connect', () => {
          console.log('Socket connected');
          this.isConnected = true;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          this.socket = null;
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
          this.isConnected = false;
        });
      } catch (error) {
        console.error('Failed to create socket connection:', error);
        this.isConnected = false;
      }
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();