import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  IdCard, 
  Calendar, 
  Building2, 
  Clock, 
  Search,
  Filter,
  Plus,
  X,
  FileText,
  Briefcase,
  Globe,
  ExternalLink,
  ChevronRight,
  FileCheck2,
  AlertCircle,
  Loader2,
  Edit,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useRouter } from '../components/Router';
import AddEmployeeModal from '../components/AddEmployeeModal';
import ImportCSVModal from '../components/ImportCSVModal';
import EditEmployeeModal from '../components/EditEmployeeModal';

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

// 11 key compliance documents abbreviations and metadata
const DOC_KEYS = [
  { key: 'iqama', label: 'Iqama', abbr: 'IQ' },
  { key: 'muqeem', label: 'Muqeem', abbr: 'MQ' },
  { key: 'license', label: 'Driving License', abbr: 'DL' },
  { key: 'driver_card', label: 'Driver Card', abbr: 'DC' },
  { key: 'tuv', label: 'TUV Certificate', abbr: 'TV' },
  { key: 'sec_id', label: 'SEC ID', abbr: 'SC' },
  { key: 'passport', label: 'Passport Copy', abbr: 'PP' },
  { key: 'registration', label: 'Vehicle Registration', abbr: 'VR' },
  { key: 'authorization', label: 'Vehicle Authorization', abbr: 'VA' },
  { key: 'mvpi', label: 'Vehicle MVPI', abbr: 'MV' },
  { key: 'insurance', label: 'Vehicle Insurance', abbr: 'IN' }
];

/**
 * Mathematically converts a Hijri date string (YYYY-MM-DD) to a Gregorian Date object.
 * Based on Julian Day Number (JDN) approximation.
 */
function hijriToGregorian(hijriStr: string): Date | null {
  if (!hijriStr || hijriStr === '—') return null;
  const parts = hijriStr.split('-');
  if (parts.length !== 3) return null;
  
  const hYear = parseInt(parts[0], 10);
  const hMonth = parseInt(parts[1], 10);
  const hDay = parseInt(parts[2], 10);
  
  if (isNaN(hYear) || isNaN(hMonth) || isNaN(hDay)) return null;

  // Precise Islamic Astronomical JDN algorithm
  const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;

  // Convert Julian Day Number to Gregorian Date
  let l = jd + 68569;
  let n = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  let i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  let j = Math.floor((80 * l) / 2447);
  const day = l - Math.floor((2447 * j) / 80);
  l = Math.floor(j / 11);
  const month = j + 2 - 12 * l;
  const year = 100 * (n - 49) + i + l;

  return new Date(year, month - 1, day);
}

/**
 * Calculates remaining days, converting Hijri dates to Gregorian automatically.
 */
const getDaysLeft = (dateStr: string | null) => {
  if (!dateStr || dateStr === '—') return null;
  
  const cleanStr = dateStr.trim();
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return null;
  
  const year = parseInt(parts[0], 10);
  if (isNaN(year)) return null;

  let targetDate: Date | null = null;

  // Auto-detect Hijri (Hijri years are currently 1440-1460, so range 1300-1600 is safe)
  if (year >= 1300 && year <= 1600) {
    targetDate = hijriToGregorian(cleanStr);
  } else {
    targetDate = new Date(cleanStr);
  }

  if (!targetDate || isNaN(targetDate.getTime())) return null;

  const today = new Date();
  targetDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const matchDocType = (type: string, docKey: string): boolean => {
  const t = type.toLowerCase();
  switch (docKey) {
    case 'iqama': return t.includes('iqama');
    case 'muqeem': return t.includes('muqeem');
    case 'license': return t.includes('license') || t.includes('driving');
    case 'driver_card': return t.includes('driver card') || t.includes('driver_card') || t.includes('drivercard');
    case 'tuv': return t.includes('tuv');
    case 'sec_id': return t.includes('sec');
    case 'passport': return t.includes('passport');
    case 'registration': return t.includes('registration') || t.includes('reg') || t.includes('istimara');
    case 'authorization': return t.includes('authorization') || t.includes('auth');
    case 'mvpi': return t.includes('mvpi');
    case 'insurance': return t.includes('insurance') || t.includes('ins');
    default: return false;
  }
};

const getDocStatus = (
  empId: string, 
  vehicleId: string | null, 
  allDocs: any[], 
  docKey: string,
  empIqamaExpiry: string
) => {
  let doc: any = null;

  // Map employee vs vehicle documents
  if (['iqama', 'muqeem', 'license', 'driver_card', 'tuv', 'sec_id', 'passport'].includes(docKey)) {
    if (docKey === 'sec_id') {
      doc = allDocs.find(d => 
        d.entity_type === 'employee' && 
        d.entity_id === empId && 
        d.type === 'SEC ID Front'
      );
      if (!doc) {
        doc = allDocs.find(d => 
          d.entity_type === 'employee' && 
          d.entity_id === empId && 
          matchDocType(d.type, docKey)
        );
      }
    } else {
      doc = allDocs.find(d => 
        d.entity_type === 'employee' && 
        d.entity_id === empId && 
        matchDocType(d.type, docKey)
      );
    }
  } else if (['registration', 'authorization', 'mvpi', 'insurance'].includes(docKey)) {
    doc = allDocs.find(d => 
      d.entity_type === 'vehicle' && 
      d.entity_id === vehicleId && 
      matchDocType(d.type, docKey)
    );
  }

  // Expiry date lookup
  let expiryDate: string | null = doc?.expiry_date || null;

  // Fallback to employee profile Iqama Hijri date if upload is missing
  if (docKey === 'iqama' && !expiryDate && empIqamaExpiry && empIqamaExpiry !== '—') {
    expiryDate = empIqamaExpiry;
  }

  if (!expiryDate && !doc) {
    return { status: 'missing', daysLeft: null, label: '—' };
  }

  const daysLeft = getDaysLeft(expiryDate);
  if (daysLeft === null) {
    return { status: 'valid', daysLeft: null, label: '✔' };
  }

  if (daysLeft >= 15) {
    return { status: 'valid', daysLeft, label: `${daysLeft}` };
  } else if (daysLeft >= 0) {
    return { status: 'near_expiry', daysLeft, label: `${daysLeft}` };
  } else {
    return { status: 'expired', daysLeft, label: `${daysLeft}` };
  }
};

const EmployeeDetailsPage = () => {
  const { navigate } = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // compliance lookup states
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [combinations, setCombinations] = useState<any[]>([]);

  // Drawer States
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empDocs, setEmpDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    
    const [empRes, docsRes, combosRes] = await Promise.all([
      supabase.from('profiles').select(`
        id,
        full_name,
        role,
        is_active,
        employee_data:employees (
          iqama_number,
          iqama_expiry_hijri,
          dob_hijri,
          photo_url,
          notes,
          profession,
          nationality,
          sponsor:sponsors (name, moi)
        )
      `),
      supabase.from('documents').select('*'),
      supabase.from('fleet_combinations').select('*').eq('is_active', true)
    ]);

    if (docsRes.data) setAllDocs(docsRes.data);
    if (combosRes.data) setCombinations(combosRes.data);

    const data = empRes.data;
    const error = empRes.error;

    if (!error && data) {
      const mapped = data.map((p: any) => {
        const emp = Array.isArray(p.employee_data) ? p.employee_data[0] : p.employee_data;

        return {
          id: p.id,
          full_name: p.full_name,
          role: p.role,
          status: p.is_active ? 'active' : 'inactive',
          iqama_number: emp?.iqama_number || '—',
          sponsor_name: emp?.sponsor?.name || 'Self',
          sponsor_moi: emp?.sponsor?.moi || '—',
          iqama_expiry_hijri: emp?.iqama_expiry_hijri || '—',
          dob_hijri: emp?.dob_hijri || '—',
          photo_url: emp?.photo_url || '',
          profession: emp?.profession || 'Driver',
          nationality: emp?.nationality || 'Saudi'
        };
      });

      const registeredOnly = mapped.filter((e: Employee) => e.sponsor_moi && e.sponsor_moi !== '—' && e.sponsor_moi.trim().length === 10);
      setEmployees(registeredOnly);
    }
    setLoading(false);
  }, []);

  const handleOpenProfile = async (emp: Employee) => {
    setSelectedEmp(emp);
    setLoadingDocs(true);
    setSelectedDocUrl(null);
    setSelectedDocType(null);

    try {
      const { data } = await (supabase as any)
        .from('documents')
        .select('*')
        .eq('entity_id', emp.id);

      if (data) {
        setEmpDocs(data);
        if (data.length > 0) {
          setSelectedDocUrl(data[0].file_url);
          setSelectedDocType(data[0].type);
        }
      }
    } catch (err) {
      console.error('Error fetching employee documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(e => 
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.iqama_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6 relative min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Master</h1>
          <p className="text-slate-500 text-sm">Centralized workforce documentation and compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsImportModalOpen(true)} 
            variant="outline"
            className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
          >
            <FileText size={18} className="text-slate-500" />
            Import CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Plus size={18} />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or Iqama..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 h-[42px] rounded-xl font-bold text-slate-700">
          <Filter size={18} />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))
        ) : filteredEmployees.map((emp) => {
          // Find assigned vehicle from combinations
          const activeCombo = combinations.find(c => c.driver_id === emp.id && c.is_active);
          const vehicleId = activeCombo?.vehicle_id || null;

          return (
            <div key={emp.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[360px]">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  emp.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {emp.status}
                </span>
              </div>

              <div>
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50">
                      {emp.photo_url ? (
                        <img src={emp.photo_url} alt={emp.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate text-sm">{emp.full_name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{emp.role}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <IdCard size={14} className="text-slate-400" />
                        <span className="text-slate-500 font-bold">Iqama:</span>
                        <span className="text-slate-800 font-black font-mono">{emp.iqama_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-slate-500 font-bold">Sponsor:</span>
                        <span className="text-slate-800 font-black truncate max-w-[150px]" title={emp.sponsor_name}>{emp.sponsor_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-55 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Iqama Expiry (Hijri)</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-500" />
                      <span className="text-xs font-black text-slate-750 font-mono">{emp.iqama_expiry_hijri}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Date of Birth</p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-amber-500" />
                      <span className="text-xs font-black text-slate-750 font-mono">{emp.dob_hijri}</span>
                    </div>
                  </div>
                </div>

                {/* Color-Coded Document Compliance Circle Row */}
                <div className="mt-5 pt-5 border-t border-slate-55">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Document Compliance Stats</p>
                  <div className="flex items-center justify-between gap-1">
                    {DOC_KEYS.map((dk) => {
                      const info = getDocStatus(emp.id, vehicleId, allDocs, dk.key, emp.iqama_expiry_hijri);
                      
                      let circleBg = 'bg-slate-100 text-slate-400 border border-slate-200/50';
                      let tooltip = `${dk.label}: Missing Document`;
                      
                      if (info.status === 'valid') {
                        circleBg = 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-black';
                        tooltip = `${dk.label}: Valid (${info.daysLeft === null ? 'No Expiry' : `${info.daysLeft} days left`})`;
                      } else if (info.status === 'near_expiry') {
                        circleBg = 'bg-amber-50 text-amber-600 border border-amber-200/60 font-black';
                        tooltip = `${dk.label}: Near Expiry (${info.daysLeft} days left)`;
                      } else if (info.status === 'expired') {
                        circleBg = 'bg-rose-50 text-rose-600 border border-rose-200/60 font-black animate-pulse';
                        tooltip = `${dk.label}: EXPIRED (${Math.abs(info.daysLeft || 0)} days ago)`;
                      }

                      return (
                        <div key={dk.key} className="flex flex-col items-center flex-1" title={tooltip}>
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shadow-sm select-none cursor-help transition-all duration-300 hover:scale-110",
                            circleBg
                          )}>
                            {info.status === 'missing' ? '—' : info.label}
                          </div>
                          <span className="text-[7px] font-black uppercase text-slate-400 mt-1" title={dk.label}>{dk.abbr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="mt-6 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dms')}
                  className="flex-1 text-xs h-9 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  View Documents
                </Button>
                <Button 
                  onClick={() => handleOpenProfile(emp)}
                  className="flex-1 text-xs h-9 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Full Profile
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* STUNNING SLIDING DRAWER: FULL PROFILE & FILE VISUALIZER */}
      {selectedEmp && (
        <div className="fixed inset-0 z-[210] flex justify-end bg-slate-900/60 backdrop-blur-md animate-fade-in">
          {/* Background Close Click Handler */}
          <div className="absolute inset-0" onClick={() => setSelectedEmp(null)} />

          {/* Drawer Body */}
          <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">{selectedEmp.full_name}</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Workforce Professional dossier</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  className="gap-1.5 h-9 px-3.5 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold shrink-0"
                >
                  <Edit size={14} className="text-slate-500" />
                  Edit Details
                </Button>
                <button 
                  onClick={() => setSelectedEmp(null)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-450 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 overflow-hidden flex divide-x divide-slate-150">
              
              {/* Left Column: Dossier Details & Documents Checklist */}
              <div className="w-1/2 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                
                {/* Dossier Quick Facts */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                    <Briefcase size={12} className="text-slate-400" /> Professional Identity
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] text-slate-450 font-bold uppercase">Role / Category</p>
                      <p className="text-xs font-black text-slate-800 uppercase mt-0.5 tracking-wide">{selectedEmp.role}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] text-slate-455 font-bold uppercase">Profession</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedEmp.profession || 'Heavy Duty Truck Driver'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] text-slate-455 font-bold uppercase">Nationality</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe size={12} className="text-slate-400" />
                        <p className="text-xs font-black text-slate-800">{selectedEmp.nationality || 'Pakistani'}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] text-slate-455 font-bold uppercase">Sponsor Company</p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-400" />
                          <p className="text-xs font-black text-slate-800">{selectedEmp.sponsor_name}</p>
                        </div>
                        {selectedEmp.sponsor_moi && selectedEmp.sponsor_moi !== '—' && (
                          <p className="text-[9px] text-slate-400 font-mono pl-[18px]">MOI: {selectedEmp.sponsor_moi}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Residency Credentials */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                    <IdCard size={12} className="text-slate-400" /> Residency & ID Stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-500">Iqama / Muqeem ID</span>
                      <span className="font-black text-slate-850 font-mono text-right">{selectedEmp.iqama_number}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-500">Iqama Expiry (Hijri)</span>
                      <span className="font-black text-slate-850 font-mono text-right">{selectedEmp.iqama_expiry_hijri}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-500">Date of Birth (Hijri)</span>
                      <span className="font-black text-slate-850 font-mono text-right">{selectedEmp.dob_hijri}</span>
                    </div>
                  </div>
                </div>

                {/* Documents Visual Vault Checklist */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-400" /> Attached Documents Vault
                  </h3>

                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading Vault Catalog...</span>
                    </div>
                  ) : empDocs.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-slate-450 text-xs">
                      <AlertCircle size={16} />
                      <p className="font-bold">No documents attached to this employee dossier.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {empDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocUrl(doc.file_url);
                            setSelectedDocType(doc.type);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition-all",
                            selectedDocUrl === doc.file_url
                              ? "bg-blue-50 border-blue-200 text-blue-800 scale-[1.01] shadow-sm"
                              : "bg-white hover:bg-slate-55 border-slate-100 text-slate-650 hover:border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold",
                              selectedDocUrl === doc.file_url ? "bg-blue-200 text-blue-600" : "bg-slate-100 text-slate-500"
                            )}>
                              {doc.type.includes('photo') || doc.type === 'Photo' ? <ImageIcon size={14} /> : <FileText size={14} />}
                            </div>
                            <div className="truncate">
                              <p className="font-black text-slate-800">{doc.type}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[200px]">{doc.name}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className={cn("transition-transform", selectedDocUrl === doc.file_url && "text-blue-600 translate-x-0.5")} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Premium Interactive Live File Viewer */}
              <div className="w-1/2 bg-slate-900 flex flex-col h-full relative overflow-hidden">
                {selectedDocUrl ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Header overlay for the viewer */}
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white border border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {selectedDocType || 'Attached Document'}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                      <a 
                        href={selectedDocUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-slate-900/80 backdrop-blur-md text-white border border-slate-800 hover:bg-slate-850 rounded-xl transition-all flex items-center justify-center shadow-lg"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8 bg-slate-950/20">
                      {selectedDocUrl.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={`${selectedDocUrl}#toolbar=0`} 
                          className="w-full h-full rounded-2xl border border-slate-800/50 shadow-2xl bg-white"
                          title="Identity Document Viewer"
                        />
                      ) : (
                        <img 
                          src={selectedDocUrl} 
                          alt="Dossier Document File" 
                          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-slate-800/30"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <FileCheck2 size={48} className="text-slate-700 animate-bounce duration-[2000ms] mb-4" />
                    <p className="font-bold text-slate-400 text-xs">Dynamic Document Viewer</p>
                    <p className="text-[10px] text-slate-600 max-w-xs mt-1 leading-relaxed">
                      Select any uploaded residency or driving document in the left column catalog list to load it here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddComplete={fetchEmployees}
      />
      
      <ImportCSVModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={fetchEmployees}
      />
      
      <EditEmployeeModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={selectedEmp}
        onUpdateComplete={() => {
          fetchEmployees();
          setSelectedEmp(null);
        }}
      />
    </div>
  );
};

export default EmployeeDetailsPage;
