import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Package, 
  User as UserIcon, 
  ChevronRight, 
  Plus, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Navigation,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import type { Order, Vehicle } from '../lib/database.types';
import RouteMap from '../components/RouteMap';
import WeatherForecast from '../components/WeatherForecast';

async function geocodeCity(name: string): Promise<[number, number] | null> {
  try {
    // Switching to Open-Meteo Geocoding API for better reliability and CORS support
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    
    if (data?.results?.length) {
      const result = data.results[0];
      return [parseFloat(result.latitude), parseFloat(result.longitude)];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null; 
  }
}

export default function DispatchPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assignment states
  const [assignment, setAssignment] = useState({
    truck_id: '',
    trailer_id: '',
    driver_id: '',
    scheduled_departure: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const [trailers, setTrailers] = useState<any[]>([]);
  const [combinations, setCombinations] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [ordersRes, vehiclesRes, driversRes, trailersRes, combosRes] = await Promise.all([
        supabase.from('orders').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('vehicles').select('*').eq('status', 'available'),
        supabase.from('employees').select('*, profile:profiles!inner(full_name, email, phone, role)').eq('profile.role', 'driver'),
        supabase.from('trailers').select('*').eq('status', 'available'),
        supabase.from('fleet_combinations').select('*')
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (driversRes.data) setDrivers(driversRes.data as any);
      if (trailersRes.data) setTrailers(trailersRes.data);
      if (combosRes.data) setCombinations(combosRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to load dispatch data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-populate logic
  useEffect(() => {
    if (assignment.truck_id) {
      const combo = combinations.find(c => c.vehicle_id === assignment.truck_id);
      if (combo) {
        setAssignment(prev => ({
          ...prev,
          trailer_id: combo.trailer_id || prev.trailer_id,
          driver_id: combo.driver_id || prev.driver_id
        }));
      }
    }
  }, [assignment.truck_id, combinations]);

  // Auto-detect coordinates for selected order if missing
  useEffect(() => {
    if (!selectedOrder) return;

    async function ensureCoordinates() {
      const needsOrigin = !selectedOrder?.pickup_lat || !selectedOrder?.pickup_lng;
      const needsDest = !selectedOrder?.delivery_lat || !selectedOrder?.delivery_lng;

      if (!needsOrigin && !needsDest) return;

      let updatedData: any = {};

      // 1. Try to find coordinates in the "Sites" master table first
      const { data: sites } = await supabase.from('sites').select('name, latitude, longitude') as { data: any[] | null };
      
      if (needsOrigin && selectedOrder?.pickup_location) {
        const siteMatch = (sites || []).find(s => s.name?.toLowerCase() === selectedOrder.pickup_location.toLowerCase());
        if (siteMatch?.latitude && siteMatch?.longitude) {
          updatedData.pickup_lat = siteMatch.latitude;
          updatedData.pickup_lng = siteMatch.longitude;
        } else {
          // Fallback to external API
          const coords = await geocodeCity(selectedOrder.pickup_location);
          if (coords) {
            updatedData.pickup_lat = coords[0];
            updatedData.pickup_lng = coords[1];
          }
        }
      }

      if (needsDest && selectedOrder?.delivery_location) {
        const siteMatch = (sites || []).find(s => s.name?.toLowerCase() === selectedOrder.delivery_location.toLowerCase());
        if (siteMatch?.latitude && siteMatch?.longitude) {
          updatedData.delivery_lat = siteMatch.latitude;
          updatedData.delivery_lng = siteMatch.longitude;
        } else {
          // Fallback to external API
          const coords = await geocodeCity(selectedOrder.delivery_location);
          if (coords) {
            updatedData.delivery_lat = coords[0];
            updatedData.delivery_lng = coords[1];
          }
        }
      }

      if (Object.keys(updatedData).length > 0 && selectedOrder) {
        // Update DB
        await (supabase.from('orders') as any).update(updatedData).eq('id', selectedOrder.id);
        
        // Update Local State
        setSelectedOrder(prev => prev ? { ...prev, ...updatedData } : null);
        
        // Refresh list
        fetchData();
      }
    }

    ensureCoordinates();
  }, [selectedOrder?.id]);

  async function handleDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder || !assignment.truck_id || !assignment.driver_id || !user) return;

    setDispatching(true);
    setError(null);

    const driverId = assignment.driver_id;

    try {
      // 1. Create the Trip
      const { data: trip, error: tripError } = await (supabase.from('trips') as any).insert({
        trip_number: 'TRP-' + Math.floor(100000 + Math.random() * 900000),
        order_id: selectedOrder.id,
        vehicle_id: assignment.truck_id,
        trailer_id: assignment.trailer_id || null, // Pass trailer ID
        driver_id: driverId, 
        dispatcher_id: user.id,
        status: 'assigned',
        origin_name: selectedOrder.pickup_location,
        origin_lat: (selectedOrder as any).pickup_lat,
        origin_lng: (selectedOrder as any).pickup_lng,
        destination_name: selectedOrder.delivery_location,
        destination_lat: (selectedOrder as any).delivery_lat,
        destination_lng: (selectedOrder as any).delivery_lng,
        route_distance_km: 0,
        scheduled_departure: assignment.scheduled_departure,
      }).select().single();

      if (tripError) throw tripError;

      if (trip) {
        // 2. Update Order status
        await (supabase.from('orders') as any).update({ status: 'assigned', assigned_vehicles: 1 }).eq('id', selectedOrder.id);
        
        // 3. Update Vehicle status
        await (supabase.from('vehicles') as any).update({ status: 'in_use', current_trip_id: trip.id, current_driver_id: assignment.driver_id }).eq('id', assignment.truck_id);
        
        // 4. Update Trailer status if assigned
        if (assignment.trailer_id) {
          await (supabase.from('trailers') as any).update({ status: 'in_use' }).eq('id', assignment.trailer_id);
        }

        // 5. Update Driver status inside unified employees table
        await (supabase.from('employees') as any).update({ status: 'on_trip' }).eq('id', driverId);

        setIsModalOpen(false);
        setSelectedOrder(null);
        setAssignment({ truck_id: '', trailer_id: '', driver_id: '', scheduled_departure: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
        await fetchData();
      }
    } catch (err: any) {
      console.error('Dispatch error:', err);
      setError(err.message || 'Failed to finalize dispatch. This may be a temporary network issue.');
    } finally {
      setDispatching(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dispatch Console</h1>
          <p className="text-slate-500 text-sm font-medium">Assign resources to pending transport orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Orders Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
              <Package size={16} className="text-blue-600" /> Pending Orders
            </h2>
            <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{orders.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100" />)
            ) : orders.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400 font-medium italic">
                All clear! No pending orders.
              </div>
            ) : orders.map(order => (
              <div 
                key={order.id} 
                className={`bg-white rounded-[2rem] border-2 transition-all p-6 group cursor-pointer ${selectedOrder?.id === order.id ? 'border-blue-600 shadow-xl shadow-blue-600/10' : 'border-slate-100 hover:border-slate-300'}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${order.priority === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {order.priority}
                    </span>
                    <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">{order.order_number}</h3>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
                  >
                    Dispatch
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Navigation size={14} className="text-slate-300" />
                    {order.pickup_location}
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <CheckCircle2 size={14} />
                    {order.delivery_location}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Truck size={14} className="text-slate-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.trailer_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Package size={14} className="text-slate-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.material_type} • {order.quantity_tons}T</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Sidebar */}
        <div className="space-y-6">
          {selectedOrder && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <RouteMap 
                shipment={{
                  id: selectedOrder.id,
                  pickup_lat: selectedOrder.pickup_lat || null,
                  pickup_lng: selectedOrder.pickup_lng || null,
                  pickup_warehouse: selectedOrder.pickup_location,
                  dest_lat: selectedOrder.delivery_lat || null,
                  dest_lng: selectedOrder.delivery_lng || null,
                  destination: selectedOrder.delivery_location
                }}
              />
              <WeatherForecast 
                shipment={{
                  id: selectedOrder.id,
                  pickup_lat: selectedOrder.pickup_lat || null,
                  pickup_lng: selectedOrder.pickup_lng || null,
                  pickup_warehouse: selectedOrder.pickup_location,
                  dest_lat: selectedOrder.delivery_lat || null,
                  dest_lng: selectedOrder.delivery_lng || null,
                  destination: selectedOrder.delivery_location,
                  dispatch_date: assignment.scheduled_departure ? assignment.scheduled_departure.split('T')[0] : null
                }}
              />
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" /> Available Units
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {vehicles.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No available units</p>
              ) : vehicles.map(v => (
                <div key={v.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{v.registration_number}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{v.type} • {v.capacity_tons}T</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <UserIcon size={16} className="text-blue-500" /> Active Drivers
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {drivers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No available drivers</p>
              ) : drivers.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-blue-600 text-sm shadow-sm">
                    {d.profile?.full_name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{d.profile?.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{d.status || 'Available'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Navigation size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest">Assign Mission</h3>
                  <p className="text-[10px] font-bold text-white/70">Resource Combination for {selectedOrder.order_number}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleDispatch} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Truck Head / Unit</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={assignment.truck_id}
                    onChange={e => setAssignment({...assignment, truck_id: e.target.value})}
                  >
                    <option value="">Select Primary Unit...</option>
                    {vehicles.filter(v => v.type === 'truck' || v.type === 'van').map(v => (
                      <option key={v.id} value={v.id}>{v.registration_number} ({v.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Trailer / Attachment</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={assignment.trailer_id}
                    onChange={e => setAssignment({...assignment, trailer_id: e.target.value})}
                  >
                    <option value="">No Trailer (Single Unit)</option>
                    {trailers.map(t => (
                      <option key={t.id} value={t.id}>{t.plate_number} ({t.type.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Assigned Driver</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={assignment.driver_id}
                    onChange={e => setAssignment({...assignment, driver_id: e.target.value})}
                  >
                    <option value="">Select Driver...</option>
                    {drivers.filter(d => d.status === 'available').map(d => (
                      <option key={d.id} value={d.id}>{d.profile?.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Scheduled Start</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="datetime-local" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={assignment.scheduled_departure}
                      onChange={e => setAssignment({...assignment, scheduled_departure: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={!assignment.truck_id || !assignment.driver_id || dispatching}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {dispatching ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  {dispatching ? 'Finalizing Dispatch...' : 'Finalize & Dispatch Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}
