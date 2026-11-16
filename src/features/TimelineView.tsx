'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge, Card } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

export function TimelineView() {
  const { projects, tasks, openTaskDrawer } = useWorkspace();

  // Fixed 4-week rolling window visualization for clean SaaS roadmap display
  const weeks = ['Week 1 (Nov 1)', 'Week 2 (Nov 8)', 'Week 3 (Nov 15)', 'Week 4 (Nov 22+)'];

  const getSpanStyle = (startDate: string, dueDate: string) => {
    const startDay = new Date(startDate).getDate();
    const endDay = new Date(dueDate).getDate();
    const leftPct = Math.max(0, Math.min(75, ((startDay - 1) / 30) * 100));
    const rawWidth = ((Math.max(endDay, startDay + 3) - startDay) / 30) * 100;
    const widthPct = Math.max(18, Math.min(100 - leftPct, rawWidth));
    return { left: `${leftPct}%`, width: `${widthPct}%` };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roadmap Timeline</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visual schedule across active initiatives and deliverable deadlines.
        </p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Header Timeline Scale */}
        <div className="grid grid-cols-12 border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
          <div className="col-span-4 py-3 px-4 border-r border-slate-200/60 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Initiative / Deliverable
          </div>
          <div className="col-span-8 grid grid-cols-4">
            {weeks.map((w) => (
              <div key={w} className="py-3 px-3 border-r border-slate-200/50 last:border-r-0">
                {w}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {projects.map((proj) => {
            const projTasks = tasks.filter((t) => t.projectId === proj.id);
            return (
              <div key={proj.id}>
                <div className="grid grid-cols-12 bg-slate-50/40 px-4 py-2.5 items-center">
                  <div className="col-span-4 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="text-xs font-bold text-slate-800">{proj.name}</span>
                  </div>
                  <div className="col-span-8 text-[11px] text-slate-400">
                    {proj.startDate} → {proj.dueDate}
                  </div>
                </div>

                {projTasks.map((task) => {
                  const span = getSpanStyle(task.startDate, task.dueDate);
                  return (
                    <div
                      key={task.id}
                      onClick={() => openTaskDrawer(task.id)}
                      className="grid grid-cols-12 items-center hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <div className="col-span-4 py-3 px-4 border-r border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-800 truncate">
                          <span className="text-slate-400 mr-1.5">{task.code}</span>
                          {task.title}
                        </span>
                        <Badge tone={task.status === 'done' ? 'emerald' : 'indigo'}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="col-span-8 relative h-10 px-2 flex items-center">
                        <div
                          className="absolute h-6 rounded-lg px-2.5 flex items-center text-[11px] font-medium text-white shadow-xs transition-all hover:brightness-110 truncate"
                          style={{
                            ...span,
                            backgroundColor: proj.color,
                          }}
                        >
                          {task.code}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
