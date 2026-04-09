import { useState, useEffect, useRef, useCallback } from 'react';
import type { ForgeLogLine } from '../types/forge';

const SERVER_BASE = '';
const MAX_LINES = 500;

export interface LogTailResult {
  lines: ForgeLogLine[];
  availableLogs: string[];
  activeLog: string | null;
  setActiveLog: (filename: string | null) => void;
  clear: () => void;
}

export function useLogTail(serverAvailable: boolean): LogTailResult {
  const [lines, setLines] = useState<ForgeLogLine[]>([]);
  const [availableLogs, setAvailableLogs] = useState<string[]>([]);
  const [activeLog, setActiveLog] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!serverAvailable) return;
    fetch(`${SERVER_BASE}/api/forge/logs`)
      .then(r => r.ok ? r.json() : [])
      .then((logs: string[]) => {
        setAvailableLogs(logs);
        if (logs.length > 0 && !activeLog) setActiveLog(logs[0]);
      })
      .catch(() => {});
  }, [serverAvailable]);

  const connectSSE = useCallback((filename: string | null) => {
    esRef.current?.close();
    if (!serverAvailable || !filename) return;

    const url = `${SERVER_BASE}/sse/logs?filename=${encodeURIComponent(filename)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === 'log' && event.data) {
          setLines(prev => {
            const next = [...prev, event.data as ForgeLogLine];
            return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
          });
        }
      } catch (_) {}
    };

    es.onerror = () => {
      setTimeout(() => connectSSE(filename), 3000);
    };
  }, [serverAvailable]);

  useEffect(() => {
    setLines([]);
    if (activeLog) connectSSE(activeLog);
    return () => { esRef.current?.close(); };
  }, [activeLog, connectSSE]);

  const clear = useCallback(() => setLines([]), []);

  return { lines, availableLogs, activeLog, setActiveLog, clear };
}
