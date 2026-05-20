import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { 
  MapPin, 
  Plus, 
  Search, 
  X, 
  Loader2, 
  Edit, 
  Trash2, 
  UserCheck,
  Navigation,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { Database } from '../lib/database.types';

declare const L: any;

type Site = Database['public']['Tables']['sites']['Row'];
type Labor = {
  id: string;
  iqama_number: string;
  nationality: string;
  profession: string;
  phone: string | null;
  status: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
};
type Mobilization = Database['public']['Tables']['labor_mobilization']['Row'];

export default function SitesPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [sites, setSites] = useState<Site[]>([]);
  const [labors, setLabors] = useState<Labor[]>([]);
  const [mobilizations, setMobilizations] = useState<Mobilization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mapSearch, setMapSearch] = useState('');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const mainMapRef = useRef<any>(null);
  const siteMarkersRef = useRef<any[]>([]);
  const laborRadiusRef = useRef<any[]>([]);

  async function fetchData() {
    setLoading(true);
    const [sitesRes, laborRes, mobRes] = await Promise.all([
      supabase.from('sites').select('*').order('name', { ascending: true }),
      supabase.from('employees').select('*, profile:profiles!inner(full_name, role)').eq('profile.role', 'labor'),
      supabase.from('labor_mobilization').select('*').eq('status', 'active')
    ]);
    
    if (sitesRes.data) setSites(sitesRes.data);
    if (laborRes.data) setLabors(laborRes.data as unknown as Labor[]);
    if (mobRes.data) setMobilizations(mobRes.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize and update Main Map
  useEffect(() => {
    if (typeof L === 'undefined' || !sites.length) return;

    if (!mainMapRef.current) {
      const map = L.map('main-site-map').setView([24.7136, 46.6753], 5);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mainMapRef.current = map;
    }

    const map = mainMapRef.current;

    // Clear existing markers/circles
    siteMarkersRef.current.forEach(m => m.remove());
    laborRadiusRef.current.forEach(c => c.remove());
    siteMarkersRef.current = [];
    laborRadiusRef.current = [];

    // Group mobilization by site
    const siteLaborCount = mobilizations.reduce((acc, m) => {
      acc[m.site_id] = (acc[m.site_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    sites.forEach(site => {
      if (site.latitude && site.longitude) {
        const count = siteLaborCount[site.id] || 0;
        
        // Site Marker
        const marker = L.marker([site.latitude, site.longitude], {
          icon: L.divIcon({
            className: 'custom-site-icon',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white ring-2 ring-blue-600/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                ${count > 0 ? `
                  <div class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    ${count}
                  </div>
                ` : ''}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        }).addTo(map);

        marker.bindPopup(`
          <div class="p-2 min-w-[150px]">
            <h4 class="font-bold text-slate-800">${site.name}</h4>
            <p class="text-xs text-slate-500 mb-2">${site.code}</p>
            <div class="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${count} Labor Assigned
            </div>
          </div>
        `);

        siteMarkersRef.current.push(marker);

        // Animated Radius Circle for Labor Density
        if (count > 0) {
          const circle = L.circle([site.latitude, site.longitude], {
            radius: 500 + (count * 100), // Scale radius by count
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1,
            className: 'animate-pulse-slow'
          }).addTo(map);
          laborRadiusRef.current.push(circle);
        }
      }
    });

    // Fit bounds if there are markers
    if (siteMarkersRef.current.length > 0) {
      const group = L.featureGroup(siteMarkersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [sites, mobilizations]);

  const handleLaborSearch = () => {
    if (!mapSearch.trim() || !mainMapRef.current) return;
    
    const labor = labors.find(l => 
      (l.profile?.full_name || '').toLowerCase().includes(mapSearch.toLowerCase()) || 
      l.iqama_number.includes(mapSearch)
    );

    if (labor) {
      const mob = mobilizations.find(m => m.labor_id === labor.id);
      if (mob) {
        const site = sites.find(s => s.id === mob.site_id);
        if (site && site.latitude && site.longitude) {
          mainMapRef.current.flyTo([site.latitude, site.longitude], 15);
          // Highlight site briefly or show popup
          const marker = siteMarkersRef.current.find(m => m.getLatLng().lat === site.latitude);
          if (marker) marker.openPopup();
        }
      } else {
        alert("Labor found but not currently mobilized to any site.");
      }
    } else {
      alert("No labor found matching name or Iqama.");
    }
  };

  const handleOpenModal = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        name: site.name,
        code: site.code,
        address: site.address,
        latitude: site.latitude?.toString() || '',
        longitude: site.longitude?.toString() || ''
      });
    } else {
      setEditingSite(null);
      setFormData({ name: '', code: '', address: '', latitude: '', longitude: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: formData.name,
      code: formData.code,
      address: formData.address,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    try {
      if (editingSite) {
        await supabase.from('sites').update(payload as never).eq('id', editingSite.id);
      } else {
        await supabase.from('sites').insert(payload as never);
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Operational Site',
      message: 'Are you sure you want to delete this site? All associated orders and dispatch mission logs will also be unlinked or deleted.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    await supabase.from('sites').delete().eq('id', id);
    await fetchData();
  };

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operational Sites</h1>
          <p className="text-slate-500 text-sm font-medium">Global infrastructure & workforce tracking</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-600/20 font-bold text-sm"
        >
          <Plus size={18} />
          Add New Site
        </button>
      </div>

      {/* Advanced Map Section */}
      <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative transition-all duration-500 ${isMapExpanded ? 'h-[80vh]' : 'h-[400px]'}`}>
        <div className="absolute top-4 left-4 z-[1000] flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search labor (Name/Iqama)..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl w-64 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              value={mapSearch}
              onChange={e => setMapSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLaborSearch()}
            />
          </div>
          <button 
            onClick={handleLaborSearch}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-xl hover:bg-blue-700 transition font-bold text-sm flex items-center gap-2"
          >
            <Navigation size={16} />
            Track
          </button>
        </div>

        <button 
          onClick={() => setIsMapExpanded(!isMapExpanded)}
          className="absolute top-4 right-4 z-[1000] bg-white p-2.5 rounded-xl shadow-xl hover:bg-slate-50 transition border border-slate-200"
        >
          {isMapExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-slate-200 space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Map Legend</span>
            <Info size={14} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-600 rounded shadow-sm flex items-center justify-center">
              <MapPin size={10} className="text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700">Operational Site</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-100 rounded-full border border-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Workforce Density</span>
          </div>
        </div>

        <div id="main-site-map" className="w-full h-full z-0" />
      </div>

      {/* Tabular View */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Navigation size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Site Directory</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by name/code..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 transition-all w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Site Detail</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">Workforce</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Address</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-10 bg-slate-50/20" />
                  </tr>
                ))
              ) : filteredSites.map(site => {
                const laborCount = mobilizations.filter(m => m.site_id === site.id).length;
                return (
                  <tr key={site.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {site.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{site.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{site.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${laborCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                          <UserCheck size={12} />
                          {laborCount} Personnel
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                        <span className="text-slate-500 leading-relaxed text-xs line-clamp-2">{site.address || 'No address provided'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(site)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(site.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.25; }
          100% { transform: scale(1); opacity: 0.15; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        .custom-site-icon {
          background: transparent !important;
          border: none !important;
        }
      `}} />

      {/* Form Modal (kept same structure for CRUD) */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0 bg-blue-600 text-white">
              <h2 className="font-bold text-lg">{editingSite ? 'Edit Site Configuration' : 'Establish New Site'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5">Site Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5">Identification Code</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase font-mono font-bold"
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Geolocation Setup</label>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Click map to set</span>
                </div>
                <div id="site-map-modal" className="w-full h-64 bg-slate-100 rounded-3xl border border-slate-200 z-0 overflow-hidden shadow-inner" />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" step="any" placeholder="Latitude"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono"
                    value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})}
                  />
                  <input 
                    type="number" step="any" placeholder="Longitude"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono"
                    value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5">Official Address</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                  placeholder="Enter full physical address..."
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50 transition shadow-xl shadow-blue-600/20 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Sync Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
