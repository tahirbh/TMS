import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Truck, 
  Calendar, 
  ShieldCheck, 
  FileCheck,
  Search,
  Camera,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  type: string;
  owner_name: string;
  moi_number: string;
  sequence_number: string;
  registration_expiry: string;
  mvpi_expiry: string;
  insurance_expiry: string;
  image_front: string;
  image_back: string;
  image_left: string;
  image_right: string;
  status: string;
}

const VehicleDetailsPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeImage, setActiveImage] = useState<'front' | 'back' | 'left' | 'right'>('front');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (!error && data) {
      setVehicles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = vehicles.filter(v => 
    v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fleet Master</h1>
          <p className="text-slate-500 text-sm">Enterprise vehicle management and compliance tracking.</p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* List Section */}
        <div className={cn(
          "transition-all duration-500",
          selectedVehicle ? "w-1/3" : "w-full"
        )}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search plate or owner..." 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="divide-y divide-slate-50 max-h-[700px] overflow-auto custom-scrollbar">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse h-20 bg-slate-50/50" />
                ))
              ) : filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:bg-blue-50/30 group",
                    selectedVehicle?.id === vehicle.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{vehicle.registration_number}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">{vehicle.make} {vehicle.model}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      vehicle.status === 'available' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {vehicle.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Section */}
        {selectedVehicle && (
          <div className="flex-1 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden sticky top-0">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                      <Truck size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedVehicle.registration_number}</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{selectedVehicle.owner_name}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedVehicle(null)}>Close</Button>
                </div>

                {/* 4D Image Viewer */}
                <div className="mb-10">
                  <div className="relative aspect-video rounded-[32px] bg-slate-100 overflow-hidden group shadow-inner border-8 border-slate-50">
                    <img 
                      src={selectedVehicle[`image_${activeImage}` as keyof Vehicle] as string || 'https://via.placeholder.com/800x450?text=No+Image'} 
                      alt="Vehicle View"
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
                      {(['front', 'back', 'left', 'right'] as const).map((dir) => (
                        <button
                          key={dir}
                          onClick={() => setActiveImage(dir)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md",
                            activeImage === dir 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                              : "bg-white/70 text-slate-600 hover:bg-white"
                          )}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                    <div className="absolute top-6 right-6 p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white">
                      <Camera size={20} />
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info size={14} /> Basic Identifiers
                    </h3>
                    <div className="space-y-4">
                      <InfoRow label="MOI Number" value={selectedVehicle.moi_number} />
                      <InfoRow label="Sequence" value={selectedVehicle.sequence_number} />
                      <InfoRow label="Year" value={selectedVehicle.year.toString()} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ShieldCheck size={14} /> Compliance Status
                    </h3>
                    <div className="space-y-4">
                      <StatusRow label="Registration" date={selectedVehicle.registration_expiry} />
                      <StatusRow label="MVPI" date={selectedVehicle.mvpi_expiry} />
                      <StatusRow label="Insurance" date={selectedVehicle.insurance_expiry} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <FileCheck size={14} /> Document Vault
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <DocBtn label="Registration" />
                      <DocBtn label="MVPI Card" />
                      <DocBtn label="Policy" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
    <span className="text-sm font-black text-slate-700">{value || '—'}</span>
  </div>
);

const StatusRow = ({ label, date }: { label: string, date: string }) => {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label} Expiry</span>
      <div className="flex items-center gap-2 mt-0.5">
        <Calendar size={14} className="text-slate-400" />
        <span className="text-sm font-black text-slate-700">{date || '—'}</span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      </div>
    </div>
  );
};

const DocBtn = ({ label }: { label: string }) => (
  <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
    <FileCheck size={20} className="text-slate-400 group-hover:text-blue-500 mb-1" />
    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
  </button>
);

export default VehicleDetailsPage;
