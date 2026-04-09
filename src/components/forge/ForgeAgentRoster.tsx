import React from 'react';
import { useForge } from '../../providers/ForgeProvider';

const ROLE_COLOR: Record<string, string> = {
  orchestrator: 'text-sx-glow border-sx-glow/40',
  architect:    'text-sx-ok border-sx-ok/40',
  builder:      'text-sx-muted border-sx-border',
  validator:    'text-sx-warning border-sx-warning/40',
};

const STATUS_DOT: Record<string, string> = {
  online:  'bg-sx-ok animate-pulse',
  active:  'bg-sx-glow animate-pulse',
  idle:    'bg-sx-muted',
  offline: 'bg-sx-faint',
  stalled: 'bg-sx-warning animate-pulse',
};

export function ForgeAgentRoster() {
  const { plugin, state } = useForge();

  if (!plugin?.agents) {
    return (
      <div className="space-y-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  const agents = Object.entries(plugin.agents);
  const online = agents.filter(([, a]) => a.status && a.status !== 'offline').length;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-4 mb-3 text-xs text-sx-faint">
        <span><span className="text-sx-ok">{online}</span>/{agents.length} agents</span>
        {state?.git_branch && (
          <span className="font-mono text-sx-glow truncate max-w-48">{state.git_branch}</span>
        )}
      </div>
      {agents.map(([name, agent]) => {
        const roleStyle = ROLE_COLOR[agent.role] || 'text-sx-muted border-sx-border';
        const dotStyle = STATUS_DOT[agent.status || 'idle'] || 'bg-sx-faint';
        return (
          <div key={name} className="flex items-center justify-between p-2.5 bg-sx-elevated border border-sx-border hover:border-sx-border transition-colors">
            <div className="flex items-center space-x-2.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyle}`} />
              <div>
                <span className="text-xs text-sx-text font-medium capitalize">{name}</span>
                <span className={`text-xs ml-2 border px-1 ${roleStyle}`}>{agent.role}</span>
              </div>
            </div>
            <div className="text-xs text-sx-faint font-mono truncate max-w-48 text-right">
              {agent.presence}
            </div>
          </div>
        );
      })}
    </div>
  );
}
