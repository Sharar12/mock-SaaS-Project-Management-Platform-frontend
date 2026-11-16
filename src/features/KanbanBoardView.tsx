'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Plus } from 'lucide-react';
import { TaskPriority, TaskStatus } from '@/contracts';
import { Avatar, Badge, BadgeTone, Button, Select } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

const COLUMNS: { id: TaskStatus; label: string; dotClass: string }[] = [
  { id: 'backlog', label: 'Backlog', dotClass: 'bg-slate-400' },
  { id: 'todo', label: 'To Do', dotClass: 'bg-sky-500' },
  { id: 'in_progress', label: 'In Progress', dotClass: 'bg-indigo-600' },
  { id: 'in_review', label: 'In Review', dotClass: 'bg-amber-500' },
  { id: 'done', label: 'Done', dotClass: 'bg-emerald-500' },
];

const PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'sky',
  high: 'amber',
  urgent: 'rose',
};

export function KanbanBoardView() {
  const searchParams = useSearchParams();
  const { projects, tasks, members, openTaskDrawer, openCreateTaskModal, updateTask } =
    useWorkspace();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  useEffect(() => {
    const qp = searchParams.get('project');
    if (qp) setSelectedProjectId(qp);
  }, [searchParams]);

  const visibleTasks =
    selectedProjectId === 'all'
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProjectId);

  const handleDrop = async (targetStatus: TaskStatus) => {
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    setDraggedTaskId(null);
    setDragOverCol(null);
    if (!task || task.status === targetStatus) return;

    await updateTask(
      task.id,
      { status: targetStatus },
      `moved to ${targetStatus.replace('_', ' ')}`
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kanban Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag cards across columns or click any card to inspect details & checklists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </Select>
          </div>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              openCreateTaskModal(selectedProjectId === 'all' ? undefined : selectedProjectId)
            }
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Horizontal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = visibleTasks.filter((t) => t.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.id);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
              className={`rounded-2xl p-3 border transition-all duration-150 min-h-[420px] ${
                isOver
                  ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50/70 border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                  <h3 className="text-xs font-semibold text-slate-800">{col.label}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-600">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {colTasks.map((task) => {
                  const assignee = members.find((m) => m.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTaskId(task.id)}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverCol(null);
                      }}
                      onClick={() => openTaskDrawer(task.id)}
                      className={`bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-soft cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-hover hover:border-indigo-300 ${
                        draggedTaskId === task.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {task.code}
                        </span>
                        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 leading-snug">
                        {task.title}
                      </p>

                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60 text-[10px] text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{task.dueDate.slice(5)}</span>
                          {task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3" />
                              {task.comments.length}
                            </span>
                          )}
                        </div>
                        {assignee && (
                          <Avatar
                            initials={assignee.initials}
                            name={assignee.name}
                            colorClass={assignee.avatarColor}
                            size="xs"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
