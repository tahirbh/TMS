import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { Search, X, Loader2, Edit, Users, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import DocumentBrowser from '../components/DocumentBrowser';

interface Driver {
  id: string;
  license_number: string | null;
  status: string;
  iqama_number: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function DriversPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    license_number: '',
    status: 'available'
  });

  async function loadDrivers() {
    setLoading(true);
    const { data } = await supabase
      .from('employees')
      .select('*, profile:profiles!inner(full_name, email, phone, role)')
      .eq('profile.role', 'driver');
    
    if (data) setDrivers(data as unknown as Driver[]);
    setLoading(false);
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleOpenModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      license_number: driver.license_number || '',
      status: driver.status
    });
    setShowModal(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          license_number: formData.license_number,
          status: formData.status
        } as never)
        .eq('id', editingDriver.id);

      if (error) throw error;

      setShowModal(false);
      await loadDrivers();
    } catch (err: any) {
      setError(err.message || 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Driver Profile',
      message: 'Are you sure you want to delete this driver? This will permanently delete their profile, employee record, and all associated operational logs.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      // 1. Delete mobilization references
      await supabase.from('labor_mobilization').delete().eq('labor_id', id);
      // 2. Delete driver's employee details
      await supabase.from('employees').delete().eq('id', id);
      // 3. Delete driver's profile
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      
      setSelectedDriver(null);
      await loadDrivers();
    } catch (err: any) {
      alert(`Deletion Error: ${err.message}`);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    d.license_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
          <p className="text-slate-500 text-sm">Manage fleet drivers, licenses, and availability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search drivers..."
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
                  <th className="px-6 py-3 font-medium">Driver</th>
                  <th className="px-6 py-3 font-medium">License</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading drivers...
                    </td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No drivers found
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map(driver => (
                    <tr 
                      key={driver.id} 
                      onClick={() => setSelectedDriver(prev => prev?.id === driver.id ? null : driver)}
                      className={cn(
                        "hover:bg-slate-50 transition cursor-pointer",
                        selectedDriver?.id === driver.id && "bg-blue-50"
                      )}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-xs">
                            {driver.profile?.full_name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{driver.profile?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{driver.profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-600">{driver.license_number}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${driver.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 
                            driver.status === 'on_trip' ? 'bg-blue-100 text-blue-700' : 
                            'bg-amber-100 text-amber-700'}`}
                        >
                          {driver.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selectedDriver ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 sticky top-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg">
                    {selectedDriver.profile?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedDriver.profile?.full_name}</h2>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{selectedDriver.license_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(selectedDriver)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(selectedDriver.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Delete Driver">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{selectedDriver.profile?.phone || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-slate-700 mt-1 capitalize">{selectedDriver.status.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <DocumentBrowser 
                  entityType="employee" 
                  entityId={selectedDriver.id} 
                  title="Driver Documents" 
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center border-dashed border-2">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">Select a driver to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Driver Modal */}
      {showModal && editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Edit Driver: {editingDriver.profile?.full_name}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono uppercase"
                  value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value.toUpperCase()})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="on_leave">On Leave</option>
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
                  type="submit" disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
