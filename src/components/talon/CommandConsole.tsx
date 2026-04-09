import React, { useState, useRef } from 'react';
import { Send, Zap, GitBranch, Layers } from 'lucide-react';
import { ExecutionMode } from '../../types/talon';
import { Persona } from '../../types';

interface CommandConsoleProps {
  personas: Persona[];
  isRunning: boolean;
  mode: ExecutionMode;
  selectedAgents: string[];
  onModeChange: (mode: ExecutionMode) => void;
  onAgentToggle: (agentId: string) => void;
  onExecute: (command: string) => void;
}

const MODE_CONFIG = [
  { id: 'auto' as ExecutionMode,       label: 'Auto',       icon: Zap },
  { id: 'sequential' as ExecutionMode, label: 'Sequential', icon: GitBranch },
  { id: 'parallel' as ExecutionMode,   label: 'Parallel',   icon: Layers },
];

const QUICK_COMMANDS = [
  'Analyze current threat posture and surface critical vulnerabilities',
  'Generate a full system status report across all active nodes',
  'Assess communication integrity and identify any compromised channels',
  'Run coordinated intelligence sweep on recent anomaly patterns',
];

export function CommandConsole({
  personas,
  isRunning,
  mode,
  selectedAgents,
  onModeChange,
  onAgentToggle,
  onExecute,
}: CommandConsoleProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || isRunning) return;
    onExecute(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div className="bg-sx-surface border border-sx-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-sx-glow animate-pulse' : 'bg-sx-faint'}`} />
          <span className="text-xs font-mono text-sx-faint tracking-widest uppercase">Command interface</span>
        </div>
        <span className="text-xs text-sx-faint font-mono">Ctrl+Enter to execute</span>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isRunning}
          placeholder="Enter a directive for your agent network..."
          className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-sm resize-none outline-none transition-colors font-mono disabled:opacity-50 px-4 py-3"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isRunning}
          className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-sx-primary hover:opacity-90 disabled:bg-sx-elevated disabled:text-sx-faint text-white px-3 py-1.5 text-xs font-medium transition-all"
        >
          <Send size={11} />
          <span>{isRunning ? 'Running...' : 'Execute'}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            onClick={() => setInput(cmd)}
            disabled={isRunning}
            className="text-xs text-sx-faint hover:text-sx-glow border border-sx-border hover:border-sx-primary px-2 py-1 transition-colors disabled:opacity-40"
          >
            {cmd.slice(0, 32)}...
          </button>
        ))}
      </div>

      <div className="flex items-start gap-6 pt-2 border-t border-sx-border">
        <div className="space-y-1.5">
          <p className="text-xs text-sx-faint uppercase tracking-wider">Mode</p>
          <div className="flex gap-1">
            {MODE_CONFIG.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onModeChange(id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium transition-all border ${
                  mode === id
                    ? 'bg-sx-primary/20 text-sx-glow border-sx-primary'
                    : 'text-sx-faint border-sx-border hover:border-sx-hover hover:text-sx-muted'
                }`}
              >
                <Icon size={11} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <p className="text-xs text-sx-faint uppercase tracking-wider">
            Routing {selectedAgents.length === 0 ? '(all)' : `(${selectedAgents.length} selected)`}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {personas.map(persona => {
              const isSelected = selectedAgents.includes(persona.id);
              const firstName = persona.name.split(' ')[0];
              return (
                <button
                  key={persona.id}
                  onClick={() => onAgentToggle(persona.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs transition-all border ${
                    isSelected
                      ? 'bg-sx-elevated text-sx-text border-sx-border'
                      : 'text-sx-faint border-sx-border hover:border-sx-hover hover:text-sx-muted'
                  }`}
                >
                  <img src={persona.avatar} alt="" className="w-4 h-4 rounded-full" />
                  <span>{firstName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
