import { useState } from 'react';
import {
  Search, Car, User, AlertCircle, CheckCircle, XCircle,
  Clock, Shield, FileText, Zap, Database, Copy, Save,
  ChevronRight, RefreshCw, Info, AlertTriangle
} from 'lucide-react';
import {
  fetchVehicleByPlate, fetchVehicleByChassis, fetchEmployeeByIqama,
  VehicleGovData, EmployeeGovData, GOV_API_MODE
} from '../lib/govApi';
import { supabase } from '../lib/supabase';

// ── helpers ────────────────────────────────────────────────────────────────
function ExpiryBadge({ date }: { date: string }) {
  if (!date) return <span className="text-xs text-slate-400">—</span>;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  const cls = days < 0 ? 'bg-red-100 text-red-700 border-red-200'
    : days <= 30 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  const label = days < 0 ? `Expired ${Math.abs(days)}d ago`
    : days === 0 ? 'Expires today'
    : `${days}d left`;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {new Date(date).toLocaleDateString('en-SA')} · {label}
    </span>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 w-44">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 dark:text-slate-200 text-right ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    valid:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    active:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    expired:  'bg-red-100 text-red-700 border-red-200',
    blocked:  'bg-red-100 text-red-700 border-red-200',
    transferred: 'bg-blue-100 text-blue-700 border-blue-200',
    absconding:  'bg-orange-100 text-orange-700 border-orange-200',
    exited:   'bg-slate-100 text-slate-600 border-slate-200',
    not_found:'bg-slate-100 text-slate-500 border-slate-200',
  };
  const cls = map[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

// ── Vehicle Result Card ────────────────────────────────────────────────────
function VehicleResultCard({
  data, onSaveToFleet
}: { data: VehicleGovData; onSaveToFleet: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white dark:bg-slate-800 overflow-hidden shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-between">
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Vehicle Found · {data.source}</p>
          <h2 className="text-white text-2xl font-black tracking-wide mt-0.5">{data.plateNumber}</h2>
          <p className="text-white/90 text-sm font-semibold">{data.year} {data.make} {data.model} · {data.color}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={data.mvpiStatus} />
          <p className="text-white/60 text-[10px] mt-2">{data.trafficViolations} traffic violation{data.trafficViolations !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration */}
        <div>
          <p className="text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider">📋 Registration</p>
          <InfoRow label="Plate Number"      value={data.plateNumber} mono />
          <InfoRow label="Chassis / VIN"     value={data.chassisNumber} mono />
          <InfoRow label="Plate Type"        value={data.plateType} />
          <InfoRow label="Owner"             value={data.ownerName} />
          <InfoRow label="Owner ID"          value={data.ownerIdNumber} mono />
          <InfoRow label="Reg. Expiry"       value={<ExpiryBadge date={data.registrationExpiry} />} />
        </div>

        {/* Insurance & MVPI */}
        <div>
          <p className="text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider">🛡️ Insurance & MVPI</p>
          <InfoRow label="Insurance Co."     value={data.insuranceCompany} />
          <InfoRow label="Policy No."        value={data.insurancePolicyNo} mono />
          <InfoRow label="Insurance Expiry"  value={<ExpiryBadge date={data.insuranceExpiry} />} />
          <InfoRow label="MVPI Status"       value={<StatusBadge status={data.mvpiStatus} />} />
          <InfoRow label="MVPI Expiry"       value={<ExpiryBadge date={data.mvpiExpiry} />} />
          <InfoRow label="Auth. Driver"      value={data.authorizedDriver} />
          <InfoRow label="Auth. Expiry"      value={<ExpiryBadge date={data.authorizationExpiry} />} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-5 flex items-center gap-3 flex-wrap">
        <button
          onClick={onSaveToFleet}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 transition-all"
        >
          <Save size={13} /> Save to Fleet Master
        </button>
        <button
          onClick={copyAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
        >
          {copied ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <span className="ml-auto text-[10px] text-slate-400">Fetched: {new Date(data.fetchedAt).toLocaleString('en-SA')}</span>
      </div>
    </div>
  );
}

// ── Employee Result Card ───────────────────────────────────────────────────
function EmployeeResultCard({
  data, onSaveToHR
}: { data: EmployeeGovData; onSaveToHR: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nitaqatColor: Record<string, string> = {
    platinum: 'from-violet-500 to-purple-600',
    gold:     'from-amber-400 to-yellow-500',
    'green - high': 'from-emerald-500 to-green-600',
    green:    'from-emerald-500 to-green-600',
    yellow:   'from-yellow-400 to-amber-500',
    red:      'from-red-500 to-rose-600',
  };
  const grad = nitaqatColor[data.nitaqatCategory?.toLowerCase()] || 'from-blue-500 to-indigo-600';

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 overflow-hidden shadow-lg shadow-blue-100 dark:shadow-blue-900/20 animate-fade-in">
      {/* Header */}
      <div className={`px-6 py-4 bg-gradient-to-r ${grad} flex items-center justify-between`}>
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Employee Found · {data.source}</p>
          <h2 className="text-white text-xl font-black mt-0.5">{data.fullNameEn}</h2>
          <p className="text-white/90 text-sm font-semibold" dir="rtl">{data.fullNameAr}</p>
          <p className="text-white/75 text-xs mt-1">{data.nationality} · {data.profession} · {data.gender === 'M' ? '♂ Male' : '♀ Female'}</p>
        </div>
        <div className="text-right space-y-1">
          <StatusBadge status={data.iqamaStatus} />
          <br/>
          <StatusBadge status={data.laborStatus} />
          <p className="text-white/60 text-[10px] mt-1">Nitaqat: {data.nitaqatCategory}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity */}
        <div>
          <p className="text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider">🪪 Identity</p>
          <InfoRow label="Iqama Number"      value={data.iqamaNumber} mono />
          <InfoRow label="Border Number"     value={data.borderNumber} mono />
          <InfoRow label="Iqama Expiry"      value={<ExpiryBadge date={data.iqamaExpiry} />} />
          <InfoRow label="Passport No."      value={data.passportNumber} mono />
          <InfoRow label="Passport Expiry"   value={<ExpiryBadge date={data.passportExpiry} />} />
          <InfoRow label="Date of Birth"     value={data.dateOfBirth} />
        </div>

        {/* Labor */}
        <div>
          <p className="text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider">🏗️ Labor & Sponsor</p>
          <InfoRow label="Profession"        value={`${data.profession} · ${data.professionAr}`} />
          <InfoRow label="Sponsor ID"        value={data.sponsorId} mono />
          <InfoRow label="Sponsor Name"      value={data.sponsorName} />
          <InfoRow label="Work Permit No."   value={data.workPermitNumber} mono />
          <InfoRow label="Work Permit Exp."  value={<ExpiryBadge date={data.workPermitExpiry} />} />
          <InfoRow label="Exit Re-Entry"     value={data.exitReEntryStatus} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-5 flex items-center gap-3 flex-wrap">
        <button
          onClick={onSaveToHR}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all"
        >
          <Save size={13} /> Save to Employee Master
        </button>
        <button
          onClick={copyAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
        >
          {copied ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <span className="ml-auto text-[10px] text-slate-400">Fetched: {new Date(data.fetchedAt).toLocaleString('en-SA')}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function GovLookupPage() {
  const [tab, setTab] = useState<'vehicle' | 'employee'>('vehicle');

  // Vehicle form
  const [vehicleInput, setVehicleInput]   = useState('');
  const [vehicleMode, setVehicleMode]     = useState<'plate' | 'chassis'>('plate');
  const [vehicleResult, setVehicleResult] = useState<VehicleGovData | null>(null);
  const [vehicleError, setVehicleError]   = useState('');
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // Employee form
  const [iqamaInput, setIqamaInput]         = useState('');
  const [borderInput, setBorderInput]       = useState('');
  const [birthMonth, setBirthMonth]         = useState('');
  const [birthYear, setBirthYear]           = useState('');
  const [empResult, setEmpResult]           = useState<EmployeeGovData | null>(null);
  const [empError, setEmpError]             = useState('');
  const [empLoading, setEmpLoading]         = useState(false);

  // ── Vehicle search ──
  const searchVehicle = async () => {
    if (!vehicleInput.trim()) return;
    setVehicleLoading(true); setVehicleError(''); setVehicleResult(null);
    try {
      const data = vehicleMode === 'plate'
        ? await fetchVehicleByPlate(vehicleInput.trim())
        : await fetchVehicleByChassis(vehicleInput.trim());
      setVehicleResult(data);
    } catch (e: any) {
      setVehicleError(e.message);
    } finally {
      setVehicleLoading(false);
    }
  };

  // ── Employee search ──
  const searchEmployee = async () => {
    if (!iqamaInput && !borderInput) { setEmpError('Enter an Iqama or Border number'); return; }
    setEmpLoading(true); setEmpError(''); setEmpResult(null);
    try {
      const data = await fetchEmployeeByIqama({
        iqamaNumber:  iqamaInput || undefined,
        borderNumber: borderInput || undefined,
        birthMonth:   birthMonth  ? parseInt(birthMonth)  : undefined,
        birthYear:    birthYear   ? parseInt(birthYear)   : undefined,
      });
      setEmpResult(data);
    } catch (e: any) {
      setEmpError(e.message);
    } finally {
      setEmpLoading(false);
    }
  };

  // ── Save vehicle to fleet master ──
  const saveVehicleToFleet = async () => {
    if (!vehicleResult) return;
    const v = vehicleResult;
    const { error } = await (supabase.from('vehicles') as any).upsert({
      registration_number:  v.plateNumber,
      make:                 v.make,
      model:                v.model,
      year:                 v.year,
      color:                v.color,
      owner_name:           v.ownerName,
      authorized_driver:    v.authorizedDriver,
      registration_expiry:  v.registrationExpiry,
      insurance_expiry:     v.insuranceExpiry,
      authorization_expiry: v.authorizationExpiry,
      mvpi_expiry:          v.mvpiExpiry,
      status:               'available',
      type:                 v.plateType === 'commercial' ? 'truck' : 'truck',
    }, { onConflict: 'registration_number' });
    if (error) alert('Error saving: ' + error.message);
    else alert(`✅ ${v.plateNumber} saved to Fleet Master!`);
  };

  // ── Save employee to HR ──
  const saveEmployeeToHR = async () => {
    if (!empResult) return;
    const e = empResult;
    const { error } = await (supabase.from('employees') as any).upsert({
      iqama_number:     e.iqamaNumber,
      name:             e.fullNameEn,
      nationality:      e.nationality,
      profession:       e.profession,
      sponsor:          e.sponsorName,
      passport_number:  e.passportNumber,
      passport_expiry:  e.passportExpiry,
      iqama_expiry:     e.iqamaExpiry,
      work_permit_expiry: e.workPermitExpiry,
      status:           e.laborStatus === 'active' ? 'active' : 'inactive',
    }, { onConflict: 'iqama_number' });
    if (error) alert('Error saving: ' + error.message);
    else alert(`✅ ${e.fullNameEn} saved to Employee Master!`);
  };

  const isSandbox = GOV_API_MODE === 'sandbox';

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Database size={22} className="text-emerald-500" />
            Government Data Lookup
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Live integration with ELM Tamm (vehicles) and Muqeem (employees)
          </p>
        </div>

        {/* Mode badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black ${
          isSandbox
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
        }`}>
          {isSandbox ? <AlertTriangle size={13} /> : <Zap size={13} />}
          {isSandbox ? '🧪 SANDBOX MODE' : '🟢 LIVE — ELM + MUQEEM'}
        </div>
      </div>

      {/* Sandbox info banner */}
      {isSandbox && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex gap-3">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-black text-amber-800 dark:text-amber-300">Sandbox Mode — Simulated Government Data</p>
              <p>This page simulates the ELM Tamm and Muqeem API responses. To enable live data, subscribe to ELM and Muqeem API packages and add credentials to your <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">.env</code>:</p>
              <div className="mt-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg p-3 font-mono text-[10px] space-y-0.5">
                <p>VITE_GOV_API_MODE=live</p>
                <p>VITE_ELM_API_KEY=your-elm-api-key</p>
                <p>VITE_ELM_CLIENT_ID=your-client-id</p>
                <p>VITE_MUQEEM_API_KEY=your-muqeem-key</p>
              </div>
              <p className="mt-2">📞 ELM: <a href="https://elm.sa" target="_blank" className="underline">elm.sa</a> · Muqeem: <a href="https://muqeem.sa" target="_blank" className="underline">muqeem.sa</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {(['vehicle', 'employee'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              tab === t
                ? 'bg-white dark:bg-slate-700 shadow-md text-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t === 'vehicle' ? <Car size={14} /> : <User size={14} />}
            {t === 'vehicle' ? 'Vehicle Lookup' : 'Employee Lookup'}
          </button>
        ))}
      </div>

      {/* ── VEHICLE TAB ── */}
      {tab === 'vehicle' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-800 dark:text-white text-sm mb-1 flex items-center gap-2">
              <Car size={15} className="text-emerald-500" /> Vehicle Information · ELM Tamm
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Lookup by Saudi plate number or chassis/VIN</p>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              {(['plate', 'chassis'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setVehicleMode(m); setVehicleInput(''); setVehicleResult(null); setVehicleError(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    vehicleMode === m
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-emerald-300'
                  }`}
                >
                  {m === 'plate' ? '🚗 Plate Number' : '🔢 Chassis / VIN'}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={vehicleInput}
                  onChange={e => setVehicleInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchVehicle()}
                  placeholder={vehicleMode === 'plate' ? 'e.g. 1901 ERA or 1901ERA' : 'e.g. WDB9630221R478210'}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
              <button
                onClick={searchVehicle}
                disabled={vehicleLoading || !vehicleInput.trim()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
              >
                {vehicleLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                {vehicleLoading ? 'Looking up…' : 'Search ELM'}
              </button>
            </div>

            {/* Sandbox hints */}
            {isSandbox && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] text-slate-400">Try:</span>
                {['1901 ERA', '2840 URA', '1169 VXA', 'WDB9630221R478210'].map(h => (
                  <button key={h} onClick={() => { setVehicleInput(h); setVehicleMode(h.length > 10 ? 'chassis' : 'plate'); }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {vehicleLoading && (
            <div className="rounded-2xl border border-emerald-200 bg-white dark:bg-slate-800 p-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Querying ELM Tamm…</p>
              <p className="text-xs text-slate-400">Contacting General Traffic Department database</p>
            </div>
          )}

          {/* Error */}
          {vehicleError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 flex items-start gap-3">
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Vehicle Not Found</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">{vehicleError}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {vehicleResult && (
            <VehicleResultCard data={vehicleResult} onSaveToFleet={saveVehicleToFleet} />
          )}
        </div>
      )}

      {/* ── EMPLOYEE TAB ── */}
      {tab === 'employee' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-800 dark:text-white text-sm mb-1 flex items-center gap-2">
              <User size={15} className="text-blue-500" /> Employee Information · Muqeem / Absher
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Verify by Iqama number, border number, or birth date</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Iqama */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  🪪 Iqama Number <span className="text-slate-400 font-normal">(10 digits, starts with 2)</span>
                </label>
                <input
                  value={iqamaInput}
                  onChange={e => setIqamaInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 2456789012"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              {/* Border number */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  🛂 Border Number <span className="text-slate-400 font-normal">(alternative to Iqama)</span>
                </label>
                <input
                  value={borderInput}
                  onChange={e => setBorderInput(e.target.value)}
                  placeholder="e.g. BRD-0045-2389"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              {/* Birth month */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  📅 Birth Month <span className="text-slate-400 font-normal">(optional — for verification)</span>
                </label>
                <select
                  value={birthMonth}
                  onChange={e => setBirthMonth(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">— Select month —</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i) => (
                    <option key={m} value={i+1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Birth year */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  📅 Birth Year <span className="text-slate-400 font-normal">(optional — for verification)</span>
                </label>
                <input
                  value={birthYear}
                  onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 1988"
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
            </div>

            <button
              onClick={searchEmployee}
              disabled={empLoading || (!iqamaInput && !borderInput)}
              className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30"
            >
              {empLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              {empLoading ? 'Verifying…' : 'Verify via Muqeem'}
            </button>

            {/* Sandbox hints */}
            {isSandbox && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] text-slate-400">Try Iqama:</span>
                {['2456789012', '2567890123', '2678901234'].map(h => (
                  <button key={h} onClick={() => setIqamaInput(h)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors">
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {empLoading && (
            <div className="rounded-2xl border border-blue-200 bg-white dark:bg-slate-800 p-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Querying Muqeem…</p>
              <p className="text-xs text-slate-400">Connecting to Ministry of Human Resources database</p>
            </div>
          )}

          {/* Error */}
          {empError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 flex items-start gap-3">
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Employee Not Found</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">{empError}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {empResult && (
            <EmployeeResultCard data={empResult} onSaveToHR={saveEmployeeToHR} />
          )}
        </div>
      )}

      {/* Source info footer */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5">
        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Data Sources</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, name: 'ELM Tamm', desc: 'Vehicle registration, insurance, MVPI from General Traffic Dept.', url: 'https://tamm.elm.sa', color: 'text-emerald-500' },
            { icon: FileText, name: 'Muqeem', desc: 'Iqama, work permit, labor status from MHRSD', url: 'https://muqeem.sa', color: 'text-blue-500' },
            { icon: CheckCircle, name: 'MOI Absher', desc: 'Residency status and civil registry from Ministry of Interior', url: 'https://absher.sa', color: 'text-indigo-500' },
          ].map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
              <s.icon size={16} className={`${s.color} shrink-0 mt-0.5`} />
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 group-hover:underline">{s.name} ↗</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
