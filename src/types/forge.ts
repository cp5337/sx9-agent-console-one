export interface ForgeAgent {
  role: 'orchestrator' | 'architect' | 'builder' | 'validator' | string;
  presence: string;
  status?: 'online' | 'offline' | 'idle' | 'active' | 'stalled';
  lastSeen?: string;
  heartbeat?: number;
}

export interface ForgeNatsSubjects {
  telemetry: string;
  presence: string;
  factory_request: string;
  factory_response: string;
}

export interface ForgeJetstreamStream {
  name: string;
  subjects: string[];
  max_age_hours: number;
}

export interface ForgeNats {
  local: string;
  ws_local: string;
  subjects: ForgeNatsSubjects;
  jetstream_streams: ForgeJetstreamStream[];
}

export interface ForgeVertical {
  pillar: string;
  port: number;
  health?: 'healthy' | 'degraded' | 'unreachable' | 'unknown';
  latencyMs?: number;
}

export interface ForgePlugin {
  agents: Record<string, ForgeAgent>;
  nats: ForgeNats;
  verticals: Record<string, ForgeVertical>;
}

export interface ForgeLinearTask {
  task_id: string;
  status: 'completed' | 'in_progress' | 'blocked' | 'cancelled' | 'pending';
  timestamp?: string;
  notes?: string;
}

export interface ForgeState {
  session_id: string;
  current_task: string;
  current_task_title: string;
  last_event: string;
  git_branch: string;
  stall_count: number;
  retry_count: number;
  linear_backtrace: ForgeLinearTask[];
  blocked_tasks: string[];
  cancelled_tasks: string[];
}

export interface ForgeRegistryPlugin {
  id: string;
  name?: string;
  description?: string;
  version?: string;
  depends_on?: string[];
  canonical_path?: string;
  nats_subjects?: string[];
  status?: 'active' | 'inactive' | 'error' | 'unknown';
}

export type ForgeRegistry = ForgeRegistryPlugin[];

export interface ForgeLogLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';
  source: string;
  message: string;
  raw: string;
}

export interface ForgeSSEEvent {
  type: 'state' | 'plugin' | 'registry' | 'log' | 'nats' | 'connected' | 'error';
  file?: string;
  data: unknown;
  timestamp: string;
}

export interface NatsMessage {
  subject: string;
  data: unknown;
  timestamp: string;
  sequence?: number;
}

export interface ForgeContext {
  plugin: ForgePlugin | null;
  state: ForgeState | null;
  registry: ForgeRegistry;
  connected: boolean;
  serverAvailable: boolean;
  natsConnected: boolean;
  forgePath: string | null;
  lastUpdated: string | null;
}
