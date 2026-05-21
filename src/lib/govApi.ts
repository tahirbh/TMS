/**
 * TMS — Saudi Government API Integration Layer
 * ══════════════════════════════════════════════
 * Covers:
 *   • ELM  (elm.sa)      — Vehicle lookup via Tamm/Wasl platform
 *   • Muqeem (muqeem.sa) — Employee / Iqama verification
 *   • MOI Absher         — Border number / residency check
 *
 * HOW TO GO LIVE:
 *   1. Subscribe to ELM Tamm  → https://tamm.elm.sa
 *   2. Subscribe to Muqeem API → https://muqeem.sa
 *   3. Set VITE_ELM_API_KEY, VITE_MUQEEM_API_KEY, VITE_ELM_CLIENT_ID in .env
 *   4. Set VITE_GOV_API_MODE=live in .env
 *   5. Done — all calls below hit real endpoints
 */

export type ApiMode = 'sandbox' | 'live';

export interface VehicleGovData {
  // From ELM Tamm / General Traffic
  plateNumber:          string;
  plateType:            string;       // private, commercial, transport
  chassisNumber:        string;
  make:                 string;
  model:                string;
  year:                 number;
  color:                string;
  ownerName:            string;
  ownerIdNumber:        string;       // Saudi ID / Iqama
  registrationExpiry:   string;       // YYYY-MM-DD
  insuranceCompany:     string;
  insuranceExpiry:      string;
  insurancePolicyNo:    string;
  mvpiStatus:           'valid' | 'expired' | 'not_found';
  mvpiExpiry:           string;
  trafficViolations:    number;
  authorizedDriver:     string;
  authorizationExpiry:  string;
  source:               string;
  fetchedAt:            string;
}

export interface EmployeeGovData {
  // From Muqeem / MOI Absher
  iqamaNumber:          string;
  borderNumber:         string;
  fullNameAr:           string;
  fullNameEn:           string;
  nationality:          string;
  nationalityCode:      string;
  dateOfBirth:          string;       // YYYY-MM-DD
  gender:               'M' | 'F';
  iqamaExpiry:          string;
  iqamaStatus:          'valid' | 'expired' | 'blocked';
  passportNumber:       string;
  passportExpiry:       string;
  profession:           string;
  professionAr:         string;
  sponsorId:            string;
  sponsorName:          string;
  workPermitNumber:     string;
  workPermitExpiry:     string;
  exitReEntryStatus:    string;
  laborStatus:          'active' | 'transferred' | 'absconding' | 'exited';
  nitaqatCategory:      string;       // Platinum / Gold / Green / Yellow / Red
  source:               string;
  fetchedAt:            string;
}

// ── Sandbox data bank (realistic Saudi data for demo/testing) ──────────────
const SANDBOX_VEHICLES: Record<string, VehicleGovData> = {
  '1901ERA': {
    plateNumber: '1901 ERA', plateType: 'commercial', chassisNumber: 'WDB9630221R478210',
    make: 'Mercedes-Benz', model: 'Actros 4843', year: 2024, color: 'White',
    ownerName: 'Afaq Al-Beeah Company Ltd.', ownerIdNumber: '7013680876',
    registrationExpiry: '2026-09-15', insuranceCompany: 'Tawuniya Insurance',
    insuranceExpiry: '2026-08-30', insurancePolicyNo: 'TWN-2024-889432',
    mvpiStatus: 'valid', mvpiExpiry: '2026-07-20', trafficViolations: 0,
    authorizedDriver: 'Mohammed Al-Ghamdi', authorizationExpiry: '2026-06-01',
    source: 'ELM Tamm (Sandbox)', fetchedAt: new Date().toISOString(),
  },
  '2840URA': {
    plateNumber: '2840 URA', plateType: 'commercial', chassisNumber: 'YV2R8S1A4NA123456',
    make: 'Volvo', model: 'FMX 460', year: 2023, color: 'Yellow',
    ownerName: 'Namaa Fleet Transport Co.', ownerIdNumber: '7015461945',
    registrationExpiry: '2025-11-30', insuranceCompany: 'Malath Insurance',
    insuranceExpiry: '2025-10-15', insurancePolicyNo: 'MLT-2023-334210',
    mvpiStatus: 'valid', mvpiExpiry: '2025-12-10', trafficViolations: 2,
    authorizedDriver: 'Ahmad Al-Zahrani', authorizationExpiry: '2025-09-01',
    source: 'ELM Tamm (Sandbox)', fetchedAt: new Date().toISOString(),
  },
  '1169VXA': {
    plateNumber: '1169 VXA', plateType: 'commercial', chassisNumber: 'LZG5X2C16PX000321',
    make: 'SHACMAN', model: 'H3000', year: 2025, color: 'White',
    ownerName: 'Al-Jawaa HR Company', ownerIdNumber: '7012345678',
    registrationExpiry: '2026-03-20', insuranceCompany: 'Al-Rajhi Takaful',
    insuranceExpiry: '2026-02-28', insurancePolicyNo: 'ART-2025-112897',
    mvpiStatus: 'valid', mvpiExpiry: '2026-04-10', trafficViolations: 0,
    authorizedDriver: 'Khalid Al-Otaibi', authorizationExpiry: '2026-01-15',
    source: 'ELM Tamm (Sandbox)', fetchedAt: new Date().toISOString(),
  },
  // Chassis/serial lookup
  'WDB9630221R478210': {
    plateNumber: '1901 ERA', plateType: 'commercial', chassisNumber: 'WDB9630221R478210',
    make: 'Mercedes-Benz', model: 'Actros 4843', year: 2024, color: 'White',
    ownerName: 'Afaq Al-Beeah Company Ltd.', ownerIdNumber: '7013680876',
    registrationExpiry: '2026-09-15', insuranceCompany: 'Tawuniya Insurance',
    insuranceExpiry: '2026-08-30', insurancePolicyNo: 'TWN-2024-889432',
    mvpiStatus: 'valid', mvpiExpiry: '2026-07-20', trafficViolations: 0,
    authorizedDriver: 'Mohammed Al-Ghamdi', authorizationExpiry: '2026-06-01',
    source: 'ELM Tamm (Sandbox)', fetchedAt: new Date().toISOString(),
  },
};

const SANDBOX_EMPLOYEES: Record<string, EmployeeGovData> = {
  '2456789012': {
    iqamaNumber: '2456789012', borderNumber: 'BRD-0045-2389',
    fullNameAr: 'محمد بن علي الغامدي', fullNameEn: 'Mohammed Ali Al-Ghamdi',
    nationality: 'Pakistan', nationalityCode: 'PK',
    dateOfBirth: '1988-04-15', gender: 'M',
    iqamaExpiry: '2026-03-20', iqamaStatus: 'valid',
    passportNumber: 'AA1234567', passportExpiry: '2028-04-14',
    profession: 'Driver', professionAr: 'سائق',
    sponsorId: '7013680876', sponsorName: 'Afaq Al-Beeah Company Ltd.',
    workPermitNumber: 'WP-2024-78934',  workPermitExpiry: '2026-03-19',
    exitReEntryStatus: 'Not Issued', laborStatus: 'active',
    nitaqatCategory: 'Green - High', source: 'Muqeem API (Sandbox)', fetchedAt: new Date().toISOString(),
  },
  '2567890123': {
    iqamaNumber: '2567890123', borderNumber: 'BRD-0061-4520',
    fullNameAr: 'أحمد محمد الزهراني', fullNameEn: 'Ahmad Mohammed Al-Zahrani',
    nationality: 'Bangladesh', nationalityCode: 'BD',
    dateOfBirth: '1990-08-22', gender: 'M',
    iqamaExpiry: '2025-07-01', iqamaStatus: 'expired',
    passportNumber: 'BN9876543', passportExpiry: '2026-08-21',
    profession: 'Heavy Equipment Operator', professionAr: 'مشغل معدات ثقيلة',
    sponsorId: '7015461945', sponsorName: 'Namaa Fleet Transport Co.',
    workPermitNumber: 'WP-2023-55210', workPermitExpiry: '2025-06-30',
    exitReEntryStatus: 'Issued', laborStatus: 'active',
    nitaqatCategory: 'Gold', source: 'Muqeem API (Sandbox)', fetchedAt: new Date().toISOString(),
  },
  '2678901234': {
    iqamaNumber: '2678901234', borderNumber: 'BRD-0072-8812',
    fullNameAr: 'رضا علي حسين', fullNameEn: 'Reza Ali Hussain',
    nationality: 'India', nationalityCode: 'IN',
    dateOfBirth: '1985-12-05', gender: 'M',
    iqamaExpiry: '2027-01-10', iqamaStatus: 'valid',
    passportNumber: 'P1234567', passportExpiry: '2029-12-04',
    profession: 'Mechanic', professionAr: 'ميكانيكي',
    sponsorId: '7013680876', sponsorName: 'Afaq Al-Beeah Company Ltd.',
    workPermitNumber: 'WP-2025-12345', workPermitExpiry: '2027-01-09',
    exitReEntryStatus: 'Not Issued', laborStatus: 'active',
    nitaqatCategory: 'Platinum', source: 'Muqeem API (Sandbox)', fetchedAt: new Date().toISOString(),
  },
};

// ── Utility ────────────────────────────────────────────────────────────────
const MODE: ApiMode = (import.meta.env.VITE_GOV_API_MODE as ApiMode) || 'sandbox';
const ELM_BASE = 'https://api.elm.sa/tamm/v2';
const MUQEEM_BASE = 'https://api.muqeem.sa/v3';
const DELAY = (ms: number) => new Promise(r => setTimeout(r, ms));

function normaliseKey(input: string): string {
  return input.toUpperCase().replace(/\s+/g, '');
}

// ── ELM Vehicle Lookup ─────────────────────────────────────────────────────
export async function fetchVehicleByPlate(plate: string): Promise<VehicleGovData> {
  const key = normaliseKey(plate);

  if (MODE === 'sandbox') {
    await DELAY(1200 + Math.random() * 800);
    const match = SANDBOX_VEHICLES[key];
    if (!match) throw new Error(`No vehicle found for plate "${plate}" in sandbox.`);
    return { ...match, fetchedAt: new Date().toISOString() };
  }

  // LIVE — ELM Tamm REST call
  const res = await fetch(`${ELM_BASE}/vehicles/plate/${encodeURIComponent(plate)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_ELM_API_KEY}`,
      'X-Client-ID': import.meta.env.VITE_ELM_CLIENT_ID || '',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `ELM API error: ${res.status}`);
  }
  const data = await res.json();
  return mapElmVehicleResponse(data);
}

export async function fetchVehicleByChassis(chassis: string): Promise<VehicleGovData> {
  const key = normaliseKey(chassis);

  if (MODE === 'sandbox') {
    await DELAY(1200 + Math.random() * 800);
    const match = SANDBOX_VEHICLES[key];
    if (!match) throw new Error(`No vehicle found for chassis "${chassis}" in sandbox.`);
    return { ...match, fetchedAt: new Date().toISOString() };
  }

  const res = await fetch(`${ELM_BASE}/vehicles/chassis/${encodeURIComponent(chassis)}`, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_ELM_API_KEY}`,
      'X-Client-ID': import.meta.env.VITE_ELM_CLIENT_ID || '',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`ELM API error: ${res.status}`);
  return mapElmVehicleResponse(await res.json());
}

// ── Muqeem Employee Lookup ─────────────────────────────────────────────────
export interface EmployeeLookupParams {
  iqamaNumber?:   string;
  borderNumber?:  string;
  birthMonth?:    number;  // 1-12
  birthYear?:     number;
}

export async function fetchEmployeeByIqama(params: EmployeeLookupParams): Promise<EmployeeGovData> {
  const key = normaliseKey(params.iqamaNumber || params.borderNumber || '');

  if (MODE === 'sandbox') {
    await DELAY(1400 + Math.random() * 800);
    // Try iqama direct match first
    const match = SANDBOX_EMPLOYEES[key];
    if (match) {
      // Optionally validate birth month/year
      if (params.birthMonth && params.birthYear) {
        const dob = new Date(match.dateOfBirth);
        if (dob.getMonth() + 1 !== params.birthMonth || dob.getFullYear() !== params.birthYear) {
          throw new Error('Iqama number found but birth date does not match. Please verify.');
        }
      }
      return { ...match, fetchedAt: new Date().toISOString() };
    }
    throw new Error(`No employee found for Iqama "${params.iqamaNumber}" in sandbox. Try: 2456789012, 2567890123, or 2678901234`);
  }

  // LIVE — Muqeem API
  const body: Record<string, unknown> = {};
  if (params.iqamaNumber)  body.iqamaNumber  = params.iqamaNumber;
  if (params.borderNumber) body.borderNumber  = params.borderNumber;
  if (params.birthMonth)   body.birthMonth    = params.birthMonth;
  if (params.birthYear)    body.birthYear     = params.birthYear;

  const res = await fetch(`${MUQEEM_BASE}/workers/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_MUQEEM_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Muqeem API error: ${res.status}`);
  return mapMuqeemEmployeeResponse(await res.json());
}

// ── Response mappers (real API field names → our interface) ───────────────
function mapElmVehicleResponse(d: any): VehicleGovData {
  return {
    plateNumber:         d.plateNumber || d.plate_number,
    plateType:           d.plateType   || d.plate_type,
    chassisNumber:       d.chassisNumber || d.vin,
    make:                d.make || d.manufacturer,
    model:               d.model,
    year:                d.modelYear || d.year,
    color:               d.color || d.colorEn,
    ownerName:           d.ownerNameEn || d.owner_name,
    ownerIdNumber:       d.ownerId || d.owner_id,
    registrationExpiry:  d.regExpiryDate || d.registration_expiry,
    insuranceCompany:    d.insuranceCompany || d.insurer,
    insuranceExpiry:     d.insuranceExpiry || d.ins_expiry,
    insurancePolicyNo:   d.policyNumber || d.policy_no,
    mvpiStatus:          d.mvpiStatus  || 'not_found',
    mvpiExpiry:          d.mvpiExpiry  || '',
    trafficViolations:   d.violations  || 0,
    authorizedDriver:    d.authorizedDriver || '',
    authorizationExpiry: d.authExpiry  || '',
    source:              'ELM Tamm (Live)',
    fetchedAt:           new Date().toISOString(),
  };
}

function mapMuqeemEmployeeResponse(d: any): EmployeeGovData {
  return {
    iqamaNumber:         d.iqamaNumber   || d.iqama_number,
    borderNumber:        d.borderNumber  || d.border_number,
    fullNameAr:          d.nameAr        || d.full_name_ar,
    fullNameEn:          d.nameEn        || d.full_name_en,
    nationality:         d.nationality   || d.nationalityEn,
    nationalityCode:     d.nationalityCode || d.nationality_code,
    dateOfBirth:         d.dateOfBirth   || d.dob,
    gender:              d.gender,
    iqamaExpiry:         d.iqamaExpiry   || d.iqama_expiry,
    iqamaStatus:         d.iqamaStatus   || d.status,
    passportNumber:      d.passportNo    || d.passport_number,
    passportExpiry:      d.passportExpiry || d.passport_exp,
    profession:          d.professionEn  || d.profession,
    professionAr:        d.professionAr  || '',
    sponsorId:           d.sponsorId     || d.sponsor_id,
    sponsorName:         d.sponsorNameEn || d.sponsor_name,
    workPermitNumber:    d.workPermitNo  || d.work_permit,
    workPermitExpiry:    d.workPermitExpiry || d.wp_expiry,
    exitReEntryStatus:   d.exitReentryStatus || d.exit_reentry,
    laborStatus:         d.laborStatus   || 'active',
    nitaqatCategory:     d.nitaqat       || d.nitaqat_category || '',
    source:              'Muqeem API (Live)',
    fetchedAt:           new Date().toISOString(),
  };
}

export { MODE as GOV_API_MODE };
