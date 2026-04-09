import { useState, useCallback, useRef } from 'react';
import { ChainStep, ChainExecution, ChainStatus, TalonCommand, AgentEvent, AgentStatus } from '../types/talon';
import { Persona } from '../types';
import { generateSimulation } from '../data/talonSimulator';

interface UseChainExecutionReturn {
  chain: ChainExecution | null;
  agentEvents: Record<string, AgentEvent[]>;
  isRunning: boolean;
  runChain: (steps: ChainStep[]) => void;
  cancelChain: () => void;
  resetChain: () => void;
}

function injectContext(command: string, previousResult: string): string {
  if (command.includes('{{context}}')) {
    return command.replace('{{context}}', previousResult.slice(0, 300));
  }
  return `${command}\n\nContext from previous step:\n${previousResult.slice(0, 300)}`;
}

export function useChainExecution(
  personas: Persona[],
  onAgentStatusChange: (agentId: string, status: AgentStatus, task?: string) => void
): UseChainExecutionReturn {
  const [chain, setChain] = useState<ChainExecution | null>(null);
  const [agentEvents, setAgentEvents] = useState<Record<string, AgentEvent[]>>({});
  const [isRunning, setIsRunning] = useState(false);

  const cancelCurrentStepRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  const resetChain = useCallback(() => {
    cancelCurrentStepRef.current?.();
    cancelledRef.current = false;
    setChain(null);
    setAgentEvents({});
    setIsRunning(false);
  }, []);

  const cancelChain = useCallback(() => {
    cancelledRef.current = true;
    cancelCurrentStepRef.current?.();
    setIsRunning(false);
    setChain(prev =>
      prev ? { ...prev, status: 'failed' as ChainStatus } : prev
    );
  }, []);

  const runChain = useCallback(
    (steps: ChainStep[]) => {
      if (isRunning || steps.length === 0) return;

      cancelledRef.current = false;
      const executionId = `chain-${Date.now()}`;

      const initialChain: ChainExecution = {
        id: executionId,
        steps,
        status: 'running',
        currentStepIndex: 0,
        stepCommands: {},
        startedAt: new Date().toISOString(),
      };

      setChain(initialChain);
      setAgentEvents({});
      setIsRunning(true);

      let stepResults: Record<string, string> = {};

      function runStep(stepIndex: number) {
        if (cancelledRef.current) return;
        if (stepIndex >= steps.length) {
          setChain(prev => prev ? { ...prev, status: 'complete', currentStepIndex: stepIndex } : prev);
          setIsRunning(false);
          return;
        }

        const step = steps[stepIndex];
        const commandId = `${executionId}-step-${stepIndex}`;

        const previousResult = stepIndex > 0
          ? stepResults[steps[stepIndex - 1].id] ?? ''
          : '';

        const effectiveInput =
          stepIndex > 0 && step.passContext && previousResult
            ? injectContext(step.command, previousResult)
            : step.command;

        const command: TalonCommand = {
          id: commandId,
          input: effectiveInput,
          mode: step.mode,
          targetAgents: step.targetAgents,
          status: 'running',
          timestamp: new Date().toISOString(),
          events: [],
        };

        setChain(prev =>
          prev
            ? {
                ...prev,
                currentStepIndex: stepIndex,
                stepCommands: { ...prev.stepCommands, [step.id]: command },
              }
            : prev
        );

        const onEvent = (event: AgentEvent) => {
          if (cancelledRef.current) return;

          setChain(prev => {
            if (!prev) return prev;
            const existing = prev.stepCommands[step.id];
            if (!existing) return prev;
            return {
              ...prev,
              stepCommands: {
                ...prev.stepCommands,
                [step.id]: { ...existing, events: [...existing.events, event] },
              },
            };
          });

          setAgentEvents(prev => ({
            ...prev,
            [commandId]: [...(prev[commandId] ?? []), event],
          }));

          if (event.agentId !== 'talon') {
            const statusMap: Record<string, AgentStatus> = {
              thought: 'thinking',
              action: 'acting',
              tool_call: 'acting',
              tool_result: 'acting',
              delegation: 'delegating',
            };
            onAgentStatusChange(
              event.agentId,
              statusMap[event.type] ?? 'thinking',
              event.content.slice(0, 50)
            );
          }
        };

        const onComplete = (result: string) => {
          if (cancelledRef.current) return;

          stepResults[step.id] = result;

          setChain(prev => {
            if (!prev) return prev;
            const existing = prev.stepCommands[step.id];
            return {
              ...prev,
              stepCommands: existing
                ? {
                    ...prev.stepCommands,
                    [step.id]: { ...existing, status: 'complete', result },
                  }
                : prev.stepCommands,
            };
          });

          onAgentStatusChange('all' as any, 'idle');

          setTimeout(() => runStep(stepIndex + 1), 600);
        };

        cancelCurrentStepRef.current = generateSimulation(command, personas, onEvent, onComplete);
      }

      runStep(0);
    },
    [isRunning, personas, onAgentStatusChange]
  );

  return { chain, agentEvents, isRunning, runChain, cancelChain, resetChain };
}
