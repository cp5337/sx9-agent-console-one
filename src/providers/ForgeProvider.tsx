import React, { createContext, useContext } from 'react';
import { useForgeState } from '../hooks/useForgeState';
import { useNatsStream } from '../hooks/useNatsStream';
import { useLogTail } from '../hooks/useLogTail';
import type { ForgePlugin, ForgeState, ForgeRegistry, NatsMessage, ForgeLogLine } from '../types/forge';

interface ForgeContextValue {
  plugin: ForgePlugin | null;
  state: ForgeState | null;
  registry: ForgeRegistry;
  connected: boolean;
  serverAvailable: boolean;
  forgePath: string | null;
  lastUpdated: string | null;
  refresh: () => void;
  natsMessages: NatsMessage[];
  natsConnected: boolean;
  natsSubjectStats: Record<string, number>;
  clearNats: () => void;
  logLines: ForgeLogLine[];
  availableLogs: string[];
  activeLog: string | null;
  setActiveLog: (f: string | null) => void;
  clearLogs: () => void;
}

const ForgeContext = createContext<ForgeContextValue | null>(null);

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const forgeState = useForgeState();
  const nats = useNatsStream(forgeState.plugin?.nats);
  const logs = useLogTail(forgeState.serverAvailable);

  const value: ForgeContextValue = {
    ...forgeState,
    natsMessages: nats.messages,
    natsConnected: nats.connected,
    natsSubjectStats: nats.subjectStats,
    clearNats: nats.clear,
    logLines: logs.lines,
    availableLogs: logs.availableLogs,
    activeLog: logs.activeLog,
    setActiveLog: logs.setActiveLog,
    clearLogs: logs.clear,
  };

  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge(): ForgeContextValue {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error('useForge must be used inside ForgeProvider');
  return ctx;
}
