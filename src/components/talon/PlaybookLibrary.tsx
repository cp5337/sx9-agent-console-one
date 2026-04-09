import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Trash2, Search, Tag, Clock, RefreshCw, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { Playbook, ChainStep } from '../../types/talon';
import { fetchPlaybooks, deletePlaybook, createPlaybook } from '../../services/playbooks';

interface PlaybookLibraryProps {
  onLoad: (steps: ChainStep[]) => void;
  onRun: (steps: ChainStep[]) => void;
  pendingSave: { name: string; description: string; steps: ChainStep[]; tags: string[] } | null;
  onPendingSaveClear: () => void;
}

const SAMPLE_PLAYBOOKS: Omit<Playbook, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Threat Response Protocol',
    description: 'Full-spectrum threat evaluation: initial scan, intelligence analysis, then coordinated response planning.',
    steps: [
      {
        id: 'thr-1',
        label: 'Initial Threat Scan',
        command: 'Run a broad threat surface evaluation across all monitored endpoints and flag any anomalies.',
        mode: 'parallel',
        targetAgents: [],
        passContext: false,
      },
      {
        id: 'thr-2',
        label: 'Intelligence Deep-Dive',
        command: 'Correlate flagged anomalies against known threat actor patterns and IOC databases. {{context}}',
        mode: 'auto',
        targetAgents: [],
        passContext: true,
      },
      {
        id: 'thr-3',
        label: 'Response Planning',
        command: 'Based on confirmed threats, generate a prioritized mitigation and response plan with agent assignments. {{context}}',
        mode: 'sequential',
        targetAgents: [],
        passContext: true,
      },
    ],
    tags: ['security', 'threat-response', 'intel'],
    run_count: 0,
  },
  {
    name: 'Full System Health Check',
    description: 'System probe, dependency audit, then stakeholder status report generation.',
    steps: [
      {
        id: 'hlt-1',
        label: 'System Probe',
        command: 'Perform a comprehensive health check across all active nodes, services, and communication endpoints.',
        mode: 'parallel',
        targetAgents: [],
        passContext: false,
      },
      {
        id: 'hlt-2',
        label: 'Dependency Audit',
        command: 'Review all system dependencies for vulnerabilities, outdated packages, and integration risks given the current system state. {{context}}',
        mode: 'auto',
        targetAgents: [],
        passContext: true,
      },
      {
        id: 'hlt-3',
        label: 'Status Report',
        command: 'Compile a concise executive status report summarizing system health, outstanding risks, and recommended actions. {{context}}',
        mode: 'sequential',
        targetAgents: [],
        passContext: true,
      },
    ],
    tags: ['ops', 'health', 'reporting'],
    run_count: 0,
  },
];

function PlaybookCard({
  playbook,
  onLoad,
  onRun,
  onDelete,
}: {
  playbook: Playbook;
  onLoad: () => void;
  onRun: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const lastRun = playbook.last_run_at
    ? new Date(playbook.last_run_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="bg-sx-surface border border-sx-border hover:border-sx-hover transition-all group">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-sx-text truncate">{playbook.name}</h3>
            {playbook.description && (
              <p className="text-xs text-sx-faint mt-0.5 leading-relaxed line-clamp-2">{playbook.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs font-mono text-sx-faint border border-sx-border px-2 py-0.5">
              {playbook.steps.length}
            </span>
          </div>
        </div>

        {playbook.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {playbook.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs text-sx-faint/70 border border-sx-border/50 px-1.5 py-0.5">
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-sx-faint">
          {lastRun && (
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{lastRun}</span>
            </div>
          )}
          {playbook.run_count > 0 && (
            <div className="flex items-center gap-1">
              <RefreshCw size={10} />
              <span>{playbook.run_count} run{playbook.run_count !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 text-xs bg-sx-primary hover:opacity-90 text-white px-3 py-1.5 transition-all flex-1 justify-center"
          >
            <Play size={11} />
            <span>Run</span>
          </button>
          <button
            onClick={onLoad}
            className="flex items-center gap-1.5 text-xs text-sx-faint hover:text-sx-muted border border-sx-border hover:border-sx-hover px-3 py-1.5 transition-all"
          >
            <ChevronRight size={11} />
            <span>Load</span>
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="text-xs text-sx-error border border-sx-error/50 px-2 py-1.5 hover:border-sx-error transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-sx-faint border border-sx-border px-2 py-1.5 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-sx-faint hover:text-sx-error border border-sx-border/50 hover:border-sx-error/50 transition-all"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlaybookLibrary({ onLoad, onRun, pendingSave, onPendingSaveClear }: PlaybookLibraryProps) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadPlaybooks() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlaybooks();
      setPlaybooks(data);
    } catch {
      setError('Failed to load playbooks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlaybooks();
  }, []);

  useEffect(() => {
    if (!pendingSave) return;
    (async () => {
      try {
        setSaving(true);
        const created = await createPlaybook(
          pendingSave.name,
          pendingSave.description,
          pendingSave.steps,
          pendingSave.tags
        );
        setPlaybooks(prev => [created, ...prev]);
        onPendingSaveClear();
      } catch {
        setError('Failed to save playbook');
      } finally {
        setSaving(false);
      }
    })();
  }, [pendingSave]);

  async function handleDelete(id: string) {
    try {
      await deletePlaybook(id);
      setPlaybooks(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete playbook');
    }
  }

  async function seedSamplePlaybooks() {
    try {
      setSaving(true);
      const created = await Promise.all(
        SAMPLE_PLAYBOOKS.map(p => createPlaybook(p.name, p.description, p.steps as ChainStep[], p.tags))
      );
      setPlaybooks(prev => [...created, ...prev]);
    } catch {
      setError('Failed to seed playbooks');
    } finally {
      setSaving(false);
    }
  }

  const filtered = playbooks.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-sx-faint tracking-widest uppercase">Playbook Library</span>
          <span className="text-xs text-sx-faint border border-sx-border px-2 py-0.5 font-mono">
            {playbooks.length}
          </span>
          {saving && <Loader2 size={12} className="text-sx-glow animate-spin" />}
        </div>
        <button
          onClick={loadPlaybooks}
          disabled={loading}
          className="p-1.5 text-sx-faint hover:text-sx-muted border border-sx-border/50 hover:border-sx-border transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="relative flex-shrink-0">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sx-faint" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search playbooks..."
          className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-xs pl-8 pr-4 py-2 outline-none transition-colors"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-sx-error border border-sx-error/30 bg-sx-error/5 px-3 py-2 flex-shrink-0">
          <AlertTriangle size={12} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto theme-scrollbar space-y-3 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-8 h-8 border border-sx-border" />
              <div className="absolute inset-0 w-8 h-8 border border-sx-primary border-t-transparent animate-spin" />
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={28} className="text-sx-border mb-3" />
            {playbooks.length === 0 ? (
              <>
                <p className="text-sx-faint text-sm">No playbooks saved</p>
                <p className="text-sx-faint/60 text-xs mt-1 mb-4">
                  Build a chain and save it, or load samples
                </p>
                <button
                  onClick={seedSamplePlaybooks}
                  disabled={saving}
                  className="text-xs text-sx-glow border border-sx-primary/50 hover:border-sx-primary px-4 py-2 transition-all disabled:opacity-50"
                >
                  Load Sample Playbooks
                </button>
              </>
            ) : (
              <>
                <p className="text-sx-faint text-sm">No matches for "{search}"</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-xs text-sx-faint hover:text-sx-muted mt-2 transition-colors"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        )}

        {!loading && filtered.map(playbook => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onLoad={() => {
              const freshSteps = playbook.steps.map(s => ({ ...s, id: `${s.id}-${Date.now()}` }));
              onLoad(freshSteps);
            }}
            onRun={() => {
              const freshSteps = playbook.steps.map(s => ({ ...s, id: `${s.id}-${Date.now()}` }));
              onRun(freshSteps);
            }}
            onDelete={() => handleDelete(playbook.id)}
          />
        ))}
      </div>
    </div>
  );
}
