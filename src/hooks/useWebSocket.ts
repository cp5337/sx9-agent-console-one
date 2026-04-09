import { useEffect, useRef, useState } from 'react';
import { Message, Persona } from '../types';

interface WebSocketMessage {
  type: 'message' | 'persona_status' | 'system_update';
  data: any;
}

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [personaUpdates, setPersonaUpdates] = useState<Persona[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);

  useEffect(() => {
    // Don't attempt WebSocket connection by default
    // Only connect if explicitly enabled
    if (!shouldConnect) {
      console.log('WebSocket: Running in offline mode (no backend server)');
      return;
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, shouldConnect]);

  const sendMessage = (message: any) => {
    console.log('WebSocket: Message not sent, running in offline mode');
    return false;
  };

  const enableConnection = () => {
    setShouldConnect(true);
  };

  return {
    isConnected,
    messages,
    personaUpdates,
    sendMessage,
    enableConnection
  };
};