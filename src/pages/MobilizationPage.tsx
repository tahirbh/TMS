import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { 
  MapPin, 
  UserCheck, 
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  X
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

interface MobilizationRecord {
  id: string;
  labor_id: string;
  site_id: string;
  supervisor_id: string | null;
  labor: Labor;
  site: Site;
  supervisor: Profile;
  start_date: string;
  end_date: string | null;
  status: string;
}

export default function MobilizationPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [records, setRecords] = useState<MobilizationRecord[]>([]);
  const [labors, setLabors] = useState<Labor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [supervisors, setSupervisors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MobilizationRecord | null>(null);

  const [form, setForm] = useState({
    labor_id: '',
    site_id: '',
    supervisor_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'active' as 'active' | 'completed'
  });

  useEffect(() => {
    fetchData();
    fetchSupportData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('labor_mobilization')
      .select('*, labor:employees(*, profile:profiles(*)), site:sites(*), supervisor:profiles(*)')
      .order('start_date', { ascending: false });

    if (!error && data) {
      setRecords(data as any);
    }
    setLoading(false);
  }

  async function fetchSupportData() {
    const [laborRes, siteRes, supervisorRes] = await Promise.all([
      supabase.from('employees').select('*, profile:profiles!inner(full_name, role)').eq('profile.role', 'labor').or('status.eq.available,status.is.null'),
      supabase.from('sites').select('*').eq('is_active', true),
      supabase.from('profiles').select('*').in('role', ['supervisor', 'admin']),
    ]);
    if (laborRes.data) setLabors(laborRes.data as unknown as Labor[]);
    if (siteRes.data) setSites(siteRes.data);
    if (supervisorRes.data) setSupervisors(supervisorRes.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      labor_id: form.labor_id,
      site_id: form.site_id,
      supervisor_id: form.supervisor_id || null,
      start_date: form.start_date,
      status: form.status
    };

    if (editingRecord) {
      const { error } = await (supabase.from('labor_mobilization') as any)
        .update(payload)
        .eq('id', editingRecord.id);
      
      if (!error) {
        // If status changed to completed, set labor to available
        if (form.status === 'completed') {
          await (supabase.from('employees') as any).update({ status: 'available' } as any).eq('id', form.labor_id);
        } else {
          await (supabase.from('employees') as any).update({ status: 'deployed' } as any).eq('id', form.labor_id);
        }
      }
    } else {
      const { error } = await (supabase.from('labor_mobilization') as any).insert(payload);
      if (!error) {
        await (supabase.from('employees') as any).update({ status: 'deployed' } as any).eq('id', form.labor_id);
      }
    }

    setIsModalOpen(false);
    setEditingRecord(null);
    setForm({ labor_id: '', site_id: '', supervisor_id: '', start_date: format(new Date(), 'yyyy-MM-dd'), status: 'active' });
    fetchData();
    fetchSupportData();
  }

  async function handleDelete(id: string, laborId: string) {
    const confirmed = await confirm({
      title: 'Delete Deployment Record',
      message: 'Are you sure you want to delete this mobilization record? This laborer status will be set back to available and all assignment logs will be unlinked.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    const { error } = await supabase.from('labor_mobilization').delete().eq('id', id);
    if (!error) {
      await (supabase.from('employees') as any).update({ status: 'available' } as any).eq('id', laborId);
      fetchData();
      fetchSupportData();
    }
  }

  async function handleDecommission(record: MobilizationRecord) {
    const { error } = await (supabase.from('labor_mobilization') as any)
      .update({ status: 'completed', end_date: new Date().toISOString() })
      .eq('id', record.id);

    if (!error) {
      await (supabase.from('employees') as any).update({ status: 'available' } as any).eq('id', record.labor_id);
      fetchData();
      fetchSupportData();
    }
  }

  const filteredRecords = records.filter(r => 
    (r.labor?.profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.site?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.supervisor?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workforce Deployment Log</h1>
          <p className="text-slate-500">Track active labor assignments across projects</p>
        </div>
        <button 
          onClick={() => {
            setEditingRecord(null);
            setForm({ labor_id: '', site_id: '', supervisor_id: '', start_date: format(new Date(), 'yyyy-MM-dd'), status: 'active' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          New Deployment
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by labor, site, or supervisor..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supervisor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-12 bg-slate-100 rounded-xl" /></td>
                  </tr>
                ))
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">No active deployments found.</td>
                </tr>
              ) : filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                        {record.labor?.profile?.full_name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{record.labor?.profile?.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {record.labor?.iqama_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MapPin size={10} /> {record.site?.name}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-300" />
                        {format(new Date(record.start_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                        <UserCheck size={12} className="text-slate-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{record.supervisor?.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      record.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {record.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingRecord(record);
                          setForm({
                            labor_id: record.labor_id,
                            site_id: record.site_id,
                            supervisor_id: record.supervisor_id || '',
                            start_date: record.start_date.split('T')[0],
                            status: record.status as any
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id, record.labor_id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                      {record.status === 'active' && (
                        <button 
                           onClick={() => handleDecommission(record)}
                          className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition"
                        >
                          End
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest">{editingRecord ? 'Update Deployment' : 'New Deployment'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workforce Assignment</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Assign Laborer</label>
                  <select 
                    required
                    disabled={!!editingRecord}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                    value={form.labor_id}
                    onChange={e => setForm({...form, labor_id: e.target.value})}
                  >
                    <option value="">Select personnel...</option>
                    {editingRecord && <option value={editingRecord.labor_id}>{editingRecord.labor?.profile?.full_name}</option>}
                    {labors.map(l => (
                      <option key={l.id} value={l.id}>{l.profile?.full_name} ({l.profession})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Project Site</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={form.site_id}
                      onChange={e => setForm({...form, site_id: e.target.value})}
                    >
                      <option value="">Select site...</option>
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Supervisor</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={form.supervisor_id}
                      onChange={e => setForm({...form, supervisor_id: e.target.value})}
                    >
                      <option value="">Select supervisor...</option>
                      {supervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Start Date</label>
                    <input 
                      type="date"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={form.start_date}
                      onChange={e => setForm({...form, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value as any})}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed / Finished</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20"
                >
                  {editingRecord ? 'Update Deployment' : 'Confirm Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
