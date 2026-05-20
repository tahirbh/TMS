import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Shield, Search, X, Loader2, Edit } from 'lucide-react';
import { formatDate } from '../lib/utils';
import type { Profile } from '../lib/database.types';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'dispatcher'
  });

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user?: Profile) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.full_name,
        email: user.email, // Email generally shouldn't be edited freely to avoid breaking Auth, but we can display it read-only
        password: '', // blank password means no change
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({ full_name: '', email: '', password: '', role: 'dispatcher' });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await supabase.auth.getSession();
      
      if (editingUser) {
        // Update existing user
        const { error: fnError, data: fnData } = await supabase.functions.invoke('update-user', {
          body: {
            target_user_id: editingUser.id,
            full_name: formData.full_name,
            role: formData.role,
            password: formData.password || undefined // Only send if provided
          }
        });
        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);
      } else {
        // Create new user
        const { error: fnError, data: fnData } = await supabase.functions.invoke('create-user', {
          body: formData
        });
        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);
      }

      setShowModal(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">Manage system access and roles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.full_name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                        {user.role === 'admin' && <Shield className="w-3 h-3 text-red-500" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {user.is_active ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleOpenModal(user)} 
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition inline-flex"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editingUser ? 'Edit User' : 'Create New User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" required disabled={!!editingUser}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm transition ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
                {editingUser && <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingUser ? 'Reset Password (Optional)' : 'Temporary Password'}
                </label>
                <input 
                  type="password" required={!editingUser} minLength={6}
                  placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="dispatcher">Dispatcher (Operations)</option>
                  <option value="supervisor">Supervisor (Sites & Reports)</option>
                  <option value="driver">Driver (Mobile App Only)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
