'use client';

import React, { useEffect, useState } from 'react';
import {
  CreateProjectInput,
  CreateTaskInput,
  Project,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  TeamMember,
} from '@/contracts';
import { Button, Input, Modal, Select, Textarea } from '@/ui';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  members: TeamMember[];
  defaultProjectId?: string;
  onSubmit: (input: Omit<CreateTaskInput, 'workspaceId'>) => Promise<void>;
}

export function CreateTaskModal({
  open,
  onClose,
  projects,
  members,
  defaultProjectId,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? '');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? '');
  const [dueDate, setDueDate] = useState('2026-11-28');
  const [tagsRaw, setTagsRaw] = useState('Frontend, Sprint');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
    else if (projects[0]) setProjectId(projects[0].id);
  }, [defaultProjectId, projects, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    setSubmitting(true);
    try {
      await onSubmit({
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        startDate: new Date().toISOString().slice(0, 10),
        dueDate,
        tags: tagsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        estimatedHours: 6,
      });
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Task"
      subtitle="Add a deliverable to your active workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g., Connect Laravel Sanctum auth endpoint"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          rows={3}
          placeholder="Acceptance criteria, notes, or technical details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </Select>
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </Select>
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <Input
          label="Tags (comma separated)"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  members: TeamMember[];
  onSubmit: (input: Omit<CreateProjectInput, 'workspaceId'>) => Promise<void>;
}

const PROJECT_COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899'];

export function CreateProjectModal({
  open,
  onClose,
  members,
  onSubmit,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [leadId, setLeadId] = useState(members[0]?.id ?? '');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState('2026-12-20');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        key: (key || name.slice(0, 4)).toUpperCase(),
        description: description.trim() || 'Reusable workspace project stream.',
        status,
        color,
        startDate: new Date().toISOString().slice(0, 10),
        dueDate,
        leadId: leadId || members[0]?.id || 'mem-1',
        tags: ['SaaS', 'Initiative'],
      });
      setName('');
      setKey('');
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Launch New Project"
      subtitle="Organize tasks, milestones, and timelines under a clean initiative."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Project Name"
              placeholder="e.g., Customer Onboarding Flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Key"
            placeholder="ONB"
            maxLength={6}
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
          />
        </div>
        <Textarea
          label="Summary"
          rows={3}
          placeholder="Goals and deliverables..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
          </Select>
          <Select label="Project Lead" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Input
            label="Target Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-700 mb-2">Accent Color</span>
          <div className="flex gap-2.5">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
