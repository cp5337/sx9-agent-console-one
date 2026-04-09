import React, { useEffect, useState } from 'react';
import { Activity, Server, AlertTriangle, WifiOff, ExternalLink, Cloud } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';

interface EndpointStatus {
  port: number;
  status: 'checking' | 'healthy' | 'degraded' | 'unreachable';
  latencyMs?: number;
}

const PILLAR_COLOR: Record<string, string> = {
  HD4:    'text-sx-glow',
  PAMER:  'text-sx-ok',
  PADDIE: 'text-sx-warning',
};

function StatusDot({ status }: { status: EndpointStatus['status'] }) {
  const map: Record<string, string> = {
    healthy:     'bg-sx-ok animate-pulse',
    degraded:    'bg-sx-warning animate-pulse',
    unreachable: 'bg-sx-error',
    checking:    'bg-sx-faint animate-pulse',
  };
  return <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${map[status] || 'bg-sx-faint'}`} />;
}

export function VerticalHealth() {
  const { plugin } = useForge();
  const [statuses, setStatuses] = useState<Record<string, EndpointStatus>>({});

  const isAzureForge = !!plugin?.cloud && plugin.cloud !== 'local';

  useEffect(() => {
    if (!plugin?.verticals) return;

    const entries = Object.entries(plugin.verticals);
    const initial: Record<string, EndpointStatus> = {};
    for (const [name, v] of entries) {
      initial[name] = { port: v.port, status: 'checking' };
    }
    setStatuses(initial);

    for (const [name, v] of entries) {
      const url = v.subdomain
        ? `https://${v.subdomain}/health`
        : `http://localhost:${v.port}/health`;

      const start = Date.now();
      fetch(url, {
        signal: AbortSignal.timeout(3000),
        mode: 'no-cors',
      })
        .then(() => {
          setStatuses(prev => ({
            ...prev,
            [name]: { port: v.port, status: 'healthy', latencyMs: Date.now() - start },
          }));
        })
        .catch(() => {
          setStatuses(prev => ({
            ...prev,
            [name]: { port: v.port, status: 'unreachable' },
          }));
        });
    }
  }, [plugin]);

  if (!plugin?.verticals) {
    return (
      <div className="space-y-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  const entries = Object.entries(plugin.verticals);
  const healthy = Object.values(statuses).filter(s => s.status === 'healthy').length;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-4 mb-3 text-xs text-sx-faint">
        <span><span className="text-sx-ok">{healthy}</span>/{entries.length} reachable</span>
        {isAzureForge && (
          <span className="flex items-center space-x-1">
            <Cloud size={10} className="text-sx-glow" />
            <span className="text-sx-glow">Azure</span>
          </span>
        )}
      </div>
      <div className="space-y-1">
        {entries.map(([name, vertical]) => {
          const ps = statuses[name] || { port: vertical.port, status: 'checking' };

          return (
            <div key={name} className="p-2.5 bg-sx-elevated border border-sx-border hover:border-sx-border transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <StatusDot status={ps.status} />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-sx-text font-medium">{name}</span>
                      {vertical.pillar && (
                        <span className={`text-xs ${PILLAR_COLOR[vertical.pillar] || 'text-sx-faint'}`}>
                          {vertical.pillar}
                        </span>
                      )}
                    </div>
                    {vertical.azure_service && (
                      <p className="text-xs text-sx-faint mt-0.5 truncate">{vertical.azure_service}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 flex-shrink-0 ml-3">
                  {ps.latencyMs !== undefined && ps.status === 'healthy' && (
                    <span className="text-sx-ok font-mono text-xs">{ps.latencyMs}ms</span>
                  )}
                  <span className="font-mono text-xs text-sx-faint">:{vertical.port}</span>
                  {vertical.subdomain && (
                    <a
                      href={`https://${vertical.subdomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sx-faint hover:text-sx-glow transition-colors"
                    >
                      <ExternalLink size={10} />
                    </a>
                  )}
                  {ps.status === 'unreachable' && <WifiOff size={11} className="text-sx-error" />}
                  {ps.status === 'checking' && <Activity size={11} className="text-sx-faint" />}
                  {ps.status === 'degraded' && <AlertTriangle size={11} className="text-sx-warning" />}
                  {ps.status === 'healthy' && <Server size={11} className="text-sx-ok" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
