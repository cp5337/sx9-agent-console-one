import React, { useState } from 'react';
import { Package, ChevronDown, ChevronRight, Link } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { ForgeRegistryPlugin } from '../../types/forge';

const STATUS_STYLES: Record<string, string> = {
  active:   'text-sx-ok bg-sx-ok/10 border-sx-ok/30',
  inactive: 'text-sx-faint bg-sx-elevated border-sx-border',
  error:    'text-sx-error bg-sx-error/10 border-sx-error/30',
  unknown:  'text-sx-faint bg-sx-elevated border-sx-border',
};

function PluginRow({ plugin, allPlugins, depth = 0 }: {
  plugin: ForgeRegistryPlugin;
  allPlugins: ForgeRegistryPlugin[];
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasDeps = plugin.depends_on && plugin.depends_on.length > 0;
  const depPlugins = hasDeps
    ? plugin.depends_on!
        .map(id => allPlugins.find(p => p.id === id))
        .filter(Boolean) as ForgeRegistryPlugin[]
    : [];

  const statusStyle = STATUS_STYLES[plugin.status || 'unknown'];

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-sx-border pl-3' : ''}>
      <div
        className={`flex items-center justify-between p-2 hover:bg-sx-elevated cursor-pointer transition-colors ${
          depth === 0 ? 'border border-sx-border mb-0.5' : 'mb-0.5'
        }`}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center space-x-2 min-w-0">
          {hasDeps ? (
            expanded ? <ChevronDown size={11} className="text-sx-faint flex-shrink-0" /> : <ChevronRight size={11} className="text-sx-faint flex-shrink-0" />
          ) : (
            <Package size={11} className="text-sx-faint flex-shrink-0" />
          )}
          <span className="font-mono text-xs text-sx-text truncate">{plugin.id}</span>
          {plugin.version && (
            <span className="text-sx-faint text-xs font-mono flex-shrink-0">v{plugin.version}</span>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {hasDeps && (
            <span className="text-sx-faint text-xs flex items-center space-x-1">
              <Link size={9} />
              <span>{plugin.depends_on!.length}</span>
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 border ${statusStyle}`}>
            {plugin.status || 'unknown'}
          </span>
        </div>
      </div>
      {plugin.description && depth === 0 && (
        <p className="text-sx-faint text-xs px-5 pb-1.5 -mt-0.5">{plugin.description}</p>
      )}
      {expanded && depPlugins.length > 0 && (
        <div className="mt-0.5 mb-1">
          {depPlugins.map(dep => (
            <PluginRow key={dep.id} plugin={dep} allPlugins={allPlugins} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PluginGraph() {
  const { registry } = useForge();

  if (!registry || registry.length === 0) {
    return (
      <div className="space-y-1.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  const rootPlugins = registry.filter(p =>
    !registry.some(other => other.depends_on?.includes(p.id))
  );

  const active = registry.filter(p => p.status === 'active').length;
  const error = registry.filter(p => p.status === 'error').length;

  return (
    <div>
      <div className="flex items-center space-x-4 mb-3 text-xs text-sx-faint">
        <span><span className="text-sx-ok">{active}</span> active</span>
        {error > 0 && <span><span className="text-sx-error">{error}</span> errors</span>}
        <span>{registry.length} total</span>
      </div>
      <div className="space-y-0 max-h-80 overflow-y-auto theme-scrollbar">
        {rootPlugins.map(plugin => (
          <PluginRow key={plugin.id} plugin={plugin} allPlugins={registry} />
        ))}
        {rootPlugins.length === 0 && registry.map(plugin => (
          <PluginRow key={plugin.id} plugin={plugin} allPlugins={registry} />
        ))}
      </div>
    </div>
  );
}
