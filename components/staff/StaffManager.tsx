'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { Plus, ShieldCheck, UserCheck, Mail } from 'lucide-react';
import { UserRole, UserStatus } from '@/lib/types';

export function StaffManager() {
  const { users, addUser, updateUser, currentUser } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('INTERNAL_STAFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    await addUser({
      name,
      email,
      role,
      status: 'ACTIVE',
    });
    setName('');
    setEmail('');
    setIsSubmitting(false);
    setIsAddModalOpen(false);
  };

  const toggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateUser(userId, { status: newStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Internal Staff Accounts & Roles</h3>
          <p className="text-xs text-slate-500">
            Only administrators can provision operational accounts and manage permissions (Section 2.1).
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Provision Staff
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Accounts</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead className="text-right">Access Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-50 border border-brand-200 text-brand font-bold flex items-center justify-center text-xs">
                    {u.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge status={u.role} />
              </TableCell>
              <TableCell>
                <Badge status={u.status} />
              </TableCell>
              <TableCell className="text-xs text-slate-700 font-medium">
                {u.assignedCustomersCount || 0} accounts
              </TableCell>
              <TableCell className="text-xs text-slate-600">{formatDate(u.createdAt)}</TableCell>
              <TableCell className="text-right">
                {currentUser.role === 'ADMIN' && u.id !== currentUser.id && (
                  <Button
                    size="sm"
                    variant={u.status === 'ACTIVE' ? 'ghost' : 'outline'}
                    className="text-xs"
                    onClick={() => toggleStatus(u.id, u.status)}
                  >
                    {u.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Provision Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="md"
        title="Provision Internal Staff Account"
        description="Creates a staff identity in PostgreSQL with role-based permissions."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateStaff} isLoading={isSubmitting}>
              Create Staff User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff Full Name"
          />
          <Input
            label="Corporate Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
          <Select
            label="Operational Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { label: 'Internal Staff (Commercial & Billing Operations)', value: 'INTERNAL_STAFF' },
              { label: 'Administrator (Full System & User Management)', value: 'ADMIN' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
