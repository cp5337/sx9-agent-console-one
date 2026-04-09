import React, { useState } from 'react';
import {
  Cloud, Database, Brain, MessageCircle, Shield,
  Globe, BarChart2, ChevronDown, ChevronRight, ArrowRight
} from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { AzureServiceDef } from '../../types/forge';

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  compute:    { icon: Cloud,          label: 'Compute',    color: 'text-sx-glow' },
  data:       { icon: Database,       label: 'Data',       color: 'text-sx-ok' },
  ai:         { icon: Brain,          label: 'AI',         color: 'text-sx-warning' },
  comms:      { icon: MessageCircle,  label: 'Comms',      color: 'text-sx-text' },
  identity:   { icon: Shield,         label: 'Identity',   color: 'text-sx-muted' },
  delivery:   { icon: Globe,          label: 'Delivery',   color: 'text-sx-glow' },
  monitoring: { icon: BarChart2,      label: 'Monitoring', color: 'text-sx-muted' },
};

const SERVICE_DISPLAY: Record<string, string> = {
  app_service:             'App Service',
  functions:               'Azure Functions',
  static_web_apps:         'Static Web Apps',
  cosmos_db:               'Cosmos DB',
  blob_storage:            'Blob Storage',
  key_vault:               'Key Vault',
  ai_foundry:              'AI Foundry',
  communication_services:  'Communication Services',
  signalr:                 'SignalR',
  azure_ad:                'Azure AD',
  front_door:              'Front Door',
  application_insights:    'Application Insights',
  log_analytics:           'Log Analytics',
};

function ServiceCard({ id, svc, expanded, onToggle }: {
  id: string;
  svc: AzureServiceDef;
  expanded: boolean;
  onToggle: () => void;
}) {
  const displayName = SERVICE_DISPLAY[id] || id.replace(/_/g, ' ');

  return (
    <div className="border border-sx-border bg-sx-root">
      <div
        className="flex items-start justify-between p-2.5 cursor-pointer hover:bg-sx-elevated transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-sx-text font-medium">{displayName}</p>
          <p className="text-xs text-sx-faint mt-0.5 truncate">{svc.purpose}</p>
        </div>
        <button className="ml-2 flex-shrink-0 text-sx-faint mt-0.5">
          {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-sx-border p-2.5 space-y-2 bg-sx-elevated">
          {svc.runtime && (
            <div className="flex justify-between text-xs">
              <span className="text-sx-faint">Runtime</span>
              <span className="font-mono text-sx-muted">{svc.runtime}</span>
            </div>
          )}
          {svc.api && (
            <div className="flex justify-between text-xs">
              <span className="text-sx-faint">API</span>
              <span className="font-mono text-sx-muted">{svc.api}</span>
            </div>
          )}
          {svc.models && svc.models.length > 0 && (
            <div className="text-xs">
              <span className="text-sx-faint block mb-1">Models</span>
              <div className="flex flex-wrap gap-1">
                {svc.models.map(m => (
                  <span key={m} className="font-mono text-sx-glow border border-sx-glow/30 px-1.5 py-0.5">{m}</span>
                ))}
              </div>
            </div>
          )}
          {svc.features && svc.features.length > 0 && (
            <div className="text-xs">
              <span className="text-sx-faint block mb-1">Features</span>
              <div className="flex flex-wrap gap-1">
                {svc.features.map(f => (
                  <span key={f} className="text-sx-muted border border-sx-border px-1.5 py-0.5">{f.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
          {svc.replaces && (
            <div className="flex items-center space-x-1.5 text-xs text-sx-faint pt-1 border-t border-sx-border">
              <ArrowRight size={9} />
              <span>Replaces: <span className="text-sx-muted">{svc.replaces}</span></span>
            </div>
          )}
          {svc.retention && (
            <div className="flex justify-between text-xs">
              <span className="text-sx-faint">Retention</span>
              <span className="text-sx-warning font-mono">{svc.retention}</span>
            </div>
          )}
          {svc.app_registrations && (
            <div className="text-xs">
              <span className="text-sx-faint block mb-1">App Registrations</span>
              {Object.entries(svc.app_registrations).map(([name, domain]) => (
                <div key={name} className="flex justify-between py-0.5">
                  <span className="text-sx-muted capitalize">{name}</span>
                  <span className="font-mono text-sx-faint">{domain}</span>
                </div>
              ))}
            </div>
          )}
          {svc.role_mapping && (
            <div className="text-xs">
              <span className="text-sx-faint block mb-1">Role Mapping</span>
              {Object.entries(svc.role_mapping).map(([role, desc]) => (
                <div key={role} className="flex justify-between py-0.5">
                  <span className="text-sx-muted capitalize">{role}</span>
                  <span className="text-sx-faint truncate ml-2 max-w-48">{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryBlock({ category, services }: { category: string; services: Record<string, AzureServiceDef> }) {
  const cfg = CATEGORY_CONFIG[category] || { icon: Cloud, label: category, color: 'text-sx-faint' };
  const Icon = cfg.icon;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-sx-surface border border-sx-border">
      <div className="flex items-center space-x-2 px-3 py-2 border-b border-sx-border">
        <Icon size={12} className={cfg.color} />
        <span className={`text-xs font-medium uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
        <span className="text-xs text-sx-faint ml-auto">{Object.keys(services).length}</span>
      </div>
      <div className="p-2 space-y-1.5">
        {Object.entries(services).map(([id, svc]) => (
          <ServiceCard
            key={id}
            id={id}
            svc={svc}
            expanded={!!expanded[id]}
            onToggle={() => toggle(id)}
          />
        ))}
      </div>
    </div>
  );
}

export function AzureServiceMap() {
  const { plugin } = useForge();

  const azureSvcs = plugin?.azure_services;

  if (!plugin) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!azureSvcs) {
    return (
      <div className="p-6 text-center">
        <Cloud size={20} className="text-sx-faint mx-auto mb-2" />
        <p className="text-xs text-sx-faint">No Azure services defined in plugin.json</p>
        <p className="text-xs text-sx-faint mt-1">Add an <code className="text-sx-glow font-mono">azure_services</code> key to enable this view.</p>
      </div>
    );
  }

  const totalServices = Object.values(azureSvcs).reduce(
    (sum, cat) => sum + (cat ? Object.keys(cat).length : 0), 0
  );

  return (
    <div>
      <div className="flex items-center space-x-4 mb-3 text-xs text-sx-faint">
        <span><span className="text-sx-glow">{totalServices}</span> services across <span className="text-sx-glow">{Object.keys(azureSvcs).length}</span> categories</span>
        {plugin.tenant && (
          <span>Tenant: <span className="text-sx-muted font-mono">{plugin.tenant}</span></span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto theme-scrollbar">
        {Object.entries(azureSvcs).map(([cat, svcs]) =>
          svcs ? <CategoryBlock key={cat} category={cat} services={svcs} /> : null
        )}
      </div>
    </div>
  );
}
