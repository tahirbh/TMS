import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertCircle, FileText, Database, Sparkles, UserPlus, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComplete: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onAddComplete }: AddEmployeeModalProps) {
  const [step, setStep] = useState<'upload' | 'register'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    iqamaNumber: '',
    dobHijri: '1410-01-01',
    expiryHijri: '1448-01-01',
    profession: 'Trailer Truck Driver',
    role: 'driver',
    nationality: 'Nepalese',
    passportNumber: '',
    passportExpiry: '',
    passportPlaceOfIssue: '',
    sponsorName: 'Namaa Fleet Transport Co.',
    sponsorMoi: '7015461945'
  });

  useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setSelectedFile(null);
      setFileUrl(null);
      setError(null);
      setSuccess(null);
      setFormData({
        fullName: '',
        iqamaNumber: '',
        dobHijri: '1410-01-01',
        expiryHijri: '1448-01-01',
        profession: 'Trailer Truck Driver',
        role: 'driver',
        nationality: 'Nepalese',
        passportNumber: '',
        passportExpiry: '',
        passportPlaceOfIssue: '',
        sponsorName: 'Namaa Fleet Transport Co.',
        sponsorMoi: '7015461945'
      });
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
      setStep('register');
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
      setStep('register');
      setError(null);
    }
  };

  const handleRegister = async () => {
    if (!formData.fullName.trim() || !formData.iqamaNumber.trim()) {
      setError('Full Name and Iqama Number are required fields.');
      return;
    }

    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Check if Iqama number is already registered
      const { data: existingEmployee } = await (supabase as any)
        .from('employees')
        .select('id')
        .eq('iqama_number', formData.iqamaNumber.trim())
        .maybeSingle();

      if (existingEmployee) {
        throw new Error(`An employee with Iqama ID ${formData.iqamaNumber} is already registered in the system.`);
      }

      // 2. Handle Sponsor Master Auto-Creation
      let finalSponsorMoi = formData.sponsorMoi.trim() || null;
      if (formData.sponsorName.trim() && formData.sponsorMoi.trim()) {
        const { data: existingSponsor } = await (supabase as any)
          .from('sponsors')
          .select('moi')
          .eq('moi', formData.sponsorMoi.trim())
          .maybeSingle();

        if (!existingSponsor) {
          const { error: sponsorErr } = await (supabase as any)
            .from('sponsors')
            .insert({
              name: formData.sponsorName.trim(),
              moi: formData.sponsorMoi.trim(),
              status: 'active'
            } as any);

          if (sponsorErr) throw sponsorErr;
        }
      }

      // 3. Register Auth User with Fallback for Rate Limits
      const placeholderEmail = `${formData.fullName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}@tms-workforce.com`;
      const tempPassword = 'UserPassword123!';
      let targetProfileId = '';

      try {
        const { error: fnError, data: fnData } = await supabase.functions.invoke('create-user', {
          body: {
            email: placeholderEmail,
            password: tempPassword,
            full_name: formData.fullName.trim(),
            role: formData.role
          }
        });

        if (fnError) throw fnError;
        if (fnData?.error) throw new Error(fnData.error);
        if (fnData?.user) {
          targetProfileId = fnData.user.id;
        } else {
          throw new Error('Failed to create credentials securely.');
        }
      } catch (authErr: any) {
        console.warn("Auth sign up failed via Edge Function:", authErr);
        const errMsg = authErr.message || '';
        if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('email rate limit exceeded')) {
          throw new Error('SUPABASE_AUTH_RATE_LIMIT');
        } else {
          throw authErr;
        }
      }

      // 4. Create Employee Record
      const { error: employeeErr } = await (supabase as any)
        .from('employees')
        .insert({
          id: targetProfileId,
          iqama_number: formData.iqamaNumber.trim(),
          iqama_expiry_hijri: formData.expiryHijri,
          dob_hijri: formData.dobHijri,
          sponsor_moi: finalSponsorMoi,
          nationality: formData.nationality,
          profession: formData.profession,
          status: 'available',
          license_number: formData.role === 'driver' ? 'LIC-' + Math.floor(100000 + Math.random() * 900000) : null,
          notes: `Manually added via Split-Screen Workspace. Passport: ${formData.passportNumber || '—'}. Issue: ${formData.passportPlaceOfIssue || '—'}.`
        } as any);

      if (employeeErr) throw employeeErr;

      // 5. Upload document scan to Supabase storage & database
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const storagePath = `manual/${Date.now()}_${formData.fullName.replace(/\s+/g, '_')}.${fileExt}`;
        
        const { error: storageErr } = await supabase.storage
          .from('documents')
          .upload(storagePath, selectedFile);

        if (!storageErr) {
          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(storagePath);

          if (publicUrlData && publicUrlData.publicUrl) {
            await (supabase as any)
              .from('documents')
              .insert({
                entity_type: 'employee',
                entity_id: targetProfileId,
                name: `${selectedFile.name.replace(/\.[^/.]+$/, "")} Scan`,
                type: 'muqeem',
                file_url: publicUrlData.publicUrl,
                storage_path: storagePath
              } as any);
          }
        }
      }

      setSuccess('Employee successfully registered and profile created!');
      onAddComplete();
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Manual registration error:', err);
      if (err.message === 'SUPABASE_AUTH_RATE_LIMIT') {
        setError('SUPABASE_AUTH_RATE_LIMIT');
      } else {
        setError(err.message || 'Failed to register employee.');
      }
    } finally {
      setRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      
      {/* STEP 1: UPLOAD SCAN FILE */}
      {step === 'upload' && (
        <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">Register New Employee</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Worfkforce Enrollment Console</p>
            </div>
            
            <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-800">
              <X size={18} />
            </button>
          </div>

          <div className="p-8">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/10 group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-800">Upload Credential Document Scan</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Supports PDF or Image (Muqeem, Passport, ID Card)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: WORKSPACE SIDE-BY-SIDE REGISTER */}
      {step === 'register' && (
        <div className="bg-slate-900 w-full max-w-[1300px] h-[90vh] rounded-[36px] shadow-2xl overflow-hidden border border-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
          
          {/* Header Bar */}
          <div className="px-8 py-5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white tracking-tight truncate flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" /> Manual Employee Registration Workspace
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Link Scan & Enter Workforce Details Side-By-Side</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Anchored Top Header Action Button */}
              <Button 
                onClick={handleRegister} 
                disabled={registering}
                className="rounded-2xl px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2 text-xs shadow-lg shadow-emerald-500/10 border border-emerald-500/20 transition-all scale-100 hover:scale-102"
              >
                {registering ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Register Employee
                  </>
                )}
              </Button>
              
              <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Rate Limit Warning Card */}
          {error && error === 'SUPABASE_AUTH_RATE_LIMIT' && (
            <div className="mx-8 mt-4 p-4.5 bg-amber-950/80 border border-amber-800 rounded-2xl flex items-start gap-3 text-amber-300 text-xs animate-in fade-in shrink-0">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500 animate-bounce" />
              <div>
                <p className="font-black text-amber-200 text-sm">Supabase Auth Rate Limit Reached (Free Tier Limitation)</p>
                <p className="font-bold text-amber-400 mt-1 leading-relaxed">
                  You have hit the Supabase hourly rate limit for signing up new accounts.
                </p>
                <div className="mt-2.5 p-3 bg-slate-900/90 rounded-xl border border-amber-950 text-slate-300 leading-relaxed font-medium">
                  💡 <strong className="text-amber-200">How to bypass:</strong> Close this modal and use the **Document Vault Upload console** instead. By setting Action Mode to **"Update Existing"**, you can link documents directly to preloaded test profiles (e.g. Govinda, Khurram) without needing to trigger rate-limited Auth signup API calls!
                </div>
              </div>
            </div>
          )}

          {/* Standard Error Display */}
          {error && error !== 'SUPABASE_AUTH_RATE_LIMIT' && (
            <div className="mx-8 mt-4 p-4 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-start gap-3 text-rose-300 text-xs animate-in fade-in shrink-0">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-black text-rose-200">Registration Error</p>
                <p className="font-semibold text-rose-400 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mx-8 mt-4 p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs animate-in fade-in shrink-0">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-black text-emerald-200">Registration Successful</p>
                <p className="font-semibold text-emerald-400 mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Split Screen Workspace Area */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            
            {/* COLUMN 1: Parallel Native PDF/Document Viewer (5-column span) */}
            <div className="lg:col-span-5 p-8 flex flex-col space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <FileText size={12} className="text-blue-400 shrink-0" /> 📁 Source Document Viewer
              </h4>
              
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden relative flex items-center justify-center p-3 shadow-2xl min-h-[400px]">
                {fileUrl && (selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf')) ? (
                  <iframe 
                    src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`}
                    className="w-full h-full rounded-2xl border-0 bg-white"
                    title="Native PDF Viewer Engine"
                  />
                ) : fileUrl ? (
                  <img 
                    src={fileUrl} 
                    alt="Scan Preview" 
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-xl"
                  />
                ) : (
                  <div className="text-slate-600 text-xs flex flex-col items-center gap-2">
                    <AlertCircle size={20} />
                    <span>No scan file available</span>
                  </div>
                )}
              </div>
              
              <p className="text-[10px] text-slate-500 font-bold text-center">
                💡 VIEW ORIGINAL SCAN FILE SIDE-BY-SIDE TO CROSS-CHECK OR COPY DATA ACCURATELY!
              </p>
            </div>

            {/* COLUMN 2 & 3: Manual Input Grid (7-column span, scrollable) */}
            <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900">
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                
                {/* Segment 1: Profiles & System Identity */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Database size={12} className="text-blue-400" /> 1. Profiles & System Identity
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Govinda Bahadur Pradhan"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Muqeem ID / Iqama Number</label>
                      <input 
                        required
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 2558534943"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:text-slate-600"
                        value={formData.iqamaNumber}
                        onChange={e => setFormData({ ...formData, iqamaNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Nationality</label>
                      <input 
                        type="text"
                        placeholder="e.g. Nepalese"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        value={formData.nationality}
                        onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Date of Birth (Hijri)</label>
                      <input 
                        type="text"
                        placeholder="YYYY-MM-DD (e.g. 1395-02-18)"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:text-slate-600"
                        value={formData.dobHijri}
                        onChange={e => setFormData({ ...formData, dobHijri: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Residency Expiry (Hijri)</label>
                      <input 
                        type="text"
                        placeholder="YYYY-MM-DD (e.g. 1448-01-20)"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:text-slate-600"
                        value={formData.expiryHijri}
                        onChange={e => setFormData({ ...formData, expiryHijri: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Profession</label>
                      <input 
                        type="text"
                        placeholder="e.g. Trailer Truck Driver"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        value={formData.profession}
                        onChange={e => setFormData({ ...formData, profession: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Assign System Role</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="driver">Driver (Workforce)</option>
                        <option value="labor">Laborer (Workforce)</option>
                        <option value="supervisor">Supervisor (Control Room)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Segment 2: Passport Information */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <FileText size={12} className="text-blue-400" /> 2. Passport Credentials
                  </h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Passport Number</label>
                      <input 
                        type="text"
                        placeholder="e.g. PA4303379"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:text-slate-600"
                        value={formData.passportNumber}
                        onChange={e => setFormData({ ...formData, passportNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Passport Expiry (Hijri)</label>
                      <input 
                        type="text"
                        placeholder="YYYY-MM-DD"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:text-slate-600"
                        value={formData.passportExpiry}
                        onChange={e => setFormData({ ...formData, passportExpiry: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Place of Issue</label>
                      <input 
                        type="text"
                        placeholder="e.g. NEPAL"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        value={formData.passportPlaceOfIssue}
                        onChange={e => setFormData({ ...formData, passportPlaceOfIssue: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Segment 3: Legal Sponsor Information */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Database size={12} className="text-blue-400" /> 3. Legal Sponsor Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Sponsor Legal Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Namaa Fleet Transport Co."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        value={formData.sponsorName}
                        onChange={e => setFormData({ ...formData, sponsorName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Sponsor MOI ID</label>
                      <input 
                        type="text"
                        placeholder="e.g. 7015461945"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:text-slate-600"
                        value={formData.sponsorMoi}
                        onChange={e => setFormData({ ...formData, sponsorMoi: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Footer Actions */}
              <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-end gap-3 shrink-0">
                <Button 
                  onClick={onClose} 
                  variant="outline" 
                  className="rounded-2xl border-slate-850 text-slate-300 hover:bg-slate-800 hover:text-white px-5 h-10 font-bold"
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={handleRegister} 
                  disabled={registering}
                  className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 h-10 gap-2 text-xs shadow-lg shadow-indigo-500/10 border border-indigo-500/20 transition-all"
                >
                  {registering ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Confirm & Create Profile
                    </>
                  )}
                </Button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
