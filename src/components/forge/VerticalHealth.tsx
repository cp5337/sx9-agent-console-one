import React, { useEffect, useState } from 'react';
import { Activity, Server, AlertTriangle, WifiOff } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';

interface PortStatus {
  port: number;
  status: 'checking' | 'healthy' | 'degraded' | 'unreachable';
  latencyMs?: number;
}

const PILLAR_COLOR: Record<string, string> = {
  HD4:    'text-sx-glow',
  PAMER:  'text-sx-ok',
  PADDIE: 'text-sx-warning',
};

function StatusDot({ status }: { status: PortStatus['status'] }) {
  const map: Record<string, string> = {
    healthy:     'bg-sx-ok animate-pulse',
    degraded:    'bg-sx-warning animate-pulse',
    unreachable: 'bg-sx-error',
    checking:    'bg-sx-faint animate-pulse',
  };
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${map[status] || 'bg-sx-faint'}`} />;
}

export function VerticalHealth() {
  const { plugin } = useForge();
  const [portStatuses, setPortStatuses] = useState<Record<string, PortStatus>>({});

  useEffect(() => {
    if (!plugin?.verticals) return;

    const entries = Object.entries(plugin.verticals);
    const initial: Record<string, PortStatus> = {};
    for (const [name, v] of entries) {
      initial[name] = { port: v.port, status: 'checking' };
    }
    setPortStatuses(initial);

    for (const [name, v] of entries) {
      const start = Date.now();
      fetch(`http://localhost:${v.port}/health`, {
        signal: AbortSignal.timeout(2000),
        mode: 'no-cors',
      })
        .then(() => {
          setPortStatuses(prev => ({
            ...prev,
            [name]: { port: v.port, status: 'healthy', latencyMs: Date.now() - start },
          }));
        })
        .catch(() => {
          setPortStatuses(prev => ({
            ...prev,
            [name]: { port: v.port, status: 'unreachable' },
          }));
        });
    }
  }, [plugin]);

  if (!plugin?.verticals) {
    return (
      <div className="space-y-1.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  const entries = Object.entries(plugin.verticals);
  const healthy = Object.values(portStatuses).filter(s => s.status === 'healthy').length;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-4 mb-3 text-xs text-sx-faint">
        <span><span className="text-sx-ok">{healthy}</span>/{entries.length} reachable</span>
      </div>
      <div className="space-y-1">
        {entries.map(([name, vertical]) => {
          const ps = portStatuses[name] || { port: vertical.port, status: 'checking' };
          return (
            <div key={name} className="flex items-center justify-between p-2.5 bg-sx-elevated border border-sx-border hover:border-sx-border transition-colors">
              <div className="flex items-center space-x-2.5">
                <StatusDot status={ps.status} />
                <div>
                  <span className="text-xs text-sx-text font-medium">{name}</span>
                  <span className={`text-xs ml-2 ${PILLAR_COLOR[vertical.pillar] || 'text-sx-faint'}`}>
                    {vertical.pillar}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs text-sx-faint">
                {ps.latencyMs !== undefined && ps.status === 'healthy' && (
                  <span className="text-sx-ok font-mono">{ps.latencyMs}ms</span>
                )}
                <span className="font-mono">:{vertical.port}</span>
                {ps.status === 'unreachable' && <WifiOff size={11} className="text-sx-error" />}
                {ps.status === 'checking' && <Activity size={11} className="text-sx-faint" />}
                {ps.status === 'degraded' && <AlertTriangle size={11} className="text-sx-warning" />}
                {ps.status === 'healthy' && <Server size={11} className="text-sx-ok" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
