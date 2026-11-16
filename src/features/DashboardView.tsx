'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  Layers,
  Plus,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, ProgressBar, StatCard } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

export function DashboardView() {
  const {
    activeWorkspace,
    projects,
    tasks,
    members,
    activities,
    openTaskDrawer,
    openCreateTaskModal,
  } = useWorkspace();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeWorkspace?.name ?? 'Workspace'} Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track sprint momentum, active initiatives, and team workload in real time.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/board">
            <Button variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Board
            </Button>
          </Link>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openCreateTaskModal()}>
            Add Deliverable
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={projects.filter((p) => p.status === 'active').length}
          trend={`${projects.length} total initiatives`}
          trendTone="neutral"
          icon={<FolderKanban className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          trend={`${doneTasks} of ${totalTasks} tasks done`}
          trendTone="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="In Progress"
          value={inProgressTasks}
          trend="Active sprint focus"
          trendTone="neutral"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Team Capacity"
          value={members.length}
          trend={`${members.filter((m) => m.status === 'online').length} online now`}
          trendTone="positive"
          icon={<Layers className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Health */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Project Progress</h2>
              <p className="text-xs text-slate-500">Deliverable velocity across active streams</p>
            </div>
            <Link href="/projects" className="text-xs font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {projects.map((project) => {
              const pTasks = tasks.filter((t) => t.projectId === project.id);
              const pDone = pTasks.filter((t) => t.status === 'done').length;
              const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
              return (
                <div
                  key={project.id}
                  className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-xs font-semibold text-slate-400">{project.key}</span>
                      <span className="text-sm font-semibold text-slate-900">{project.name}</span>
                    </div>
                    <Badge tone={project.status === 'active' ? 'emerald' : 'sky'}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <ProgressBar value={pct} />
                    <span className="text-xs font-semibold text-slate-700 w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 6).map((act) => {
              const actor = members.find((m) => m.id === act.actorId);
              return (
                <div key={act.id} className="flex items-start gap-3">
                  <Avatar
                    initials={actor?.initials ?? 'SY'}
                    colorClass={actor?.avatarColor}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900">
                        {actor?.name ?? 'System'}
                      </span>{' '}
                      {act.action}{' '}
                      <span className="font-medium text-indigo-700">{act.targetTitle}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Priority Queue */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Upcoming & High Priority Tasks</h2>
          <Link href="/tasks" className="text-xs font-medium text-indigo-600 hover:underline">
            Full table view
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks
            .filter((t) => t.status !== 'done')
            .slice(0, 6)
            .map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  onClick={() => openTaskDrawer(task.id)}
                  className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-soft transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400">{task.code}</span>
                    <Badge
                      tone={
                        task.priority === 'urgent'
                          ? 'rose'
                          : task.priority === 'high'
                          ? 'amber'
                          : 'neutral'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Due {task.dueDate}</span>
                    {assignee ? (
                      <Avatar
                        initials={assignee.initials}
                        name={assignee.name}
                        colorClass={assignee.avatarColor}
                        size="xs"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400">Unassigned</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
