import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  AlertTriangle, 
  Search, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Wrench,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import type { BreakdownRequest, Vehicle, Profile } from '../lib/database.types';

export default function BreakdownPage() {
  const [requests, setRequests] = useState<(BreakdownRequest & { vehicle: Vehicle, reporter: Profile })[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    vehicle_id: '',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'urgent',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('breakdown_requests')
      .select('*, vehicle:vehicles(*), reporter:profiles(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data as any);
    }

    const { data: vData } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available');
    
    if (vData) setVehicles(vData);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Create breakdown request
    const { error: reqError } = await (supabase.from('breakdown_requests') as any).insert({
      vehicle_id: form.vehicle_id,
      description: form.description,
      priority: form.priority,
      reported_by: user.id,
      status: 'pending'
    });

    if (!reqError) {
      // 2. Update vehicle status to maintenance
      await (supabase.from('vehicles') as any).update({ status: 'maintenance' }).eq('id', form.vehicle_id);
      
      setIsModalOpen(false);
      setForm({ vehicle_id: '', description: '', priority: 'normal' });
      fetchData();
    }
  }

  async function resolveBreakdown(requestId: string, vehicleId: string) {
    const { error } = await (supabase.from('breakdown_requests') as any)
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (!error) {
      // Set vehicle back to available
      await (supabase.from('vehicles') as any).update({ status: 'available' }).eq('id', vehicleId);
      fetchData();
    }
  }

  const filteredRequests = requests.filter(r => 
    r.vehicle.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fleet Maintenance</h1>
          <p className="text-slate-500">Track and resolve vehicle breakdowns</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/20 font-bold"
        >
          <AlertTriangle size={18} />
          Report Breakdown
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Under Repair</p>
            <h3 className="text-2xl font-black text-slate-800">
              {requests.filter(r => r.status !== 'resolved').length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Response</p>
            <h3 className="text-2xl font-black text-slate-800">
              {requests.filter(r => r.status === 'pending').length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Resolved Today</p>
            <h3 className="text-2xl font-black text-slate-800">
              {requests.filter(r => r.status === 'resolved' && r.resolved_at?.startsWith(format(new Date(), 'yyyy-MM-dd'))).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by truck number or issue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-sm font-bold">
              <Filter size={18} />
              Filter Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Issue Description</th>
                <th className="px-6 py-4">Priority & Status</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="h-20 bg-slate-50/20" /></tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">No active maintenance logs found.</td></tr>
              ) : filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${req.status === 'resolved' ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-600'}`}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{req.vehicle.registration_number}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{req.vehicle.make} {req.vehicle.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-slate-700 font-medium line-clamp-2">{req.description}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={10} />
                        {format(new Date(req.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        req.priority === 'urgent' || req.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {req.priority}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        req.status === 'resolved' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'resolved' ? 'bg-green-600' : 'bg-orange-600 animate-pulse'}`} />
                        {req.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                        {req.reporter.full_name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{req.reporter.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status !== 'resolved' && (
                      <button 
                        onClick={() => resolveBreakdown(req.id, req.vehicle_id)}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-green-600 hover:text-white hover:border-green-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto"
                      >
                        <CheckCircle2 size={14} />
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} />
                <h3 className="font-black uppercase tracking-wider">Report Breakdown</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5">Affected Vehicle</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10"
                  value={form.vehicle_id}
                  onChange={e => setForm({...form, vehicle_id: e.target.value})}
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registration_number} - {v.make} {v.model}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Only "Available" vehicles are shown. If a trip is active, cancel the trip first.</p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5">Issue Details</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10"
                  placeholder="Describe the mechanical failure, location, and current state..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'normal', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({...form, priority: p})}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                        form.priority === p 
                        ? 'bg-red-600 border-red-600 text-white' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-3"
                >
                  <Wrench size={20} />
                  Submit Maintenance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
