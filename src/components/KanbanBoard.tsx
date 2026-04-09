import React from 'react';
import { Task } from '../types';
import { Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const COLUMNS: { id: string; title: string; status: Task['status'] }[] = [
  { id: 'todo',        title: 'To Do',       status: 'todo' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
  { id: 'review',      title: 'Review',      status: 'review' },
  { id: 'done',        title: 'Done',        status: 'done' },
];

const PRIORITY_STYLE: Record<Task['priority'], string> = {
  critical: 'border-l-[3px] border-l-sx-error bg-sx-error/5',
  high:     'border-l-[3px] border-l-orange-500 bg-orange-500/5',
  medium:   'border-l-[3px] border-l-sx-warning bg-sx-warning/5',
  low:      'border-l-[3px] border-l-sx-success bg-sx-success/5',
};

const PRIORITY_ICON: Record<Task['priority'], React.ReactNode> = {
  critical: <AlertTriangle size={12} className="text-sx-error" />,
  high:     <AlertTriangle size={12} className="text-orange-500" />,
  medium:   <Clock size={12} className="text-sx-warning" />,
  low:      <CheckCircle size={12} className="text-sx-success" />,
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate }) => {
  const byStatus = (s: Task['status']) => tasks.filter(t => t.status === s);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    onTaskUpdate(e.dataTransfer.getData('text/plain'), { status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="bg-sx-root border border-sx-border p-3 min-h-[24rem]"
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, col.status)}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sx-muted text-xs font-medium uppercase tracking-wider">{col.title}</p>
            <span className="bg-sx-elevated border border-sx-border text-sx-faint text-xs px-1.5 py-0.5">
              {byStatus(col.status).length}
            </span>
          </div>

          <div className="space-y-2">
            {byStatus(col.status).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={e => handleDragStart(e, task.id)}
                className={`bg-sx-surface border border-sx-border p-3 cursor-move hover:border-sx-primary transition-all ${PRIORITY_STYLE[task.priority]}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sx-text text-xs font-medium flex-1 pr-2">{task.title}</p>
                  {PRIORITY_ICON[task.priority]}
                </div>
                <p className="text-sx-muted text-xs mb-3 line-clamp-2">{task.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <User size={11} className="text-sx-faint" />
                    <span className="text-sx-faint text-xs">{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={11} className="text-sx-faint" />
                    <span className="text-sx-faint text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag, i) => (
                      <span key={i} className="bg-sx-elevated border border-sx-border text-sx-faint text-xs px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
