'use client';

import React, { useEffect, useState } from 'react';
import { Check, Database, RotateCcw, Server } from 'lucide-react';
import { PlanTier } from '@/contracts';
import { API_MODE } from '@/services/apiService';
import { Badge, Button, Card, Input } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

const PLANS: { id: PlanTier; name: string; price: string; features: string[] }[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0 / mo',
    features: ['Up to 5 team members', '3 active projects', 'Basic Kanban board'],
  },
  {
    id: 'pro',
    name: 'Pro SaaS',
    price: '$18 / seat',
    features: ['Unlimited projects & tasks', 'Timeline & custom tags', 'Webhook automations'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$45 / seat',
    features: ['Dedicated MySQL tenant isolation', 'SSO & audit logs', 'Priority SLA'],
  },
];

export function SettingsView() {
  const { activeWorkspace, updateWorkspace, resetDemo } = useWorkspace();
  const [name, setName] = useState(activeWorkspace?.name ?? '');
  const [industry, setIndustry] = useState(activeWorkspace?.industry ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setIndustry(activeWorkspace.industry);
    }
  }, [activeWorkspace]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWorkspace({ name, industry });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure tenant identity, SaaS subscription tier, and backend adapter status.
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900 mb-4">General Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Industry / Domain"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Subscription Tier */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">SaaS Subscription Plan</h2>
            <p className="text-xs text-slate-500">Switch plan tiers instantly to preview tenant limits.</p>
          </div>
          <Badge tone="indigo">{activeWorkspace?.plan ?? 'pro'} active</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const current = activeWorkspace?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`p-4 rounded-2xl border transition-all ${
                  current
                    ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{plan.name}</span>
                  {current && <Badge tone="indigo">Current</Badge>}
                </div>
                <p className="text-lg font-bold text-slate-900 mt-2">{plan.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={current ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full mt-4"
                  disabled={current}
                  onClick={() => updateWorkspace({ plan: plan.id })}
                >
                  {current ? 'Active Plan' : `Switch to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Backend Adapter Status */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              {API_MODE === 'mock' ? (
                <Database className="w-5 h-5" />
              ) : (
                <Server className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                API Mode: <span className="uppercase text-indigo-600">{API_MODE}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg leading-relaxed">
                Currently powered by <code>src/mock-backend/</code> with browser{' '}
                <code>localStorage</code> persistence. Once Laravel + MySQL is built in{' '}
                <code>backend/</code>, delete <code>src/mock-backend/</code> and point{' '}
                <code>src/services/apiService.ts</code> to your Laravel endpoints.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetDemo}
          >
            Reset Mock Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
