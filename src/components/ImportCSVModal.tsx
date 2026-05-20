import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertCircle, FileText, Database, Sparkles, Download, Play, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ParsedEmployeeRow {
  fullName: string;
  iqamaNumber: string;
  nationality: string;
  profession: string;
  role: string;
  dobHijri: string;
  expiryHijri: string;
  passportNumber: string;
  passportExpiry: string;
  passportPlaceOfIssue: string;
  sponsorName: string;
  sponsorMoi: string;
  isValid: boolean;
  errorMsg?: string;
}

export default function ImportCSVModal({ isOpen, onClose, onImportComplete }: ImportCSVModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'summary'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Real-Time Progress States
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentActionLog, setCurrentActionLog] = useState('Initializing import stream...');
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [sponsorsCreatedCount, setSponsorsCreatedCount] = useState(0);
  const [summaryReport, setSummaryReport] = useState<{ successList: string[]; failList: { name: string; err: string }[] }>({
    successList: [],
    failList: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setParsedRows([]);
      setError(null);
      setCurrentProgress(0);
      setSuccessCount(0);
      setFailureCount(0);
      setSponsorsCreatedCount(0);
      setSummaryReport({ successList: [], failList: [] });
    }
  }, [isOpen]);

  // Resilient Quote-Aware CSV Parser
  const parseCSVText = (text: string): ParsedEmployeeRow[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    // Parse header to map positions accurately
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    // Header Mappings
    const mapHeader = (name: string) => {
      const idx = rawHeaders.findIndex(h => h.includes(name.toLowerCase()));
      return idx;
    };

    const idxName = mapHeader('full name');
    const idxIqama = mapHeader('iqama number');
    const idxNationality = mapHeader('nationality');
    const idxProfession = mapHeader('profession');
    const idxRole = mapHeader('role');
    const idxDob = mapHeader('dob hijri');
    const idxExpiry = mapHeader('expiry hijri');
    const idxPassportNum = mapHeader('passport number');
    const idxPassportExp = mapHeader('passport expiry');
    const idxPassportIssue = mapHeader('passport place of issue');
    const idxSponsorName = mapHeader('sponsor name');
    const idxSponsorMoi = mapHeader('sponsor moi');

    const resultRows: ParsedEmployeeRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Resilient character parser for comma-splits inside quotes
      const values: string[] = [];
      let insideQuote = false;
      let currentValue = '';

      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"' || char === "'") {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(currentValue.trim().replace(/^["']|["']$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^["']|["']$/g, ''));

      // Extract values by indices with safe fallbacks
      const fullName = idxName !== -1 ? values[idxName] || '' : '';
      const iqamaNumber = idxIqama !== -1 ? values[idxIqama] || '' : '';
      const nationality = idxNationality !== -1 ? values[idxNationality] || 'Pakistani' : 'Pakistani';
      const profession = idxProfession !== -1 ? values[idxProfession] || 'Heavy Duty Truck Driver' : 'Heavy Duty Truck Driver';
      const role = idxRole !== -1 ? (values[idxRole] || 'driver').toLowerCase() : 'driver';
      const dobHijri = idxDob !== -1 ? values[idxDob] || '1410-01-01' : '1410-01-01';
      const expiryHijri = idxExpiry !== -1 ? values[idxExpiry] || '1448-01-01' : '1448-01-01';
      const passportNumber = idxPassportNum !== -1 ? values[idxPassportNum] || '' : '';
      const passportExpiry = idxPassportExp !== -1 ? values[idxPassportExp] || '' : '';
      const passportPlaceOfIssue = idxPassportIssue !== -1 ? values[idxPassportIssue] || '' : '';
      const sponsorName = idxSponsorName !== -1 ? values[idxSponsorName] || '' : '';
      const sponsorMoi = idxSponsorMoi !== -1 ? values[idxSponsorMoi] || '' : '';

      // Validation logic
      let isValid = true;
      let errorMsg = '';

      if (!fullName) {
        isValid = false;
        errorMsg = 'Full Name is required.';
      } else if (!iqamaNumber || iqamaNumber.length !== 10 || isNaN(Number(iqamaNumber))) {
        isValid = false;
        errorMsg = 'Iqama Number must be exactly 10 digits.';
      } else if (!sponsorName || !sponsorMoi || sponsorMoi.length !== 10 || isNaN(Number(sponsorMoi))) {
        isValid = false;
        errorMsg = 'Sponsor Name and valid 10-digit Sponsor MOI are required.';
      }

      resultRows.push({
        fullName,
        iqamaNumber,
        nationality,
        profession,
        role: role === 'driver' || role === 'labor' ? role : 'driver',
        dobHijri,
        expiryHijri,
        passportNumber,
        passportExpiry,
        passportPlaceOfIssue,
        sponsorName,
        sponsorMoi,
        isValid,
        errorMsg
      });
    }

    return resultRows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setError(null);
      readAndParseCSV(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setError(null);
      readAndParseCSV(file);
    }
  };

  const readAndParseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSVText(text);
        if (rows.length === 0) {
          throw new Error('The uploaded CSV file appears to be empty or missing headers.');
        }
        setParsedRows(rows);
        setStep('preview');
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading CSV file.');
    };
    reader.readAsText(file);
  };

  // Generate & Download Dynamic CSV Template
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Full Name,Iqama Number,Nationality,Profession,Role,DOB Hijri,Expiry Hijri,Passport Number,Passport Expiry,Passport Place of Issue,Sponsor Name,Sponsor MOI\n"
      + "Govinda Bahadur Pradhan,2558534943,Nepalese,Trailer Truck Driver,driver,1395-02-18,1448-01-20,PA4303379,1457-03-06,NEPAL,Namaa Fleet Transport Co.,7015461945\n"
      + "Arshad Khan,2438910294,Pakistani,Heavy Duty Truck Driver,driver,1412-05-18,1448-11-25,KP0998877,1448-05-15,LAHORE,Jawaa Human Resources Company,7012345678\n"
      + "Manan Ansari,2520677903,Indian,Loading and Unloading Labor,labor,1400-04-14,1447-11-17,KP0887766,1448-02-10,MUMBAI,Jawaa Human Resources Company,7012345678";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tms_employee_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Start Bulk Import Engine
  const startBulkImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setError('There are no valid rows to import.');
      return;
    }

    setStep('importing');
    setCurrentProgress(0);
    setSuccessCount(0);
    setFailureCount(0);
    setSponsorsCreatedCount(0);
    setError(null);

    const successfulNames: string[] = [];
    const failedNames: { name: string; err: string }[] = [];
    let newSponsorsCreated = 0;

    try {
      // PHASE 1: PRE-FLIGHT UNIQUE SPONSOR AUTO-CREATION
      setCurrentActionLog('Pre-flight: Extracting unique sponsors from data feed...');
      await new Promise(resolve => setTimeout(resolve, 800));

      const uniqueSponsorsMap = new Map<string, string>(); // MOI -> Name
      validRows.forEach(row => {
        if (row.sponsorMoi && row.sponsorName) {
          uniqueSponsorsMap.set(row.sponsorMoi.trim(), row.sponsorName.trim());
        }
      });

      let sponsorIdx = 0;
      for (const [moi, name] of uniqueSponsorsMap.entries()) {
        sponsorIdx++;
        setCurrentActionLog(`Pre-flight: Checking sponsor ${sponsorIdx} of ${uniqueSponsorsMap.size} (MOI: ${moi})...`);
        
        const { data: existingSponsor } = await (supabase as any)
          .from('sponsors')
          .select('moi')
          .eq('moi', moi)
          .maybeSingle();

        if (!existingSponsor) {
          setCurrentActionLog(`Pre-flight: Auto-creating missing sponsor "${name}"...`);
          const { error: sponsorErr } = await (supabase as any)
            .from('sponsors')
            .insert({
              name,
              moi,
              status: 'active'
            } as any);

          if (!sponsorErr) {
            newSponsorsCreated++;
            setSponsorsCreatedCount(newSponsorsCreated);
          } else {
            console.error('Failed to auto-create sponsor:', sponsorErr);
          }
        }
      }

      setCurrentActionLog(`Pre-flight sponsor mapping complete. Auto-created ${newSponsorsCreated} missing sponsors!`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // PHASE 2: SEQUENTIAL WORKFORCE ENROLLMENT (EDGE-FUNCTION RATES BYPASS)
      for (let index = 0; index < validRows.length; index++) {
        const row = validRows[index];
        setCurrentActionLog(`Row ${index + 1}/${validRows.length}: Enrolling profile "${row.fullName}"...`);

        try {
          // A. Check if employee is already registered in employees to prevent duplicate blocks
          const { data: existingEmp } = await (supabase as any)
            .from('employees')
            .select('id')
            .eq('iqama_number', row.iqamaNumber.trim())
            .maybeSingle();

          if (existingEmp) {
            throw new Error(`Iqama ID ${row.iqamaNumber} is already registered in the system.`);
          }

          // B. Register Administrative User through backend Edge Function bypassing rate limits!
          const placeholderEmail = `${row.fullName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}@tms-workforce.com`;
          const tempPassword = 'UserPassword123!';
          let targetProfileId = '';

          const { error: fnError, data: fnData } = await supabase.functions.invoke('create-user', {
            body: {
              email: placeholderEmail,
              password: tempPassword,
              full_name: row.fullName.trim(),
              role: row.role
            }
          });

          if (fnError) throw fnError;
          if (fnData?.error) throw new Error(fnData.error);
          if (fnData?.user) {
            targetProfileId = fnData.user.id;
          } else {
            throw new Error('Secure credentials creation returned invalid signature.');
          }

          // C. Create workforce employee record
          const { error: employeeErr } = await (supabase as any)
            .from('employees')
            .insert({
              id: targetProfileId,
              iqama_number: row.iqamaNumber.trim(),
              iqama_expiry_hijri: row.expiryHijri,
              dob_hijri: row.dobHijri,
              sponsor_moi: row.sponsorMoi.trim(),
              nationality: row.nationality,
              profession: row.profession,
              status: 'available',
              license_number: row.role === 'driver' ? 'LIC-' + Math.floor(100000 + Math.random() * 900000) : null,
              notes: `Bulk registered via CSV upload workspace. Passport: ${row.passportNumber || '—'}. Sponsor: ${row.sponsorName}`
            } as any);

          if (employeeErr) throw employeeErr;

          // D. Record Success
          successfulNames.push(row.fullName);
          setSuccessCount(prev => prev + 1);

        } catch (rowErr: any) {
          console.error(`Error importing row for ${row.fullName}:`, rowErr);
          failedNames.push({ name: row.fullName, err: rowErr.message || 'Registration failed' });
          setFailureCount(prev => prev + 1);
        }

        // Update progress bar
        setCurrentProgress(Math.round(((index + 1) / validRows.length) * 100));
      }

      // Finish bulk process
      setSummaryReport({
        successList: successfulNames,
        failList: failedNames
      });
      setStep('summary');
      onImportComplete();

    } catch (err: any) {
      console.error('Fatal bulk import failure:', err);
      setError(err.message || 'A fatal error occurred during the bulk import process.');
      setStep('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      
      {/* STEP 1: UPLOAD DASHBOARD */}
      {step === 'upload' && (
        <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">Bulk CSV Import Console</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Workforce Mass Enrollment Workspace</p>
            </div>
            
            <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-800">
              <X size={18} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-xs animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {/* Template Download Alert */}
            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-800">Download Excel/CSV Import Template</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  Use our standardized template prefilled with accurate header columns and sample rows to format your employee data lists correctly!
                </p>
                <Button 
                  onClick={downloadTemplate} 
                  type="button"
                  className="mt-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] h-8 px-4 gap-1.5 shadow-md shadow-blue-500/10 transition-all scale-100 hover:scale-102"
                >
                  <Download size={12} />
                  Download CSV Template
                </Button>
              </div>
            </div>

            {/* Drag & Drop File Container */}
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
                accept=".csv"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-800">Upload Employee CSV File</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Drag-and-drop or browse your local system folder</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW & VALIDATION GRID */}
      {step === 'preview' && (
        <div className="bg-slate-900 w-full max-w-[1100px] h-[85vh] rounded-[36px] shadow-2xl overflow-hidden border border-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
          
          <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-4 shrink-0">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight truncate flex items-center gap-2">
                <FileText size={18} className="text-blue-400" /> Parsed CSV Data Verification
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Review parsed columns, validate records, and proceed to bulk upload</p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={startBulkImport}
                className="rounded-2xl px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black gap-2 text-xs shadow-lg shadow-indigo-500/10 border border-indigo-500/20 transition-all scale-100 hover:scale-102"
              >
                <Play size={14} />
                Start Bulk Import ({parsedRows.filter(r => r.isValid).length} Rows)
              </Button>
              
              <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-start gap-3 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-black text-rose-200">Processing Error</p>
                  <p className="font-semibold text-rose-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Validation warning summary */}
            {parsedRows.some(r => !r.isValid) && (
              <div className="p-4 bg-amber-950/60 border border-amber-900/60 rounded-2xl flex items-start gap-3 text-amber-300 text-xs animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-black text-amber-200">Validation Notice</p>
                  <p className="text-[10px] text-amber-400 mt-1">
                    Some rows contain formatting errors or missing values (shown in red below). These rows will be skipped automatically during the import process.
                  </p>
                </div>
              </div>
            )}

            {/* Scrollable table grid */}
            <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-bold text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Full Name</th>
                      <th className="px-5 py-3.5">Iqama / ID</th>
                      <th className="px-5 py-3.5">Nationality</th>
                      <th className="px-5 py-3.5">Profession</th>
                      <th className="px-5 py-3.5">Sponsor MOI</th>
                      <th className="px-5 py-3.5">Sponsor Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={`hover:bg-slate-900/50 transition-colors ${!row.isValid ? 'bg-rose-950/10' : ''}`}>
                        <td className="px-5 py-3">
                          {row.isValid ? (
                            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-lg text-[9px]">Valid</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-lg text-[9px]" title={row.errorMsg}>Error</span>
                          )}
                        </td>
                        <td className={`px-5 py-3 ${!row.isValid && !row.fullName ? 'text-rose-400' : 'text-slate-200'}`}>{row.fullName || '—'}</td>
                        <td className="px-5 py-3 font-mono">{row.iqamaNumber || '—'}</td>
                        <td className="px-5 py-3">{row.nationality}</td>
                        <td className="px-5 py-3 text-slate-400">{row.profession}</td>
                        <td className="px-5 py-3 font-mono text-slate-400">{row.sponsorMoi || '—'}</td>
                        <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{row.sponsorName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-end gap-3 shrink-0">
            <Button 
              onClick={() => setStep('upload')} 
              variant="outline"
              className="rounded-2xl border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white px-5 h-10 font-bold text-xs"
            >
              Back to Upload
            </Button>
            
            <Button 
              onClick={startBulkImport}
              className="rounded-2xl px-6 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black gap-2 text-xs shadow-lg shadow-indigo-500/10 border border-indigo-500/20 transition-all"
            >
              Confirm & Start Import ({parsedRows.filter(r => r.isValid).length} Rows)
            </Button>
          </div>

        </div>
      )}

      {/* STEP 3: REAL-TIME PROGRESS BAR */}
      {step === 'importing' && (
        <div className="bg-slate-900 w-full max-w-xl rounded-[36px] shadow-2xl overflow-hidden border border-slate-800 p-8 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-3xl bg-indigo-950 border border-indigo-800 flex items-center justify-center shadow-xl shadow-indigo-500/10 animate-pulse">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-black text-white tracking-tight">Bulk Import Stream Active</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Do not close this modal or refresh your browser!</p>
          </div>

          {/* Glowing Progress loader */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-wide">
              <span>Progress</span>
              <span className="text-indigo-400 font-mono">{currentProgress}%</span>
            </div>
            
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-850 p-0.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/20"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Action Log Output Screen */}
          <div className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4.5 min-h-[80px] flex items-center justify-center text-center shadow-2xl">
            <p className="text-[10.5px] font-mono text-emerald-400 leading-relaxed font-bold animate-pulse">
              ⚡ {currentActionLog}
            </p>
          </div>

          {/* Summary counters in progress */}
          <div className="w-full grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Sponsors Auto-Created</p>
              <p className="text-lg font-black text-emerald-400 mt-1 font-mono">{sponsorsCreatedCount}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Succeeded Profiles</p>
              <p className="text-lg font-black text-indigo-400 mt-1 font-mono">{successCount}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Failed rows</p>
              <p className="text-lg font-black text-rose-400 mt-1 font-mono">{failureCount}</p>
            </div>
          </div>

        </div>
      )}

      {/* STEP 4: AUDIT SUMMARY REPORT */}
      {step === 'summary' && (
        <div className="bg-slate-900 w-full max-w-2xl rounded-[36px] shadow-2xl overflow-hidden border border-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
          
          <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-4 shrink-0">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" /> Import Operation Complete
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit log of bulk workforce enrollment session</p>
            </div>

            <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Main Stats Card */}
            <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 grid grid-cols-3 divide-x divide-slate-800 text-center shadow-xl">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sponsors Auto-Created</p>
                <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{sponsorsCreatedCount}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Imported Profiles</p>
                <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">{successCount}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Errors Encountered</p>
                <p className="text-2xl font-black text-rose-500 mt-1 font-mono">{failureCount}</p>
              </div>
            </div>

            {/* Error Audit Details */}
            {summaryReport.failList.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Failure Audit Log ({summaryReport.failList.length} Rows skipped)
                </h4>
                
                <div className="bg-slate-950 border border-slate-850 rounded-2xl max-h-[160px] overflow-y-auto divide-y divide-slate-850">
                  {summaryReport.failList.map((f, idx) => (
                    <div key={idx} className="p-3 text-[10.5px] font-bold flex justify-between gap-4">
                      <span className="text-slate-300 font-bold">{f.name}</span>
                      <span className="text-rose-400 font-mono font-medium">{f.err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Audit Details */}
            {summaryReport.successList.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Database size={12} /> Success Profiles Linked ({summaryReport.successList.length} Accounts created)
                </h4>
                
                <div className="bg-slate-950 border border-slate-850 rounded-2xl max-h-[160px] overflow-y-auto p-4 flex flex-wrap gap-2">
                  {summaryReport.successList.map((name, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-[10px] font-bold">
                      ✅ {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/90 backdrop-blur flex justify-end shrink-0">
            <Button 
              onClick={onClose} 
              className="rounded-2xl px-6 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-500/10 border border-emerald-500/20 transition-all"
            >
              Done & Close
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
