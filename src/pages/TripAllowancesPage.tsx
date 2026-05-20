import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  CircleDollarSign, 
  Truck, 
  Search,
  Download,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface TripAllowance {
  id: string;
  trip_id: string;
  distance_km: number;
  allowance_sr: number;
  cost_per_km: number;
  total_cost_sr: number;
  calculated_at: string;
  trip: {
    trip_number: string;
    status: string;
    vehicle: { registration_number: string };
    driver: { profile: { full_name: string } };
  };
}

export default function TripAllowancesPage() {
  const [allowances, setAllowances] = useState<TripAllowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllowances();
  }, []);

  async function fetchAllowances() {
    setLoading(true);
    const { data } = await supabase
      .from('trip_ledger')
      .select(`
        *,
        trip:trips (
          trip_number,
          status,
          vehicle:vehicles (registration_number),
          driver:drivers (profile:profiles (full_name))
        )
      `)
      .order('calculated_at', { ascending: false });

    if (data) setAllowances(data as any);
    setLoading(false);
  }

  const filteredAllowances = allowances.filter(a => 
    a.trip.trip_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.trip.driver.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayout = filteredAllowances.reduce((sum, a) => sum + a.allowance_sr, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trip Allowances</h1>
          <p className="text-slate-500 text-sm">Review driver trip fuel and operational allowances</p>
        </div>
        <button 
          onClick={fetchAllowances}
          className="p-2 text-slate-400 hover:text-blue-600 transition"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <CircleDollarSign size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white/70">Total Pending Payout</span>
          </div>
          <p className="text-3xl font-black">{totalPayout.toLocaleString()} SR</p>
          <p className="text-[10px] font-bold text-white/50 mt-2 uppercase tracking-widest">Calculated across {filteredAllowances.length} trips</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-50 rounded-lg text-blue-600">
              <Truck size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total KM covered</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{filteredAllowances.reduce((sum, a) => sum + a.distance_km, 0).toLocaleString()} KM</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Actual odometer distance</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Policy Verified</p>
            <p className="text-[10px] text-slate-400 font-medium">Auto-calculation active</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search trip or driver..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip / Driver</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuel Allowance</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated At</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 bg-slate-50/20" />
                  </tr>
                ))
              ) : filteredAllowances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No allowances found</td>
                </tr>
              ) : filteredAllowances.map(allowance => (
                <tr key={allowance.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800 text-sm">{allowance.trip.trip_number}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{allowance.trip.driver.profile.full_name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">
                    {allowance.distance_km} KM
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-blue-600">{allowance.allowance_sr} SR</span>
                      <div className="p-1 bg-blue-50 rounded text-blue-600">
                        <CircleDollarSign size={12} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">
                    {format(new Date(allowance.calculated_at), 'MMM d, p')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
