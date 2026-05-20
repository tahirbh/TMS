import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  MapPin, 
  Calendar, 
  UserPlus,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import type { Site, Profile } from '../lib/database.types';

interface Labor {
  id: string;
  iqama_number: string;
  nationality: string;
  profession: string;
  phone: string | null;
  status: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function LaborPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [labors, setLabors] = useState<Labor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [supervisors, setSupervisors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobilizeModalOpen, setIsMobilizeModalOpen] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<Labor | null>(null);

  // Form states
  const [laborForm, setLaborForm] = useState({
    name: '',
    iqama_number: '',
    nationality: 'Saudi',
    profession: 'Labor',
    phone: '',
    status: 'available'
  });

  const [mobilizationForm, setMobilizationForm] = useState({
    site_id: '',
    supervisor_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [laborRes, siteRes, supervisorRes] = await Promise.all([
      supabase.from('employees').select('*, profile:profiles!inner(full_name, email, phone, role)').eq('profile.role', 'labor').order('created_at', { ascending: false }),
      supabase.from('sites').select('*').eq('is_active', true),
      supabase.from('profiles').select('*').in('role', ['supervisor', 'admin']),
    ]);

    if (laborRes.data) setLabors(laborRes.data as unknown as Labor[]);
    if (siteRes.data) setSites(siteRes.data);
    if (supervisorRes.data) setSupervisors(supervisorRes.data);
    setLoading(false);
  }

  async function handleAddLabor(e: React.FormEvent) {
    e.preventDefault();
    try {
      // 1. Create a profile
      const email = `labor_${laborForm.iqama_number}_${Math.floor(Math.random() * 1000)}@tms-labor.com`;
      const { data: newProfile, error: profileErr } = await supabase
        .from('profiles')
        .insert({
          full_name: laborForm.name,
          email,
          role: 'labor',
          is_active: true
        } as any)
        .select('id')
        .single();

      if (profileErr) throw profileErr;
      if (!newProfile) throw new Error('Failed to create profile');

      // 2. Create employee record
      const { error: employeeErr } = await supabase
        .from('employees')
        .insert({
          id: (newProfile as any).id,
          iqama_number: laborForm.iqama_number,
          nationality: laborForm.nationality,
          profession: laborForm.profession,
          phone: laborForm.phone,
          status: 'available'
        } as any);

      if (employeeErr) throw employeeErr;

      setIsAddModalOpen(false);
      setLaborForm({ name: '', iqama_number: '', nationality: 'Saudi', profession: 'Labor', phone: '', status: 'available' });
      fetchData();
    } catch (err: any) {
      alert(`Error adding labor: ${err.message}`);
    }
  }

  async function handleMobilize(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLabor) return;

    const { error } = await (supabase.from('labor_mobilization') as any).insert({
      labor_id: selectedLabor.id,
      site_id: mobilizationForm.site_id,
      supervisor_id: mobilizationForm.supervisor_id || null,
      start_date: mobilizationForm.start_date,
    });

    if (!error) {
      // Also update labor status in employees table
      await (supabase.from('employees') as any).update({ status: 'deployed' } as any).eq('id', selectedLabor.id);
      
      setIsMobilizeModalOpen(false);
      fetchData();
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: 'Delete Laborer Profile',
      message: 'Are you sure you want to delete this laborer? All mobilization history, employee details, and associated logs will be permanently lost.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      // 1. Delete mobilization records
      await supabase.from('labor_mobilization').delete().eq('labor_id', id);
      
      // 2. Delete the employee record
      await supabase.from('employees').delete().eq('id', id);
      
      // 3. Delete profile
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      
      fetchData();
    } catch (err: any) {
      alert(`Deletion Error: ${err.message}`);
    }
  }

  const filteredLabors = labors.filter(l => 
    (l.profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.iqama_number.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Labor Management</h1>
          <p className="text-slate-500">Manage workforce and site mobilization</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Labor</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Labor</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{labors.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Active (Deployed)</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {labors.filter(l => l.status === 'deployed').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <Loader2 size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">On Bench</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {labors.filter(l => l.status !== 'deployed').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <MapPin size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Sites Active</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{sites.length}</h3>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or Iqama..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Labor Details</th>
                <th className="px-6 py-4">Profession</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-16 bg-slate-50/20" />
                  </tr>
                ))
              ) : filteredLabors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No laborers found matching your search.
                  </td>
                </tr>
              ) : filteredLabors.map((labor) => (
                <tr key={labor.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {labor.profile?.full_name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{labor.profile?.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono">ID: {labor.iqama_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {labor.profession}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {labor.status === 'deployed' ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        Deployed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Idle
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {labor.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedLabor(labor);
                          setIsMobilizeModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mobilize to Site"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(labor.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Laborer"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Labor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Add New Labor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddLabor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={laborForm.name}
                    onChange={e => setLaborForm({...laborForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Iqama / ID Number</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={laborForm.iqama_number}
                    onChange={e => setLaborForm({...laborForm, iqama_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Profession</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={laborForm.profession}
                    onChange={e => setLaborForm({...laborForm, profession: e.target.value})}
                  >
                    <option>Labor</option>
                    <option>Technician</option>
                    <option>Mechanic</option>
                    <option>Safety Officer</option>
                    <option>Operator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nationality</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={laborForm.nationality}
                    onChange={e => setLaborForm({...laborForm, nationality: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={laborForm.phone}
                    onChange={e => setLaborForm({...laborForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20"
                >
                  Save Labor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobilization Modal */}
      {isMobilizeModalOpen && selectedLabor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <MapPin size={24} />
                <h3 className="font-bold text-lg">Mobilize Workforce</h3>
              </div>
              <button onClick={() => setIsMobilizeModalOpen(false)} className="text-white/70 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-4 bg-blue-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm">
                {selectedLabor.profile?.full_name?.charAt(0) || 'L'}
              </div>
              <div>
                <p className="font-bold text-slate-800">{selectedLabor.profile?.full_name || 'Laborer'}</p>
                <p className="text-xs text-slate-500">Currently Idle • ID {selectedLabor.iqama_number}</p>
              </div>
            </div>
            <form onSubmit={handleMobilize} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Target Site</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={mobilizationForm.site_id}
                  onChange={e => setMobilizationForm({...mobilizationForm, site_id: e.target.value})}
                >
                  <option value="">Select a site...</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name} ({site.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Supervisor In-Charge</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={mobilizationForm.supervisor_id}
                  onChange={e => setMobilizationForm({...mobilizationForm, supervisor_id: e.target.value})}
                >
                  <option value="">Select supervisor...</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deployment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={mobilizationForm.start_date}
                    onChange={e => setMobilizationForm({...mobilizationForm, start_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} />
                  Confirm Mobilization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
