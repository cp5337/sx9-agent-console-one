export type AgentEventType =
  | 'thought'
  | 'action'
  | 'tool_call'
  | 'tool_result'
  | 'delegation'
  | 'synthesis'
  | 'error'
  | 'system';

export type ExecutionMode = 'auto' | 'sequential' | 'parallel';

export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'delegating' | 'complete' | 'error';

export interface AgentEvent {
  id: string;
  agentId: string;
  agentName: string;
  type: AgentEventType;
  content: string;
  timestamp: string;
  tool?: string;
  toolInput?: string;
  toolOutput?: string;
  targetAgentId?: string;
  targetAgentName?: string;
  confidence?: number;
}

export interface TalonCommand {
  id: string;
  input: string;
  mode: ExecutionMode;
  targetAgents: string[];
  status: 'pending' | 'running' | 'complete' | 'failed';
  timestamp: string;
  events: AgentEvent[];
  result?: string;
  duration?: number;
}

export interface AgentNode {
  agentId: string;
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  status: AgentStatus;
  currentTask?: string;
  tokenUsage: number;
  actionsCount: number;
  connections: string[];
}

export interface ChainStep {
  id: string;
  label: string;
  command: string;
  mode: ExecutionMode;
  targetAgents: string[];
  passContext: boolean;
}

export type ChainStatus = 'idle' | 'running' | 'complete' | 'failed';

export interface ChainExecution {
  id: string;
  steps: ChainStep[];
  status: ChainStatus;
  currentStepIndex: number;
  stepCommands: Record<string, TalonCommand>;
  startedAt: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  steps: ChainStep[];
  tags: string[];
  run_count: number;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}
