import React, { useState } from 'react';
import { FileText, Clock, ChevronDown, ChevronUp, Copy, CheckCheck, Inbox } from 'lucide-react';
import { TalonCommand } from '../../types/talon';

interface ResultsPanelProps {
  commands: TalonCommand[];
  activeCommandId: string | null;
}

function CommandHistoryItem({
  command,
  isActive,
  onClick,
}: {
  command: TalonCommand;
  isActive: boolean;
  onClick: () => void;
}) {
  const statusColor = {
    pending:  'text-sx-faint',
    running:  'text-sx-glow',
    complete: 'text-sx-success',
    failed:   'text-sx-error',
  }[command.status];

  const time = new Date(command.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border transition-all ${
        isActive ? 'bg-sx-elevated border-sx-border' : 'bg-sx-surface border-sx-border/50 hover:border-sx-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-sx-muted truncate flex-1 leading-relaxed">{command.input}</p>
        <span className={`text-xs flex-shrink-0 font-mono ${statusColor}`}>{command.status}</span>
      </div>
      <div className="flex items-center space-x-3 mt-1.5 text-xs text-sx-faint">
        <div className="flex items-center space-x-1">
          <Clock size={10} />
          <span>{time}</span>
        </div>
        <span>{command.events.length} events</span>
        <span className="uppercase text-sx-faint/60">{command.mode}</span>
      </div>
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center space-x-1 text-xs text-sx-faint hover:text-sx-muted transition-colors">
      {copied ? <CheckCheck size={11} className="text-sx-success" /> : <Copy size={11} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export function ResultsPanel({ commands, activeCommandId }: ResultsPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const activeCommand = commands.find(c => c.id === activeCommandId);
  const completedCommands = commands.filter(c => c.status === 'complete');

  return (
    <div className="bg-sx-surface border border-sx-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-sx-glow" />
          <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Results</span>
        </div>
        {completedCommands.length > 0 && (
          <button
            onClick={() => setShowHistory(v => !v)}
            className="flex items-center space-x-1 text-xs text-sx-faint hover:text-sx-muted transition-colors"
          >
            <span>{completedCommands.length} prior</span>
            {showHistory ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto theme-scrollbar space-y-3">
        {activeCommand?.status === 'running' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-4">
              <div className="w-9 h-9 border border-sx-border" />
              <div className="absolute inset-0 w-9 h-9 border border-sx-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-sx-muted">Agents working...</p>
            <p className="text-xs text-sx-faint mt-1">{activeCommand.events.length} events received</p>
          </div>
        )}

        {activeCommand?.status === 'complete' && activeCommand.result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sx-success uppercase tracking-wider">Complete</span>
              <CopyButton text={activeCommand.result} />
            </div>
            <div className="bg-sx-root border border-sx-border p-4">
              <p className="text-sm text-sx-text leading-relaxed whitespace-pre-line">{activeCommand.result}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Events', value: String(activeCommand.events.length) },
                { label: 'Mode',   value: activeCommand.mode.toUpperCase() },
                { label: 'Agents', value: activeCommand.targetAgents.length > 0 ? String(activeCommand.targetAgents.length) : 'All' },
                { label: 'Status', value: 'Complete', valueColor: 'text-sx-success' },
              ].map(item => (
                <div key={item.label} className="bg-sx-elevated border border-sx-border p-2.5">
                  <p className="text-sx-faint mb-0.5">{item.label}</p>
                  <p className={`font-mono ${(item as any).valueColor ?? 'text-sx-muted'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeCommand && commands.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <Inbox size={28} className="text-sx-border mb-3" />
            <p className="text-sx-faint text-sm">No results yet</p>
            <p className="text-sx-faint/60 text-xs mt-1">Execute a command to see output here</p>
          </div>
        )}

        {showHistory && completedCommands.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-sx-border">
            <p className="text-xs text-sx-faint uppercase tracking-wider">History</p>
            {completedCommands
              .filter(c => c.id !== activeCommandId)
              .slice()
              .reverse()
              .map(cmd => (
                <CommandHistoryItem key={cmd.id} command={cmd} isActive={false} onClick={() => {}} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
