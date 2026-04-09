import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Network, Shield, Terminal, Link2, BookOpen } from 'lucide-react';
import { TalonCommand, AgentEvent, AgentNode, ExecutionMode, AgentStatus, ChainStep } from '../../types/talon';
import { Persona } from '../../types';
import { generateSimulation } from '../../data/talonSimulator';
import { CommandConsole } from './CommandConsole';
import { AgentRoster } from './AgentRoster';
import { ExecutionStream } from './ExecutionStream';
import { ResultsPanel } from './ResultsPanel';
import { ChainBuilder } from './ChainBuilder';
import { PlaybookLibrary } from './PlaybookLibrary';
import { useChainExecution } from '../../hooks/useChainExecution';

type TalonTab = 'command' | 'chain' | 'playbooks';

interface TalonPanelProps {
  personas: Persona[];
}

function buildInitialNodes(personas: Persona[]): AgentNode[] {
  return personas.map(p => ({
    agentId:    p.id,
    agentName:  p.name,
    agentRole:  p.role,
    agentAvatar: p.avatar,
    status:     'idle' as AgentStatus,
    tokenUsage: 0,
    actionsCount: 0,
    connections: [],
  }));
}

export function TalonPanel({ personas }: TalonPanelProps) {
  const [activeTab, setActiveTab] = useState<TalonTab>('command');

  const [commands, setCommands] = useState<TalonCommand[]>([]);
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);
  const [agentNodes, setAgentNodes] = useState<AgentNode[]>(() => buildInitialNodes(personas));
  const [mode, setMode] = useState<ExecutionMode>('auto');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const [chainSteps, setChainSteps] = useState<ChainStep[]>([{
    id: `step-init-${Date.now()}`,
    label: '',
    command: '',
    mode: 'auto',
    targetAgents: [],
    passContext: false,
  }]);
  const [pendingSave, setPendingSave] = useState<{
    name: string; description: string; steps: ChainStep[]; tags: string[];
  } | null>(null);

  const activeCommand = commands.find(c => c.id === activeCommandId);
  const streamEvents = activeCommand?.events ?? [];

  const updateNodeStatus = useCallback((agentId: string, status: AgentStatus, task?: string) => {
    if (agentId === 'all' as any) {
      setAgentNodes(prev => prev.map(n => ({ ...n, status: 'idle' as AgentStatus, currentTask: undefined })));
      return;
    }
    setAgentNodes(prev =>
      prev.map(n =>
        n.agentId === agentId
          ? {
              ...n,
              status,
              currentTask: task ?? (status === 'idle' ? undefined : n.currentTask),
              tokenUsage: status !== 'idle' ? n.tokenUsage + Math.floor(Math.random() * 120 + 40) : n.tokenUsage,
              actionsCount: status === 'acting' || status === 'delegating' ? n.actionsCount + 1 : n.actionsCount,
            }
          : n
      )
    );
  }, []);

  const { chain, isRunning: chainIsRunning, runChain, cancelChain } = useChainExecution(
    personas,
    updateNodeStatus
  );

  const isAnyRunning = isRunning || chainIsRunning;

  const handleAgentToggle = useCallback((agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  }, []);

  const handleExecute = useCallback(
    (input: string) => {
      if (isRunning) return;
      cancelRef.current?.();

      const commandId = `cmd-${Date.now()}`;
      const newCommand: TalonCommand = {
        id: commandId,
        input,
        mode,
        targetAgents: selectedAgents,
        status: 'running',
        timestamp: new Date().toISOString(),
        events: [],
      };

      setCommands(prev => [...prev, newCommand]);
      setActiveCommandId(commandId);
      setIsRunning(true);
      setAgentNodes(prev => prev.map(n => ({ ...n, status: 'idle' as AgentStatus })));

      const onEvent = (event: AgentEvent) => {
        setCommands(prev =>
          prev.map(c => c.id === commandId ? { ...c, events: [...c.events, event] } : c)
        );
        if (event.agentId !== 'talon') {
          const statusMap: Record<string, AgentStatus> = {
            thought:     'thinking',
            action:      'acting',
            tool_call:   'acting',
            tool_result: 'acting',
            delegation:  'delegating',
          };
          updateNodeStatus(event.agentId, statusMap[event.type] ?? 'thinking', event.content.slice(0, 50));
        }
      };

      const onComplete = (result: string) => {
        setCommands(prev =>
          prev.map(c => c.id === commandId ? { ...c, status: 'complete', result } : c)
        );
        setIsRunning(false);
        setAgentNodes(prev => prev.map(n => ({ ...n, status: 'idle' as AgentStatus, currentTask: undefined })));
      };

      cancelRef.current = generateSimulation(newCommand, personas, onEvent, onComplete);
    },
    [isRunning, mode, selectedAgents, personas, updateNodeStatus]
  );

  const handleRunChain = useCallback((steps: ChainStep[]) => {
    runChain(steps);
  }, [runChain]);

  const handleLoadAndRun = useCallback((steps: ChainStep[]) => {
    setChainSteps(steps);
    setActiveTab('chain');
    setTimeout(() => runChain(steps), 100);
  }, [runChain]);

  const handleLoadToBuilder = useCallback((steps: ChainStep[]) => {
    setChainSteps(steps);
    setActiveTab('chain');
  }, []);

  const handleSavePlaybook = useCallback(
    (name: string, description: string, steps: ChainStep[], tags: string[]) => {
      setPendingSave({ name, description, steps, tags });
      setActiveTab('playbooks');
    },
    []
  );

  const chainStreamEvents: AgentEvent[] = (() => {
    if (!chain || !chainSteps[chain.currentStepIndex]) return [];
    const step = chainSteps[chain.currentStepIndex];
    return chain.stepCommands[step.id]?.events ?? [];
  })();

  useEffect(() => {
    return () => { cancelRef.current?.(); };
  }, []);

  const TABS: { id: TalonTab; label: string; icon: React.ElementType }[] = [
    { id: 'command', label: 'Command', icon: Terminal },
    { id: 'chain',   label: 'Chain',   icon: Link2 },
    { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
  ];

  const commandCount = commands.length + (chain ? Object.keys(chain.stepCommands).length : 0);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-sx-elevated border border-sx-border flex items-center justify-center">
              <Network className="w-4 h-4 text-sx-glow" />
            </div>
            <div>
              <p className="text-sm font-medium text-sx-text leading-none">TALON</p>
              <p className="text-xs text-sx-faint leading-none mt-0.5">Agentic communication panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4 text-xs">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 border ${
              isAnyRunning
                ? 'bg-sx-primary/10 border-sx-primary text-sx-glow'
                : 'bg-sx-elevated border-sx-border text-sx-faint'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isAnyRunning ? 'bg-sx-glow animate-pulse' : 'bg-sx-faint'}`} />
              <span>{isAnyRunning ? 'Executing' : 'Ready'}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 border bg-sx-elevated border-sx-border text-sx-faint">
              <Shield size={10} className="text-sx-success" />
              <span>Network secure</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-sx-primary text-sx-glow'
                    : 'border-transparent text-sx-faint hover:text-sx-muted'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'command' && (
        <>
          <div className="flex-shrink-0">
            <CommandConsole
              personas={personas}
              isRunning={isRunning}
              mode={mode}
              selectedAgents={selectedAgents}
              onModeChange={setMode}
              onAgentToggle={handleAgentToggle}
              onExecute={handleExecute}
            />
          </div>
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
            <div className="col-span-3">
              <AgentRoster nodes={agentNodes} commandCount={commandCount} />
            </div>
            <div className="col-span-5">
              <ExecutionStream events={streamEvents} isRunning={isRunning} />
            </div>
            <div className="col-span-4">
              <ResultsPanel commands={commands} activeCommandId={activeCommandId} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'chain' && (
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          <div className="col-span-8 overflow-hidden flex flex-col">
            <ChainBuilder
              personas={personas}
              chain={chain}
              isRunning={chainIsRunning}
              steps={chainSteps}
              onStepsChange={setChainSteps}
              onRun={handleRunChain}
              onCancel={cancelChain}
              onSavePlaybook={handleSavePlaybook}
            />
          </div>
          <div className="col-span-4 flex flex-col gap-4 min-h-0">
            <div className="flex-shrink-0" style={{ height: '45%' }}>
              <AgentRoster nodes={agentNodes} commandCount={commandCount} />
            </div>
            <div className="flex-1 min-h-0">
              <ExecutionStream
                events={chainStreamEvents}
                isRunning={chainIsRunning}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'playbooks' && (
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          <div className="col-span-8 overflow-hidden flex flex-col">
            <PlaybookLibrary
              onLoad={handleLoadToBuilder}
              onRun={handleLoadAndRun}
              pendingSave={pendingSave}
              onPendingSaveClear={() => setPendingSave(null)}
            />
          </div>
          <div className="col-span-4 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <AgentRoster nodes={agentNodes} commandCount={commandCount} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
