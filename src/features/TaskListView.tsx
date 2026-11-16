'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskPriority, TaskStatus } from '@/contracts';
import { Avatar, Badge, BadgeTone, Button, Card, Tabs } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

const PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'sky',
  high: 'amber',
  urgent: 'rose',
};

export function TaskListView() {
  const { tasks, projects, members, openTaskDrawer, openCreateTaskModal, updateTask } =
    useWorkspace();
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  const filtered =
    statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task List</h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured table view with instant inline status switching.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openCreateTaskModal()}>
          New Task
        </Button>
      </div>

      <Tabs
        activeId={statusFilter}
        onChange={(id) => setStatusFilter(id as 'all' | TaskStatus)}
        options={[
          { id: 'all', label: 'All', count: tasks.length },
          {
            id: 'todo',
            label: 'To Do',
            count: tasks.filter((t) => t.status === 'todo').length,
          },
          {
            id: 'in_progress',
            label: 'In Progress',
            count: tasks.filter((t) => t.status === 'in_progress').length,
          },
          {
            id: 'in_review',
            label: 'In Review',
            count: tasks.filter((t) => t.status === 'in_review').length,
          },
          {
            id: 'done',
            label: 'Done',
            count: tasks.filter((t) => t.status === 'done').length,
          },
        ]}
      />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Deliverable</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const assignee = members.find((m) => m.id === task.assigneeId);

                return (
                  <tr
                    key={task.id}
                    onClick={() => openTaskDrawer(task.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                      {task.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {project?.name ?? '—'}
                    </td>
                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTask(
                            task.id,
                            { status: e.target.value as TaskStatus },
                            `updated status to ${e.target.value.replace('_', ' ')}`
                          )
                        }
                        className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={assignee.initials}
                            colorClass={assignee.avatarColor}
                            size="xs"
                          />
                          <span className="text-xs text-slate-700">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {task.dueDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
