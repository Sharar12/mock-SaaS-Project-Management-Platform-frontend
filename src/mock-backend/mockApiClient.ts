import {
  ActivityLog,
  CreateProjectInput,
  CreateTaskInput,
  InviteMemberInput,
  MemberRole,
  Project,
  Task,
  TeamMember,
  Workspace,
  WorkspaceBundle,
} from '@/contracts';
import { readMockDb, resetMockDb, writeMockDb } from './db';

const SIMULATED_LATENCY_MS = 120;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const mockApiClient = {
  async getBundle(): Promise<WorkspaceBundle> {
    await wait(SIMULATED_LATENCY_MS);
    return readMockDb();
  },

  async resetDemoData(): Promise<WorkspaceBundle> {
    await wait(SIMULATED_LATENCY_MS);
    return resetMockDb();
  },

  async updateWorkspace(
    workspaceId: string,
    patch: Partial<Pick<Workspace, 'name' | 'industry' | 'plan' | 'accentColor'>>
  ): Promise<Workspace> {
    await wait(SIMULATED_LATENCY_MS);
    const db = readMockDb();
    const idx = db.workspaces.findIndex((w) => w.id === workspaceId);
    if (idx === -1) throw new Error('Workspace not found');
    db.workspaces[idx] = { ...db.workspaces[idx], ...patch };
    writeMockDb(db);
    return db.workspaces[idx];
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    await wait(SIMULATED_LATENCY_MS);
    const db = readMockDb();
    const project: Project = {
      id: uid('proj'),
      workspaceId: input.workspaceId,
      key: input.key.toUpperCase().slice(0, 6),
      name: input.name,
      description: input.description,
      status: input.status,
      color: input.color,
      startDate: input.startDate,
      dueDate: input.dueDate,
      leadId: input.leadId,
      memberIds: [input.leadId],
      tags: input.tags,
    };
    db.projects.unshift(project);

    const activity: ActivityLog = {
      id: uid('act'),
      workspaceId: input.workspaceId,
      actorId: input.leadId,
      action: 'created project',
      targetTitle: project.name,
      timestamp: new Date().toISOString(),
    };
    db.activities.unshift(activity);
    writeMockDb(db);
    return project;
  },

  async createTask(input: CreateTaskInput, actorId: string): Promise<Task> {
    await wait(SIMULATED_LATENCY_MS);
    const db = readMockDb();
    const project = db.projects.find((p) => p.id === input.projectId);
    const existingCount = db.tasks.filter((t) => t.projectId === input.projectId).length;
    const code = `${project?.key ?? 'TSK'}-${101 + existingCount}`;

    const task: Task = {
      id: uid('task'),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      code,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
      startDate: input.startDate,
      dueDate: input.dueDate,
      tags: input.tags,
      subtasks: [],
      comments: [],
      estimatedHours: input.estimatedHours,
      createdAt: new Date().toISOString(),
    };

    db.tasks.unshift(task);
    db.activities.unshift({
      id: uid('act'),
      workspaceId: input.workspaceId,
      actorId,
      action: 'created task',
      targetTitle: `${task.code} ${task.title}`,
      timestamp: new Date().toISOString(),
    });
    writeMockDb(db);
    return task;
  },

  async updateTask(
    taskId: string,
    patch: Partial<Task>,
    actorId?: string,
    activityNote?: string
  ): Promise<Task> {
    await wait(80);
    const db = readMockDb();
    const idx = db.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    const updated: Task = { ...db.tasks[idx], ...patch };
    db.tasks[idx] = updated;

    if (actorId && activityNote) {
      db.activities.unshift({
        id: uid('act'),
        workspaceId: updated.workspaceId,
        actorId,
        action: activityNote,
        targetTitle: `${updated.code} ${updated.title}`,
        timestamp: new Date().toISOString(),
      });
    }
    writeMockDb(db);
    return updated;
  },

  async deleteTask(taskId: string): Promise<void> {
    await wait(80);
    const db = readMockDb();
    db.tasks = db.tasks.filter((t) => t.id !== taskId);
    writeMockDb(db);
  },

  async addTaskComment(taskId: string, authorId: string, content: string): Promise<Task> {
    await wait(80);
    const db = readMockDb();
    const idx = db.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    db.tasks[idx].comments.push({
      id: uid('cm'),
      authorId,
      content,
      createdAt: new Date().toISOString(),
    });
    writeMockDb(db);
    return db.tasks[idx];
  },

  async inviteMember(input: InviteMemberInput): Promise<TeamMember> {
    await wait(SIMULATED_LATENCY_MS);
    const db = readMockDb();
    const palette = [
      'bg-indigo-600',
      'bg-sky-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-violet-600',
    ];
    const parts = input.name.trim().split(/\s+/);
    const initials = (
      (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')
    ).toUpperCase();

    const member: TeamMember = {
      id: uid('mem'),
      workspaceId: input.workspaceId,
      name: input.name,
      email: input.email,
      role: input.role,
      title: input.title,
      avatarColor: palette[db.members.length % palette.length],
      initials: initials || 'TM',
      status: 'online',
    };
    db.members.push(member);
    writeMockDb(db);
    return member;
  },

  async updateMemberRole(memberId: string, role: MemberRole): Promise<TeamMember> {
    await wait(80);
    const db = readMockDb();
    const idx = db.members.findIndex((m) => m.id === memberId);
    if (idx === -1) throw new Error('Member not found');
    db.members[idx].role = role;
    writeMockDb(db);
    return db.members[idx];
  },
};
