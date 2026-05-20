import { useState, useEffect } from 'react';
import { X, Loader2, Save, AlertCircle, Database, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

interface Employee {
  id: string;
  iqama_number: string;
  full_name: string;
  role: string;
  sponsor_name: string;
  sponsor_moi?: string;
  iqama_expiry_hijri: string;
  dob_hijri: string;
  photo_url: string;
  status: string;
  nationality?: string;
  profession?: string;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onUpdateComplete: () => void;
}

export default function EditEmployeeModal({ isOpen, onClose, employee, onUpdateComplete }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    iqamaNumber: '',
    nationality: '',
    profession: '',
    role: 'driver',
    dobHijri: '',
    expiryHijri: '',
    sponsorName: '',
    sponsorMoi: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Prepopulate form when employee changes
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        fullName: employee.full_name || '',
        iqamaNumber: employee.iqama_number || '',
        nationality: employee.nationality || '',
        profession: employee.profession || '',
        role: employee.role || 'driver',
        dobHijri: employee.dob_hijri || '',
        expiryHijri: employee.iqama_expiry_hijri || '',
        sponsorName: employee.sponsor_name || '',
        sponsorMoi: employee.sponsor_moi || ''
      });
      setError(null);
      setSuccess(null);
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.fullName.trim()) throw new Error('Full Name is required.');
      if (!formData.iqamaNumber.trim() || formData.iqamaNumber.trim().length !== 10) {
        throw new Error('Valid 10-digit Iqama Number is required.');
      }
      if (!formData.sponsorMoi.trim() || formData.sponsorMoi.trim().length !== 10) {
        throw new Error('Valid 10-digit Sponsor MOI is required to link legal sponsor.');
      }

      const finalSponsorMoi = formData.sponsorMoi.trim();

      // 1. Upsert Sponsor details if specified
      if (formData.sponsorName.trim() && finalSponsorMoi) {
        const { data: existingSponsor } = await (supabase as any)
          .from('sponsors')
          .select('moi')
          .eq('moi', finalSponsorMoi)
          .maybeSingle();

        if (!existingSponsor) {
          // Create new sponsor reference
          const { error: insErr } = await (supabase as any)
            .from('sponsors')
            .insert({
              name: formData.sponsorName.trim(),
              moi: finalSponsorMoi,
              status: 'active'
            });
          if (insErr) throw insErr;
        } else {
          // Update sponsor name to reflect edits
          const { error: updSponsorErr } = await (supabase as any)
            .from('sponsors')
            .update({ name: formData.sponsorName.trim() })
            .eq('moi', finalSponsorMoi);
          if (updSponsorErr) throw updSponsorErr;
        }
      }

      // 2. Update System Profile Table (Full Name & Role)
      const { error: profileErr } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: formData.fullName.trim(),
          role: formData.role
        })
        .eq('id', employee.id);

      if (profileErr) throw profileErr;

      // 3. Update Employee Master Table
      const { error: employeeErr } = await (supabase as any)
        .from('employees')
        .update({
          iqama_number: formData.iqamaNumber.trim(),
          iqama_expiry_hijri: formData.expiryHijri.trim(),
          dob_hijri: formData.dobHijri.trim(),
          sponsor_moi: finalSponsorMoi,
          nationality: formData.nationality.trim(),
          profession: formData.profession.trim()
        })
        .eq('id', employee.id);

      if (employeeErr) throw employeeErr;

      setSuccess('Workforce profile updated successfully!');
      onUpdateComplete();
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Edit employee error:', err);
      setError(err.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Panel */}
        <div className="px-8 py-6 border-b border-slate-150 flex items-center justify-between gap-4 bg-slate-50">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-2 truncate">
              <Sparkles size={18} className="text-blue-500 shrink-0" /> Edit Workforce Information
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 truncate">Modify profile credentials and legal sponsorship</p>
          </div>
          
          <button 
            type="button" 
            onClick={onClose} 
            disabled={saving}
            className="p-2.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveChanges} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Status Banners */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-700 text-xs animate-in fade-in">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-emerald-500 animate-bounce" />
              <p className="font-bold">{success}</p>
            </div>
          )}

          {/* Section 1: Professional Identity */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
              <Database size={12} className="text-blue-500" /> 1. Professional Identity
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Profession</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.profession}
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Nationality</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.nationality}
                  onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">System Role</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="driver">Driver (Workforce)</option>
                  <option value="labor">Laborer (Workforce)</option>
                  <option value="supervisor">Supervisor (Control Room)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Residency Credentials */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
              <Database size={12} className="text-blue-500" /> 2. Residency Credentials
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Iqama / Muqeem ID</label>
                <input 
                  required
                  type="text"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.iqamaNumber}
                  onChange={e => setFormData({ ...formData, iqamaNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Iqama Expiry (Hijri)</label>
                <input 
                  required
                  type="text"
                  placeholder="YYYY-MM-DD"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.expiryHijri}
                  onChange={e => setFormData({ ...formData, expiryHijri: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Date of Birth (Hijri)</label>
                <input 
                  required
                  type="text"
                  placeholder="YYYY-MM-DD"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.dobHijri}
                  onChange={e => setFormData({ ...formData, dobHijri: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Legal Sponsor Details */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
              <Database size={12} className="text-blue-500" /> 3. Legal Sponsor Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Sponsor Company Name</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.sponsorName}
                  onChange={e => setFormData({ ...formData, sponsorName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Sponsor MOI Number</label>
                <input 
                  required
                  type="text"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-850 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.sponsorMoi}
                  onChange={e => setFormData({ ...formData, sponsorMoi: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Footer Action Panel */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={saving}
              className="rounded-2xl px-5 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="rounded-2xl px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-2 shadow-lg shadow-blue-500/25 border border-blue-500/10 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
