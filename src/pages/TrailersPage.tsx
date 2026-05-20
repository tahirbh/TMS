import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { getStatusColor } from '../lib/utils';
import {
  Search,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Settings2
} from 'lucide-react';

const STATUS_OPTIONS = ['all', 'available', 'in_use', 'maintenance', 'inactive'] as const;
const TYPE_OPTIONS = ['flatbed', 'curtainside', 'reefer', 'lowbed', 'tipper', 'tanker'] as const;

export default function TrailersPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTrailer, setEditingTrailer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    type: 'flatbed',
    capacity_tons: 0,
    status: 'available'
  });

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('trailers')
      .select('*')
      .order('plate_number');
    setTrailers(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = trailers;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.plate_number.toLowerCase().includes(q) || t.type.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, trailers]);

  const handleOpenModal = (trailer?: any) => {
    if (trailer) {
      setEditingTrailer(trailer);
      setFormData({
        plate_number: trailer.plate_number,
        type: trailer.type,
        capacity_tons: trailer.capacity_tons || 0,
        status: trailer.status
      });
    } else {
      setEditingTrailer(null);
      setFormData({
        plate_number: '',
        type: 'flatbed',
        capacity_tons: 0,
        status: 'available'
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingTrailer) {
        const { error } = await (supabase.from('trailers') as any).update(formData as any).eq('id', editingTrailer.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('trailers') as any).insert(formData as any);
        if (error) throw error;
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save trailer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Trailer Asset',
      message: 'Are you sure you want to delete this trailer? This will permanently remove the trailer from your active assets database.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('trailers').delete().eq('id', id);
      if (error) throw error;
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Trailer Assets</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and track heavy vehicle trailer units</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
        >
          <Plus size={18} />
          Add Trailer
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by plate or type..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${statusFilter === opt ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {opt.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trailer Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specification</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-xl" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">No trailer assets found</td>
                </tr>
              ) : (
                filtered.map(trailer => (
                  <tr key={trailer.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                          <Settings2 size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight uppercase">{trailer.plate_number}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{trailer.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                      {trailer.capacity_tons} Tons Capacity
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(trailer.status)}`}>
                        {trailer.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(trailer)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(trailer.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">
                    {editingTrailer ? 'Modify Asset' : 'Register New Trailer'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trailer Inventory System</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-3 hover:bg-slate-200 rounded-2xl transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Plate Number</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. T-12345"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                      value={formData.plate_number}
                      onChange={e => setFormData({...formData, plate_number: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Trailer Type</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition appearance-none"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Capacity (Tons)</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                      value={formData.capacity_tons}
                      onChange={e => setFormData({...formData, capacity_tons: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Status</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      {STATUS_OPTIONS.filter(o => o !== 'all').map(opt => (
                        <option key={opt} value={opt}>{opt.toUpperCase().replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : (editingTrailer ? 'Update Asset' : 'Register Asset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
