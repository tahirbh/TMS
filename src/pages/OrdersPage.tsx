import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, X, Loader2, Edit, Trash2, Calendar, Truck, MapPin } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { formatDate } from '../lib/utils';
import { format } from 'date-fns';

type Order = Database['public']['Tables']['orders']['Row'] & {
  site?: { name: string };
  creator?: { full_name: string };
};
type Site = Database['public']['Tables']['sites']['Row'] & {
  supervisor?: { full_name: string } | null;
};

const STATUS_OPTIONS = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'] as const;
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'] as const;

export default function OrdersPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    site_id: '',
    material_type: '',
    quantity_tons: 0,
    priority: 'normal',
    status: 'pending',
    pickup_location: '',
    delivery_location: '',
    notes: '',
    trailer_type: 'standard',
    required_date: format(new Date(), 'yyyy-MM-dd'),
    truck_count: 1
  });

  async function loadData() {
    setLoading(true);
    const [ordersRes, sitesRes] = await Promise.all([
      supabase.from('orders').select('*, site:sites(name), creator:profiles!orders_created_by_fkey(full_name)').order('created_at', { ascending: false }),
      supabase.from('sites').select('*, supervisor:profiles(full_name)').order('name')
    ]);
    
    if (ordersRes.data) setOrders(ordersRes.data as unknown as Order[]);
    if (sitesRes.data) setSites(sitesRes.data as unknown as Site[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        site_id: order.site_id,
        material_type: order.material_type,
        quantity_tons: order.quantity_tons,
        priority: order.priority,
        status: order.status,
        pickup_location: order.pickup_location,
        delivery_location: order.delivery_location,
        notes: order.notes,
        trailer_type: order.trailer_type || 'standard',
        required_date: order.required_date || format(new Date(), 'yyyy-MM-dd'),
        truck_count: 1
      });
    } else {
      setEditingOrder(null);
      setFormData({
        site_id: sites.length > 0 ? sites[0].id : '',
        material_type: '',
        quantity_tons: 0,
        priority: 'normal',
        status: 'pending',
        pickup_location: '',
        delivery_location: '',
        notes: '',
        trailer_type: 'standard',
        required_date: format(new Date(), 'yyyy-MM-dd'),
        truck_count: 1
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);

    const basePayload = {
      site_id: formData.site_id,
      material_type: formData.material_type,
      quantity_tons: formData.quantity_tons,
      priority: formData.priority,
      status: formData.status,
      pickup_location: formData.pickup_location,
      delivery_location: formData.delivery_location,
      notes: formData.notes,
      trailer_type: formData.trailer_type,
      required_date: formData.required_date,
      required_vehicles: 1, // Since we create one order per truck
      assigned_vehicles: 0,
    };

    try {
      if (editingOrder) {
        const { error } = await supabase.from('orders').update(basePayload as never).eq('id', editingOrder.id);
        if (error) throw error;
      } else {
        // Batch creation logic
        const inserts = Array.from({ length: formData.truck_count }).map((_, i) => ({
          ...basePayload,
          order_number: `ORD-${Math.floor(100000 + Math.random() * 900000)}${formData.truck_count > 1 ? `-${i+1}` : ''}`,
          created_by: profile.id
        }));

        const { error } = await supabase.from('orders').insert(inserts as any);
        if (error) throw error;
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Operational Order',
      message: 'Are you sure you want to delete this order? This will also remove any linked mission logs and financial records.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      // 1. Get all linked trip IDs
      const { data: linkedTrips } = await supabase.from('trips').select('id').eq('order_id', id);
      const tripIds = (linkedTrips as any[])?.map(t => t.id) || [];

      // 2. Delete linked trip ledgers
      if (tripIds.length > 0) {
        await supabase.from('trip_ledger').delete().in('trip_id', tripIds);
      }

      // 3. Delete linked trips
      await supabase.from('trips').delete().eq('order_id', id);
      
      // 4. Delete the order
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert(`Deletion Error: ${err.message}`);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) || 
    o.material_type.toLowerCase().includes(search.toLowerCase()) ||
    o.site?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Orders Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage transport requests and vehicle deployment</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
        >
          <Plus size={18} />
          Create New Order
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search orders..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">{order.order_number}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {order.pickup_location}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {order.delivery_location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-700">{order.material_type}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{order.quantity_tons} Tons • {order.trailer_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                            order.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-600'}`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${order.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                            order.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                            'bg-slate-50 text-slate-400'}`}
                        >
                          {order.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                          <Trash2 size={16} />
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

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="font-black uppercase tracking-widest text-sm">{editingOrder ? `Edit Order` : 'New Transport Order'}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Entry System</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                      <MapPin size={12} className="text-emerald-500" /> Loading Site (Pickup)
                    </label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={formData.pickup_location} 
                      onChange={e => {
                        const val = e.target.value;
                        const matchingSite = sites.find(s => s.name === val);
                        setFormData({
                          ...formData,
                          pickup_location: val,
                          site_id: matchingSite ? matchingSite.id : formData.site_id
                        });
                      }}
                    >
                      <option value="">Select loading site...</option>
                      {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      <option value="custom">-- Custom Location --</option>
                    </select>
                    {(() => {
                      const matchedSite = sites.find(s => s.name === formData.pickup_location);
                      const supervisorName = matchedSite?.supervisor?.full_name;
                      if (!supervisorName) return null;
                      return (
                        <div className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          👤 Site Supervisor: {supervisorName}
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                      <MapPin size={12} className="text-blue-500" /> Offloading Site (Delivery)
                    </label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={formData.delivery_location} 
                      onChange={e => setFormData({...formData, delivery_location: e.target.value})}
                    >
                      <option value="">Select offloading site...</option>
                      {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      <option value="custom">-- Custom Location --</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Associated Project</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.site_id} onChange={e => setFormData({...formData, site_id: e.target.value})}
                  >
                    <option value="" disabled>Link to site project...</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Date of Loading</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={formData.required_date} onChange={e => setFormData({...formData, required_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Material Type</label>
                  <input 
                    type="text" required placeholder="e.g. Steel Coils"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.material_type} onChange={e => setFormData({...formData, material_type: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Quantity (Tons)</label>
                  <input 
                    type="number" step="any" required min={0.1}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.quantity_tons} onChange={e => setFormData({...formData, quantity_tons: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Trailer Requirement</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.trailer_type} onChange={e => setFormData({...formData, trailer_type: e.target.value as any})}
                  >
                    <option value="standard">Standard / Curtainside</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="tanker">Tanker</option>
                    <option value="refrigerated">Refrigerated</option>
                    <option value="curtainsider">Curtainsider</option>
                  </select>
                </div>

                {!editingOrder && (
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                      <Truck size={14} className="text-blue-600" /> Number of Trucks
                    </label>
                    <input 
                      type="number" required min={1} max={50}
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm font-black text-blue-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={formData.truck_count} onChange={e => setFormData({...formData, truck_count: parseInt(e.target.value)})}
                    />
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">System will generate {formData.truck_count} individual orders.</p>
                  </div>
                )}

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Priority</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all capitalize"
                      value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                    >
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Initial Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all capitalize"
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Instructions / Notes</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  rows={2}
                  placeholder="Additional transport details..."
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={saving || !profile}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingOrder ? 'Update Order' : `Generate ${formData.truck_count} Order${formData.truck_count > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
