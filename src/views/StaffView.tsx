import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  KeyRound,
  Check,
  X,
  Lock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Staff, StaffPermissions, StaffRole } from '../types';

export const StaffView: React.FC = () => {
  const { staff, addStaff, updateStaff, currentStaff, setCurrentStaff } = useShop();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('cashier');
  const [pin, setPin] = useState('1234');
  const [permissions, setPermissions] = useState<StaffPermissions>({
    viewSales: true,
    createInvoice: true,
    editInvoice: false,
    cancelInvoice: false,
    viewProfit: false,
    viewGst: false,
    manageInventory: false,
    manageCustomers: true,
    manageSuppliers: false,
    manageExpenses: false,
    manageSettings: false,
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('cashier');
    setPin('1234');
    setPermissions({
      viewSales: true,
      createInvoice: true,
      editInvoice: false,
      cancelInvoice: false,
      viewProfit: false,
      viewGst: false,
      manageInventory: false,
      manageCustomers: true,
      manageSuppliers: false,
      manageExpenses: false,
      manageSettings: false,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone);
    setRole(s.role);
    setPin(s.pin);
    setPermissions({ ...s.permissions });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name,
        email,
        phone,
        role,
        pin,
        permissions,
      });
    } else {
      addStaff({
        name,
        email,
        phone,
        role,
        pin,
        permissions,
        active: true,
      });
    }

    setIsAddModalOpen(false);
  };

  const togglePermission = (key: keyof StaffPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Staff Accounts & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control exact permissions for Cashiers, Managers, Accountants, and Inventory Handlers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0984E3] hover:bg-[#0770C2] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => {
          const isCurrentUser = currentStaff.id === s.id;
          return (
            <div
              key={s.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs space-y-4 flex flex-col justify-between transition ${
                isCurrentUser
                  ? 'border-indigo-500 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center">
                      {s.name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {s.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">
                        Role: {s.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Permissions"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Email: {s.email || 'N/A'}</p>
                  <p>Phone: {s.phone}</p>
                  <p className="font-mono">Security PIN: ****</p>
                </div>

                {/* Permissions Pill Grid */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Granted Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {Object.entries(s.permissions)
                      .filter(([_, allowed]) => allowed)
                      .map(([key]) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium"
                        >
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Bottom Switch Staff Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStaff(s)}
                  className={`w-full py-1.5 px-3 text-xs font-bold rounded-xl transition ${
                    isCurrentUser
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isCurrentUser ? '✓ Currently Active Profile' : 'Switch To This Account'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 my-auto max-h-[92vh]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingStaff ? 'Edit Staff Account & Permissions' : 'Create Staff Member'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase font-semibold"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quick PIN (4 digits)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Granular Permissions Switchboard */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Granular Permissions Control:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(permissions).map(([key, isAllowed]) => (
                    <label
                      key={key}
                      onClick={() => togglePermission(key as keyof StaffPermissions)}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        readOnly
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="capitalize text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Save Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
