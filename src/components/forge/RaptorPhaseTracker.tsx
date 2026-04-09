import React from 'react';
import { Radio, Layers, Eye, Cpu, Monitor, ArrowRight } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { RaptorPhase } from '../../types/forge';

const PHASE_ORDER = ['egg', 'net', 'vision'];

const PHASE_CONFIG: Record<string, {
  icon: React.ElementType;
  label: string;
  color: string;
  borderColor: string;
  description: string;
}> = {
  egg: {
    icon: Cpu,
    label: 'EGG',
    color: 'text-sx-muted',
    borderColor: 'border-sx-border',
    description: 'Health agent partition — thin client init, NATS handshake',
  },
  net: {
    icon: Radio,
    label: 'NET',
    color: 'text-sx-warning',
    borderColor: 'border-sx-warning/40',
    description: 'NATS mesh live — telemetry flowing, site visibility active',
  },
  vision: {
    icon: Eye,
    label: 'VISION',
    color: 'text-sx-glow',
    borderColor: 'border-sx-primary/60',
    description: 'Full surface — screen grab, SME connect, readiness, chat',
  },
};

function PhaseCard({ id, phase, active }: { id: string; phase: RaptorPhase; active: boolean }) {
  const cfg = PHASE_CONFIG[id] || { icon: Layers, label: id.toUpperCase(), color: 'text-sx-faint', borderColor: 'border-sx-border', description: '' };
  const Icon = cfg.icon;

  return (
    <div className={`border ${active ? cfg.borderColor : 'border-sx-border'} ${active ? 'bg-sx-elevated' : 'bg-sx-root'} transition-all`}>
      <div className={`flex items-center space-x-2.5 px-3 py-2.5 border-b ${active ? cfg.borderColor : 'border-sx-border'}`}>
        <Icon size={13} className={active ? cfg.color : 'text-sx-faint'} />
        <span className={`text-xs font-mono font-bold tracking-widest ${active ? cfg.color : 'text-sx-faint'}`}>
          {cfg.label}
        </span>
        {active && (
          <span className={`ml-auto text-xs ${cfg.color} border ${cfg.borderColor} px-1.5`}>ACTIVE</span>
        )}
      </div>
      <div className="p-3 space-y-2.5">
        <p className="text-xs text-sx-muted">{phase.description || cfg.description}</p>
        <div className="space-y-1.5">
          <div className="flex items-start space-x-2 text-xs">
            <span className="text-sx-faint w-20 flex-shrink-0">NATS</span>
            <code className="font-mono text-sx-glow text-xs break-all">{phase.nats_subject}</code>
          </div>
          <div className="flex items-start space-x-2 text-xs">
            <span className="text-sx-faint w-20 flex-shrink-0">Azure</span>
            <span className="text-sx-muted text-xs">{phase.azure_service}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RaptorPhaseTracker() {
  const { plugin } = useForge();
  const raptor = plugin?.raptor_vision;

  if (!plugin) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!raptor) {
    return (
      <div className="p-6 text-center">
        <Eye size={20} className="text-sx-faint mx-auto mb-2" />
        <p className="text-xs text-sx-faint">No Raptor Vision config in plugin.json</p>
        <p className="text-xs text-sx-faint mt-1">Add a <code className="text-sx-glow font-mono">raptor_vision</code> key to enable this view.</p>
      </div>
    );
  }

  const phases = raptor.phases || {};
  const tc = raptor.thin_client;
  const orderedPhases = PHASE_ORDER.filter(id => phases[id]);
  const activePhase = orderedPhases[orderedPhases.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-xs text-sx-faint">
        <span>Phase progression:</span>
        {orderedPhases.map((id, i) => (
          <React.Fragment key={id}>
            <span className={PHASE_CONFIG[id]?.color || 'text-sx-faint'}>{PHASE_CONFIG[id]?.label || id.toUpperCase()}</span>
            {i < orderedPhases.length - 1 && <ArrowRight size={10} className="text-sx-faint" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {orderedPhases.map(id => (
          <PhaseCard
            key={id}
            id={id}
            phase={phases[id]!}
            active={id === activePhase}
          />
        ))}
      </div>

      {tc && (
        <div className="bg-sx-elevated border border-sx-border p-3 space-y-2">
          <div className="flex items-center space-x-2 mb-2">
            <Monitor size={12} className="text-sx-faint" />
            <span className="text-xs text-sx-muted uppercase tracking-wider">Thin Client</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div>
              <p className="text-xs text-sx-faint mb-0.5">Device</p>
              <p className="text-xs text-sx-text">{tc.device}</p>
            </div>
            <div>
              <p className="text-xs text-sx-faint mb-0.5">Deployment</p>
              <p className="text-xs text-sx-muted">{tc.deployment}</p>
            </div>
            <div>
              <p className="text-xs text-sx-faint mb-0.5">Fallback</p>
              <p className="text-xs text-sx-muted">{tc.fallback}</p>
            </div>
            <div>
              <p className="text-xs text-sx-faint mb-0.5">Network</p>
              <p className="text-xs text-sx-muted">{tc.network}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
