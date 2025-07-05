import React, { createContext, useContext } from 'react';

interface WebSocketContextType {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // Temporalmente deshabilitado hasta que configuremos WebSocket en el servidor
  const value: WebSocketContextType = {
    connect: () => console.log('WebSocket deshabilitado temporalmente'),
    disconnect: () => console.log('WebSocket deshabilitado temporalmente'),
    sendMessage: () => console.log('WebSocket deshabilitado temporalmente'),
    isConnected: false,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 