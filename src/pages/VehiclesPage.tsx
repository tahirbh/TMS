import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import type { Vehicle } from '../lib/database.types';
import { getStatusColor, formatDate } from '../lib/utils';
import {
  Truck,
  Search,
  ChevronDown,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Upload
} from 'lucide-react';
import DocumentBrowser from '../components/DocumentBrowser';
import ImportVehiclesCSVModal from '../components/ImportVehiclesCSVModal';

const STATUS_OPTIONS = ['all', 'available', 'in_use', 'maintenance', 'inactive'] as const;
const TYPE_OPTIONS = ['all', 'truck', 'trailer', 'van', 'tanker', 'flatbed'] as const;

function expiryBadge(dateStr: string | null | undefined) {
  if (!dateStr) return <span className="text-slate-300 text-xs">—</span>;
  const expiry = new Date(dateStr);
  const today = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const label = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  if (daysLeft < 0) {
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">{label}</span>;
  } else if (daysLeft <= 30) {
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">{label}</span>;
  }
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">{label}</span>;
}

export default function VehiclesPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filtered, setFiltered] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Vehicle | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'truck',
    capacity_tons: 0,
    status: 'available',
    last_service_date: '',
    next_service_date: '',
    registration_expiry: '',
    insurance_expiry: '',
    authorized_driver: '',
    authorization_expiry: '',
    mvpi_expiry: '',
    notes: ''
  });

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('registration_number');
    setVehicles(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
    
    if (selected && data) {
      const updatedSelected = (data as Vehicle[]).find(v => v.id === selected.id);
      if (updatedSelected) setSelected(updatedSelected);
      else setSelected(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = vehicles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        v =>
          v.registration_number.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(v => v.type === typeFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, typeFilter, vehicles]);

  // Counts
  const counts = {
    available: vehicles.filter(v => v.status === 'available').length,
    in_use: vehicles.filter(v => v.status === 'in_use').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length,
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        registration_number: vehicle.registration_number,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || new Date().getFullYear(),
        type: vehicle.type,
        capacity_tons: vehicle.capacity_tons || 0,
        status: vehicle.status,
        last_service_date: vehicle.last_service_date?.substring(0, 10) || '',
        next_service_date: vehicle.next_service_date?.substring(0, 10) || '',
        registration_expiry: (vehicle as any).registration_expiry?.substring(0, 10) || '',
        insurance_expiry: (vehicle as any).insurance_expiry?.substring(0, 10) || '',
        authorized_driver: (vehicle as any).authorized_driver || '',
        authorization_expiry: (vehicle as any).authorization_expiry?.substring(0, 10) || '',
        mvpi_expiry: (vehicle as any).mvpi_expiry?.substring(0, 10) || '',
        notes: vehicle.notes || ''
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        registration_number: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'truck',
        capacity_tons: 0,
        status: 'available',
        last_service_date: '',
        next_service_date: '',
        registration_expiry: '',
        insurance_expiry: '',
        authorized_driver: '',
        authorization_expiry: '',
        mvpi_expiry: '',
        notes: ''
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...formData,
      last_service_date: formData.last_service_date || null,
      next_service_date: formData.next_service_date || null,
      registration_expiry: formData.registration_expiry || null,
      insurance_expiry: formData.insurance_expiry || null,
      authorized_driver: formData.authorized_driver || null,
      authorization_expiry: formData.authorization_expiry || null,
      mvpi_expiry: formData.mvpi_expiry || null,
    };

    try {
      if (editingVehicle) {
        const { error } = await supabase.from('vehicles').update(payload as never).eq('id', editingVehicle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vehicles').insert(payload as never);
        if (error) throw error;
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Vehicle Asset',
      message: 'Are you sure you want to delete this vehicle? This will permanently remove the vehicle from your active assets database.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      setSelected(null);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehicle Master</h1>
          <p className="text-slate-500 text-sm">Fleet assets, compliance validity &amp; authorization tracker</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Status Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Available', count: counts.available, icon: CheckCircle2, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'In Use', count: counts.in_use, icon: Truck, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Maintenance', count: counts.maintenance, icon: Wrench, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Inactive', count: counts.inactive, icon: AlertTriangle, color: 'bg-slate-50 border-slate-200 text-slate-500' },
        ].map(card => (
          <button
            key={card.label}
            onClick={() => setStatusFilter(prev => prev === card.label.toLowerCase().replace(' ', '_') ? 'all' : card.label.toLowerCase().replace(' ', '_'))}
            className={`flex items-center gap-3 p-3 rounded-xl border transition hover:shadow-sm ${card.color}`}
          >
            <card.icon className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-medium">{card.label}</p>
              <p className="text-lg font-bold">{card.count}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Selected Vehicle Info Card ── */}
      {selected && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base tracking-tight">{selected.registration_number}</h2>
                <p className="text-blue-100 text-xs">{selected.make} {selected.model} · {selected.year} · <span className="capitalize">{selected.type}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white capitalize">
                {selected.status.replace('_', ' ')}
              </span>
              <button onClick={() => handleOpenModal(selected)} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(selected.id)} className="p-1.5 text-white/80 hover:text-red-200 hover:bg-red-500/30 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setSelected(null)} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3">
            {/* Core Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { label: 'Capacity', value: `${selected.capacity_tons} T` },
                { label: 'Color', value: (selected as any).color || '—' },
                { label: 'Owner', value: (selected as any).owner_name || '—' },
                { label: 'Sequence No.', value: (selected as any).sequence_number || '—' },
                { label: 'Auth. Driver', value: (selected as any).authorized_driver || '—' },
                { label: 'Last Service', value: selected.last_service_date ? new Date(selected.last_service_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                { label: 'Next Service', value: selected.next_service_date ? new Date(selected.next_service_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-2.5 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Validity Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Reg. Expiry', value: (selected as any).registration_expiry },
                { label: 'Insurance Validity', value: (selected as any).insurance_expiry },
                { label: 'Auth. Validity', value: (selected as any).authorization_expiry },
                { label: 'MVPI Validity', value: (selected as any).mvpi_expiry },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <div className="mt-1">{expiryBadge(item.value)}</div>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex gap-2">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-blue-800 text-xs">{selected.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <DocumentBrowser entityType="vehicle" entityId={selected.id} title="Vehicle Documents" />
            </div>
          </div>
        </div>
      )}

      {/* ── Full-Width Vehicle Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filters Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search registration, make or model…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <span className="ml-auto text-[11px] text-slate-400 font-medium">{filtered.length} / {vehicles.length} vehicles</span>
        </div>

        {/* Compact Horizontally Scrollable Table */}
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading vehicles…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No vehicles found</p>
            </div>
          ) : (
            <table className="w-full text-[11px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-3 py-2.5 sticky left-0 bg-slate-50 z-10 border-r border-slate-100 min-w-[100px]">Reg. No.</th>
                  <th className="text-left px-3 py-2.5 min-w-[130px]">Make / Model</th>
                  <th className="text-left px-3 py-2.5">Yr</th>
                  <th className="text-left px-3 py-2.5">Type</th>
                  <th className="text-right px-3 py-2.5">Cap (T)</th>
                  <th className="text-left px-3 py-2.5">Color</th>
                  <th className="text-left px-3 py-2.5 min-w-[130px]">Owner</th>
                  <th className="text-left px-3 py-2.5">Seq. No.</th>
                  <th className="text-left px-3 py-2.5 min-w-[120px]">Auth. Driver</th>
                  <th className="text-left px-3 py-2.5">Status</th>
                  <th className="text-left px-3 py-2.5 min-w-[110px]">Reg. Expiry</th>
                  <th className="text-left px-3 py-2.5 min-w-[110px]">Ins. Validity</th>
                  <th className="text-left px-3 py-2.5 min-w-[110px]">Auth. Validity</th>
                  <th className="text-left px-3 py-2.5 min-w-[110px]">MVPI Validity</th>
                  <th className="text-left px-3 py-2.5 min-w-[110px]">Next Service</th>
                  <th className="text-left px-3 py-2.5 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(v => (
                  <tr
                    key={v.id}
                    onClick={() => setSelected(prev => prev?.id === v.id ? null : v)}
                    className={`cursor-pointer hover:bg-blue-50/40 transition-colors ${selected?.id === v.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className={`px-3 py-2 font-bold text-slate-800 sticky left-0 z-10 border-r border-slate-100 ${selected?.id === v.id ? 'bg-blue-50' : 'bg-white'}`}>
                      {v.registration_number}
                    </td>
                    <td className="px-3 py-2 text-slate-700 font-medium">{v.make} {v.model}</td>
                    <td className="px-3 py-2 text-slate-400">{v.year}</td>
                    <td className="px-3 py-2 capitalize text-slate-600">{v.type}</td>
                    <td className="px-3 py-2 text-slate-500 text-right">{v.capacity_tons}</td>
                    <td className="px-3 py-2 text-slate-500">{(v as any).color || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2 text-slate-600">{(v as any).owner_name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2 text-slate-500 font-mono">{(v as any).sequence_number || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2 text-slate-600">{(v as any).authorized_driver || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getStatusColor(v.status)}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2">{expiryBadge((v as any).registration_expiry)}</td>
                    <td className="px-3 py-2">{expiryBadge((v as any).insurance_expiry)}</td>
                    <td className="px-3 py-2">{expiryBadge((v as any).authorization_expiry)}</td>
                    <td className="px-3 py-2">{expiryBadge((v as any).mvpi_expiry)}</td>
                    <td className="px-3 py-2">{expiryBadge(v.next_service_date)}</td>
                    <td className="px-3 py-2 pr-4">
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); handleOpenModal(v); }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(v.id); }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Form Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-800">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{error}</div>}

              {/* Vehicle Details */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vehicle Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                    <input type="text" required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono uppercase"
                      value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value.toUpperCase()})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                    <input type="text" required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                    <input type="text" required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                    <input type="number" required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (Tons)</label>
                    <input type="number" step="any" required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.capacity_tons} onChange={e => setFormData({...formData, capacity_tons: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      {TYPE_OPTIONS.filter(t => t !== 'all').map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {STATUS_OPTIONS.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Service</label>
                    <input type="date"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.last_service_date} onChange={e => setFormData({...formData, last_service_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Next Service</label>
                    <input type="date"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.next_service_date} onChange={e => setFormData({...formData, next_service_date: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Validity & Authorization */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Validity &amp; Authorization</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Registration Expiry</label>
                    <input type="date"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.registration_expiry} onChange={e => setFormData({...formData, registration_expiry: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Validity</label>
                    <input type="date"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.insurance_expiry} onChange={e => setFormData({...formData, insurance_expiry: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Authorized Driver Name</label>
                    <input type="text" placeholder="Full name of authorized driver"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.authorized_driver} onChange={e => setFormData({...formData, authorized_driver: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Authorization Validity</label>
                    <input type="date"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.authorization_expiry} onChange={e => setFormData({...formData, authorization_expiry: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">MVPI Validity</label>
                    <input type="date"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      value={formData.mvpi_expiry} onChange={e => setFormData({...formData, mvpi_expiry: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <ImportVehiclesCSVModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={load}
        />
      )}
    </div>
  );
}

