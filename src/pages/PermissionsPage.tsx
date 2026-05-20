import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RolePermission {
  role: string;
  path: string;
}

const ROLES = [
  'super_admin', 
  'management', 
  'operations_manager', 
  'fleet_supervisor', 
  'hr', 
  'document_controller', 
  'driver', 
  'read_only_viewer'
];

const PAGES = [
  { path: '/', label: 'Dashboard' },
  { path: '/control-tower', label: 'Control Tower' },
  { path: '/trips', label: 'Trips' },
  { path: '/vehicles', label: 'Vehicles' },
  { path: '/orders', label: 'Orders' },
  { path: '/dispatch', label: 'Dispatch' },
  { path: '/mobilization', label: 'Mobilization' },
  { path: '/drivers', label: 'Drivers' },
  { path: '/labor', label: 'Labor' },
  { path: '/supervisors', label: 'Supervisors' },
  { path: '/sites', label: 'Sites' },
  { path: '/trip-allowances', label: 'Allowances' },
  { path: '/breakdowns', label: 'Maintenance' },
  { path: '/trailers', label: 'Trailers' },
  { path: '/fleet-combinations', label: 'Combinations' },
  { path: '/sponsors', label: 'Sponsors' },
  { path: '/employee-master', label: 'Employee Master' },
  { path: '/vehicle-master', label: 'Vehicle Master' },
  { path: '/search', label: 'Global Search' },
  { path: '/dms', label: 'DMS Engine' },
  { path: '/documents', label: 'Documents' },
  { path: '/inspections', label: 'Inspections' },
  { path: '/reports', label: 'Reports' },
  { path: '/users', label: 'Users' },
  { path: '/permissions', label: 'Permissions' },
  { path: '/settings', label: 'Settings' },
  { path: '/notifications', label: 'Alerts' },
  { path: '/driver-mobile', label: 'Driver Mobile' },
];

export default function PermissionsPage() {
  const { refreshPermissions } = useAuth();
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('role_permissions')
      .select('role, path');
    
    if (error) {
      console.error('Error loading permissions:', error);
    } else {
      setPermissions(data || []);
    }
    setLoading(false);
  }

  const hasPermission = (role: string, path: string) => {
    // Super Admin always has permission for everything
    if (role === 'super_admin' || role === 'admin') return true;
    return permissions.some(p => p.role === role && p.path === path);
  };

  const togglePermission = async (role: string, path: string) => {
    if (role === 'super_admin' || role === 'admin') return; // Cannot revoke admin permissions

    const id = `${role}-${path}`;
    setSaving(id);

    const exists = hasPermission(role, path);

    if (exists) {
      // Remove
      const { error } = await (supabase
        .from('role_permissions') as any)
        .delete()
        .eq('role', role)
        .eq('path', path);
      
      if (!error) {
        setPermissions(prev => prev.filter(p => !(p.role === role && p.path === path)));
        await refreshPermissions();
      }
    } else {
      // Add
      const { error } = await (supabase
        .from('role_permissions') as any)
        .insert({ role, path });
      
      if (!error) {
        setPermissions(prev => [...prev, { role, path }]);
        await refreshPermissions();
      }
    }
    
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Access Control</h1>
          <p className="text-slate-500 text-sm">Manage page access for different user groups</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Page / Module</th>
                {ROLES.map(role => (
                  <th key={role} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="capitalize">{role.replace('_', ' ')}</span>
                      {(role === 'super_admin' || role === 'admin') && <Shield className="w-3 h-3 text-blue-500" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAGES.map((page) => (
                <tr key={page.path} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{page.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{page.path}</span>
                    </div>
                  </td>
                  {ROLES.map((role) => {
                    const isAllowed = hasPermission(role, page.path);
                    const isSaving = saving === `${role}-${page.path}`;
                    const isAdmin = role === 'super_admin' || role === 'admin';

                    return (
                      <td key={role} className="px-6 py-4 text-center">
                        <button
                          disabled={isAdmin || isSaving}
                          onClick={() => togglePermission(role, page.path)}
                          className={`
                            relative w-10 h-10 rounded-lg flex items-center justify-center transition-all
                            ${isAdmin 
                              ? 'bg-blue-50 text-blue-600 cursor-default' 
                              : isAllowed 
                                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                            }
                            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : isAllowed ? (
                            <Check className="w-5 h-5" strokeWidth={3} />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                          
                          {isAdmin && (
                            <div className="absolute -top-1 -right-1">
                              <Lock className="w-3 h-3 text-blue-400" />
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 text-blue-800">
        <Shield className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-1">Security Note</p>
          <p>
            The <strong>Admin</strong> role is implicitly granted access to all pages to prevent accidental lock-outs. 
            Changes made here take effect immediately for the next page load or sidebar refresh.
          </p>
        </div>
      </div>
    </div>
  );
}
