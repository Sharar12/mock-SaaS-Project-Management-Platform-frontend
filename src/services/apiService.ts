import {
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
import { mockApiClient } from '@/mock-backend/mockApiClient';

/**
 * UNIVERSAL API ADAPTER
 * -------------------------------------------------------------------------
 * This is the ONLY file connected to `src/mock-backend/`.
 * When your PHP / Laravel + MySQL backend is ready:
 * 1. Replace `mockApiClient.*` calls below with `fetch(`${API_URL}/...`)`.
 * 2. Delete the entire `src/mock-backend/` directory cleanly.
 */
export const API_MODE = process.env.NEXT_PUBLIC_API_MODE ?? 'mock';

export const apiService = {
  getBundle(): Promise<WorkspaceBundle> {
    return mockApiClient.getBundle();
  },

  resetDemoData(): Promise<WorkspaceBundle> {
    return mockApiClient.resetDemoData();
  },

  updateWorkspace(
    workspaceId: string,
    patch: Partial<Pick<Workspace, 'name' | 'industry' | 'plan' | 'accentColor'>>
  ): Promise<Workspace> {
    return mockApiClient.updateWorkspace(workspaceId, patch);
  },

  createProject(input: CreateProjectInput): Promise<Project> {
    return mockApiClient.createProject(input);
  },

  createTask(input: CreateTaskInput, actorId: string): Promise<Task> {
    return mockApiClient.createTask(input, actorId);
  },

  updateTask(
    taskId: string,
    patch: Partial<Task>,
    actorId?: string,
    activityNote?: string
  ): Promise<Task> {
    return mockApiClient.updateTask(taskId, patch, actorId, activityNote);
  },

  deleteTask(taskId: string): Promise<void> {
    return mockApiClient.deleteTask(taskId);
  },

  addTaskComment(taskId: string, authorId: string, content: string): Promise<Task> {
    return mockApiClient.addTaskComment(taskId, authorId, content);
  },

  inviteMember(input: InviteMemberInput): Promise<TeamMember> {
    return mockApiClient.inviteMember(input);
  },

  updateMemberRole(memberId: string, role: MemberRole): Promise<TeamMember> {
    return mockApiClient.updateMemberRole(memberId, role);
  },
};
