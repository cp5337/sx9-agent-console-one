export interface ForgeAgent {
  role: 'orchestrator' | 'architect' | 'builder' | 'validator' | string;
  presence: string;
  surface?: string;
  status?: 'online' | 'offline' | 'idle' | 'active' | 'stalled';
  lastSeen?: string;
  heartbeat?: number;
}

export interface ForgeNatsSubjects {
  telemetry?: string;
  presence?: string;
  factory_request?: string;
  factory_response?: string;
  smarttech_health?: string;
  smarttech_sme?: string;
  training_xapi?: string;
  raptor_egg?: string;
  raptor_net?: string;
  raptor_vision?: string;
  [key: string]: string | undefined;
}

export interface ForgeJetstreamStream {
  name: string;
  subjects: string[];
  max_age_hours: number;
}

export interface ForgeNats {
  local?: string;
  primary?: string;
  deployment?: string;
  ws_local?: string;
  ws?: string;
  subjects: ForgeNatsSubjects;
  jetstream_streams?: ForgeJetstreamStream[];
}

export interface ForgeVertical {
  pillar?: string;
  port: number;
  subdomain?: string;
  azure_service?: string;
  health?: 'healthy' | 'degraded' | 'unreachable' | 'unknown';
  latencyMs?: number;
}

export interface ForgePlugin {
  name?: string;
  version?: string;
  description?: string;
  cloud?: 'azure' | 'gcp' | 'aws' | 'local';
  tenant?: string;
  agents: Record<string, ForgeAgent>;
  nats: ForgeNats;
  verticals: Record<string, ForgeVertical>;
  domains?: Record<string, string>;
  azure_services?: AzureServices;
  raptor_vision?: RaptorVision;
  safety_act?: SafetyAct;
  dev_surfaces?: Record<string, DevSurface>;
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

export interface AzureServiceDef {
  purpose: string;
  plan?: string;
  runtime?: string;
  api?: string;
  models?: string[];
  features?: string[];
  ports?: string;
  replaces?: string;
  tenant?: string;
  app_registrations?: Record<string, string>;
  role_mapping?: Record<string, string>;
  retention?: string;
  note?: string;
}

export interface AzureServiceCategory {
  [service: string]: AzureServiceDef;
}

export interface AzureServices {
  compute?: AzureServiceCategory;
  data?: AzureServiceCategory;
  ai?: AzureServiceCategory;
  comms?: AzureServiceCategory;
  identity?: AzureServiceCategory;
  delivery?: AzureServiceCategory;
  monitoring?: AzureServiceCategory;
  [category: string]: AzureServiceCategory | undefined;
}

export interface RaptorPhase {
  description: string;
  nats_subject: string;
  azure_service: string;
}

export interface RaptorThinClient {
  device: string;
  deployment: string;
  fallback: string;
  network: string;
}

export interface RaptorVision {
  phases: {
    egg?: RaptorPhase;
    net?: RaptorPhase;
    vision?: RaptorPhase;
    [phase: string]: RaptorPhase | undefined;
  };
  thin_client?: RaptorThinClient;
}

export interface SafetyAct {
  constraint: string;
  audit_trail?: string;
  identity?: string;
  encryption?: string;
  no_additional_subscriptions?: boolean;
}

export interface DevSurface {
  role: string;
  repos?: string[];
}
