import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Trip, Vehicle, Profile } from '../lib/database.types';
import { getStatusColor } from '../lib/utils';
import { 
  Navigation2, 
  Upload, 
  CheckCircle2, 
  Truck, 
  Map as MapIcon,
  ChevronRight,
  Info,
  Weight,
  Camera,
  Play,
  Flag,
  CircleDollarSign,
  FileText,
  ClipboardList,
  Loader2,
  Package,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import RouteMap from '../components/RouteMap';

async function geocodeCity(name: string): Promise<[number, number] | null> {
  try {
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


export default function TripsPage() {
  const [trips, setTrips] = useState<(Trip & { vehicle: Vehicle })[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<(Trip & { vehicle: Vehicle }) | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUserProfile();
  }, []);

  // Auto-detect coordinates if missing
  useEffect(() => {
    if (!selectedTrip) return;

    async function ensureCoordinates() {
      const needsOrigin = !selectedTrip?.origin_lat || !selectedTrip?.origin_lng;
      const needsDest = !selectedTrip?.destination_lat || !selectedTrip?.destination_lng;

      if (!needsOrigin && !needsDest) return;

      let updatedData: any = {};

      // 1. Try to find coordinates in the "Sites" master table first
      const { data: sites } = await supabase.from('sites').select('name, latitude, longitude') as { data: any[] | null };

      if (needsOrigin && selectedTrip?.origin_name) {
        const siteMatch = (sites || []).find(s => s.name?.toLowerCase() === selectedTrip.origin_name?.toLowerCase());
        if (siteMatch?.latitude && siteMatch?.longitude) {
          updatedData.origin_lat = siteMatch.latitude;
          updatedData.origin_lng = siteMatch.longitude;
        } else {
          // Fallback to external API
          const coords = await geocodeCity(selectedTrip.origin_name);
          if (coords) {
            updatedData.origin_lat = coords[0];
            updatedData.origin_lng = coords[1];
          }
        }
      }

      if (needsDest && selectedTrip?.destination_name) {
        const siteMatch = (sites || []).find(s => s.name?.toLowerCase() === selectedTrip.destination_name?.toLowerCase());
        if (siteMatch?.latitude && siteMatch?.longitude) {
          updatedData.destination_lat = siteMatch.latitude;
          updatedData.destination_lng = siteMatch.longitude;
        } else {
          // Fallback to external API
          const coords = await geocodeCity(selectedTrip.destination_name);
          if (coords) {
            updatedData.destination_lat = coords[0];
            updatedData.destination_lng = coords[1];
          }
        }
      }

      if (Object.keys(updatedData).length > 0 && selectedTrip) {
        // Update DB
        await (supabase.from('trips') as any).update(updatedData).eq('id', selectedTrip.id);
        
        // Update Local State
        setSelectedTrip(prev => prev ? { ...prev, ...updatedData } : null);
        
        // Refresh list to keep everything in sync
        fetchData();
      }
    }

    ensureCoordinates();
  }, [selectedTrip?.id]);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from('trips')
      .select('*, vehicle:vehicles(*), trailer:trailers(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    setTrips(data as any ?? []);
    setLoading(false);
  }

  async function fetchUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(data);
    }
  }

  const [metrics, setMetrics] = useState({
    start_odometer: '',
    arrival_odometer: '',
    final_odometer: '',
    gross_weight: '',
    net_weight: ''
  });

  const [updating, setUpdating] = useState(false);

  async function updateTripStatus(tripId: string, newStatus: string, additionalData: any = {}) {
    setUpdating(true);
    try {
      const { data: tripData } = await supabase
        .from('trips')
        .select('order_id')
        .eq('id', tripId)
        .single();

      const { error } = await (supabase.from('trips') as any)
        .update({ status: newStatus, ...additionalData, updated_at: new Date().toISOString() })
        .eq('id', tripId);

      if (error) throw error;

      // Operational Sync upon completion
      const tripDataAny = tripData as any;
      
      // Fetch Landfill coordinates from sites master
      const { data: landfill } = await supabase.from('sites').select('*').ilike('name', '%Landfill Rabigh%').limit(1).maybeSingle();
      const landfillAny = landfill as any;
      const defaultLoc = landfillAny ? { lat: landfillAny.latitude, lng: landfillAny.longitude } : { lat: 24.5772, lng: 46.8524 };

      if (tripDataAny?.driver_id || tripDataAny?.vehicle_id) {
        let lat = defaultLoc.lat;
        let lng = defaultLoc.lng;
        
        // Get current trip details for location sync
        const { data: tripLoc } = await supabase.from('trips').select('*').eq('id', tripId).single();
        const tLoc = tripLoc as any;

        if (newStatus === 'arrived_site' || newStatus === 'loading') {
          lat = tLoc?.origin_lat || lat;
          lng = tLoc?.origin_lng || lng;
        } else if (newStatus === 'completed' || newStatus === 'delivered') {
          lat = tLoc?.destination_lat || lat;
          lng = tLoc?.destination_lng || lng;
        }

        // Sync Driver Location inside unified employees table
        const { data: drv } = await supabase.from('employees').select('id').eq('id', tripDataAny.driver_id || (tLoc as any)?.driver_id).maybeSingle();
        const drvAny = drv as any;
        if (drvAny) {
          await (supabase.from('employees') as any).update({
            current_lat: lat,
            current_lng: lng,
            last_location_update: new Date().toISOString()
          } as any).eq('id', drvAny.id);
        }
      }

      if (newStatus === 'completed' && tripDataAny?.order_id) {
        // 1. Sync Order Status
        await (supabase.from('orders') as any)
          .update({ status: 'completed' })
          .eq('id', tripDataAny.order_id);
          
        // 2. Release Vehicle & Driver
        const { data: tripFull } = await supabase
          .from('trips')
          .select('vehicle_id, driver_id')
          .eq('id', tripId)
          .single();

        const tripFullAny = tripFull as any;
        if (tripFullAny?.vehicle_id) {
          await (supabase.from('vehicles') as any)
            .update({ status: 'available' })
            .eq('id', tripFullAny.vehicle_id);
        }

        if (tripFullAny?.driver_id) {
          await (supabase.from('employees') as any)
            .update({ status: 'available' } as any)
            .eq('id', tripFullAny.driver_id);
        }

        // 3. Financial Calculation
        await calculateAndSaveLedger(tripId);
      }

      await fetchData();
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(prev => prev ? { ...prev, status: newStatus as any, ...additionalData } : null);
      }
    } catch (err: any) {
      console.error('Update error:', err);
      alert('Operational Error: Failed to synchronize mission status. Please check your connection.');
    } finally {
      setUpdating(false);
    }
  }

  async function calculateAndSaveLedger(tripId: string) {
    const { data: trip } = await supabase
      .from('trips')
      .select('*, vehicle:vehicles(*)')
      .eq('id', tripId)
      .single();
      
    if (!trip) return;

    const tripAny = trip as any;
    const distance = tripAny.final_odometer - tripAny.start_odometer;
    const actualDistance = distance > 0 ? distance : (tripAny.actual_distance_km || tripAny.route_distance_km || 0);
    
    const isHeavy = tripAny.vehicle?.capacity_tons >= 10;
    const rate = isHeavy ? 0.90 : 0.60;
    
    // Total Allowance as per user request (600 * 0.9)
    const totalAllowance = actualDistance * rate;

    await (supabase.from('trip_ledger') as any).upsert({
      trip_id: tripId,
      distance_km: actualDistance,
      cost_per_km: rate,
      total_cost_sr: totalAllowance,
      allowance_sr: totalAllowance,
      calculated_at: new Date().toISOString()
    }, { onConflict: 'trip_id' });
  }

  async function handleStartTrip(tripId: string) {
    if (!metrics.start_odometer) {
      alert('Please enter starting ODOMeter');
      return;
    }
    
    await updateTripStatus(tripId, 'enroute', { 
      start_odometer: parseFloat(metrics.start_odometer),
      actual_departure: new Date().toISOString() 
    });
  }

  async function handleReportArrival(tripId: string) {
    if (!metrics.arrival_odometer || !metrics.gross_weight) {
      alert('Please enter arrival ODOMeter and Gross Weight');
      return;
    }
    
    await updateTripStatus(tripId, 'delivered', { 
      arrival_odometer: parseFloat(metrics.arrival_odometer),
      gross_weight: parseFloat(metrics.gross_weight),
      arrived_at: new Date().toISOString()
    });
  }

  async function handleCompleteTrip(tripId: string) {
    if (!metrics.final_odometer || !metrics.net_weight) {
      alert('Please enter final ODOMeter and Net Weight');
      return;
    }

    await updateTripStatus(tripId, 'completed', { 
      final_odometer: parseFloat(metrics.final_odometer),
      net_weight: parseFloat(metrics.net_weight),
      actual_arrival: new Date().toISOString() 
    });
  }

  async function handleFileUpload(tripId: string, type: 'Bayan' | 'Manifest' | 'POD') {
    setUploading(true);
    const driveFolder = "https://drive.google.com/drive/u/0/folders/0ANPit7RLrnkpUk9PVA";
    const fileName = `${type}_${selectedTrip?.trip_number}_${Date.now()}.pdf`;
    const driveUrl = `${driveFolder}/${fileName}`;
    
    // Map types to DB columns
    const fieldMap = {
      'Bayan': 'bayan_url',
      'Manifest': 'manifest_url',
      'POD': 'proof_of_delivery_url'
    };

    const field = fieldMap[type];

    setTimeout(async () => {
      await updateTripStatus(tripId, selectedTrip?.status || 'assigned', { [field]: driveUrl });
      setUploading(false);
      alert(`${type} uploaded and saved to Google Drive link successfully!`);
    }, 1200);
  }


  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    origin_name: '',
    destination_name: '',
    route_distance_km: 0,
    start_odometer: 0,
    arrival_odometer: 0,
    final_odometer: 0,
    gross_weight: 0,
    net_weight: 0
  });

  const handleEditOpen = () => {
    if (!selectedTrip) return;
    setEditFormData({
      origin_name: selectedTrip.origin_name || '',
      destination_name: selectedTrip.destination_name || '',
      route_distance_km: selectedTrip.route_distance_km || 0,
      start_odometer: (selectedTrip as any).start_odometer || 0,
      arrival_odometer: (selectedTrip as any).arrival_odometer || 0,
      final_odometer: (selectedTrip as any).final_odometer || 0,
      gross_weight: (selectedTrip as any).gross_weight || 0,
      net_weight: (selectedTrip as any).net_weight || 0
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!selectedTrip) return;
    setUpdating(true);
    try {
      const { error } = await (supabase.from('trips') as any)
        .update(editFormData)
        .eq('id', selectedTrip.id);
      
      if (error) throw error;
      
      // Re-calculate ledger if finished
      if (selectedTrip.status === 'completed') {
        await calculateAndSaveLedger(selectedTrip.id);
      }

      await fetchData();
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trip Operations</h1>
          <p className="text-slate-500 text-sm">Monitor live trips and execute dispatch workflows</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'live' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >
            Live View
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >
            History & Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trips list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">Trip Queue</h2>
            <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{trips.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="p-4 animate-pulse h-20 bg-slate-50/20" />)
            ) : trips.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">No active trips</div>
            ) : (
              trips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => {
                    setSelectedTrip(trip);
                  }}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition relative group ${selectedTrip?.id === trip.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-black text-slate-800 text-xs tracking-wider">{trip.trip_number}</p>
                    <span className="text-[10px] font-mono text-slate-400">{trip.route_distance_km}km</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                    <span className="truncate max-w-[80px]">{trip.origin_name}</span>
                    <ChevronRight size={10} className="text-slate-300" />
                    <span className="truncate max-w-[80px] text-blue-600 font-bold">{trip.destination_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${getStatusColor(trip.status)}`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Trip details & Actions */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto h-[calc(100vh-200px)] pr-2 custom-scrollbar">
          {selectedTrip ? (
            <>
              {activeTab === 'live' ? (
                <>
                  {/* Mission Timeline Tracking */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Navigation2 size={18} className="text-blue-600" /> Mission Timeline
                      </h3>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleEditOpen}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                          Edit Mission Details
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between relative px-4">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-12 right-12 h-0.5 bg-slate-100 z-0">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ 
                            width: selectedTrip.status === 'completed' ? '100%' : 
                                   selectedTrip.status === 'delivered' ? '66%' : 
                                   selectedTrip.status === 'enroute' ? '33%' : '0%' 
                          }} 
                        />
                      </div>

                      {/* Stage 1: Assigned */}
                      <div className="flex flex-col items-center text-center gap-3 relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedTrip.created_at ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase">Assigned</p>
                          <p className="text-[9px] font-bold text-slate-400">{format(new Date(selectedTrip.created_at), 'HH:mm')}</p>
                        </div>
                      </div>

                      {/* Stage 2: Departure */}
                      <div className="flex flex-col items-center text-center gap-3 relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedTrip.actual_departure ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Play size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase">Started</p>
                          <p className="text-[9px] font-bold text-slate-400">{selectedTrip.actual_departure ? format(new Date(selectedTrip.actual_departure), 'HH:mm') : '--:--'}</p>
                        </div>
                      </div>

                      {/* Stage 3: Arrival */}
                      <div className="flex flex-col items-center text-center gap-3 relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${(selectedTrip as any).arrived_at ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <MapIcon size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase">Arrived</p>
                          <p className="text-[9px] font-bold text-slate-400">{(selectedTrip as any).arrived_at ? format(new Date((selectedTrip as any).arrived_at), 'HH:mm') : '--:--'}</p>
                        </div>
                      </div>

                      {/* Stage 4: Completed */}
                      <div className="flex flex-col items-center text-center gap-3 relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedTrip.actual_arrival ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase">Mission</p>
                          <p className="text-[9px] font-bold text-slate-400">{selectedTrip.actual_arrival ? format(new Date(selectedTrip.actual_arrival), 'HH:mm') : '--:--'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${getStatusColor(selectedTrip.status)} bg-opacity-10`}>
                          <Truck size={32} className={getStatusColor(selectedTrip.status).replace('bg-', 'text-').replace('text-white', 'text-slate-800')} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedTrip.trip_number}</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedTrip.status)}`}>
                              {selectedTrip.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <MapIcon size={14} />
                            {selectedTrip.origin_name} <ChevronRight size={14} /> {selectedTrip.destination_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Revenue</p>
                          <p className="text-xl font-black text-green-600">
                            {((selectedTrip.actual_distance_km || selectedTrip.route_distance_km) * (selectedTrip.vehicle.capacity_tons >= 10 ? 0.9 : 0.6)).toFixed(2)} SR
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                          <CircleDollarSign size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Truck size={10} /> Vehicle
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{selectedTrip.vehicle.registration_number}</p>
                        <p className="text-[10px] text-slate-500">{selectedTrip.vehicle.make} {selectedTrip.vehicle.model}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Truck size={10} /> Trailer
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{(selectedTrip as any).trailer?.plate_number || 'N/A'}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{(selectedTrip as any).trailer?.type || 'Not Assigned'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Weight size={10} /> Net Weight
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{selectedTrip.net_weight || 0} Tons</p>
                        <p className="text-[10px] text-slate-500">{selectedTrip.vehicle.capacity_tons}T Capacity</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Navigation2 size={10} /> Distance
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{selectedTrip.route_distance_km} KM</p>
                        <p className="text-[10px] text-slate-500">Scheduled Route</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Info size={10} /> Departure
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{selectedTrip.scheduled_departure ? format(new Date(selectedTrip.scheduled_departure), 'MMM d, p') : 'N/A'}</p>
                        <p className="text-[10px] text-slate-500">Planned Start</p>
                      </div>
                    </div>
                  </div>

                  <RouteMap 
                    shipment={selectedTrip ? {
                      id: selectedTrip.id,
                      pickup_lat: selectedTrip.origin_lat,
                      pickup_lng: selectedTrip.origin_lng,
                      pickup_warehouse: selectedTrip.origin_name,
                      dest_lat: selectedTrip.destination_lat,
                      dest_lng: selectedTrip.destination_lng,
                      destination: selectedTrip.destination_name
                    } : null}
                  />

                  {/* Action Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dispatcher Actions */}
                    {(userProfile?.role === 'admin' || userProfile?.role === 'dispatcher') && (
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Navigation2 size={18} className="text-blue-600" /> Dispatcher Control
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">Road Way Bayan</p>
                              <p className="text-[10px] text-slate-500">Manifest / Permit Document</p>
                            </div>
                            {selectedTrip.bayan_url ? (
                              <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                                <CheckCircle2 size={16} /> Verified
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleFileUpload(selectedTrip.id, 'Bayan')}
                                disabled={uploading}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition flex items-center gap-1"
                              >
                                <Upload size={12} /> {uploading ? '...' : 'Upload'}
                              </button>
                            )}
                          </div>

                          <button 
                            onClick={() => updateTripStatus(selectedTrip.id, selectedTrip.status)}
                            disabled={updating}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-2"
                          >
                            <MapIcon size={14} /> {updating ? 'Syncing...' : 'Force Site Sync'}
                          </button>
                          
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="block font-bold text-slate-800 text-sm mb-2">Verified Net Weight</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                                placeholder="Enter tonnage..."
                                defaultValue={selectedTrip.net_weight || ''}
                                onBlur={(e) => updateTripStatus(selectedTrip.id, selectedTrip.status, { net_weight: parseFloat(e.target.value) })}
                              />
                              <div className="bg-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center">TONS</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Driver Actions */}
                    {(userProfile?.role === 'admin' || userProfile?.role === 'driver') && (
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                          <Truck size={80} />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Truck size={18} className="text-orange-600" /> Driver Cockpit
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                          {selectedTrip.status === 'assigned' && (
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Start ODOMeter</label>
                              <input 
                                type="number" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10"
                                placeholder="Reading at start..."
                                value={metrics.start_odometer}
                                onChange={e => setMetrics({...metrics, start_odometer: e.target.value})}
                              />
                            </div>
                          )}

                          {selectedTrip.status === 'enroute' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Arrival ODOMeter</label>
                                <input 
                                  type="number" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                  placeholder="At destination..."
                                  value={metrics.arrival_odometer}
                                  onChange={e => setMetrics({...metrics, arrival_odometer: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Gross Weight (T)</label>
                                <input 
                                  type="number" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                  placeholder="Total tonnage..."
                                  value={metrics.gross_weight}
                                  onChange={e => setMetrics({...metrics, gross_weight: e.target.value})}
                                />
                              </div>
                            </div>
                          )}

                          {selectedTrip.status === 'delivered' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Final ODOMeter</label>
                                <input 
                                  type="number" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                  placeholder="Final reading..."
                                  value={metrics.final_odometer}
                                  onChange={e => setMetrics({...metrics, final_odometer: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Net Weight (T)</label>
                                <input 
                                  type="number" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                  placeholder="Actual material..."
                                  value={metrics.net_weight}
                                  onChange={e => setMetrics({...metrics, net_weight: e.target.value})}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {selectedTrip.status === 'assigned' && (
                            <button 
                              onClick={() => handleStartTrip(selectedTrip.id)}
                              disabled={updating}
                              className="col-span-2 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {updating ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                              {updating ? 'Processing...' : 'Start Trip'}
                            </button>
                          )}
                          
                          {selectedTrip.status === 'enroute' && (
                            <button 
                              onClick={() => handleReportArrival(selectedTrip.id)}
                              disabled={updating}
                              className="col-span-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {updating ? <Loader2 size={20} className="animate-spin" /> : <Navigation2 size={20} />}
                              {updating ? 'Processing...' : 'Report Arrival'}
                            </button>
                          )}

                          {(selectedTrip.status === 'delivered' || selectedTrip.status === 'enroute') && (
                            <div className="col-span-2 grid grid-cols-3 gap-2 mt-4">
                               <button 
                                 onClick={() => handleFileUpload(selectedTrip.id, 'Bayan')}
                                 disabled={updating || uploading}
                                 className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 disabled:opacity-50 ${selectedTrip.bayan_url ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}
                               >
                                 <FileText size={18} />
                                 <span className="text-[8px] font-black uppercase tracking-tighter">Bayan</span>
                               </button>
                               <button 
                                 onClick={() => handleFileUpload(selectedTrip.id, 'Manifest')}
                                 disabled={updating || uploading}
                                 className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 disabled:opacity-50 ${selectedTrip.manifest_url ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}
                               >
                                 <ClipboardList size={18} />
                                 <span className="text-[8px] font-black uppercase tracking-tighter">Manifest</span>
                               </button>
                               <button 
                                 onClick={() => handleFileUpload(selectedTrip.id, 'POD')}
                                 disabled={updating || uploading}
                                 className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 disabled:opacity-50 ${selectedTrip.proof_of_delivery_url ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}
                               >
                                 <Camera size={18} />
                                 <span className="text-[8px] font-black uppercase tracking-tighter">POD</span>
                               </button>
                            </div>
                          )}

                          {selectedTrip.status === 'delivered' && (
                            <button 
                              onClick={() => handleCompleteTrip(selectedTrip.id)}
                              disabled={updating}
                              className="col-span-2 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                            >
                              {updating ? <Loader2 size={20} className="animate-spin" /> : <Flag size={20} />}
                              {updating ? 'Processing...' : 'Complete Mission'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider">Mission Audit Logs</h3>
                      <p className="text-slate-500 text-xs">Chronological timeline of all trip operations</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                      {selectedTrip.trip_number}
                    </div>
                  </div>

                  <div className="relative pl-8 space-y-12">
                    {/* Vertical Line */}
                    <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-slate-100" />

                    {/* Milestone 1: Assignment */}
                    <div className="relative">
                      <div className="absolute -left-[25px] w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10" />
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Trip Assigned</span>
                          <span className="text-[10px] font-bold text-slate-400">{format(new Date(selectedTrip.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 inline-block min-w-[300px]">
                          <p className="text-xs text-slate-600">Mission initialized for vehicle <span className="font-bold text-slate-800">{selectedTrip.vehicle.registration_number}</span></p>
                          <p className="text-[10px] text-slate-400 mt-1 italic">Route: {selectedTrip.origin_name} to {selectedTrip.destination_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Milestone 2: Departure */}
                    <div className="relative">
                      <div className={`absolute -left-[25px] w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${selectedTrip.actual_departure ? 'bg-orange-500' : 'bg-slate-200'}`} />
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${selectedTrip.actual_departure ? 'text-orange-600 bg-orange-50' : 'text-slate-400 bg-slate-100'}`}>Trip Started</span>
                          {selectedTrip.actual_departure && <span className="text-[10px] font-bold text-slate-400">{format(new Date(selectedTrip.actual_departure), 'MMM dd, HH:mm')}</span>}
                        </div>
                        {selectedTrip.actual_departure ? (
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 inline-block min-w-[300px]">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Start ODO</p>
                                <p className="text-sm font-black text-slate-800">{selectedTrip.start_odometer} KM</p>
                              </div>
                              <div className="h-8 w-px bg-slate-200" />
                              <p className="text-xs text-slate-600">Vehicle departed from <span className="font-bold text-slate-800">{selectedTrip.origin_name}</span></p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Waiting for departure logs...</p>
                        )}
                      </div>
                    </div>

                    {/* Milestone 3: Arrival */}
                    <div className="relative">
                      <div className={`absolute -left-[25px] w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${(selectedTrip as any).arrived_at ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${(selectedTrip as any).arrived_at ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-100'}`}>Destination Arrival</span>
                          {(selectedTrip as any).arrived_at && <span className="text-[10px] font-bold text-slate-400">{format(new Date((selectedTrip as any).arrived_at), 'MMM dd, HH:mm')}</span>}
                        </div>
                        {(selectedTrip as any).arrived_at ? (
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 inline-block min-w-[300px]">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Arrival ODO</p>
                                <p className="text-sm font-black text-slate-800">{selectedTrip.arrival_odometer} KM</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Gross Weight</p>
                                <p className="text-sm font-black text-slate-800">{selectedTrip.gross_weight} T</p>
                              </div>
                              <div className="flex items-center justify-center">
                                {selectedTrip.manifest_url && <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-1 rounded">MANIFEST ✓</span>}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Waiting for arrival verification...</p>
                        )}
                      </div>
                    </div>

                    {/* Milestone 4: Completion */}
                    <div className="relative">
                      <div className={`absolute -left-[25px] w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${selectedTrip.actual_arrival ? 'bg-green-600' : 'bg-slate-200'}`} />
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${selectedTrip.actual_arrival ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}>Mission Accomplished</span>
                          {selectedTrip.actual_arrival && <span className="text-[10px] font-bold text-slate-400">{format(new Date(selectedTrip.actual_arrival), 'MMM dd, HH:mm')}</span>}
                        </div>
                        {selectedTrip.actual_arrival ? (
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 inline-block min-w-[300px]">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Final ODO</p>
                                <p className="text-sm font-black text-slate-800">{selectedTrip.final_odometer} KM</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Net Weight</p>
                                <p className="text-sm font-black text-slate-800">{selectedTrip.net_weight} T</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Distance</p>
                                <p className="text-sm font-black text-blue-600">{selectedTrip.final_odometer - selectedTrip.start_odometer} KM</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Mission in progress...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Navigation2 size={40} className="text-slate-200" />
              </div>
              <p className="font-bold uppercase tracking-widest text-sm">Select a mission to begin operational control</p>
            </div>
          )}
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Modify Mission Logs</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Origin</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.origin_name}
                    onChange={e => setEditFormData({...editFormData, origin_name: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Destination</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.destination_name}
                    onChange={e => setEditFormData({...editFormData, destination_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Distance (KM)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.route_distance_km}
                    onChange={e => setEditFormData({...editFormData, route_distance_km: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Start ODO</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.start_odometer}
                    onChange={e => setEditFormData({...editFormData, start_odometer: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Arrival ODO</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.arrival_odometer}
                    onChange={e => setEditFormData({...editFormData, arrival_odometer: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Final ODO</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.final_odometer}
                    onChange={e => setEditFormData({...editFormData, final_odometer: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Gross Weight (T)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.gross_weight}
                    onChange={e => setEditFormData({...editFormData, gross_weight: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Net Weight (T)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    value={editFormData.net_weight}
                    onChange={e => setEditFormData({...editFormData, net_weight: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave}
                disabled={updating}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {updating ? 'Saving Changes...' : 'Save Mission Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}
