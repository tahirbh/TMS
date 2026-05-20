import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  User, 
  Truck, 
  Building2, 
  ShieldAlert, 
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const RelationalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    employees: any[],
    vehicles: any[],
    sponsors: any[]
  }>({ employees: [], vehicles: [], sponsors: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);

    try {
      // Perform parallel searches
      const [empRes, vehRes, sponRes] = await Promise.all([
        supabase.from('profiles').select('*, employees(*)').ilike('full_name', `%${query}%`),
        supabase.from('vehicles').select('*').or(`registration_number.ilike.%${query}%,moi_number.ilike.%${query}%`),
        supabase.from('sponsors').select('*').or(`name.ilike.%${query}%,moi.ilike.%${query}%`)
      ]);

      setResults({
        employees: empRes.data || [],
        vehicles: vehRes.data || [],
        sponsors: sponRes.data || []
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Relational Intelligence Search</h1>
        <p className="text-slate-500">Search across employees, vehicles, sponsors, and documents instantly.</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-white rounded-[28px] shadow-2xl p-2 border border-slate-100">
          <Search className="ml-4 text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Search Name, Iqama, Plate Number, or ID..." 
            className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg font-medium text-slate-800 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            className="rounded-[20px] px-8 py-7 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Engine'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-12 pb-20">
          {/* Employee Results */}
          {results.employees.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={16} /> Employees Found ({results.employees.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.employees.map(emp => (
                  <ResultCard 
                    key={emp.id}
                    title={emp.full_name}
                    subtitle={`Iqama: ${emp.employees?.[0]?.iqama_number || '—'}`}
                    icon={User}
                    color="blue"
                    badge={emp.role}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Vehicle Results */}
          {results.vehicles.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Truck size={16} /> Vehicles Found ({results.vehicles.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.vehicles.map(veh => (
                  <ResultCard 
                    key={veh.id}
                    title={veh.registration_number}
                    subtitle={`${veh.make} ${veh.model} | Owner: ${veh.owner_name || '—'}`}
                    icon={Truck}
                    color="indigo"
                    badge={veh.type}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sponsor Results */}
          {results.sponsors.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={16} /> Sponsors Found ({results.sponsors.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.sponsors.map(spon => (
                  <ResultCard 
                    key={spon.id}
                    title={spon.name}
                    subtitle={`MOI: ${spon.moi || '—'} | Status: ${spon.status}`}
                    icon={Building2}
                    color="emerald"
                    badge="Sponsor"
                  />
                ))}
              </div>
            </section>
          )}

          {query && !loading && results.employees.length === 0 && results.vehicles.length === 0 && results.sponsors.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No relational data matched your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ title, subtitle, icon: Icon, color, badge }: any) => (
  <div className="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer flex items-center gap-4">
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
      color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
      color === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
      "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
    )}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-slate-900 truncate">{title}</h4>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest">{badge}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{subtitle}</p>
    </div>
    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
      <ArrowRight size={16} />
    </div>
  </div>
);

export default RelationalSearch;
