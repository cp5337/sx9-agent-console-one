import { useState, useEffect, useRef, useCallback } from 'react';
import type { NatsMessage, ForgeNats } from '../types/forge';

const MAX_MESSAGES = 200;

export interface NatsStreamResult {
  messages: NatsMessage[];
  connected: boolean;
  subjectStats: Record<string, number>;
  clear: () => void;
}

export function useNatsStream(natsConfig: ForgeNats | null | undefined): NatsStreamResult {
  const [messages, setMessages] = useState<NatsMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [subjectStats, setSubjectStats] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!natsConfig?.ws_local) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(natsConfig.ws_local);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        const subjects = Object.values(natsConfig.subjects || {});
        for (const subject of subjects) {
          ws.send(JSON.stringify({ op: 'sub', subject }));
        }
      };

      ws.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          const msg: NatsMessage = {
            subject: raw.subject || 'unknown',
            data: raw.data || raw,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => {
            const next = [msg, ...prev];
            return next.length > MAX_MESSAGES ? next.slice(0, MAX_MESSAGES) : next;
          });
          setSubjectStats(prev => ({
            ...prev,
            [msg.subject]: (prev[msg.subject] || 0) + 1,
          }));
        } catch (_) {}
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        setConnected(false);
        ws.close();
      };
    } catch (_) {
      setConnected(false);
    }
  }, [natsConfig]);

  useEffect(() => {
    if (natsConfig?.ws_local) connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [natsConfig, connect]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, connected, subjectStats, clear };
}
