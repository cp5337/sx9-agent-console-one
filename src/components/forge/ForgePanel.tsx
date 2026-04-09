import React, { useState } from 'react';
import {
  GitBranch, RefreshCw, FolderOpen, Cloud, Shield,
  Users, ListChecks, Server, Package, FileText, Radio,
  Eye, Globe
} from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import { ForgeAgentRoster } from './ForgeAgentRoster';
import { TaskTimeline } from './TaskTimeline';
import { VerticalHealth } from './VerticalHealth';
import { PluginGraph } from './PluginGraph';
import { LogViewer } from './LogViewer';
import { NatsMonitor } from './NatsMonitor';
import { AzureServiceMap } from './AzureServiceMap';
import { RaptorPhaseTracker } from './RaptorPhaseTracker';
import { DomainMap } from './DomainMap';

type ForgeSectionId = 'agents' | 'tasks' | 'verticals' | 'plugins' | 'logs' | 'nats' | 'azure' | 'raptor' | 'domains';

interface Section {
  id: ForgeSectionId;
  label: string;
  icon: React.ElementType;
  azureOnly?: boolean;
}

const BASE_SECTIONS: Section[] = [
  { id: 'agents',    label: 'Agents',    icon: Users },
  { id: 'tasks',     label: 'Timeline',  icon: ListChecks },
  { id: 'verticals', label: 'Verticals', icon: Server },
  { id: 'plugins',   label: 'Plugins',   icon: Package },
  { id: 'logs',      label: 'Logs',      icon: FileText },
  { id: 'nats',      label: 'NATS',      icon: Radio },
];

const AZURE_SECTIONS: Section[] = [
  { id: 'azure',   label: 'Azure',   icon: Cloud,  azureOnly: true },
  { id: 'raptor',  label: 'Raptor',  icon: Eye,    azureOnly: true },
  { id: 'domains', label: 'Domains', icon: Globe,  azureOnly: true },
];

const CLOUD_BADGE: Record<string, { label: string; color: string }> = {
  azure: { label: 'Azure', color: 'text-sx-glow border-sx-glow/40' },
  gcp:   { label: 'GCP',   color: 'text-sx-ok border-sx-ok/40' },
  aws:   { label: 'AWS',   color: 'text-sx-warning border-sx-warning/40' },
  local: { label: 'Local', color: 'text-sx-faint border-sx-border' },
};

function SessionBanner() {
  const { state, plugin, forgePath, connected, serverAvailable, lastUpdated, refresh } = useForge();

  const cloud = plugin?.cloud;
  const cloudBadge = cloud ? CLOUD_BADGE[cloud] : null;
  const hasSafetyAct = !!plugin?.safety_act;

  return (
    <div className="bg-sx-surface border border-sx-border p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5 min-w-0 flex-1">
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              serverAvailable
                ? connected ? 'bg-sx-ok animate-pulse' : 'bg-sx-warning animate-pulse'
                : 'bg-sx-faint'
            }`} />
            <span className="text-xs text-sx-faint">
              {serverAvailable
                ? connected ? 'Live' : 'Connecting'
                : 'Mock mode — run npx sx9-console to connect'}
            </span>
            {cloudBadge && (
              <span className={`text-xs border px-1.5 py-0.5 font-mono ${cloudBadge.color}`}>
                {cloudBadge.label}
              </span>
            )}
            {plugin?.tenant && (
              <span className="text-xs text-sx-faint font-mono">{plugin.tenant}</span>
            )}
            {hasSafetyAct && (
              <span className="flex items-center space-x-1 text-xs text-sx-ok border border-sx-ok/30 px-1.5 py-0.5">
                <Shield size={9} />
                <span>Safety Act</span>
              </span>
            )}
            {forgePath && (
              <span className="text-xs text-sx-faint flex items-center space-x-1">
                <FolderOpen size={10} />
                <span className="font-mono truncate max-w-72">{forgePath}</span>
              </span>
            )}
          </div>

          {plugin?.description && (
            <p className="text-xs text-sx-faint">{plugin.description}</p>
          )}

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
          ) : plugin ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5">
              {plugin.name && (
                <div>
                  <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Forge</p>
                  <p className="text-sx-text text-xs font-medium">{plugin.name}</p>
                </div>
              )}
              {plugin.version && (
                <div>
                  <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Version</p>
                  <p className="text-sx-muted text-xs font-mono">{plugin.version}</p>
                </div>
              )}
              <div>
                <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Agents</p>
                <p className="text-sx-glow text-xs">{Object.keys(plugin.agents).length} defined</p>
              </div>
              <div>
                <p className="text-sx-faint text-xs uppercase tracking-wider mb-0.5">Verticals</p>
                <p className="text-sx-text text-xs">{Object.keys(plugin.verticals).length} services</p>
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
    case 'azure':     return <AzureServiceMap />;
    case 'raptor':    return <RaptorPhaseTracker />;
    case 'domains':   return <DomainMap />;
    default:          return null;
  }
}

export function ForgePanel() {
  const [activeSection, setActiveSection] = useState<ForgeSectionId>('agents');
  const { natsConnected, plugin } = useForge();

  const isAzure = plugin?.cloud === 'azure' || !!plugin?.azure_services || !!plugin?.raptor_vision;
  const allSections = isAzure ? [...BASE_SECTIONS, ...AZURE_SECTIONS] : BASE_SECTIONS;

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
              {allSections.map(section => {
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
                    {section.azureOnly && (
                      <span className="ml-auto text-xs text-sx-glow/60 font-mono">az</span>
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
                const s = allSections.find(s => s.id === activeSection)!;
                if (!s) return null;
                const Icon = s.icon;
                return (
                  <>
                    <Icon size={14} className="text-sx-glow" />
                    <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">{s.label}</span>
                    {s.azureOnly && (
                      <span className="text-xs text-sx-glow/60 font-mono border border-sx-glow/20 px-1 ml-1">azure</span>
                    )}
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
