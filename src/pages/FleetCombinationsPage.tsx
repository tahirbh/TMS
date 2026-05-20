import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Truck,
  Users,
  Settings2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function FleetCombinationsPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [combinations, setCombinations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    vehicle_id: '',
    trailer_id: '',
    driver_id: '',
    is_active: true
  });

  async function load() {
    setLoading(true);
    const [combos, vRes, tRes, dRes] = await Promise.all([
      supabase.from('fleet_combinations').select('*, vehicle:vehicles(*), trailer:trailers(*), driver:profiles(*)'),
      supabase.from('vehicles').select('*').eq('status', 'available'),
      supabase.from('trailers').select('*').eq('status', 'available'),
      supabase.from('profiles').select('*').eq('role', 'driver')
    ]);

    setCombinations(combos.data ?? []);
    setVehicles(vRes.data ?? []);
    setTrailers(tRes.data ?? []);
    setDrivers(dRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Calculate Idle Assets (assets not linked to any active combination)
  const idleTrucks = vehicles.filter(v => !combinations.some(c => c.vehicle_id === v.id));
  const idleTrailers = trailers.filter(t => !combinations.some(c => c.trailer_id === t.id));
  const idleDrivers = drivers.filter(d => !combinations.some(c => c.driver_id === d.id));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const vehicleId = formData.vehicle_id && formData.vehicle_id !== 'none' ? formData.vehicle_id : null;
      const trailerId = formData.trailer_id && formData.trailer_id !== 'none' ? formData.trailer_id : null;
      const driverId = formData.driver_id && formData.driver_id !== 'none' ? formData.driver_id : null;

      // Ensure at least one asset is selected
      if (!vehicleId && !trailerId && !driverId) {
        throw new Error('At least one asset (Truck, Trailer, or Driver) must be assigned.');
      }

      const selectedTruck = vehicles.find(v => v.id === vehicleId);
      const selectedTrailer = trailers.find(t => t.id === trailerId);
      
      const truckPart = selectedTruck?.registration_number || 'None';
      const trailerPart = selectedTrailer?.plate_number || 'None';
      const dynamicName = `${truckPart}/${trailerPart}`;

      const { error } = await supabase.from('fleet_combinations').insert({
        vehicle_id: vehicleId,
        trailer_id: trailerId,
        driver_id: driverId,
        name: dynamicName,
        is_active: formData.is_active
      } as any);
      
      if (error) throw error;
      
      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save combination');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Break Fleet Combination',
      message: 'Are you sure you want to break this fleet combination? This will unlink the truck, trailer, and driver.',
      confirmText: 'Break Link',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('fleet_combinations').delete().eq('id', id);
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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Asset Combinations</h1>
          <p className="text-slate-500 text-sm font-medium">Link Trucks, Trailers, and Drivers for rapid dispatch</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', vehicle_id: '', trailer_id: '', driver_id: '', is_active: true });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
        >
          <Plus size={18} />
          Link New Unit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Main Combinations Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
              ))
            ) : combinations.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                <LinkIcon size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">No active combinations found</p>
              </div>
            ) : (
              combinations.map(combo => (
                <div key={combo.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 relative">
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button 
                      onClick={() => handleDelete(combo.id)}
                      className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{combo.name || 'Fixed Combination'}</h3>
                        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Active Ready</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Truck size={20} className={combo.vehicle ? "text-blue-500" : "text-slate-300"} />
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vehicle</p>
                          <p className={`text-xs font-bold ${combo.vehicle ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                            {combo.vehicle?.registration_number || 'None / Unassigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Settings2 size={20} className={combo.trailer ? "text-orange-500" : "text-slate-300"} />
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trailer</p>
                          <p className={`text-xs font-bold ${combo.trailer ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                            {combo.trailer?.plate_number || 'None / Unassigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Users size={20} className={combo.driver ? "text-green-500" : "text-slate-300"} />
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assigned Driver</p>
                          <p className={`text-xs font-bold ${combo.driver ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                            {combo.driver?.full_name || 'None / Unassigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit ID: {combo.id.substring(0, 8)}</span>
                    <LinkIcon size={14} className="text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Unassigned Assets (Idle Since Today) Roster */}
        <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-150 backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-orange-500 animate-pulse" />
              Idle Roster
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Assets Unassigned Since Today</p>
          </div>

          <div className="space-y-4">
            
            {/* Idle Trucks */}
            <div className="space-y-2">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Trucks ({idleTrucks.length})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </h3>
              {idleTrucks.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic px-1">All trucks are active.</p>
              ) : (
                idleTrucks.map(truck => (
                  <div key={truck.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow transition">
                    <div className="flex items-center gap-3">
                      <Truck size={16} className="text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{truck.registration_number}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{truck.make} {truck.model}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Idle Today</span>
                  </div>
                ))
              )}
            </div>

            {/* Idle Trailers */}
            <div className="space-y-2">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Trailers ({idleTrailers.length})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </h3>
              {idleTrailers.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic px-1">All trailers are active.</p>
              ) : (
                idleTrailers.map(trailer => (
                  <div key={trailer.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow transition">
                    <div className="flex items-center gap-3">
                      <Settings2 size={16} className="text-orange-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{trailer.plate_number}</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase">{trailer.type}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Idle Today</span>
                  </div>
                ))
              )}
            </div>

            {/* Idle Drivers */}
            <div className="space-y-2">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Drivers ({idleDrivers.length})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </h3>
              {idleDrivers.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic px-1">All drivers are active.</p>
              ) : (
                idleDrivers.map(driver => (
                  <div key={driver.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow transition">
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-green-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{driver.full_name}</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase">{driver.role}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Idle Today</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Link Mission Unit</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fleet Asset Association</p>
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Truck</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none appearance-none"
                      value={formData.vehicle_id}
                      onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                    >
                      <option value="none">None / Unassigned (Idle)</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.make}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Trailer</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none appearance-none"
                      value={formData.trailer_id}
                      onChange={e => setFormData({...formData, trailer_id: e.target.value})}
                    >
                      <option value="none">None / Unassigned (Idle)</option>
                      {trailers.map(t => <option key={t.id} value={t.id}>{t.plate_number} - {t.type.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Driver</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none appearance-none"
                      value={formData.driver_id}
                      onChange={e => setFormData({...formData, driver_id: e.target.value})}
                    >
                      <option value="none">None / Unassigned (Idle)</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
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
                  {saving ? <Loader2 className="animate-spin" size={18} /> : 'Establish Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
