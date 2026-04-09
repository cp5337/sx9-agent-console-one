import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Circle, ExternalLink } from 'lucide-react';
import { useForge } from '../../providers/ForgeProvider';
import type { ForgeLinearTask } from '../../types/forge';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  completed:   { icon: CheckCircle, color: 'text-sx-ok',      label: 'Done' },
  in_progress: { icon: Clock,       color: 'text-sx-glow',    label: 'Active' },
  blocked:     { icon: AlertCircle, color: 'text-sx-warning', label: 'Blocked' },
  cancelled:   { icon: XCircle,     color: 'text-sx-faint',   label: 'Cancelled' },
  pending:     { icon: Circle,      color: 'text-sx-muted',   label: 'Pending' },
};

function TaskRow({ task, isCurrent }: { task: ForgeLinearTask; isCurrent: boolean }) {
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start space-x-3 p-2.5 border ${
      isCurrent ? 'border-sx-primary bg-sx-elevated' : 'border-transparent hover:bg-sx-elevated'
    } transition-colors`}>
      <Icon size={14} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-mono text-xs ${isCurrent ? 'text-sx-glow' : 'text-sx-text'}`}>
            {task.task_id}
          </span>
          {isCurrent && (
            <span className="text-xs text-sx-primary bg-sx-elevated border border-sx-primary px-1">CURRENT</span>
          )}
          <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
        </div>
        {task.notes && (
          <p className="text-sx-muted text-xs mt-0.5 truncate">{task.notes}</p>
        )}
        {task.timestamp && (
          <p className="text-sx-faint text-xs mt-0.5">
            {new Date(task.timestamp).toLocaleString()}
          </p>
        )}
      </div>
      <a
        href={`https://linear.app/issue/${task.task_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sx-faint hover:text-sx-glow transition-colors flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink size={11} />
      </a>
    </div>
  );
}

export function TaskTimeline() {
  const { state } = useForge();

  if (!state) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-sx-elevated border border-sx-border animate-pulse" />
        ))}
      </div>
    );
  }

  const blockedTasks: ForgeLinearTask[] = state.blocked_tasks.map(id => ({
    task_id: id,
    status: 'blocked',
  }));

  const cancelledTasks: ForgeLinearTask[] = state.cancelled_tasks.map(id => ({
    task_id: id,
    status: 'cancelled',
  }));

  const allTasks = [...state.linear_backtrace, ...blockedTasks, ...cancelledTasks];

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-xs text-sx-faint">
          <span><span className="text-sx-ok">{state.linear_backtrace.filter(t => t.status === 'completed').length}</span> done</span>
          <span><span className="text-sx-warning">{state.blocked_tasks.length}</span> blocked</span>
          <span><span className="text-sx-faint">{state.cancelled_tasks.length}</span> cancelled</span>
        </div>
        {state.stall_count > 0 && (
          <span className="text-xs text-sx-warning font-mono">stalls: {state.stall_count}</span>
        )}
      </div>
      <div className="space-y-0.5 max-h-80 overflow-y-auto theme-scrollbar">
        {allTasks.map(task => (
          <TaskRow
            key={task.task_id}
            task={task}
            isCurrent={task.task_id === state.current_task}
          />
        ))}
        {allTasks.length === 0 && (
          <p className="text-sx-faint text-xs p-3">No task history</p>
        )}
      </div>
    </div>
  );
}
