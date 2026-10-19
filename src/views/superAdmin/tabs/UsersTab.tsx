import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  Smartphone,
  Globe,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { PlatformUser } from '../../../types/superAdmin';

interface UsersTabProps {
  users: PlatformUser[];
  onForceLogoutUser?: (userId: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onForceLogoutUser }) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.businessName.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);

    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Multi-Tenant User Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Platform-wide directory of all business owners, managers, cashiers, and accountants.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Total Users: <span className="text-white">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, phone, business..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="owner">Business Owner</option>
          <option value="manager">Store Manager</option>
          <option value="cashier">Cashier</option>
          <option value="accountant">Accountant</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111822] text-slate-400 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">User & Contact</th>
                <th className="py-3 px-3.5">Tenant Business</th>
                <th className="py-3 px-3.5">Role</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Last Login & Device</th>
                <th className="py-3 px-3.5">IP Address</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No users found matching search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {u.email} • {u.phone}
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="font-semibold text-white">{u.businessName}</span>
                      <div className="text-[10px] text-slate-500 font-mono">{u.businessId}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/10 text-sky-400 border border-blue-500/20">
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      {u.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="text-[11px] text-slate-300 font-mono">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3" /> {u.device || 'Web Browser'}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                      {u.ipAddress || '103.21.244.18'}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => {
                          alert(`Session for ${u.name} revoked.`);
                          if (onForceLogoutUser) onForceLogoutUser(u.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-[10px] font-bold transition flex items-center gap-1 mx-auto"
                        title="Force logout active user session"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Force Logout</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
