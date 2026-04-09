import { AgentEvent, AgentEventType, TalonCommand, ExecutionMode } from '../types/talon';
import { Persona } from '../types';

interface SimStep {
  agentId: string;
  type: AgentEventType;
  content: string;
  tool?: string;
  toolInput?: string;
  toolOutput?: string;
  targetAgentId?: string;
  targetAgentName?: string;
  delay: number;
}

const ROLE_TOOLS: Record<string, string[]> = {
  'Strategic Operations Lead': ['mission_planner', 'resource_allocator', 'risk_assessor'],
  'Technical Systems Architect': ['code_exec', 'graph_query', 'system_probe', 'dependency_scan'],
  'Intelligence Analyst': ['memory_query', 'threat_intel', 'pattern_match', 'data_fusion'],
  'Communications Specialist': ['channel_monitor', 'sentiment_analysis', 'broadcast', 'log_query'],
  'Operations Coordinator': ['task_scheduler', 'workflow_engine', 'status_aggregator'],
  'Cybersecurity Expert': ['vuln_scan', 'cipher_audit', 'intrusion_detect', 'threat_hunt'],
};

function pickTool(persona: Persona): string {
  const tools = ROLE_TOOLS[persona.role] || ['generic_query'];
  return tools[Math.floor(Math.random() * tools.length)];
}

function buildThought(persona: Persona, command: string, index: number): string {
  const thoughts: Record<string, string[]> = {
    'Strategic Operations Lead': [
      `Evaluating mission parameters for: "${command.slice(0, 40)}..."`,
      'Assessing resource availability and risk vectors across active operations.',
      'Synthesizing multi-source intelligence into a coherent operational picture.',
      'Identifying critical path dependencies and potential escalation points.',
    ],
    'Technical Systems Architect': [
      `Parsing technical requirements from command: "${command.slice(0, 35)}..."`,
      'Mapping system topology and identifying component interaction points.',
      'Evaluating architectural constraints and optimization opportunities.',
      'Cross-referencing dependency graph for latent coupling risks.',
    ],
    'Intelligence Analyst': [
      `Correlating input against known intelligence patterns...`,
      'Running pattern-match across historical event database.',
      'Confidence threshold set to 0.87. Cross-validating anomalies.',
      'Fusing multi-domain signals for comprehensive threat picture.',
    ],
    'Communications Specialist': [
      `Scanning active channels for relevant communication threads...`,
      'Analyzing message sentiment and priority routing queues.',
      'Filtering noise from signal across monitored endpoints.',
      'Preparing structured report for stakeholder dissemination.',
    ],
    'Operations Coordinator': [
      `Queuing task distribution for: "${command.slice(0, 35)}..."`,
      'Checking workflow engine for conflicting scheduled operations.',
      'Allocating parallel execution slots across available agents.',
      'Aggregating status signals from active task nodes.',
    ],
    'Cybersecurity Expert': [
      `Initiating threat surface evaluation for given context...`,
      'Scanning for known vulnerability signatures and zero-day indicators.',
      'Running cipher audit against active communication endpoints.',
      'Correlating anomaly signals with MITRE ATT&CK framework.',
    ],
  };
  const pool = thoughts[persona.role] || [`Processing directive: "${command.slice(0, 40)}..."`];
  return pool[index % pool.length];
}

function buildToolOutput(tool: string): string {
  const outputs: Record<string, string> = {
    mission_planner: 'Plan generated: 4 phases, 12 checkpoints, risk level MEDIUM',
    resource_allocator: 'Resources allocated: 3 agents, 2 data streams, priority HIGH',
    risk_assessor: 'Risk score: 0.34 (Low-Medium). Mitigation paths: 3 identified',
    code_exec: 'Execution complete. Exit 0. Output: 847 lines processed, 2 anomalies flagged',
    graph_query: 'Graph traversal complete. 23 nodes, 41 edges. Clusters: 4 detected',
    system_probe: 'Probe results: 6/8 endpoints healthy, 2 degraded, 0 critical',
    dependency_scan: 'Dependency tree: 128 packages, 3 outdated, 1 known CVE (low severity)',
    memory_query: 'Memory recall: 7 matching contexts, confidence 0.91, last access 3h ago',
    threat_intel: '3 threat actors matched. IOC overlap: 68%. TLP:AMBER advisory issued',
    pattern_match: 'Patterns matched: 5/12 signatures. Anomaly score: 0.72',
    data_fusion: 'Fusion complete: 4 data sources merged. Conflict resolution: 2 entries reconciled',
    channel_monitor: 'Active channels: 14. Flagged threads: 2. Average latency: 38ms',
    sentiment_analysis: 'Sentiment: Neutral (0.51). Urgency markers: 3. Escalation risk: Low',
    broadcast: 'Broadcast queued to 6 recipients. Delivery confirmation: pending',
    log_query: 'Log query returned 1,248 entries. Filtered to 47 relevant events',
    task_scheduler: 'Scheduled 4 tasks. Next execution: T+00:02:30. Queue depth: 7',
    workflow_engine: 'Workflow compiled: 6 steps, 2 parallel branches, estimated 4m 20s',
    status_aggregator: 'Status aggregated from 8 nodes. 6 nominal, 1 warning, 1 stale',
    vuln_scan: 'Scan complete: 0 critical, 2 high, 5 medium vulnerabilities detected',
    cipher_audit: 'TLS audit: 4 endpoints on TLS 1.2 (recommend upgrade), 6 on TLS 1.3',
    intrusion_detect: 'IDS check: No active intrusions. 3 suspicious patterns logged',
    threat_hunt: 'Hunt complete: 0 confirmed threats. 2 items flagged for review (low confidence)',
    generic_query: 'Query returned 15 results. Relevance score: 0.84',
  };
  return outputs[tool] || 'Operation complete. Results nominal.';
}

function buildResult(command: string, personas: Persona[]): string {
  const agentNames = personas.map(p => p.name.split(' ')[0]).join(', ');
  return `TALON synthesis complete. Collaborative analysis by ${agentNames} has been finalized.

Based on multi-agent evaluation of "${command.slice(0, 60)}${command.length > 60 ? '...' : ''}":

— Primary assessment consolidated from ${personas.length} agent perspectives
— ${Math.floor(Math.random() * 8) + 3} action items identified and prioritized
— Confidence index: ${(0.82 + Math.random() * 0.15).toFixed(2)}
— Recommended escalation path: ${personas[0]?.name || 'Lead Agent'} → Operations
— Next review checkpoint: T+${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 50) + 10}m

All findings have been logged to the mission record and distributed to relevant stakeholders.`;
}

function selectAgents(personas: Persona[], mode: ExecutionMode, targetIds: string[]): Persona[] {
  if (targetIds.length > 0) {
    return personas.filter(p => targetIds.includes(p.id)).slice(0, 3);
  }
  if (mode === 'parallel') return personas.slice(0, 3);
  return [personas[Math.floor(Math.random() * personas.length)], personas[(Math.floor(Math.random() * personas.length) + 1) % personas.length]].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, 2);
}

export function generateSimulation(
  command: TalonCommand,
  personas: Persona[],
  onEvent: (event: AgentEvent) => void,
  onComplete: (result: string) => void
): () => void {
  const selectedPersonas = selectAgents(personas, command.mode, command.targetAgents);
  const steps: SimStep[] = [];
  let cursor = 400;

  steps.push({
    agentId: 'talon',
    type: 'system',
    content: `Routing directive to ${selectedPersonas.map(p => p.name).join(', ')}. Mode: ${command.mode.toUpperCase()}.`,
    delay: cursor,
  });
  cursor += 600;

  selectedPersonas.forEach((persona, pi) => {
    const baseDelay = command.mode === 'parallel' ? 0 : pi * 2800;

    steps.push({
      agentId: persona.id,
      type: 'thought',
      content: buildThought(persona, command.input, 0),
      delay: cursor + baseDelay,
    });
    cursor += 700;

    const tool1 = pickTool(persona);
    const toolInput1 = `context="${command.input.slice(0, 30)}" depth=2`;
    steps.push({
      agentId: persona.id,
      type: 'tool_call',
      content: `Invoking ${tool1}`,
      tool: tool1,
      toolInput: toolInput1,
      delay: cursor + baseDelay,
    });
    cursor += 900;

    steps.push({
      agentId: persona.id,
      type: 'tool_result',
      content: buildToolOutput(tool1),
      tool: tool1,
      toolOutput: buildToolOutput(tool1),
      delay: cursor + baseDelay,
    });
    cursor += 600;

    steps.push({
      agentId: persona.id,
      type: 'thought',
      content: buildThought(persona, command.input, 1),
      delay: cursor + baseDelay,
    });
    cursor += 700;

    if (pi < selectedPersonas.length - 1) {
      const target = selectedPersonas[(pi + 1) % selectedPersonas.length];
      steps.push({
        agentId: persona.id,
        type: 'delegation',
        content: `Delegating sub-analysis to ${target.name} for domain expertise.`,
        targetAgentId: target.id,
        targetAgentName: target.name,
        delay: cursor + baseDelay,
      });
      cursor += 500;
    }

    const tool2 = pickTool(persona);
    steps.push({
      agentId: persona.id,
      type: 'action',
      content: `Executing secondary evaluation pass with ${tool2}.`,
      tool: tool2,
      delay: cursor + baseDelay,
    });
    cursor += 1000;

    steps.push({
      agentId: persona.id,
      type: 'thought',
      content: buildThought(persona, command.input, 2),
      delay: cursor + baseDelay,
    });
    cursor += 600;
  });

  steps.push({
    agentId: 'talon',
    type: 'synthesis',
    content: `Consolidating outputs from ${selectedPersonas.length} agents. Running cross-validation pass...`,
    delay: cursor + 400,
  });
  cursor += 1200;

  steps.push({
    agentId: 'talon',
    type: 'synthesis',
    content: 'Synthesis complete. Generating final assessment report.',
    delay: cursor,
  });

  const timeouts: ReturnType<typeof setTimeout>[] = [];

  steps.forEach((step) => {
    const t = setTimeout(() => {
      const event: AgentEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        agentId: step.agentId,
        agentName: step.agentId === 'talon' ? 'TALON' : (personas.find(p => p.id === step.agentId)?.name || step.agentId),
        type: step.type,
        content: step.content,
        timestamp: new Date().toISOString(),
        tool: step.tool,
        toolInput: step.toolInput,
        toolOutput: step.toolOutput,
        targetAgentId: step.targetAgentId,
        targetAgentName: step.targetAgentName,
      };
      onEvent(event);
    }, step.delay);
    timeouts.push(t);
  });

  const resultDelay = cursor + 800;
  const resultTimeout = setTimeout(() => {
    onComplete(buildResult(command.input, selectedPersonas));
  }, resultDelay);
  timeouts.push(resultTimeout);

  return () => timeouts.forEach(clearTimeout);
}
