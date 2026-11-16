'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { Project, Task, TaskPriority, TaskStatus, TeamMember } from '@/contracts';
import { Avatar, Badge, Button, Drawer, Select } from '@/ui';

interface TaskDetailDrawerProps {
  task: Task | null;
  projects: Project[];
  members: TeamMember[];
  onClose: () => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>, activityNote?: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddComment: (taskId: string, content: string) => Promise<void>;
}

export function TaskDetailDrawer({
  task,
  projects,
  members,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
}: TaskDetailDrawerProps) {
  const [commentText, setCommentText] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  if (!task) {
    return (
      <Drawer open={false} onClose={onClose}>
        <div />
      </Drawer>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);

  const toggleSubtask = (subId: string) => {
    const updated = task.subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask(task.id, { subtasks: updated });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const updated = [
      ...task.subtasks,
      { id: `st-${Date.now()}`, title: newSubtask.trim(), completed: false },
    ];
    onUpdateTask(task.id, { subtasks: updated });
    setNewSubtask('');
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onAddComment(task.id, commentText.trim());
    setCommentText('');
  };

  return (
    <Drawer
      open={Boolean(task)}
      onClose={onClose}
      headerExtra={
        <div className="flex items-center gap-2">
          <Badge tone="indigo">{task.code}</Badge>
          {project && <span className="text-xs text-slate-500">{project.name}</span>}
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {task.description || 'No description provided yet.'}
          </p>
        </div>

        {/* Metadata Controls */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
          <Select
            label="Status"
            value={task.status}
            onChange={(e) =>
              onUpdateTask(
                task.id,
                { status: e.target.value as TaskStatus },
                `changed status to ${e.target.value.replace('_', ' ')}`
              )
            }
          >
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </Select>

          <Select
            label="Priority"
            value={task.priority}
            onChange={(e) =>
              onUpdateTask(
                task.id,
                { priority: e.target.value as TaskPriority },
                `set priority to ${e.target.value}`
              )
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          <Select
            label="Assignee"
            value={task.assigneeId ?? ''}
            onChange={(e) =>
              onUpdateTask(task.id, { assigneeId: e.target.value || null }, 'reassigned task')
            }
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-700">Due Date</span>
            <div className="h-10 px-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value })}
                className="bg-transparent w-full text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              Checklist ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </h4>
          </div>
          <div className="space-y-2">
            {task.subtasks.map((st) => (
              <label
                key={st.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(st.id)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span
                  className={`text-sm ${
                    st.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {st.title}
                </span>
              </label>
            ))}
          </div>
          <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2.5">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
            <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </form>
        </div>

        {/* Comments */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            Discussion ({task.comments.length})
          </h4>
          <div className="space-y-3 mb-3">
            {task.comments.map((cm) => {
              const author = members.find((m) => m.id === cm.authorId);
              return (
                <div
                  key={cm.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar
                      initials={author?.initials ?? 'U'}
                      colorClass={author?.avatarColor}
                      size="xs"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      {author?.name ?? 'Team Member'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(cm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{cm.content}</p>
                </div>
              );
            })}
          </div>
          <form onSubmit={handlePostComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
            <Button type="submit" size="md" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Post
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Estimated: {task.estimatedHours}h
          </span>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => onDeleteTask(task.id)}
          >
            Delete Task
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
