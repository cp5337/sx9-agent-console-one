import { useState, useEffect, useRef, useCallback } from 'react';
import type { ForgePlugin, ForgeState, ForgeRegistry, ForgeSSEEvent } from '../types/forge';

const SERVER_BASE = '';

export interface ForgeStateResult {
  plugin: ForgePlugin | null;
  state: ForgeState | null;
  registry: ForgeRegistry;
  connected: boolean;
  serverAvailable: boolean;
  forgePath: string | null;
  lastUpdated: string | null;
  refresh: () => void;
}

export function useForgeState(): ForgeStateResult {
  const [plugin, setPlugin] = useState<ForgePlugin | null>(null);
  const [state, setState] = useState<ForgeState | null>(null);
  const [registry, setRegistry] = useState<ForgeRegistry>([]);
  const [connected, setConnected] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [forgePath, setForgePath] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchInitial = useCallback(async () => {
    try {
      const statusRes = await fetch(`${SERVER_BASE}/api/forge/status`, { signal: AbortSignal.timeout(2000) });
      if (!statusRes.ok) throw new Error('Server not available');
      const status = await statusRes.json();
      setServerAvailable(true);
      setForgePath(status.forgePath);

      const allRes = await fetch(`${SERVER_BASE}/api/forge/all`);
      if (allRes.ok) {
        const all = await allRes.json();
        if (all.plugin) setPlugin(all.plugin);
        if (all.state) setState(all.state);
        if (all.plugin_registry) setRegistry(
          Array.isArray(all.plugin_registry)
            ? all.plugin_registry
            : Object.entries(all.plugin_registry).map(([id, v]: [string, unknown]) => ({
                id,
                ...(typeof v === 'object' && v !== null ? v : {}),
              }))
        );
        setLastUpdated(new Date().toISOString());
      }
    } catch (_) {
      setServerAvailable(false);
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    try {
      const es = new EventSource(`${SERVER_BASE}/sse/forge`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const event: ForgeSSEEvent = JSON.parse(e.data);
          setLastUpdated(event.timestamp);
          if (event.type === 'connected') {
            setConnected(true);
            setServerAvailable(true);
            const d = event.data as { forgePath?: string };
            if (d?.forgePath) setForgePath(d.forgePath);
          } else if (event.type === 'plugin') {
            setPlugin(event.data as ForgePlugin);
          } else if (event.type === 'state') {
            setState(event.data as ForgeState);
          } else if (event.type === 'registry') {
            const raw = event.data;
            setRegistry(
              Array.isArray(raw)
                ? raw
                : Object.entries(raw as Record<string, unknown>).map(([id, v]) => ({
                    id,
                    ...(typeof v === 'object' && v !== null ? v as object : {}),
                  }))
            );
          }
        } catch (_) {}
      };

      es.onerror = () => {
        setConnected(false);
        setTimeout(connectSSE, 3000);
      };
    } catch (_) {
      setServerAvailable(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial().then(() => connectSSE());
    return () => {
      eventSourceRef.current?.close();
    };
  }, [fetchInitial, connectSSE]);

  return { plugin, state, registry, connected, serverAvailable, forgePath, lastUpdated, refresh: fetchInitial };
}
