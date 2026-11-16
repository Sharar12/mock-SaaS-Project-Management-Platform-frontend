'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
} from '@/contracts';
import { apiService } from '@/services/apiService';
import { AppShell, ToastContainer, ToastItem } from '@/ui';
import { CreateProjectModal, CreateTaskModal } from './CreateModals';
import { TaskDetailDrawer } from './TaskDetailDrawer';

interface WorkspaceContextValue {
  loading: boolean;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspaceId: (id: string) => void;
  projects: Project[];
  tasks: Task[];
  members: TeamMember[];
  activities: ActivityLog[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTask: Task | null;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
  openCreateTaskModal: (defaultProjectId?: string) => void;
  openCreateProjectModal: () => void;
  createProject: (input: Omit<CreateProjectInput, 'workspaceId'>) => Promise<void>;
  createTask: (input: Omit<CreateTaskInput, 'workspaceId'>) => Promise<void>;
  updateTask: (taskId: string, patch: Partial<Task>, activityNote?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  inviteMember: (input: Omit<InviteMemberInput, 'workspaceId'>) => Promise<void>;
  updateMemberRole: (memberId: string, role: MemberRole) => Promise<void>;
  updateWorkspace: (
    patch: Partial<Pick<Workspace, 'name' | 'industry' | 'plan' | 'accentColor'>>
  ) => Promise<void>;
  resetDemo: () => Promise<void>;
  notify: (message: string, type?: 'success' | 'info') => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [defaultTaskProjectId, setDefaultTaskProjectId] = useState<string | undefined>();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const loadBundle = useCallback(async () => {
    setLoading(true);
    try {
      const bundle = await apiService.getBundle();
      setWorkspaces(bundle.workspaces);
      setAllProjects(bundle.projects);
      setAllTasks(bundle.tasks);
      setAllMembers(bundle.members);
      setAllActivities(bundle.activities);
      if (bundle.workspaces.length > 0) {
        setActiveWorkspaceId((prev) =>
          bundle.workspaces.some((w) => w.id === prev) ? prev : bundle.workspaces[0].id
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBundle();
  }, [loadBundle]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId]
  );

  const projects = useMemo(
    () => allProjects.filter((p) => p.workspaceId === activeWorkspaceId),
    [allProjects, activeWorkspaceId]
  );

  const members = useMemo(
    () => allMembers.filter((m) => m.workspaceId === activeWorkspaceId),
    [allMembers, activeWorkspaceId]
  );

  const tasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTasks
      .filter((t) => t.workspaceId === activeWorkspaceId)
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
  }, [allTasks, activeWorkspaceId, searchQuery]);

  const activities = useMemo(
    () => allActivities.filter((a) => a.workspaceId === activeWorkspaceId),
    [allActivities, activeWorkspaceId]
  );

  const selectedTask = useMemo(
    () =>
      allTasks.find((t) => t.id === selectedTaskId && t.workspaceId === activeWorkspaceId) ?? null,
    [allTasks, selectedTaskId, activeWorkspaceId]
  );

  const currentActorId = members[0]?.id ?? 'mem-1';

  const createProject = async (input: Omit<CreateProjectInput, 'workspaceId'>) => {
    const created = await apiService.createProject({ ...input, workspaceId: activeWorkspaceId });
    setAllProjects((prev) => [created, ...prev]);
    notify(`Project "${created.name}" created`);
  };

  const createTask = async (input: Omit<CreateTaskInput, 'workspaceId'>) => {
    const created = await apiService.createTask(
      { ...input, workspaceId: activeWorkspaceId },
      currentActorId
    );
    setAllTasks((prev) => [created, ...prev]);
    notify(`Task ${created.code} added`);
  };

  const updateTask = async (taskId: string, patch: Partial<Task>, activityNote?: string) => {
    const updated = await apiService.updateTask(taskId, patch, currentActorId, activityNote);
    setAllTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (activityNote) {
      notify(`Updated ${updated.code}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    await apiService.deleteTask(taskId);
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskId(null);
    notify('Task deleted', 'info');
  };

  const addComment = async (taskId: string, content: string) => {
    const updated = await apiService.addTaskComment(taskId, currentActorId, content);
    setAllTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    notify('Comment posted');
  };

  const inviteMember = async (input: Omit<InviteMemberInput, 'workspaceId'>) => {
    const member = await apiService.inviteMember({ ...input, workspaceId: activeWorkspaceId });
    setAllMembers((prev) => [...prev, member]);
    notify(`Invited ${member.name} to workspace`);
  };

  const updateMemberRole = async (memberId: string, role: MemberRole) => {
    const updated = await apiService.updateMemberRole(memberId, role);
    setAllMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    notify(`Updated role for ${updated.name}`);
  };

  const updateWorkspace = async (
    patch: Partial<Pick<Workspace, 'name' | 'industry' | 'plan' | 'accentColor'>>
  ) => {
    const updated = await apiService.updateWorkspace(activeWorkspaceId, patch);
    setWorkspaces((prev) => prev.map((w) => (w.id === activeWorkspaceId ? updated : w)));
    notify('Workspace settings saved');
  };

  const resetDemo = async () => {
    const bundle = await apiService.resetDemoData();
    setWorkspaces(bundle.workspaces);
    setAllProjects(bundle.projects);
    setAllTasks(bundle.tasks);
    setAllMembers(bundle.members);
    setAllActivities(bundle.activities);
    notify('Mock database restored to clean seed state', 'info');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        projects,
        tasks,
        members,
        activities,
        searchQuery,
        setSearchQuery,
        selectedTask,
        openTaskDrawer: (id) => setSelectedTaskId(id),
        closeTaskDrawer: () => setSelectedTaskId(null),
        openCreateTaskModal: (projectId) => {
          setDefaultTaskProjectId(projectId);
          setCreateTaskOpen(true);
        },
        openCreateProjectModal: () => setCreateProjectOpen(true),
        createProject,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        inviteMember,
        updateMemberRole,
        updateWorkspace,
        resetDemo,
        notify,
      }}
    >
      <AppShell
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspaceId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTaskClick={() => {
          setDefaultTaskProjectId(projects[0]?.id);
          setCreateTaskOpen(true);
        }}
        onNewProjectClick={() => setCreateProjectOpen(true)}
        unreadActivityCount={activities.length}
      >
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-56 bg-slate-100 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
              ))}
            </div>
            <div className="h-72 bg-slate-100 rounded-2xl" />
          </div>
        ) : (
          children
        )}
      </AppShell>

      <TaskDetailDrawer
        task={selectedTask}
        projects={projects}
        members={members}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onAddComment={addComment}
      />

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projects={projects}
        members={members}
        defaultProjectId={defaultTaskProjectId}
        onSubmit={createTask}
      />

      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        members={members}
        onSubmit={createProject}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
