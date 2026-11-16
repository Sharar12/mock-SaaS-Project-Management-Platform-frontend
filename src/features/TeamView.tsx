'use client';

import React, { useState } from 'react';
import { Mail, Shield, UserPlus } from 'lucide-react';
import { MemberRole } from '@/contracts';
import { Avatar, Badge, Button, Card, Input, Modal, Select } from '@/ui';
import { useWorkspace } from './WorkspaceContext';

export function TeamView() {
  const { members, tasks, inviteMember, updateMemberRole } = useWorkspace();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await inviteMember({
        name: name.trim(),
        email: email.trim(),
        role,
        title: title.trim() || 'Product Contributor',
      });
      setName('');
      setEmail('');
      setTitle('');
      setInviteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage workspace seats, role-based access, and active workload distribution.
          </p>
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setInviteOpen(true)}>
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map((member) => {
          const assignedCount = tasks.filter(
            (t) => t.assigneeId === member.id && t.status !== 'done'
          ).length;

          return (
            <Card key={member.id} interactive>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={member.initials}
                    colorClass={member.avatarColor}
                    size="lg"
                    status={member.status}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{member.name}</h3>
                    <p className="text-xs text-slate-500">{member.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>
                <Badge tone={member.role === 'owner' ? 'indigo' : 'neutral'}>
                  {member.role}
                </Badge>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-800">{assignedCount}</strong> open tasks
                </span>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value as MemberRole)}
                    className="h-8 px-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        subtitle="Add a collaborator to this workspace."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g., Nadia Karim"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Work Email"
            type="email"
            placeholder="nadia@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              placeholder="Backend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select
              label="Workspace Role"
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
