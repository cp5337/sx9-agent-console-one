import React, { useState } from 'react';
import {
  Plus, Trash2, Play, Save, ArrowDown, Zap, GitBranch, Layers,
  Link, Unlink, ChevronDown, ChevronUp, CheckCircle, Loader,
  AlertCircle, Circle, X
} from 'lucide-react';
import { ChainStep, ChainExecution, ExecutionMode } from '../../types/talon';
import { Persona } from '../../types';

interface ChainBuilderProps {
  personas: Persona[];
  chain: ChainExecution | null;
  isRunning: boolean;
  steps: ChainStep[];
  onStepsChange: (steps: ChainStep[]) => void;
  onRun: (steps: ChainStep[]) => void;
  onCancel: () => void;
  onSavePlaybook: (name: string, description: string, steps: ChainStep[], tags: string[]) => void;
}

const MODE_CONFIG = [
  { id: 'auto' as ExecutionMode, label: 'Auto', icon: Zap },
  { id: 'sequential' as ExecutionMode, label: 'Seq', icon: GitBranch },
  { id: 'parallel' as ExecutionMode, label: 'Par', icon: Layers },
];

function newStep(): ChainStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: '',
    command: '',
    mode: 'auto',
    targetAgents: [],
    passContext: false,
  };
}

function StepStatusIcon({ status }: { status?: 'pending' | 'running' | 'complete' | 'failed' }) {
  if (!status || status === 'pending') return <Circle size={14} className="text-sx-faint" />;
  if (status === 'running') return <Loader size={14} className="text-sx-glow animate-spin" />;
  if (status === 'complete') return <CheckCircle size={14} className="text-sx-success" />;
  return <AlertCircle size={14} className="text-sx-error" />;
}

interface StepCardProps {
  step: ChainStep;
  index: number;
  total: number;
  personas: Persona[];
  executionStatus?: 'pending' | 'running' | 'complete' | 'failed';
  isRunning: boolean;
  onChange: (updated: ChainStep) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function StepCard({
  step, index, total, personas, executionStatus, isRunning,
  onChange, onRemove, onMoveUp, onMoveDown
}: StepCardProps) {
  const [expanded, setExpanded] = useState(true);

  const isActive = executionStatus === 'running';
  const isDone = executionStatus === 'complete';
  const isFailed = executionStatus === 'failed';

  const borderClass = isActive
    ? 'border-sx-primary'
    : isDone
    ? 'border-sx-success/50'
    : isFailed
    ? 'border-sx-error/50'
    : 'border-sx-border';

  return (
    <div className={`bg-sx-surface border ${borderClass} transition-all`}>
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-mono font-bold border ${
          isActive ? 'border-sx-primary text-sx-glow bg-sx-primary/10' : 'border-sx-border text-sx-faint'
        }`}>
          {index + 1}
        </div>
        <StepStatusIcon status={executionStatus} />
        <span className="text-xs text-sx-muted flex-1 truncate">
          {step.label || `Step ${index + 1}`}
          {step.command && (
            <span className="text-sx-faint ml-2">— {step.command.slice(0, 40)}{step.command.length > 40 ? '…' : ''}</span>
          )}
        </span>
        {step.passContext && index > 0 && (
          <Link size={11} className="text-sx-glow flex-shrink-0" title="Context passed from previous step" />
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isRunning && (
            <>
              <button
                onClick={e => { e.stopPropagation(); onMoveUp(); }}
                disabled={index === 0}
                className="p-1 text-sx-faint hover:text-sx-muted disabled:opacity-30 transition-colors"
              >
                <ChevronUp size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onMoveDown(); }}
                disabled={index === total - 1}
                className="p-1 text-sx-faint hover:text-sx-muted disabled:opacity-30 transition-colors"
              >
                <ChevronDown size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onRemove(); }}
                className="p-1 text-sx-faint hover:text-sx-error transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
          {expanded ? <ChevronUp size={12} className="text-sx-faint ml-1" /> : <ChevronDown size={12} className="text-sx-faint ml-1" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-sx-border/50">
          <div className="pt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-sx-faint uppercase tracking-wider block mb-1.5">Step Label</label>
              <input
                type="text"
                value={step.label}
                onChange={e => onChange({ ...step, label: e.target.value })}
                disabled={isRunning}
                placeholder={`Step ${index + 1}`}
                className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-xs px-3 py-2 outline-none transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-sx-faint uppercase tracking-wider block mb-1.5">Mode</label>
              <div className="flex gap-1">
                {MODE_CONFIG.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => !isRunning && onChange({ ...step, mode: id })}
                    disabled={isRunning}
                    className={`flex items-center gap-1 px-2 py-1.5 text-xs border transition-all flex-1 justify-center ${
                      step.mode === id
                        ? 'bg-sx-primary/20 text-sx-glow border-sx-primary'
                        : 'text-sx-faint border-sx-border hover:border-sx-hover hover:text-sx-muted'
                    } disabled:opacity-50`}
                  >
                    <Icon size={9} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-sx-faint uppercase tracking-wider block mb-1.5">Command</label>
            <textarea
              value={step.command}
              onChange={e => onChange({ ...step, command: e.target.value })}
              disabled={isRunning}
              rows={3}
              placeholder={
                index > 0 && step.passContext
                  ? 'Enter command — use {{context}} to inject previous result...'
                  : 'Enter directive for this step...'
              }
              className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-xs resize-none outline-none transition-colors font-mono disabled:opacity-50 px-3 py-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-sx-faint uppercase tracking-wider mb-1.5">Agents</p>
              <div className="flex flex-wrap gap-1">
                {personas.map(p => {
                  const selected = step.targetAgents.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (isRunning) return;
                        onChange({
                          ...step,
                          targetAgents: selected
                            ? step.targetAgents.filter(id => id !== p.id)
                            : [...step.targetAgents, p.id],
                        });
                      }}
                      className={`flex items-center gap-1 px-2 py-1 text-xs border transition-all ${
                        selected
                          ? 'bg-sx-elevated text-sx-text border-sx-border'
                          : 'text-sx-faint border-sx-border/50 hover:border-sx-border hover:text-sx-muted'
                      } disabled:opacity-50`}
                    >
                      <img src={p.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                      <span>{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {index > 0 && (
              <div className="flex flex-col items-end gap-1">
                <p className="text-xs text-sx-faint uppercase tracking-wider">Pass Context</p>
                <button
                  onClick={() => !isRunning && onChange({ ...step, passContext: !step.passContext })}
                  disabled={isRunning}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs border transition-all ${
                    step.passContext
                      ? 'bg-sx-primary/20 text-sx-glow border-sx-primary'
                      : 'text-sx-faint border-sx-border hover:border-sx-hover'
                  } disabled:opacity-50`}
                >
                  {step.passContext ? <Link size={11} /> : <Unlink size={11} />}
                  <span>{step.passContext ? 'Linked' : 'Isolated'}</span>
                </button>
              </div>
            )}
          </div>

          {isDone && (
            <div className="bg-sx-root border border-sx-success/30 p-2.5">
              <p className="text-xs text-sx-success uppercase tracking-wider mb-1">Step complete</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ChainBuilder({
  personas, chain, isRunning, steps, onStepsChange, onRun, onCancel, onSavePlaybook
}: ChainBuilderProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveTags, setSaveTags] = useState('');

  const canRun = !isRunning && steps.length > 0 && steps.every(s => s.command.trim());

  function updateStep(index: number, updated: ChainStep) {
    onStepsChange(steps.map((s, i) => (i === index ? updated : s)));
  }

  function removeStep(index: number) {
    onStepsChange(steps.filter((_, i) => i !== index));
  }

  function addStep() {
    onStepsChange([...steps, newStep()]);
  }

  function moveStep(from: number, to: number) {
    const next = [...steps];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onStepsChange(next);
  }

  function getStepExecutionStatus(step: ChainStep): 'pending' | 'running' | 'complete' | 'failed' | undefined {
    if (!chain) return undefined;
    const cmd = chain.stepCommands[step.id];
    if (!cmd) {
      if (chain.currentStepIndex < steps.indexOf(step)) return 'pending';
      return undefined;
    }
    return cmd.status as 'pending' | 'running' | 'complete' | 'failed';
  }

  function handleSave() {
    const tags = saveTags.split(',').map(t => t.trim()).filter(Boolean);
    onSavePlaybook(saveName.trim(), saveDesc.trim(), steps, tags);
    setShowSaveModal(false);
    setSaveName('');
    setSaveDesc('');
    setSaveTags('');
  }

  const completedCount = chain
    ? Object.values(chain.stepCommands).filter(c => c.status === 'complete').length
    : 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-sx-faint tracking-widest uppercase">Chain Builder</span>
          <span className="text-xs text-sx-faint border border-sx-border px-2 py-0.5 font-mono">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </span>
          {isRunning && chain && (
            <span className="text-xs text-sx-glow border border-sx-primary px-2 py-0.5 font-mono animate-pulse">
              Step {Math.min(chain.currentStepIndex + 1, steps.length)}/{steps.length}
            </span>
          )}
          {chain?.status === 'complete' && (
            <span className="text-xs text-sx-success border border-sx-success/50 px-2 py-0.5 font-mono">
              Complete — {completedCount}/{steps.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isRunning && steps.some(s => s.command.trim()) && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 text-xs text-sx-faint hover:text-sx-muted border border-sx-border hover:border-sx-hover px-3 py-1.5 transition-all"
            >
              <Save size={11} />
              <span>Save Playbook</span>
            </button>
          )}
          {isRunning ? (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-xs text-sx-error border border-sx-error/50 hover:border-sx-error px-3 py-1.5 transition-all"
            >
              <X size={11} />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              onClick={() => onRun(steps)}
              disabled={!canRun}
              className="flex items-center gap-1.5 text-xs bg-sx-primary hover:opacity-90 disabled:bg-sx-elevated disabled:text-sx-faint text-white px-3 py-1.5 transition-all"
            >
              <Play size={11} />
              <span>Run Chain</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto theme-scrollbar space-y-0 min-h-0">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <StepCard
              step={step}
              index={i}
              total={steps.length}
              personas={personas}
              executionStatus={getStepExecutionStatus(step)}
              isRunning={isRunning}
              onChange={updated => updateStep(i, updated)}
              onRemove={() => removeStep(i)}
              onMoveUp={() => moveStep(i, i - 1)}
              onMoveDown={() => moveStep(i, i + 1)}
            />
            {i < steps.length - 1 && (
              <div className="flex items-center justify-center py-1">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-px h-3 bg-sx-border" />
                  <ArrowDown size={12} className={`${
                    steps[i + 1].passContext ? 'text-sx-glow' : 'text-sx-border'
                  }`} />
                  <div className="w-px h-3 bg-sx-border" />
                </div>
                {steps[i + 1].passContext && (
                  <span className="ml-2 text-xs text-sx-glow/70 font-mono">context flows</span>
                )}
              </div>
            )}
          </React.Fragment>
        ))}

        {!isRunning && (
          <button
            onClick={addStep}
            className="w-full mt-3 flex items-center justify-center gap-2 border border-dashed border-sx-border hover:border-sx-primary text-sx-faint hover:text-sx-glow py-3 text-xs transition-all"
          >
            <Plus size={13} />
            <span>Add Step</span>
          </button>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-sx-surface border border-sx-border w-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-sx-text">Save as Playbook</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-sx-faint hover:text-sx-muted transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-sx-faint uppercase tracking-wider block mb-1.5">Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="Threat Response Protocol"
                  className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-sm px-3 py-2 outline-none transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-sx-faint uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={saveDesc}
                  onChange={e => setSaveDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief description of what this playbook does..."
                  className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-sm resize-none outline-none transition-colors px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs text-sx-faint uppercase tracking-wider block mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={e => setSaveTags(e.target.value)}
                  placeholder="security, threat-response, intel"
                  className="w-full bg-sx-root border border-sx-border focus:border-sx-primary text-sx-text placeholder-sx-faint text-sm px-3 py-2 outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-xs text-sx-faint border border-sx-border px-4 py-2 hover:border-sx-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="text-xs bg-sx-primary hover:opacity-90 disabled:bg-sx-elevated disabled:text-sx-faint text-white px-4 py-2 transition-all"
              >
                Save Playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
