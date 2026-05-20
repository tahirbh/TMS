import { useState } from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  Truck, 
  FileCheck, 
  ListChecks, 
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

type TabType = 'overview' | 'rbac' | 'fleet' | 'dms' | 'sop';

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-1">
            <BookOpen size={14} />
            EH TMS Knowledge Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight">System Specification & EHSS Policies</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Enterprise blueprints and compliance handbook for Environmental Horizons Co.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href="/EH_TMS_SCOPE_DOCUMENT.md" 
            download
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            <Download size={14} />
            Download Spec Dossier (.MD)
          </a>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Nav */}
        <div className="space-y-1 bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">Dossier Contents</p>
          {[
            { id: 'overview', icon: BookOpen, label: 'Executive Summary', desc: 'System scope and genesis' },
            { id: 'rbac', icon: ShieldAlert, label: 'Workforce RBAC', desc: 'Stakeholder permissions' },
            { id: 'fleet', icon: Truck, label: 'Fleet Asset Model', desc: 'Active combinations' },
            { id: 'dms', icon: FileCheck, label: 'DMS & Compliance', desc: 'Expiry pipelines & MOI' },
            { id: 'sop', icon: ListChecks, label: 'Operational SOPs', desc: 'Step-by-step checklists' },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                  active 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">{tab.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Details Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl shadow-slate-100/10 dark:shadow-none min-h-[500px]">
          
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="relative rounded-2xl overflow-hidden group shadow-lg border border-slate-200/50 dark:border-slate-800">
                <img 
                  src="/about_illustration.png" 
                  alt="EH TMS Realistic Fleet Mockup" 
                  className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full w-max mb-1">EH TMS Official Fleet Mockup</span>
                  <h3 className="text-white text-lg font-black">Environmental Horizons Heavy Transport & Logistics Fleet</h3>
                  <p className="text-slate-300 text-xs mt-0.5">Heavy Bulker, Vacuum Tanker, Curtain Side Trailer, and Dyna Utility Truck wrapped in corporate decals.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Executive Scope & System Vision</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  The <strong>EH Transport & Terminal Management System (EH TMS)</strong> represents a custom-engineered enterprise asset coordinator built specifically for <strong>Environmental Horizons Co. (EH)</strong>. Operating heavily within hazardous waste collection, chemical powder hauling, and port-side cargo logistics across Saudi Arabia, EH requires absolute integration of fleet dispatch control with rigorous administrative compliance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-1">1. Workforce Governance</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Eliminates KSA legal worker liabilities by checking residency (Iqama), heavy-vehicle driving licenses, and SEC region clearance cards against legal sponsors recorded under their unique MOI sponsor keys.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-1">2. Dynamic Asset Locking</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Links semi-truck tractors, specialized hazardous-liquid vacuum tankers, bulker silo trailers, and drivers into "Active Mission Units" dynamically, reflecting operational versatility.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-1">3. Control Tower Geofencing</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Monitors real-time terminal locations, active trips, dynamic fuel allowances, and sudden truck breakdowns. Maps landfill nodes, port terminals, and geocoded customer sites.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-1">4. Terminal Supervisor Assignments</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Explicitly registers local terminals and landfill sites under dedicated supervisor profiles. Supervisors coordinate local pre-trip checklists and inspect incoming tankers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFORCE RBAC */}
          {activeTab === 'rbac' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Role-Based Access Control (RBAC) Matrix</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Permissions, responsibilities, and data boundaries mapped by stakeholder profiles.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Role</th>
                      <th className="p-3">Primary Focus</th>
                      <th className="p-3">Target Screens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {[
                      { role: 'Super Admin', focus: 'Governance, audits, permission overrides', screens: 'Users, Permissions, Logs' },
                      { role: 'Management', focus: 'KPIs, yield tracking, corporate auditing', screens: 'Dashboard, Control Tower, Fleet' },
                      { role: 'Operations Manager', focus: 'Scheduling, orders, route planning', screens: 'Orders, Trips, Dispatch' },
                      { role: 'Fleet Supervisor', focus: 'Terminal checks, truck health, combinations', screens: 'Fleet, Combinations, Breakdowns' },
                      { role: 'HR Coordinator', focus: 'Onboarding, Iqama registry, sponsors', screens: 'Workforce Master, Sponsors' },
                      { role: 'Document Controller', focus: 'Vault audit, compliance monitoring', screens: 'DMS Engine, Expirations' },
                      { role: 'Driver', focus: 'Trip execution, pre-trip checklists', screens: 'Driver Portal, Inspections' },
                      { role: 'Labor', focus: 'Physical dispatch checklists', screens: 'Site Console, Labor Details' }
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                        <td className="p-3 font-bold text-slate-800 dark:text-white">{item.role}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 leading-normal">{item.focus}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-md font-bold text-[10px]">{item.screens}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FLEET ASSET MODEL */}
          {activeTab === 'fleet' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">The Fleet Combination Model</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Flexible coupling logic that maps dynamic three-tier asset combinations.</p>
              </div>

              {/* Graphical Combination Flow */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider text-center">Active Mission Unit Assembly</h4>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
                  
                  {/* Truck */}
                  <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl w-36 shadow-sm">
                    <span className="text-2xl">🚚</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Tractor Truck</span>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black mt-1 uppercase">Available</span>
                  </div>

                  <span className="text-slate-400 text-xl font-bold">+</span>

                  {/* Trailer */}
                  <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl w-36 shadow-sm">
                    <span className="text-2xl">🚛</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Specialized Trailer</span>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black mt-1 uppercase">Available</span>
                  </div>

                  <span className="text-slate-400 text-xl font-bold">+</span>

                  {/* Driver */}
                  <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl w-36 shadow-sm">
                    <span className="text-2xl">👤</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Licensed Driver</span>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black mt-1 uppercase">Available</span>
                  </div>

                  <div className="hidden md:flex flex-col items-center">
                    <ArrowRight className="text-blue-500 animate-pulse" />
                  </div>

                  {/* Active Unit */}
                  <div className="flex flex-col items-center bg-blue-600 p-4 rounded-2xl w-44 shadow-lg text-white">
                    <span className="text-2xl">🔗</span>
                    <span className="text-xs font-black mt-1">Active Mission Unit</span>
                    <span className="text-[9px] font-medium opacity-80">Auto Named: Truck/Trailer</span>
                    <span className="text-[8px] font-black uppercase bg-blue-800 px-1.5 py-0.5 rounded mt-2">Locked & Dispatched</span>
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-[11px] text-center max-w-lg mx-auto">
                  Breaking down a fleet combination immediately unlocks all three individual entities, releasing them back to their respective pools for immediate repurposing.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Supported Trailer Classes & Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Curtain Side Trailer', util: 'General dry cargo, palletized logistics, lateral dock loading. Full corporate leaf wraps.', key: 'curtainsider' },
                    { title: 'Vacuum Tanker Trailer', util: 'Industrial liquid waste collection, landfill leachate hauling, wastewater cleanup. Metallic safety tanks.', key: 'tanker' },
                    { title: 'Bulker Silo Trailer', util: 'Dry-bulk powder cement hauling, industrial powder raw materials. Aerodynamic pressurized silos.', key: 'bulker' },
                    { title: 'Dyna Mini Box Utility Truck', util: 'Rapid site response operations, environmental testing samples, tool delivery. Compact urban utility truck.', key: 'van / box' }
                  ].map((spec, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{spec.title}</h4>
                        <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">{spec.key}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal">{spec.util}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DMS & COMPLIANCE */}
          {activeTab === 'dms' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Document Management Vault & OCR Verification</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Automated validity pipelines, date tracking, and MOI sponsor indexes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Expiration Rules */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">KSA Date & Expiration Monitor</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-normal">
                    Saudi Iqamas and Muqeem resident documents expire using the **Hijri (Islamic Lunar) Calendar**, whereas heavy truck registrations, MVPI, and insurance policies follow the standard **Gregorian Calendar**.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/15 border border-red-100 dark:border-red-900/30 rounded-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-rose-700 dark:text-rose-400">Expired (Red Status)</div>
                        <div className="text-[10px] text-rose-500 mt-0.5">Gregorian expiry date has passed current timestamp. Trigger block.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Near Expiry (Orange Warning)</div>
                        <div className="text-[10px] text-amber-500 mt-0.5">Expiry date is within 30 days. Auto SMS/Email dispatcher alert.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Valid (Green Status)</div>
                        <div className="text-[10px] text-emerald-500 mt-0.5">Expiry date is more than 30 days away. Compliant and active.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Pipeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Auto-Provision Sponsor Pipeline</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-normal">
                    When the HR Coordinator uploads employee residency sheets (Iqama), the system checks the legal **MOI Sponsor Code**.
                  </p>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 relative font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-slate-400 mb-1">
                      <AlertCircle size={12} className="text-blue-500" />
                      Trigger Execution Block
                    </div>
                    <div>1. Input: Iqama scanned PDF containing Sponsor MOI.</div>
                    <div>2. Check: Does sponsor 'moi_key' exist in local registry?</div>
                    <div className="text-amber-500 font-bold">↳ No: CREATE NEW entry in sponsors matching MOI code to prevent application workflow locks.</div>
                    <div className="text-emerald-500 font-bold">↳ Yes: Fetch existing sponsor registry and relate employee.</div>
                    <div>3. Finish: Successfully onboard workforce without lockup.</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: STANDARD OPERATING PROCEDURES */}
          {activeTab === 'sop' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Standard Operating Procedures (SOP)</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">EHSS compliance workflows required for fleet mobilization and order tracking.</p>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1', title: 'Workforce Registry Setup', desc: 'Onboard workforce profile under the Workforce Master module. Provide Iqama details, Hijri Expiry Date, and sponsor keys. Securely save scanned PDF residency files.' },
                  { step: '2', title: 'Asset Verification & Registration', desc: 'Input Tractor (Truck) and Specialized Trailer details under Vehicles and Trailers modules. Record exact MVPI checkup timelines, third-party liability (TPL) insurance, and Istimara expiration dates.' },
                  { step: '3', title: 'Creating active combination units', desc: 'Open Fleet Combinations panel. Select available Truck, select specialized Trailer, and select licensed active Driver. Link entities. The locked unit is now marked active and restricted from overlapping setups.' },
                  { step: '4', title: 'Trip Dispatching & Pre-Trip Safety checks', desc: 'Select pending haul order targeting registered geolocated Sites. Select active combination unit and click Dispatch. Driver validates vehicle checklist (body, tires, safety indicators, DMS status) prior to departure.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black rounded-full flex items-center justify-center shrink-0 text-xs">{item.step}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
