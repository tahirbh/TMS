import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  UserCheck, 
  Plus, 
  Search, 
  X, 
  Loader2, 
  Edit, 
  Phone, 
  Mail, 
  MapPin
} from 'lucide-react';
import type { Profile, Site } from '../lib/database.types';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Profile[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSupervisor, setEditingSupervisor] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    site_id: ''
  });

  async function loadData() {
    setLoading(true);
    const [profilesRes, sitesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'supervisor').order('full_name'),
      supabase.from('sites').select('*').eq('is_active', true)
    ]);
    
    if (profilesRes.data) setSupervisors(profilesRes.data);
    if (sitesRes.data) setSites(sitesRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (sup?: Profile) => {
    if (sup) {
      setEditingSupervisor(sup);
      setFormData({
        full_name: sup.full_name,
        email: sup.email,
        phone: sup.phone || '',
        password: '',
        site_id: sup.site_id || ''
      });
    } else {
      setEditingSupervisor(null);
      setFormData({ full_name: '', email: '', phone: '', password: '', site_id: '' });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingSupervisor) {
        // Update via Edge Function
        const { error: fnError, data: fnData } = await supabase.functions.invoke('update-user', {
          body: {
            target_user_id: editingSupervisor.id,
            full_name: formData.full_name,
            phone: formData.phone,
            site_id: formData.site_id || null,
            password: formData.password || undefined
          }
        });
        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);

        // Direct sync fallback for site_id
        await (supabase.from('profiles') as any).update({ site_id: formData.site_id || null }).eq('id', editingSupervisor.id);
      } else {
        // Create via Edge Function
        const { error: fnError, data: fnData } = await supabase.functions.invoke('create-user', {
          body: {
            ...formData,
            role: 'supervisor'
          }
        });
        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);
        
        // Direct sync fallback for site_id if the record exists
        if (fnData?.user?.id) {
           await (supabase.from('profiles') as any).update({ site_id: formData.site_id || null }).eq('id', fnData.user.id);
        }
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save supervisor');
    } finally {
      setSaving(false);
    }
  };

  const filteredSupervisors = supervisors.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Site Supervisors</h1>
          <p className="text-slate-500 text-sm font-medium">Manage personnel responsible for site operations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
        >
          <Plus size={18} />
          Add Supervisor
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search supervisors..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-50 rounded-[2rem] animate-pulse" />
            ))
          ) : filteredSupervisors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium italic">
              No supervisors found matching your search.
            </div>
          ) : filteredSupervisors.map(sup => (
            <div key={sup.id} className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl border-2 border-blue-100 shadow-sm overflow-hidden">
                    {sup.avatar_url ? <img src={sup.avatar_url} className="w-full h-full object-cover" /> : sup.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight">{sup.full_name}</h3>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded mt-1">
                      Site Leader
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenModal(sup)}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition"
                >
                  <Edit size={18} />
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><Mail size={14} /></div>
                  <span className="text-xs font-bold">{sup.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><Phone size={14} /></div>
                  <span className="text-xs font-bold">{sup.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><MapPin size={14} /></div>
                  <span className="text-xs font-black uppercase tracking-tight">
                    {sites.find(s => s.id === sup.site_id)?.name || 'Unassigned Site'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supervisor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl"><UserCheck size={24} /></div>
                <div>
                  <h2 className="font-black uppercase tracking-widest text-sm">{editingSupervisor ? 'Edit Supervisor' : 'New Supervisor'}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel Management</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Email Address</label>
                    <input 
                      type="email" required disabled={!!editingSupervisor}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                      {editingSupervisor ? 'Reset Password' : 'Initial Password'}
                    </label>
                    <input 
                      type="password" required={!editingSupervisor} minLength={6}
                      placeholder={editingSupervisor ? 'Leave blank to keep' : 'Minimum 6 chars'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Primary Site</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={formData.site_id} onChange={e => setFormData({...formData, site_id: e.target.value})}
                    >
                      <option value="">Select Site (Optional)...</option>
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" disabled={saving}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSupervisor ? 'Update Supervisor' : 'Create Supervisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
