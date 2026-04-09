import React, { useState } from 'react';
import { Radio, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { NatsMessage } from '../../types/forge';

function SubjectBadge({ subject, count }: { subject: string; count: number }) {
  return (
    <div className="flex items-center justify-between p-2 bg-sx-elevated border border-sx-border">
      <span className="font-mono text-xs text-sx-muted truncate">{subject}</span>
      <span className="text-xs text-sx-glow font-mono flex-shrink-0 ml-2">{count}</span>
    </div>
  );
}

function MessageRow({ msg }: { msg: NatsMessage }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false });
  const dataStr = typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data, null, 2);
  const isExpandable = typeof msg.data === 'object' && msg.data !== null;

  return (
    <div className="border-b border-sx-border last:border-0">
      <div
        className={`flex items-start space-x-2 p-2 hover:bg-sx-elevated ${isExpandable ? 'cursor-pointer' : ''}`}
        onClick={() => isExpandable && setExpanded(e => !e)}
      >
        {isExpandable ? (
          expanded ? <ChevronDown size={11} className="text-sx-faint mt-0.5 flex-shrink-0" /> : <ChevronRight size={11} className="text-sx-faint mt-0.5 flex-shrink-0" />
        ) : (
          <span className="w-3" />
        )}
        <span className="text-sx-faint font-mono text-xs flex-shrink-0 w-20">{time}</span>
        <span className="font-mono text-xs text-sx-glow truncate flex-1">{msg.subject}</span>
      </div>
      {expanded && (
        <pre className="font-mono text-xs text-sx-muted bg-sx-root border-t border-sx-border p-2 overflow-x-auto max-h-48">
          {dataStr}
        </pre>
      )}
    </div>
  );
}

export function NatsMonitor() {
  const { natsMessages, natsConnected, natsSubjectStats, clearNats, plugin } = useForge();
  const [view, setView] = useState<'messages' | 'subjects'>('messages');

  const wsUrl = plugin?.nats?.ws_local;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${natsConnected ? 'bg-sx-ok animate-pulse' : 'bg-sx-error'}`} />
          <span className="text-xs text-sx-faint">
            {natsConnected ? 'NATS connected' : wsUrl ? `Connecting to ${wsUrl}` : 'NATS not configured'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setView(v => v === 'messages' ? 'subjects' : 'messages')}
            className="text-xs text-sx-faint hover:text-sx-text px-2 py-0.5 border border-sx-border hover:border-sx-border transition-colors"
          >
            {view === 'messages' ? 'Subjects' : 'Messages'}
          </button>
          <button
            onClick={clearNats}
            className="p-1 text-sx-faint hover:text-sx-error transition-colors"
            title="Clear"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {!natsConnected && (
        <div className="p-3 bg-sx-elevated border border-sx-border">
          <p className="text-xs text-sx-faint">
            NATS WebSocket unavailable. Messages will appear here when{' '}
            <code className="text-sx-glow font-mono">{wsUrl || 'ws://127.0.0.1:4223'}</code> is reachable.
          </p>
        </div>
      )}

      {view === 'subjects' ? (
        <div className="space-y-1 max-h-64 overflow-y-auto theme-scrollbar">
          {Object.entries(natsSubjectStats).length === 0 ? (
            <p className="text-xs text-sx-faint p-2">No subject activity yet</p>
          ) : (
            Object.entries(natsSubjectStats)
              .sort((a, b) => b[1] - a[1])
              .map(([subject, count]) => (
                <SubjectBadge key={subject} subject={subject} count={count} />
              ))
          )}
        </div>
      ) : (
        <div className="border border-sx-border max-h-64 overflow-y-auto theme-scrollbar">
          {natsMessages.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <div className="text-center">
                <Radio size={16} className="text-sx-faint mx-auto mb-1" />
                <p className="text-xs text-sx-faint">No messages</p>
              </div>
            </div>
          ) : (
            natsMessages.map((msg, i) => <MessageRow key={i} msg={msg} />)
          )}
        </div>
      )}
    </div>
  );
}
