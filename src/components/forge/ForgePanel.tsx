import React, { useState } from 'react';
import {
  GitBranch, RefreshCw, FolderOpen, Wifi, WifiOff,
  Users, ListChecks, Server, Package, FileText, Radio
} from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import { ForgeAgentRoster } from './ForgeAgentRoster';
import { TaskTimeline } from './TaskTimeline';
import { VerticalHealth } from './VerticalHealth';
import { PluginGraph } from './PluginGraph';
import { LogViewer } from './LogViewer';
import { NatsMonitor } from './NatsMonitor';

type ForgeSectionId = 'agents' | 'tasks' | 'verticals' | 'plugins' | 'logs' | 'nats';

interface Section {
  id: ForgeSectionId;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: 'agents',    label: 'Agents',    icon: Users },
  { id: 'tasks',     label: 'Timeline',  icon: ListChecks },
  { id: 'verticals', label: 'Verticals', icon: Server },
  { id: 'plugins',   label: 'Plugins',   icon: Package },
  { id: 'logs',      label: 'Logs',      icon: FileText },
  { id: 'nats',      label: 'NATS',      icon: Radio },
];

function SessionBanner() {
  const { state, forgePath, connected, serverAvailable, lastUpdated, refresh } = useForge();

  return (
    <div className="bg-sx-surface border border-sx-border p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              serverAvailable ? (connected ? 'bg-sx-ok animate-pulse' : 'bg-sx-warning animate-pulse') : 'bg-sx-error'
            }`} />
            <span className="text-xs text-sx-faint">
              {serverAvailable
                ? connected ? 'Live' : 'Connecting'
                : 'Mock mode — run npx sx9-console to connect'}
            </span>
            {forgePath && (
              <span className="text-xs text-sx-faint flex items-center space-x-1">
                <FolderOpen size={10} />
                <span className="font-mono truncate max-w-80">{forgePath}</span>
              </span>
            )}
          </div>

          {state ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5">
              <div>
                <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Session</p>
                <p className="text-sx-text text-xs font-mono truncate">{state.session_id}</p>
              </div>
              <div>
                <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Current Task</p>
                <p className="text-sx-glow text-xs font-medium truncate">
                  {state.current_task} — {state.current_task_title}
                </p>
              </div>
              <div>
                <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Branch</p>
                <div className="flex items-center space-x-1">
                  <GitBranch size={10} className="text-sx-faint flex-shrink-0" />
                  <p className="text-sx-text text-xs font-mono truncate">{state.git_branch}</p>
                </div>
              </div>
              <div>
                <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Last Event</p>
                <p className="text-sx-muted text-xs font-mono">{state.last_event}</p>
              </div>
            </div>
          ) : (
            <div className="h-10 bg-sx-elevated animate-pulse border border-sx-border" />
          )}
        </div>

        <button
          onClick={refresh}
          className="p-1.5 text-sx-faint hover:text-sx-text transition-colors ml-4 flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {lastUpdated && (
        <p className="text-sx-faint text-xs mt-2">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function SectionPanel({ id }: { id: ForgeSectionId }) {
  switch (id) {
    case 'agents':    return <ForgeAgentRoster />;
    case 'tasks':     return <TaskTimeline />;
    case 'verticals': return <VerticalHealth />;
    case 'plugins':   return <PluginGraph />;
    case 'logs':      return <LogViewer />;
    case 'nats':      return <NatsMonitor />;
    default:          return null;
  }
}

export function ForgePanel() {
  const [activeSection, setActiveSection] = useState<ForgeSectionId>('agents');
  const { natsConnected } = useForge();

  return (
    <div className="space-y-0">
      <SessionBanner />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-sx-surface border border-sx-border">
            <div className="p-2 border-b border-sx-border">
              <span className="text-xs text-sx-faint uppercase tracking-wider">Sections</span>
            </div>
            <nav className="p-1">
              {SECTIONS.map(section => {
                const Icon = section.icon;
                const active = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 text-xs transition-colors ${
                      active
                        ? 'bg-sx-elevated text-sx-glow border-l-2 border-sx-primary'
                        : 'text-sx-faint hover:text-sx-muted hover:bg-sx-elevated border-l-2 border-transparent'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{section.label}</span>
                    {section.id === 'nats' && natsConnected && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sx-ok animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          <div className="bg-sx-surface border border-sx-border p-4">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-sx-border">
              {(() => {
                const s = SECTIONS.find(s => s.id === activeSection)!;
                const Icon = s.icon;
                return (
                  <>
                    <Icon size={14} className="text-sx-glow" />
                    <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">{s.label}</span>
                  </>
                );
              })()}
            </div>
            <SectionPanel id={activeSection} />
          </div>
        </div>
      </div>
    </div>
  );
}
