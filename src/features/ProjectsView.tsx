'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, FolderKanban, Plus } from 'lucide-react';
import { ProjectStatus } from '@/contracts';
import { Avatar, Badge, Button, Card, EmptyState, ProgressBar, Tabs } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

export function ProjectsView() {
  const { projects, tasks, members, openCreateProjectModal, openCreateTaskModal } = useWorkspace();
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');

  const filtered =
    filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Universal project containers reusable across engineering, design, or operations.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateProjectModal}>
          New Project
        </Button>
      </div>

      <Tabs
        activeId={filter}
        onChange={(id) => setFilter(id as 'all' | ProjectStatus)}
        options={[
          { id: 'all', label: 'All Projects', count: projects.length },
          {
            id: 'active',
            label: 'Active',
            count: projects.filter((p) => p.status === 'active').length,
          },
          {
            id: 'planning',
            label: 'Planning',
            count: projects.filter((p) => p.status === 'planning').length,
          },
          {
            id: 'on_hold',
            label: 'On Hold',
            count: projects.filter((p) => p.status === 'on_hold').length,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title="No projects match this filter"
          description="Create a new project initiative to organize tasks, team leads, and sprint timelines."
          action={
            <Button size="sm" onClick={openCreateProjectModal}>
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const pTasks = tasks.filter((t) => t.projectId === project.id);
            const doneCount = pTasks.filter((t) => t.status === 'done').length;
            const progress = pTasks.length > 0 ? Math.round((doneCount / pTasks.length) * 100) : 0;
            const lead = members.find((m) => m.id === project.leadId);

            return (
              <Card key={project.id} interactive className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-xs font-bold tracking-wider text-slate-400">
                        {project.key}
                      </span>
                    </div>
                    <Badge tone={project.status === 'active' ? 'emerald' : 'sky'} dot>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">
                        {doneCount}/{pTasks.length} tasks completed
                      </span>
                      <span className="font-semibold text-slate-800">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {lead && (
                        <Avatar
                          initials={lead.initials}
                          name={`Lead: ${lead.name}`}
                          colorClass={lead.avatarColor}
                          size="xs"
                        />
                      )}
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.dueDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openCreateTaskModal(project.id)}
                      >
                        + Task
                      </Button>
                      <Link href={`/board?project=${project.id}`}>
                        <Button
                          size="sm"
                          variant="secondary"
                          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        >
                          Board
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
