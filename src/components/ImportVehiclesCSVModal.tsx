import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertCircle, FileText, Database, Sparkles, Download, Play, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

interface ImportVehiclesCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ParsedVehicleRow {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: string;
  capacityTons: number;
  status: string;
  ownerName: string;
  sequenceNumber: string;
  color: string;
  authorizedDriver: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  authorizationExpiry: string;
  mvpiExpiry: string;
  notes: string;
  isValid: boolean;
  errorMsg?: string;
}

export default function ImportVehiclesCSVModal({ isOpen, onClose, onImportComplete }: ImportVehiclesCSVModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'summary'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedVehicleRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Real-Time Progress States
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentActionLog, setCurrentActionLog] = useState('Initializing import stream...');
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
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
      setSummaryReport({ successList: [], failList: [] });
    }
  }, [isOpen]);

  // Resilient Quote-Aware CSV Parser
  const parseCSVText = (text: string): ParsedVehicleRow[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    // Parse header to map positions accurately
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    // Header Mappings
    const mapHeader = (name: string) => {
      return rawHeaders.findIndex(h => h.includes(name.toLowerCase()));
    };

    const idxReg = mapHeader('registration number') !== -1 ? mapHeader('registration number') : mapHeader('registration');
    const idxMake = mapHeader('make') !== -1 ? mapHeader('make') : mapHeader('manufacturer');
    const idxModel = mapHeader('model');
    const idxYear = mapHeader('year');
    const idxType = mapHeader('type');
    const idxCapacity = mapHeader('capacity tons') !== -1 ? mapHeader('capacity tons') : mapHeader('capacity');
    const idxStatus = mapHeader('status');
    const idxOwner = mapHeader('owner name') !== -1 ? mapHeader('owner name') : mapHeader('owner');
    const idxSeq = mapHeader('sequence number') !== -1 ? mapHeader('sequence number') : mapHeader('sequence');
    const idxColor = mapHeader('color');
    const idxAuthDriver = mapHeader('authorized driver') !== -1 ? mapHeader('authorized driver') : mapHeader('auth. driver');
    const idxRegExpiry = mapHeader('registration expiry');
    const idxInsExpiry = mapHeader('insurance validity') !== -1 ? mapHeader('insurance validity') : mapHeader('insurance');
    const idxAuthExpiry = mapHeader('authorization validity') !== -1 ? mapHeader('authorization validity') : mapHeader('auth. validity');
    const idxMvpiExpiry = mapHeader('mvpi validity') !== -1 ? mapHeader('mvpi validity') : mapHeader('mvpi');
    const idxNotes = mapHeader('notes');

    const resultRows: ParsedVehicleRow[] = [];

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
      const registrationNumber = idxReg !== -1 ? (values[idxReg] || '').trim().toUpperCase() : '';
      const make = idxMake !== -1 ? (values[idxMake] || '').trim() : '';
      const model = idxModel !== -1 ? (values[idxModel] || '').trim() : '';
      const yearRaw = idxYear !== -1 ? values[idxYear] || '' : '';
      const type = idxType !== -1 ? (values[idxType] || '').trim().toLowerCase() : 'truck';
      const capacityRaw = idxCapacity !== -1 ? values[idxCapacity] || '0' : '0';
      const status = idxStatus !== -1 ? (values[idxStatus] || '').trim().toLowerCase() : 'available';
      const ownerName = idxOwner !== -1 ? (values[idxOwner] || '').trim() : '';
      const sequenceNumber = idxSeq !== -1 ? (values[idxSeq] || '').trim() : '';
      const color = idxColor !== -1 ? (values[idxColor] || '').trim() : '';
      const authorizedDriver = idxAuthDriver !== -1 ? (values[idxAuthDriver] || '').trim() : '';
      const registrationExpiry = idxRegExpiry !== -1 ? (values[idxRegExpiry] || '').trim() : '';
      const insuranceExpiry = idxInsExpiry !== -1 ? (values[idxInsExpiry] || '').trim() : '';
      const authorizationExpiry = idxAuthExpiry !== -1 ? (values[idxAuthExpiry] || '').trim() : '';
      const mvpiExpiry = idxMvpiExpiry !== -1 ? (values[idxMvpiExpiry] || '').trim() : '';
      const notes = idxNotes !== -1 ? (values[idxNotes] || '').trim() : '';

      // Validation logic
      let isValid = true;
      let errorMsg = '';

      const year = parseInt(yearRaw);
      const capacityTons = parseFloat(capacityRaw);

      if (!registrationNumber) {
        isValid = false;
        errorMsg = 'Registration Number is required.';
      } else if (!make) {
        isValid = false;
        errorMsg = 'Make is required.';
      } else if (!model) {
        isValid = false;
        errorMsg = 'Model is required.';
      } else if (isNaN(year) || year < 1900 || year > 2100) {
        isValid = false;
        errorMsg = 'Year must be a valid 4-digit number (e.g. 2024).';
      }

      const validTypes = ['truck', 'trailer', 'van', 'tanker', 'flatbed'];
      const finalType = validTypes.includes(type) ? type : 'truck';

      const validStatuses = ['available', 'in_use', 'maintenance', 'inactive'];
      const finalStatus = validStatuses.includes(status) ? status : 'available';

      resultRows.push({
        registrationNumber,
        make,
        model,
        year: isNaN(year) ? new Date().getFullYear() : year,
        type: finalType,
        capacityTons: isNaN(capacityTons) ? 0 : capacityTons,
        status: finalStatus,
        ownerName,
        sequenceNumber,
        color,
        authorizedDriver,
        registrationExpiry,
        insuranceExpiry,
        authorizationExpiry,
        mvpiExpiry,
        notes,
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
    const headers = [
      'Registration Number', 'Make', 'Model', 'Year', 'Type', 'Capacity Tons', 'Color',
      'Owner Name', 'Sequence Number', 'Authorized Driver', 'Status',
      'Registration Expiry', 'Insurance Validity', 'Authorization Validity', 'MVPI Validity',
      'Last Service Date', 'Next Service Date', 'Notes'
    ].join(',');

    const sample1 = [
      '1901 ERA', 'Mercedes', 'Actros 4843', '2024', 'truck', '45', 'White',
      'Afaq Al-Beeah Company Ltd.', '345512810', 'Mohammed Al-Ghamdi', 'available',
      '2026-12-31', '2026-09-30', '2026-11-15', '2026-08-20',
      '2025-01-10', '2025-07-10', 'Bulk registered via CSV upload'
    ].join(',');

    const sample2 = [
      '2840 URA', 'Volvo', 'FMX 460', '2023', 'truck', '40', 'Yellow',
      'Namaa Fleet Transport Co.', '345512811', 'Ahmad Al-Zahrani', 'available',
      '2026-10-15', '2026-07-01', '2026-09-01', '2026-06-30',
      '2025-03-01', '2025-09-01', 'Silo Bulker Truck'
    ].join(',');

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, sample1, sample2].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'tms_vehicle_import_template.csv');
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
    setError(null);

    const successfulRegs: string[] = [];
    const failedRegs: { name: string; err: string }[] = [];

    try {
      for (let index = 0; index < validRows.length; index++) {
        const row = validRows[index];
        setCurrentActionLog(`Row ${index + 1}/${validRows.length}: Checking registration "${row.registrationNumber}"...`);

        try {
          // A. Check if registration number already exists
          const { data: existingVeh } = await supabase
            .from('vehicles')
            .select('id')
            .eq('registration_number', row.registrationNumber.trim())
            .maybeSingle();

          if (existingVeh) {
            throw new Error(`Vehicle registration ${row.registrationNumber} already exists in database.`);
          }

          // B. Insert vehicle details
          const { error: insertErr } = await supabase
            .from('vehicles')
            .insert({
              registration_number: row.registrationNumber.trim(),
              make: row.make,
              model: row.model,
              year: row.year,
              type: row.type,
              capacity_tons: row.capacityTons,
              status: row.status,
              owner_name: row.ownerName || null,
              sequence_number: row.sequenceNumber || null,
              color: row.color || null,
              authorized_driver: row.authorizedDriver || null,
              registration_expiry: row.registrationExpiry || null,
              insurance_expiry: row.insuranceExpiry || null,
              authorization_expiry: row.authorizationExpiry || null,
              mvpi_expiry: row.mvpiExpiry || null,
              notes: row.notes || 'Imported via CSV bulk upload',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertErr) throw insertErr;

          // C. Record Success
          successfulRegs.push(row.registrationNumber);
          setSuccessCount(prev => prev + 1);

        } catch (rowErr: any) {
          console.error(`Error importing row for ${row.registrationNumber}:`, rowErr);
          failedRegs.push({ name: row.registrationNumber, err: rowErr.message || 'Save failed' });
          setFailureCount(prev => prev + 1);
        }

        // Update progress bar
        setCurrentProgress(Math.round(((index + 1) / validRows.length) * 100));
      }

      // Finish bulk process
      setSummaryReport({
        successList: successfulRegs,
        failList: failedRegs
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
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">Bulk Vehicle CSV Import</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Fleet Mass Enrollment Workspace</p>
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
                  Use our standardized template prefilled with accurate header columns and sample rows to format your vehicle assets list correctly!
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
                <p className="text-sm font-black text-slate-800">Upload Vehicles CSV File</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Drag-and-drop or browse your local system folder</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW & VALIDATION GRID */}
      {step === 'preview' && (
        <div className="bg-slate-900 w-full max-w-[1100px] h-[85vh] rounded-[36px] shadow-2xl overflow-hidden border border-slate-880 flex flex-col animate-in zoom-in-95 duration-200">
          
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
                      <th className="px-5 py-3.5">Registration</th>
                      <th className="px-5 py-3.5">Make / Model</th>
                      <th className="px-5 py-3.5">Year</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Capacity (T)</th>
                      <th className="px-5 py-3.5">Owner Name</th>
                      <th className="px-5 py-3.5">Seq Number</th>
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
                        <td className={`px-5 py-3 font-mono ${!row.isValid && !row.registrationNumber ? 'text-rose-400' : 'text-slate-200'}`}>{row.registrationNumber || '—'}</td>
                        <td className="px-5 py-3 text-slate-200">{row.make} {row.model}</td>
                        <td className="px-5 py-3">{row.year}</td>
                        <td className="px-5 py-3 capitalize text-slate-400">{row.type}</td>
                        <td className="px-5 py-3 text-slate-400">{row.capacityTons}t</td>
                        <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{row.ownerName || '—'}</td>
                        <td className="px-5 py-3 font-mono text-slate-400">{row.sequenceNumber || '—'}</td>
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
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Enrolled Fleet Assets</p>
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit log of bulk vehicle enrollment session</p>
            </div>

            <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Main Stats Card */}
            <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 grid grid-cols-2 divide-x divide-slate-800 text-center shadow-xl">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Enrolled Fleet Assets</p>
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
                  <Database size={12} /> Fleet Assets Enrolled ({summaryReport.successList.length} Vehicles created)
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
