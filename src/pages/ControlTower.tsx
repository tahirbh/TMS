import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getStatusColor } from '../lib/utils';
import { 
  Truck, 
  Search, 
  Loader2, 
  MapPin, 
  Navigation2, 
  Navigation,
  TrendingUp,
  Users,
  Package,
  CircleDollarSign,
  Container,
  UserPlus
} from 'lucide-react';

declare const L: any;

interface Stats {
  totalVehicles: number;
  availableVehicles: number;
  totalTrailers: number;
  availableTrailers: number;
  totalDrivers: number;
  availableDrivers: number;
  totalSupervisors: number;
  totalSites: number;
  activeTrips: number;
  pendingOrders: number;
  totalRevenue: number;
  activeBreakdowns: number;
}

export default function ControlTower() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [landfillSite, setLandfillSite] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [tripsRes, driversRes, sitesRes, vehiclesRes, trailersRes, profilesRes, ordersRes, ledgerRes, breakdownRes] = await Promise.all([
        supabase
          .from('trips')
          .select('*, vehicle:vehicles(registration_number), driver:employees(profile:profiles(full_name))')
          .in('status', ['enroute', 'arrived_site', 'loading', 'in_transit', 'delivered', 'completed'])
          .order('created_at', { ascending: false }),
        supabase.from('employees').select('*, profile:profiles!inner(full_name, role)').eq('profile.role', 'driver'),
        supabase.from('sites').select('*'),
        supabase.from('vehicles').select('status'),
        supabase.from('trailers').select('status'),
        supabase.from('profiles').select('role'),
        supabase.from('orders').select('status'),
        supabase.from('trip_ledger').select('total_cost_sr'),
        supabase.from('breakdown_requests').select('status').neq('status', 'resolved')
      ]);

      setTrips(tripsRes.data ?? []);
      setDrivers(driversRes.data ?? []);
      const sites = sitesRes.data ?? [];
      const landfill = sites.find((s: any) => s.name.toLowerCase().includes('landfill rabigh'));
      if (landfill) setLandfillSite(landfill);

      const v = vehiclesRes.data || [];
      const t = trailersRes.data || [];
      const d = driversRes.data || [];
      const p = profilesRes.data || [];
      const o = ordersRes.data || [];
      const l = ledgerRes.data || [];
      const b = breakdownRes.data || [];

      setStats({
        totalVehicles: v.length,
        availableVehicles: v.filter((x: any) => x.status === 'available').length,
        totalTrailers: t.length,
        availableTrailers: t.filter((x: any) => x.status === 'available').length,
        totalDrivers: d.length,
        availableDrivers: d.filter((x: any) => x.status === 'available').length,
        totalSupervisors: p.filter((x: any) => x.role === 'supervisor').length,
        totalSites: sites.length,
        activeTrips: (tripsRes.data || []).filter((x: any) => ['enroute', 'arrived_site', 'loading', 'in_transit'].includes(x.status)).length,
        pendingOrders: o.filter((x: any) => x.status === 'pending').length,
        totalRevenue: l.reduce((acc, curr: any) => acc + (curr.total_cost_sr || 0), 0),
        activeBreakdowns: b.length
      });

      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof L === 'undefined' || loading) return;

    const defaultCenter: [number, number] = landfillSite ? [landfillSite.latitude, landfillSite.longitude] : [24.7136, 46.6753];
    
    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
    }

    const map = L.map('control-tower-map').setView(defaultCenter, landfillSite ? 12 : 5); 
    
    const streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 20
    });

    streets.addTo(map);
    mapInstanceRef.current = map;

    let markers: any[] = [];
    let driverMarkers: any[] = [];

    // Always plot all drivers
    drivers.forEach(d => {
      const lat = d.current_lat || landfillSite?.latitude;
      const lng = d.current_lng || landfillSite?.longitude;
      
      if (lat && lng) {
        const isActive = selectedTrip && (selectedTrip as any).driver_id === d.id;
        const hasActiveTrip = trips.some(t => t.driver_id === d.id);
        
        const icon = L.divIcon({
          className: isActive ? 'selected-truck-icon' : 'custom-div-icon',
          html: `<div style="width: ${isActive ? '28px' : '20px'}; height: ${isActive ? '28px' : '20px'}; background-color: ${isActive ? '#ef4444' : (hasActiveTrip ? '#2563eb' : '#94a3b8')}; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: ${isActive ? '12px' : '8px'}; font-weight: 900; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">T</div>`,
          iconSize: isActive ? [28, 28] : [20, 20],
          iconAnchor: isActive ? [14, 14] : [10, 10]
        });

        const m = L.marker([lat, lng], { icon })
          .bindPopup(`
            <div class="p-2">
              <p class="font-black text-sm text-slate-800">${d.profile?.full_name || 'Unit'}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase">${hasActiveTrip ? 'Mission Active' : 'Idle / Base'}</p>
            </div>
          `);
        
        m.addTo(map);
        driverMarkers.push(m);
        
        if (isActive) {
          m.openPopup();
          markers.push(m);
        }
      }
    });

    if (selectedTrip) {
      if (selectedTrip.origin_lat && selectedTrip.origin_lng) {
        markers.push(L.marker([selectedTrip.origin_lat, selectedTrip.origin_lng], {
          icon: L.divIcon({
            className: 'origin-marker',
            html: '<div style="width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%;"></div>',
            iconSize: [12, 12]
          })
        }).bindPopup('Origin: ' + selectedTrip.origin_name).addTo(map));
      }
      if (selectedTrip.destination_lat && selectedTrip.destination_lng) {
        markers.push(L.marker([selectedTrip.destination_lat, selectedTrip.destination_lng], {
          icon: L.divIcon({
            className: 'dest-marker',
            html: '<div style="width: 12px; height: 12px; background: #6366f1; border: 2px solid white; border-radius: 50%;"></div>',
            iconSize: [12, 12]
          })
        }).bindPopup('Destination: ' + selectedTrip.destination_name).addTo(map));
      }

      if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
      }
    } else if (driverMarkers.length > 0) {
      const group = new L.featureGroup(driverMarkers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [selectedTrip, trips, drivers, landfillSite, loading]);

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim() || !mapInstanceRef.current) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        mapInstanceRef.current.flyTo([lat, lon], 14);
        
        if (searchMarkerRef.current) {
          searchMarkerRef.current.setLatLng([lat, lon]).bindPopup(`Search Result: ${result.display_name}`).openPopup();
        } else {
          searchMarkerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current).bindPopup(`Search Result: ${result.display_name}`).openPopup();
        }
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Map search failed", err);
      alert("Failed to search location");
    } finally {
      setIsSearchingMap(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-3">
      {/* High-Density Stats Grid */}
      <div className="stats-grid animate-fade-in">
        <StatCard icon={Truck} label="Trucks" val={stats?.totalVehicles} sub={`${stats?.availableVehicles} Avail`} color="bg-blue-500" />
        <StatCard icon={Container} label="Trailers" val={stats?.totalTrailers} sub={`${stats?.availableTrailers} Avail`} color="bg-indigo-500" />
        <StatCard icon={Users} label="Drivers" val={stats?.totalDrivers} sub={`${stats?.availableDrivers} Avail`} color="bg-cyan-500" />
        <StatCard icon={UserPlus} label="Supervisors" val={stats?.totalSupervisors} sub="Active Leaders" color="bg-violet-500" />
        <StatCard icon={MapPin} label="Sites" val={stats?.totalSites} sub="Strategic Bases" color="bg-emerald-500" />
        <StatCard icon={Navigation2} label="Live Trips" val={stats?.activeTrips} sub="Mission En Route" color="bg-orange-500" />
        <StatCard icon={Package} label="Pending Orders" val={stats?.pendingOrders} sub="Queued Load" color="bg-rose-500" />
        <StatCard icon={CircleDollarSign} label="Revenue" val={stats?.totalRevenue?.toLocaleString()} sub="Total SR" color="bg-amber-500" />
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Map View */}
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div id="control-tower-map" className="w-full h-full" />
          
          {/* Map Controls */}
          <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
            <div className="absolute top-4 left-14 z-[400] w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 flex items-center p-1.5 transition-all hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              <input 
                type="text" 
                placeholder="Search landmarks or locations..."
                className="flex-1 px-2 text-sm focus:outline-none bg-transparent"
                value={mapSearchQuery}
                onChange={e => setMapSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleMapSearch();
                  }
                }}
              />
              <button 
                onClick={handleMapSearch}
                disabled={isSearchingMap || !mapSearchQuery.trim()}
                className="text-slate-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50 disabled:opacity-50"
              >
                {isSearchingMap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Active trips list */}
        <div className="w-[300px] bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center justify-between">
              Active Missions
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">{trips.length}</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
            ) : trips.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No active trips</div>
            ) : (
              trips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`w-full text-left p-3 hover:bg-slate-50 transition ${selectedTrip?.id === trip.id ? 'bg-blue-50' : ''}`}
                >
                  <p className="font-medium text-slate-800 text-sm truncate">{trip.trip_number}</p>
                  <p className="text-xs text-slate-400 truncate">{trip.origin_name} → {trip.destination_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                    {trip.route_distance_km > 0 && (
                      <span className="text-xs text-slate-400">{trip.route_distance_km}km</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected trip details */}
      {selectedTrip && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Trip Info</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{selectedTrip.trip_number}</p>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="text-slate-500">Vehicle:</span> <span className="font-medium">{(selectedTrip as any).vehicle?.registration_number}</span></p>
                <p><span className="text-slate-500">Driver:</span> <span className="font-medium">{(selectedTrip as any).driver?.profile?.full_name}</span></p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedTrip.status)}`}>
                  {selectedTrip.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Route</p>
              <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> {selectedTrip.origin_name}
              </p>
              <p className="text-xs text-slate-400 mt-2 ml-5">↓</p>
              <p className="text-sm font-medium text-slate-800 mt-2 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5" /> {selectedTrip.destination_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Distance & Time</p>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="text-slate-500">Distance:</span> <span className="font-medium">{selectedTrip.route_distance_km}km</span></p>
                <p><span className="text-slate-500">Actual:</span> <span className="font-medium">{selectedTrip.actual_distance_km}km</span></p>
                <p className="flex items-center gap-1 text-xs mt-2">
                  <TrendingUp className="w-3 h-3" />
                  {selectedTrip.actual_distance_km > selectedTrip.route_distance_km ? 'Over' : 'On'} route
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, val, sub, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-sm font-black text-slate-800">{val ?? 0}</p>
            <p className="text-[8px] font-bold text-slate-500 truncate">{sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
