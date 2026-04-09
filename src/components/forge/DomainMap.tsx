import React from 'react';
import { Globe, Shield, Lock, ExternalLink, Code } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';

const DOMAIN_LABEL: Record<string, string> = {
  production:   'Production',
  staging:      'Staging',
  dev:          'Dev',
  mothership:   'Mothership',
  dev_platform: 'Dev Platform',
};

const DOMAIN_COLOR: Record<string, string> = {
  production:   'text-sx-ok',
  staging:      'text-sx-warning',
  dev:          'text-sx-muted',
  mothership:   'text-sx-glow',
  dev_platform: 'text-sx-faint',
};

const DEV_SURFACE_COLOR: Record<string, string> = {
  bolt:      'text-sx-glow',
  cursor:    'text-sx-ok',
  ai_studio: 'text-sx-warning',
};

export function DomainMap() {
  const { plugin } = useForge();

  if (!plugin) {
    return (
      <div className="space-y-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  const domains = plugin.domains;
  const safety = plugin.safety_act;
  const devSurfaces = plugin.dev_surfaces;
  const cloud = plugin.cloud;
  const tenant = plugin.tenant;

  return (
    <div className="space-y-5">
      {(cloud || tenant) && (
        <div className="bg-sx-elevated border border-sx-border p-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {cloud && (
              <div>
                <p className="text-xs text-sx-faint mb-0.5">Cloud</p>
                <p className="text-xs text-sx-glow font-mono uppercase">{cloud}</p>
              </div>
            )}
            {tenant && (
              <div>
                <p className="text-xs text-sx-faint mb-0.5">Tenant</p>
                <p className="text-xs text-sx-text font-mono">{tenant}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {domains && Object.keys(domains).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Globe size={12} className="text-sx-faint" />
            <span className="text-xs text-sx-faint uppercase tracking-wider">Domains</span>
          </div>
          <div className="space-y-1">
            {Object.entries(domains).map(([key, domain]) => {
              const label = DOMAIN_LABEL[key] || key;
              const color = DOMAIN_COLOR[key] || 'text-sx-muted';
              return (
                <div key={key} className="flex items-center justify-between p-2 bg-sx-elevated border border-sx-border">
                  <span className={`text-xs font-medium ${color}`}>{label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-sx-muted">{domain}</span>
                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sx-faint hover:text-sx-glow transition-colors"
                    >
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {safety && (
        <div className="border border-sx-border bg-sx-elevated">
          <div className="flex items-center space-x-2 px-3 py-2 border-b border-sx-border">
            <Shield size={12} className="text-sx-ok" />
            <span className="text-xs text-sx-ok font-medium uppercase tracking-wider">Safety Act Compliance</span>
            {safety.no_additional_subscriptions && (
              <span className="ml-auto text-xs text-sx-ok border border-sx-ok/40 px-1.5">Azure Only</span>
            )}
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start space-x-2 text-xs">
              <Lock size={10} className="text-sx-faint mt-0.5 flex-shrink-0" />
              <p className="text-sx-muted">{safety.constraint}</p>
            </div>
            {safety.audit_trail && (
              <div className="flex justify-between text-xs">
                <span className="text-sx-faint">Audit Trail</span>
                <span className="text-sx-muted">{safety.audit_trail}</span>
              </div>
            )}
            {safety.identity && (
              <div className="flex justify-between text-xs">
                <span className="text-sx-faint">Identity</span>
                <span className="text-sx-muted">{safety.identity}</span>
              </div>
            )}
            {safety.encryption && (
              <div className="flex justify-between text-xs">
                <span className="text-sx-faint">Encryption</span>
                <span className="text-sx-muted">{safety.encryption}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {devSurfaces && Object.keys(devSurfaces).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Code size={12} className="text-sx-faint" />
            <span className="text-xs text-sx-faint uppercase tracking-wider">Dev Surfaces</span>
          </div>
          <div className="space-y-1">
            {Object.entries(devSurfaces).map(([name, surface]) => {
              const color = DEV_SURFACE_COLOR[name] || 'text-sx-muted';
              return (
                <div key={name} className="bg-sx-elevated border border-sx-border p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium capitalize ${color}`}>{name.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-sx-faint mb-1.5">{surface.role}</p>
                  {surface.repos && surface.repos.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {surface.repos.map(repo => (
                        <span key={repo} className="font-mono text-xs text-sx-faint border border-sx-border px-1.5 py-0.5">{repo}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!domains && !safety && !devSurfaces && (
        <div className="p-6 text-center">
          <Globe size={20} className="text-sx-faint mx-auto mb-2" />
          <p className="text-xs text-sx-faint">No domain or compliance config in plugin.json</p>
        </div>
      )}
    </div>
  );
}
