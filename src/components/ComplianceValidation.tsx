import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ComplianceResult {
  valid: boolean;
  checks: {
    label: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
  }[];
}

export const useCompliance = (_vehicleId?: string, _driverId?: string) => {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = useCallback(async (vId: string, dId: string) => {
    setLoading(true);
    // Simulate complex relational query
    const [vRes, dRes] = await Promise.all([
      supabase.from('vehicles').select('*').eq('id', vId).single(),
      supabase.from('profiles').select('*, employees(*), driving_licenses(*), sec_ids(*)').eq('id', dId).single()
    ]) as any[];

    const checks: ComplianceResult['checks'] = [];
    let allPass = true;

    // Vehicle Checks
    if (vRes.data) {
      const v = vRes.data;
      const isRegExpired = new Date(v.registration_expiry) < new Date();
      checks.push({
        label: 'Vehicle Registration',
        status: isRegExpired ? 'fail' : 'pass',
        message: isRegExpired ? 'Expired registration card' : 'Valid'
      });
      if (isRegExpired) allPass = false;

      const isInsExpired = new Date(v.insurance_expiry) < new Date();
      checks.push({
        label: 'Vehicle Insurance',
        status: isInsExpired ? 'fail' : 'pass',
        message: isInsExpired ? 'Insurance expired' : 'Valid'
      });
      if (isInsExpired) allPass = false;
    }

    // Driver Checks
    if (dRes.data) {
      const d = dRes.data;
      const iqama = d.employees?.[0];
      const hasIqama = !!iqama;
      checks.push({
        label: 'Iqama Validity',
        status: !hasIqama ? 'fail' : 'pass',
        message: !hasIqama ? 'Missing iqama documentation' : 'Valid'
      });
      if (!hasIqama) allPass = false;

      const license = d.driving_licenses?.[0];
      const isLicExpired = license ? new Date(license.expiry_date) < new Date() : true;
      checks.push({
        label: 'Driving License',
        status: isLicExpired ? 'fail' : 'pass',
        message: isLicExpired ? 'License expired or missing' : 'Valid'
      });
      if (isLicExpired) allPass = false;
    }

    setResult({ valid: allPass, checks });
    setLoading(false);
  }, []);

  return { result, loading, validate };
};

export const CompliancePanel = ({ vehicleId, driverId }: { vehicleId: string, driverId: string }) => {
  const { result, loading, validate } = useCompliance();

  useEffect(() => {
    if (vehicleId && driverId) validate(vehicleId, driverId);
  }, [vehicleId, driverId, validate]);

  if (loading) return <div className="p-8 text-center animate-pulse">Running Intelligence Validation...</div>;
  if (!result) return null;

  return (
    <div className={cn(
      "rounded-[32px] border p-6 transition-all",
      result.valid ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            result.valid ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight">
              {result.valid ? 'Ready for Dispatch' : 'Trip Blocked'}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Relational Compliance Result
            </p>
          </div>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest",
          result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        )}>
          {result.valid ? 'COMPLIANT' : 'NON-COMPLIANT'}
        </div>
      </div>

      <div className="space-y-3">
        {result.checks.map((check, i) => (
          <div key={i} className="flex items-center justify-between bg-white/50 p-3 rounded-2xl border border-white/50">
            <div className="flex items-center gap-3">
              {check.status === 'pass' ? <CheckCircle2 className="text-emerald-500" size={18} /> : 
               check.status === 'fail' ? <XCircle className="text-rose-500" size={18} /> : 
               <AlertTriangle className="text-amber-500" size={18} />}
              <div>
                <p className="text-xs font-bold text-slate-900">{check.label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{check.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
