import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { 
  Plus, 
  Search, 
  Building2, 
  Users,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import DocumentBrowser from '../components/DocumentBrowser';

interface Sponsor {
  id: string;
  name: string;
  moi: string;
  contract_url?: string;
  status: 'active' | 'inactive';
  notes?: string;
  employee_count?: number;
}

export default function SponsorsPage() {
  const confirm = useConfirmStore(state => state.confirm);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorMoi, setSponsorMoi] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState<'active' | 'inactive'>('active');
  const [sponsorNotes, setSponsorNotes] = useState('');

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('sponsors')
      .select(`
        *,
        employees:employees(count)
      `);

    if (!error && data) {
      setSponsors((data as any[]).map(s => ({
        ...s,
        employee_count: s.employees?.[0]?.count || 0
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const openCreateModal = () => {
    setModalMode('create');
    setSponsorName('');
    setSponsorMoi('');
    setSponsorStatus('active');
    setSponsorNotes('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (sponsor: Sponsor, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSponsorName(sponsor.name);
    setSponsorMoi(sponsor.moi || '');
    setSponsorStatus(sponsor.status);
    setSponsorNotes(sponsor.notes || '');
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) {
      setError('Sponsor name is required.');
      return;
    }
    if (!sponsorMoi.trim()) {
      setError('Sponsor MOI is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (modalMode === 'create') {
        const { error: insertErr } = await (supabase as any)
          .from('sponsors')
          .insert({
            name: sponsorName,
            moi: sponsorMoi.trim(),
            status: sponsorStatus,
            notes: sponsorNotes
          });
        if (insertErr) throw insertErr;
      } else {
        if (!selectedSponsor) return;
        const { error: updateErr } = await (supabase as any)
          .from('sponsors')
          .update({
            name: sponsorName,
            moi: sponsorMoi.trim(),
            status: sponsorStatus,
            notes: sponsorNotes
          })
          .eq('id', selectedSponsor.id);
        if (updateErr) throw updateErr;
      }

      fetchSponsors();
      setShowModal(false);
      setSelectedSponsor(null);
    } catch (err: any) {
      console.error('Error saving sponsor:', err);
      setError(err.message || 'Failed to save sponsor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sponsor: Sponsor, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Sponsor',
      message: `Are you sure you want to delete ${sponsor.name}? This will remove them from the sponsor master list.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const { error: deleteErr } = await (supabase as any)
        .from('sponsors')
        .delete()
        .eq('id', sponsor.id);

      if (deleteErr) throw deleteErr;

      fetchSponsors();
      setSelectedSponsor(null);
    } catch (err: any) {
      console.error('Error deleting sponsor:', err);
      alert(err.message || 'Failed to delete sponsor.');
    }
  };

  const filteredSponsors = sponsors.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Sponsor Master
          </h1>
          <p className="text-slate-500 text-sm">Manage enterprise sponsors and their legal contracts.</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2 font-bold shadow-lg shadow-blue-500/20">
          <Plus size={18} />
          Add New Sponsor
        </Button>
      </div>

      {/* Grid Layout (List + Detail side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sponsors List Table */}
        <div className={cn(
          "bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm transition-all",
          selectedSponsor ? "lg:col-span-7" : "lg:col-span-12"
        )}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sponsors..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Total: {sponsors.length}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Active: {sponsors.filter(s => s.status === 'active').length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Sponsor Name</th>
                  <th className="px-6 py-4 text-center">Employees</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-6 h-16 bg-slate-50/10" />
                    </tr>
                  ))
                ) : filteredSponsors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                      No sponsors found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredSponsors.map((sponsor) => (
                    <tr 
                      key={sponsor.id} 
                      onClick={() => setSelectedSponsor(sponsor)}
                      className={cn(
                        "hover:bg-slate-50/55 transition-colors cursor-pointer group",
                        selectedSponsor?.id === sponsor.id ? "bg-blue-50/20" : ""
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">
                            {sponsor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{sponsor.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">MOI: {sponsor.moi || '—'} | ID: {sponsor.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          <Users size={11} />
                          {sponsor.employee_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                          sponsor.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {sponsor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => openEditModal(sponsor, e)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(sponsor, e)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
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

        {/* Sponsor Detail Side Panel with Integrated Document Browser */}
        {selectedSponsor && (
          <div className="lg:col-span-5 bg-white rounded-[32px] border border-slate-100 p-6 shadow-xl space-y-6 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  {selectedSponsor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{selectedSponsor.name}</h3>
                  <span className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    selectedSponsor.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {selectedSponsor.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => openEditModal(selectedSponsor, e)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                  title="Edit Sponsor"
                >
                  <Edit2 size={15} />
                </button>
                <button 
                  onClick={(e) => handleDelete(selectedSponsor, e)}
                  className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Sponsor"
                >
                  <Trash2 size={15} />
                </button>
                <button 
                  onClick={() => setSelectedSponsor(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Registry Info Card */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sponsor Registry Stats</h4>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Sponsor MOI Number</span>
                <span className="font-black text-slate-800 font-mono">{selectedSponsor.moi || '—'}</span>
              </div>
            </div>

            {/* Notes Section */}
            {selectedSponsor.notes && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sponsor Notes</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
                  {selectedSponsor.notes}
                </p>
              </div>
            )}

            {/* Attached Documents Browser Integration */}
            <div className="border-t border-slate-100 pt-6">
              <DocumentBrowser 
                entityType="sponsor"
                entityId={selectedSponsor.id}
                title="Sponsor Contracts & Vault"
              />
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Sponsor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <form onSubmit={handleSave} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {modalMode === 'create' ? 'Add New Sponsor' : 'Edit Sponsor'}
                </h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sponsor Master Registry</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-50 rounded-lg">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-600 text-xs font-bold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sponsor Name</label>
                <input 
                  type="text" 
                  value={sponsorName}
                  onChange={e => setSponsorName(e.target.value)}
                  placeholder="e.g. Saudi Aramco"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* MOI */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sponsor MOI</label>
                <input 
                  type="text" 
                  value={sponsorMoi}
                  onChange={e => setSponsorMoi(e.target.value)}
                  placeholder="e.g. 7012345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
                <select 
                  value={sponsorStatus}
                  onChange={e => setSponsorStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Notes</label>
                <textarea 
                  value={sponsorNotes}
                  onChange={e => setSponsorNotes(e.target.value)}
                  placeholder="Enter custom descriptions or contract terms details..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)} disabled={submitting} className="text-xs">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="rounded-2xl px-5 bg-blue-600 hover:bg-blue-700 font-bold gap-2 text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
