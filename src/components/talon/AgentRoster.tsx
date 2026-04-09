import React from 'react';
import { Brain, Cpu, ArrowRight, CheckCircle } from 'lucide-react';
import { AgentNode, AgentStatus } from '../../types/talon';

interface AgentRosterProps {
  nodes: AgentNode[];
  commandCount: number;
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; dot: string; pulse: boolean }> = {
  idle:       { label: 'Idle',       color: 'text-sx-faint',   dot: 'bg-sx-faint',   pulse: false },
  thinking:   { label: 'Thinking',   color: 'text-sx-warning', dot: 'bg-sx-warning', pulse: true  },
  acting:     { label: 'Acting',     color: 'text-sx-glow',    dot: 'bg-sx-glow',    pulse: true  },
  delegating: { label: 'Delegating', color: 'text-sx-primary', dot: 'bg-sx-primary', pulse: true  },
  complete:   { label: 'Complete',   color: 'text-sx-success', dot: 'bg-sx-success', pulse: false },
  error:      { label: 'Error',      color: 'text-sx-error',   dot: 'bg-sx-error',   pulse: false },
};

function TokenBar({ usage }: { usage: number }) {
  const pct = Math.min(100, (usage / 4000) * 100);
  const color = pct > 80 ? 'bg-sx-error' : pct > 50 ? 'bg-sx-warning' : 'bg-sx-glow';
  return (
    <div className="w-full h-px bg-sx-border overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AgentRoster({ nodes, commandCount }: AgentRosterProps) {
  const activeCount = nodes.filter(n => n.status !== 'idle').length;

  return (
    <div className="bg-sx-surface border border-sx-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-sx-glow" />
          <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Agents</span>
        </div>
        <span className="text-xs text-sx-faint font-mono">{activeCount}/{nodes.length} active</span>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
        {nodes.map(node => {
          const cfg = STATUS_CONFIG[node.status];
          return (
            <div
              key={node.agentId}
              className={`p-3 border transition-all duration-300 ${
                node.status !== 'idle'
                  ? 'bg-sx-elevated border-sx-border'
                  : 'bg-sx-surface border-sx-border/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="relative flex-shrink-0">
                  <img src={node.agentAvatar} alt={node.agentName} className="w-8 h-8 rounded-full" />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-sx-surface ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-sx-text truncate">{node.agentName.split(' ')[0]}</p>
                    <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-sx-faint truncate">{node.agentRole.split(' ').slice(0, 3).join(' ')}</p>
                </div>
              </div>

              {node.currentTask && (
                <p className="mt-1.5 text-xs text-sx-muted italic truncate pl-11">{node.currentTask}</p>
              )}

              <div className="mt-2 pl-11 space-y-1">
                <div className="flex justify-between text-xs text-sx-faint">
                  <span>{node.tokenUsage.toLocaleString()} tokens</span>
                  <span>{node.actionsCount} actions</span>
                </div>
                <TokenBar usage={node.tokenUsage} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-sx-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-sx-faint">
            <Cpu size={11} />
            <span>Commands</span>
          </div>
          <span className="text-sx-muted font-mono">{commandCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-sx-faint">
            <ArrowRight size={11} />
            <span>Delegations</span>
          </div>
          <span className="text-sx-muted font-mono">{nodes.reduce((a, n) => a + Math.floor(n.actionsCount / 3), 0)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-sx-faint">
            <CheckCircle size={11} />
            <span>Network</span>
          </div>
          <span className="text-sx-success font-mono">Nominal</span>
        </div>
      </div>
    </div>
  );
}
