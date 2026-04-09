import React, { useEffect, useRef } from 'react';
import { Brain, Wrench, CornerDownRight, Sparkles, AlertTriangle, Terminal, ChevronRight } from 'lucide-react';
import { AgentEvent, AgentEventType } from '../../types/talon';

interface ExecutionStreamProps {
  events: AgentEvent[];
  isRunning: boolean;
}

const EVENT_CONFIG: Record<AgentEventType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  thought:     { icon: Brain,          color: 'text-sx-warning', bg: 'bg-sx-warning/5',  label: 'Thought'    },
  action:      { icon: ChevronRight,   color: 'text-sx-glow',    bg: 'bg-sx-glow/5',     label: 'Action'     },
  tool_call:   { icon: Terminal,       color: 'text-sx-primary', bg: 'bg-sx-primary/5',  label: 'Tool call'  },
  tool_result: { icon: Wrench,         color: 'text-sx-success', bg: 'bg-sx-success/5',  label: 'Result'     },
  delegation:  { icon: CornerDownRight,color: 'text-sx-agent',   bg: 'bg-sx-agent/5',    label: 'Delegation' },
  synthesis:   { icon: Sparkles,       color: 'text-sx-glow',    bg: 'bg-sx-glow/8',     label: 'Synthesis'  },
  error:       { icon: AlertTriangle,  color: 'text-sx-error',   bg: 'bg-sx-error/5',    label: 'Error'      },
  system:      { icon: Terminal,       color: 'text-sx-faint',   bg: 'bg-sx-elevated',   label: 'System'     },
};

function AgentBadge({ name, agentId }: { name: string; agentId: string }) {
  if (agentId === 'talon') {
    return (
      <span className="text-xs font-medium text-sx-glow bg-sx-primary/15 border border-sx-primary px-1.5 py-0.5 font-mono">
        TALON
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-sx-text bg-sx-elevated border border-sx-border px-1.5 py-0.5 font-mono">
      {name.split(' ')[0].toUpperCase()}
    </span>
  );
}

function EventEntry({ event }: { event: AgentEvent }) {
  const cfg = EVENT_CONFIG[event.type];
  const Icon = cfg.icon;
  const time = new Date(event.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={`flex items-start space-x-3 px-3 py-2.5 border border-transparent hover:border-sx-border transition-colors group ${cfg.bg}`}>
      <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <AgentBadge name={event.agentName} agentId={event.agentId} />
          <span className={`text-xs uppercase tracking-wider ${cfg.color} opacity-60`}>{cfg.label}</span>
          {event.tool && (
            <span className="text-xs font-mono text-sx-faint bg-sx-root px-1.5 border border-sx-border">{event.tool}</span>
          )}
          <span className="text-xs text-sx-faint ml-auto font-mono group-hover:text-sx-muted transition-colors">{time}</span>
        </div>
        <p className={`text-sm leading-relaxed ${event.type === 'thought' ? 'italic text-sx-muted' : 'text-sx-text'}`}>
          {event.content}
        </p>
        {event.toolInput && (
          <div className="mt-1 bg-sx-root px-2.5 py-1.5 font-mono text-xs text-sx-faint border border-sx-border">
            <span className="text-sx-faint/60 mr-1">IN:</span>{event.toolInput}
          </div>
        )}
        {event.toolOutput && (
          <div className="mt-1 bg-sx-root px-2.5 py-1.5 font-mono text-xs text-sx-success/70 border border-sx-border">
            <span className="text-sx-faint/60 mr-1">OUT:</span>{event.toolOutput}
          </div>
        )}
        {event.targetAgentName && event.type === 'delegation' && (
          <div className="flex items-center space-x-1 mt-1 text-xs text-sx-faint">
            <CornerDownRight size={10} />
            <span>Routing to</span>
            <span className="text-sx-muted font-mono">{event.targetAgentName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ExecutionStream({ events, isRunning }: ExecutionStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div className="bg-sx-surface border border-sx-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-sx-glow animate-pulse' : events.length > 0 ? 'bg-sx-success' : 'bg-sx-faint'}`} />
          <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Execution stream</span>
        </div>
        <span className="text-xs text-sx-faint font-mono">{events.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto theme-scrollbar space-y-px pr-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Terminal size={28} className="text-sx-border mb-3" />
            <p className="text-sx-faint text-sm">Awaiting execution</p>
            <p className="text-sx-faint/60 text-xs mt-1">Agent activity streams here in real time</p>
          </div>
        ) : (
          events.map(event => <EventEntry key={event.id} event={event} />)
        )}
        {isRunning && events.length > 0 && (
          <div className="flex items-center space-x-2 px-3 py-2 text-xs text-sx-faint">
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-sx-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-sx-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-sx-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Processing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
