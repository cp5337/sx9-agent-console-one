import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Pause, Play } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { ForgeLogLine } from '../../types/forge';

const LEVEL_STYLES: Record<string, string> = {
  INFO:  'text-sx-glow',
  WARN:  'text-sx-warning',
  ERROR: 'text-sx-error',
  DEBUG: 'text-sx-faint',
  TRACE: 'text-sx-faint',
  FATAL: 'text-sx-error',
};

function LogRow({ line }: { line: ForgeLogLine }) {
  const lvlStyle = LEVEL_STYLES[line.level] || 'text-sx-muted';
  const time = line.timestamp
    ? new Date(line.timestamp).toLocaleTimeString('en-US', { hour12: false })
    : '';
  return (
    <div className="flex items-start space-x-2 py-0.5 hover:bg-sx-elevated px-2 font-mono text-xs leading-5">
      <span className="text-sx-faint flex-shrink-0 w-20">{time}</span>
      <span className={`flex-shrink-0 w-12 ${lvlStyle}`}>{line.level}</span>
      <span className="text-sx-faint flex-shrink-0 max-w-32 truncate">[{line.source}]</span>
      <span className="text-sx-text break-all min-w-0">{line.message}</span>
    </div>
  );
}

export function LogViewer() {
  const { logLines, availableLogs, activeLog, setActiveLog, clearLogs, serverAvailable } = useForge();
  const [paused, setPaused] = useState(false);
  const [frozenLines, setFrozenLines] = useState<ForgeLogLine[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    setFrozenLines(logLines);
    if (!paused && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logLines, paused]);

  const displayed = paused ? frozenLines : logLines;

  if (!serverAvailable) {
    return (
      <div className="flex items-center justify-center h-32 text-sx-faint text-xs">
        Server unavailable — start with <code className="ml-1 text-sx-glow font-mono">npx sx9-console</code>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-72">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {availableLogs.map(log => (
            <button
              key={log}
              onClick={() => { setActiveLog(log); clearLogs(); }}
              className={`text-xs px-2 py-0.5 border flex-shrink-0 transition-colors ${
                activeLog === log
                  ? 'border-sx-primary text-sx-glow'
                  : 'border-sx-border text-sx-faint hover:text-sx-muted hover:border-sx-border'
              }`}
            >
              {log.replace('.log', '')}
            </button>
          ))}
          {availableLogs.length === 0 && (
            <span className="text-sx-faint text-xs">No log files found</span>
          )}
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => setPaused(p => !p)}
            className="p-1 text-sx-faint hover:text-sx-text transition-colors"
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            onClick={clearLogs}
            className="p-1 text-sx-faint hover:text-sx-error transition-colors"
            title="Clear"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto theme-scrollbar bg-sx-root border border-sx-border">
        {displayed.length === 0 && (
          <div className="flex items-center justify-center h-full text-sx-faint text-xs">
            Waiting for log lines...
          </div>
        )}
        {displayed.map((line, i) => <LogRow key={i} line={line} />)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
