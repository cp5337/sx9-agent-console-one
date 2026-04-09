import React, { useState } from 'react';
import { Radio, Trash2, ChevronDown, ChevronRight, Server } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { NatsMessage } from '../../types/forge';

const SUBJECT_LABEL: Record<string, string> = {
  telemetry:       'Telemetry',
  presence:        'Agent Presence',
  factory_request: 'Factory Request',
  factory_response:'Factory Response',
  smarttech_health:'SmartTech Health',
  smarttech_sme:   'SME Request',
  training_xapi:   'xAPI Statements',
  raptor_egg:      'Raptor EGG',
  raptor_net:      'Raptor NET',
  raptor_vision:   'Raptor VISION',
};

const SUBJECT_COLOR: Record<string, string> = {
  raptor_egg:      'text-sx-muted',
  raptor_net:      'text-sx-warning',
  raptor_vision:   'text-sx-glow',
  smarttech_health:'text-sx-ok',
  smarttech_sme:   'text-sx-ok',
  training_xapi:   'text-sx-text',
  telemetry:       'text-sx-faint',
  presence:        'text-sx-glow',
};

function SubjectRow({ subjectKey, subject, count }: { subjectKey: string; subject: string; count: number }) {
  const label = SUBJECT_LABEL[subjectKey] || subjectKey.replace(/_/g, ' ');
  const color = SUBJECT_COLOR[subjectKey] || 'text-sx-faint';
  return (
    <div className="flex items-center justify-between p-2 bg-sx-elevated border border-sx-border">
      <div className="flex items-center space-x-2 min-w-0">
        <span className={`text-xs font-medium flex-shrink-0 ${color}`}>{label}</span>
        <span className="font-mono text-xs text-sx-faint truncate">{subject}</span>
      </div>
      <span className="text-xs text-sx-glow font-mono flex-shrink-0 ml-2">{count}</span>
    </div>
  );
}

function MessageRow({ msg }: { msg: NatsMessage }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false });
  const dataStr = typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data, null, 2);
  const isExpandable = typeof msg.data === 'object' && msg.data !== null;

  const subjectKey = Object.entries(SUBJECT_LABEL).find(([, label]) =>
    msg.subject.startsWith(label)
  )?.[0];
  const subjectColor = subjectKey ? SUBJECT_COLOR[subjectKey] || 'text-sx-glow' : 'text-sx-glow';

  return (
    <div className="border-b border-sx-border last:border-0">
      <div
        className={`flex items-start space-x-2 p-2 hover:bg-sx-elevated ${isExpandable ? 'cursor-pointer' : ''}`}
        onClick={() => isExpandable && setExpanded(e => !e)}
      >
        {isExpandable ? (
          expanded ? <ChevronDown size={11} className="text-sx-faint mt-0.5 flex-shrink-0" /> : <ChevronRight size={11} className="text-sx-faint mt-0.5 flex-shrink-0" />
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}
        <span className="text-sx-faint font-mono text-xs flex-shrink-0 w-20">{time}</span>
        <span className={`font-mono text-xs truncate flex-1 ${subjectColor}`}>{msg.subject}</span>
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
  const [view, setView] = useState<'messages' | 'subjects' | 'config'>('messages');

  const nats = plugin?.nats;
  const wsUrl = nats?.ws || nats?.ws_local;
  const primaryUrl = nats?.primary || nats?.local;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${natsConnected ? 'bg-sx-ok animate-pulse' : 'bg-sx-faint'}`} />
          <span className="text-xs text-sx-faint">
            {natsConnected
              ? 'NATS connected'
              : wsUrl
                ? `Disconnected — ${wsUrl}`
                : 'NATS not configured'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {(['messages', 'subjects', 'config'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-2 py-0.5 border transition-colors capitalize ${
                view === v
                  ? 'border-sx-primary text-sx-glow'
                  : 'border-sx-border text-sx-faint hover:text-sx-muted'
              }`}
            >
              {v}
            </button>
          ))}
          <button
            onClick={clearNats}
            className="p-1 text-sx-faint hover:text-sx-error transition-colors ml-1"
            title="Clear"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {view === 'config' ? (
        <div className="space-y-3">
          {nats ? (
            <>
              <div className="bg-sx-elevated border border-sx-border p-3 space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Server size={12} className="text-sx-faint" />
                  <span className="text-xs text-sx-faint uppercase tracking-wider">Connection</span>
                </div>
                {nats.deployment && (
                  <div className="flex justify-between text-xs">
                    <span className="text-sx-faint">Deployment</span>
                    <span className="text-sx-muted">{nats.deployment}</span>
                  </div>
                )}
                {primaryUrl && (
                  <div className="flex justify-between text-xs">
                    <span className="text-sx-faint">Primary</span>
                    <code className="font-mono text-sx-text text-xs">{primaryUrl}</code>
                  </div>
                )}
                {wsUrl && (
                  <div className="flex justify-between text-xs">
                    <span className="text-sx-faint">WebSocket</span>
                    <code className="font-mono text-sx-glow text-xs">{wsUrl}</code>
                  </div>
                )}
              </div>
              {nats.subjects && Object.keys(nats.subjects).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-sx-faint uppercase tracking-wider mb-2">Subjects</p>
                  {Object.entries(nats.subjects).map(([key, subject]) => {
                    const label = SUBJECT_LABEL[key] || key.replace(/_/g, ' ');
                    const color = SUBJECT_COLOR[key] || 'text-sx-faint';
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-sx-elevated border border-sx-border">
                        <span className={`text-xs ${color} flex-shrink-0 w-36`}>{label}</span>
                        <code className="font-mono text-xs text-sx-faint truncate">{subject}</code>
                      </div>
                    );
                  })}
                </div>
              )}
              {nats.jetstream_streams && nats.jetstream_streams.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-sx-faint uppercase tracking-wider mb-2">JetStream</p>
                  {nats.jetstream_streams.map(stream => (
                    <div key={stream.name} className="p-2 bg-sx-elevated border border-sx-border">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-sx-text">{stream.name}</span>
                        <span className="text-xs text-sx-faint">{stream.max_age_hours}h retention</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {stream.subjects.map(s => (
                          <code key={s} className="font-mono text-xs text-sx-faint border border-sx-border px-1">{s}</code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-sx-faint p-3">No NATS config in plugin.json</p>
          )}
        </div>
      ) : view === 'subjects' ? (
        <div className="space-y-1 max-h-64 overflow-y-auto theme-scrollbar">
          {nats?.subjects ? (
            Object.entries(nats.subjects)
              .filter(([, subject]) => subject)
              .map(([key, subject]) => (
                <SubjectRow
                  key={key}
                  subjectKey={key}
                  subject={subject!}
                  count={
                    Object.entries(natsSubjectStats)
                      .filter(([s]) => s.startsWith(subject!.replace('>', '')))
                      .reduce((sum, [, c]) => sum + c, 0)
                  }
                />
              ))
          ) : Object.entries(natsSubjectStats).length === 0 ? (
            <p className="text-xs text-sx-faint p-2">No subject activity yet</p>
          ) : (
            Object.entries(natsSubjectStats)
              .sort((a, b) => b[1] - a[1])
              .map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between p-2 bg-sx-elevated border border-sx-border">
                  <span className="font-mono text-xs text-sx-muted truncate">{subject}</span>
                  <span className="text-xs text-sx-glow font-mono flex-shrink-0 ml-2">{count}</span>
                </div>
              ))
          )}
        </div>
      ) : (
        <div className="border border-sx-border max-h-64 overflow-y-auto theme-scrollbar">
          {natsMessages.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <div className="text-center">
                <Radio size={16} className="text-sx-faint mx-auto mb-1" />
                <p className="text-xs text-sx-faint">
                  {wsUrl ? 'Waiting for messages...' : 'No NATS config'}
                </p>
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
