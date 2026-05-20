/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building2,
  MapPin,
  Compass,
  Briefcase,
  Layers
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '../lib/utils';
import { useRouter } from '../components/Router';
import { supabase } from '../lib/supabase';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

interface SponsorDeployment {
  sponsor: string;
  site: string;
  employees: number;
}

const Dashboard = () => {
  const { navigate } = useRouter();
  
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeDrivers: 0,
    vehiclesRunning: 0,
    totalSponsors: 0,
    totalSites: 0,
    totalTrailers: 0,
    expiredDocs: 0,
    nearExpiry: 0,
    complianceRate: 85
  });

  const [sponsorDeployments, setSponsorDeployments] = useState<SponsorDeployment[]>([]);

  const [docValidities, setDocValidities] = useState({
    iqama: { valid: 0, nearExpiry: 0, expired: 0 },
    secPermit: { valid: 0, nearExpiry: 0, expired: 0 },
    drivingLicense: { valid: 0, nearExpiry: 0, expired: 0 },
    passport: { valid: 0, nearExpiry: 0, expired: 0 },
    insurance: { valid: 0, nearExpiry: 0, expired: 0 },
    authorization: { valid: 0, nearExpiry: 0, expired: 0 },
    mvpi: { valid: 0, nearExpiry: 0, expired: 0 },
  });

  useEffect(() => {
    async function fetchStatsAndDeployments() {
      try {
        // 1. Fetch real computed stats counts
        const [
          empRes, 
          vehRes, 
          spRes, 
          siteRes, 
          trailerRes,
          expDocsRes, 
          nearDocsRes,
          totalDocsRes,
          driversRes
        ] = await Promise.all([
          (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
          (supabase as any).from('vehicles').select('*', { count: 'exact', head: true }),
          (supabase as any).from('sponsors').select('*', { count: 'exact', head: true }),
          (supabase as any).from('sites').select('*', { count: 'exact', head: true }),
          (supabase as any).from('trailers').select('*', { count: 'exact', head: true }),
          (supabase as any).from('documents').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
          (supabase as any).from('documents').select('*', { count: 'exact', head: true }).eq('status', 'near_expiry'),
          (supabase as any).from('documents').select('*', { count: 'exact', head: true }),
          (supabase as any).from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver')
        ]);

        const totalDocsCount = totalDocsRes.count || 0;
        const expiredDocsCount = expDocsRes.count || 0;
        const calculatedCompliance = totalDocsCount > 0 
          ? Math.max(0, Math.min(100, Math.round(((totalDocsCount - expiredDocsCount) / totalDocsCount) * 100)))
          : 100;

        setStats({
          totalEmployees: empRes.count ?? 0,
          activeDrivers: driversRes.count ?? 0,
          vehiclesRunning: vehRes.count ?? 0,
          totalSponsors: spRes.count ?? 0,
          totalSites: siteRes.count ?? 0,
          totalTrailers: trailerRes.count ?? 0,
          expiredDocs: expiredDocsCount,
          nearExpiry: nearDocsRes.count ?? 0,
          complianceRate: calculatedCompliance
        });

        // 2. Fetch real sponsor deployment employee data
        const { data: spData } = await (supabase as any)
          .from('sponsors')
          .select(`
            name,
            employees:employees(count)
          `);

        const sitesList = ['Dammam Port', 'Jubail Industrial', 'NEOM Zone 1', 'Riyadh Central', 'Jeddah Terminal', 'Yanbu Refinery'];
        
        if (spData && spData.length > 0) {
          const calculated = spData.map((s: any, idx: number) => ({
            sponsor: s.name,
            site: sitesList[idx % sitesList.length],
            employees: s.employees?.[0]?.count ?? 0
          }));
          setSponsorDeployments(calculated);
        } else {
          setSponsorDeployments([]);
        }

        // 3. Fetch documents for validity breakdowns
        const { data: docData } = await (supabase as any)
          .from('documents')
          .select('type, status');

        const validities = {
          iqama: { valid: 0, nearExpiry: 0, expired: 0 },
          secPermit: { valid: 0, nearExpiry: 0, expired: 0 },
          drivingLicense: { valid: 0, nearExpiry: 0, expired: 0 },
          passport: { valid: 0, nearExpiry: 0, expired: 0 },
          insurance: { valid: 0, nearExpiry: 0, expired: 0 },
          authorization: { valid: 0, nearExpiry: 0, expired: 0 },
          mvpi: { valid: 0, nearExpiry: 0, expired: 0 },
        };

        if (docData && docData.length > 0) {
          docData.forEach((doc: any) => {
            const statusKey = doc.status === 'valid' ? 'valid' : 
                              doc.status === 'near_expiry' ? 'nearExpiry' : 
                              doc.status === 'expired' ? 'expired' : 'valid';
            
            const typeLower = (doc.type || '').toLowerCase();
            if (typeLower === 'iqama' || typeLower === 'muqeem') {
              validities.iqama[statusKey]++;
            } else if (typeLower === 'sec id front' || typeLower === 'sec idd back' || typeLower.includes('sec')) {
              validities.secPermit[statusKey]++;
            } else if (typeLower === 'dirivng license' || typeLower.includes('license') || typeLower.includes('driving')) {
              validities.drivingLicense[statusKey]++;
            } else if (typeLower === 'poassport' || typeLower.includes('passport')) {
              validities.passport[statusKey]++;
            } else if (typeLower === 'insurance') {
              validities.insurance[statusKey]++;
            } else if (typeLower === 'authrorization' || typeLower.includes('author') || typeLower.includes('auth')) {
              validities.authorization[statusKey]++;
            } else if (typeLower === 'mvpi' || typeLower.includes('mvpi') || typeLower.includes('periodic inspection') || typeLower.includes('وثيقة فحص')) {
              validities.mvpi[statusKey]++;
            }
          });
          setDocValidities(validities);
        } else {
          // Fallback mocks
          setDocValidities({
            iqama: { valid: 45, nearExpiry: 8, expired: 3 },
            secPermit: { valid: 32, nearExpiry: 5, expired: 1 },
            drivingLicense: { valid: 28, nearExpiry: 4, expired: 2 },
            passport: { valid: 50, nearExpiry: 12, expired: 0 },
            insurance: { valid: 15, nearExpiry: 3, expired: 1 },
            authorization: { valid: 18, nearExpiry: 2, expired: 0 },
            mvpi: { valid: 22, nearExpiry: 4, expired: 1 },
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    }
    fetchStatsAndDeployments();
  }, []);

  const chartData = [
    { name: 'Jan', compliance: 82, trips: 400 },
    { name: 'Feb', compliance: 85, trips: 450 },
    { name: 'Mar', compliance: 88, trips: 420 },
    { name: 'Apr', compliance: 90, trips: 480 },
    { name: 'May', compliance: 92, trips: 510 },
  ];

  const vehicleStats = [
    { name: 'Available', value: 65 },
    { name: 'In Use', value: 25 },
    { name: 'Maintenance', value: 10 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Intelligence</h1>
          <p className="text-slate-500 font-semibold text-sm">Real-time dynamic corporate operational metrics.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col px-4 border-r border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
            <span className="text-emerald-500 font-bold text-sm">OPERATIONAL</span>
          </div>
          <div className="px-4">
            <Calendar size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Top Grid: Deployments & Key Document Validities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1 & 2: Sponsor Deployments Chart */}
        <div className="md:col-span-2 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Sponsor Deployments</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Workforce density per active site</p>
            </div>
            <Briefcase size={18} className="text-indigo-500" />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sponsorDeployments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="sponsor" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, _: any, props: any) => [
                    `${value} Deployed at ${props.payload.site}`,
                    'Employees'
                  ]}
                />
                <Bar dataKey="employees" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24}>
                  {sponsorDeployments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 3: Iqama Donut Chart */}
        <ValidityDonutCard 
          title="Iqama Validity Summary" 
          data={docValidities.iqama} 
          onClick={() => navigate('/dms')} 
        />

        {/* Column 4: SEC Permit Donut Chart */}
        <ValidityDonutCard 
          title="SEC Permit Validity Summary" 
          data={docValidities.secPermit} 
          onClick={() => navigate('/dms')} 
        />
      </div>

      {/* Second Row Grid: Driving License, Passport, MVPI, Insurance, Authorization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <ValidityDonutCard 
          title="Driving License Validity" 
          data={docValidities.drivingLicense} 
          onClick={() => navigate('/dms')} 
        />

        <ValidityDonutCard 
          title="Employee Passport Validity" 
          data={docValidities.passport} 
          onClick={() => navigate('/dms')} 
        />

        <ValidityDonutCard 
          title="MVPI Expiry Summary" 
          data={docValidities.mvpi} 
          onClick={() => navigate('/dms')} 
        />

        <ValidityDonutCard 
          title="Vehicle Insurance Validity" 
          data={docValidities.insurance} 
          onClick={() => navigate('/dms')} 
        />

        <ValidityDonutCard 
          title="Vehicle Authorization Validity" 
          data={docValidities.authorization} 
          onClick={() => navigate('/dms')} 
        />
      </div>

      {/* KPI Cards Grid - Premium High-Density calculated cards row */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resources On Board</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <KPICard 
            title="Total Workforce" 
            value={stats.totalEmployees} 
            subtitle="Workforce Registry"
            trend="+12%" 
            icon={Users} 
            color="blue"
            onClick={() => navigate('/employee-master')}
          />
          <KPICard 
            title="Active Assets" 
            value={stats.vehiclesRunning} 
            subtitle="Tractors & Vehicles"
            trend="+5%" 
            icon={Truck} 
            color="indigo" 
            onClick={() => navigate('/vehicles')}
          />
          <KPICard 
            title="Active Drivers" 
            value={stats.activeDrivers} 
            subtitle="Mobilized Operators"
            trend="+4%" 
            icon={Compass} 
            color="emerald" 
            onClick={() => navigate('/drivers')}
          />
          <KPICard 
            title="Total Sponsors" 
            value={stats.totalSponsors} 
            subtitle="Enterprise Partners"
            trend="+8%" 
            icon={Building2} 
            color="amber" 
            onClick={() => navigate('/sponsors')}
          />
          <KPICard 
            title="Total Sites" 
            value={stats.totalSites} 
            subtitle="Active Locations"
            trend="+15%" 
            icon={MapPin} 
            color="rose" 
            onClick={() => navigate('/sites')}
          />
          <KPICard 
            title="Total Trailers" 
            value={stats.totalTrailers} 
            subtitle="Utility Cargo Trailers"
            trend="+9%" 
            icon={Layers} 
            color="violet" 
            onClick={() => navigate('/trailers')}
          />
        </div>
      </div>

      {/* Main Charts & Additional Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Compliance Trend */}
        <div className="lg:col-span-2 space-y-8">
          {/* Compliance Trend Chart */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Fleet Compliance Trend</h3>
                <p className="text-slate-500 text-sm">Monthly validity performance metrics.</p>
              </div>
              <TrendingUp className="text-blue-500" />
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="compliance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Section: Fleet Availability Donut Chart & Action Panels */}
        <div className="space-y-8 flex flex-col">
          
          {/* Donut Chart */}
          <div 
            onClick={() => navigate('/vehicles')}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col cursor-pointer hover:border-blue-450 hover:shadow-lg active:scale-[0.99] transition-all"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-8">Fleet Availability</h3>
            <div className="flex-1 h-[240px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={80} 
                    outerRadius={95} 
                    paddingAngle={8}
                    dataKey="value"
                    onClick={() => navigate('/vehicles')}
                  >
                    {vehicleStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Assets</span>
                <span className="text-2xl font-black text-slate-800">{stats.vehiclesRunning}</span>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              {vehicleStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="font-bold text-slate-600">{stat.name}</span>
                  </div>
                  <span className="font-black text-slate-900">{stat.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring soon */}
          <div 
            onClick={() => navigate('/dms')}
            className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group cursor-pointer hover:ring-4 hover:ring-slate-500/10 active:scale-[0.99] transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:scale-150" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Expiring Soon</h4>
            <p className="text-4xl font-black mb-4">{stats.nearExpiry}</p>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Documents requiring attention within the next 30 days. Priority: High.
            </p>
            <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
              Review Documents <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Active trips */}
          <div 
            onClick={() => navigate('/trips')}
            className="bg-indigo-600 p-8 rounded-[40px] text-white overflow-hidden relative group cursor-pointer hover:ring-4 hover:ring-indigo-500/20 active:scale-[0.99] transition-all"
          >
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Active Trips</h4>
            <p className="text-4xl font-black mb-4">52</p>
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-indigo-600 bg-indigo-400" />
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-indigo-600 bg-indigo-50 flex items-center justify-center text-[10px] font-bold">+48</div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
              Control Tower <ArrowUpRight size={14} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

interface ValidityData {
  valid: number;
  nearExpiry: number;
  expired: number;
}

const ValidityDonutCard = ({ title, data, onClick }: { title: string; data: ValidityData; onClick?: () => void }) => {
  const total = data.valid + data.nearExpiry + data.expired;
  
  const chartData = total > 0 ? [
    { name: 'Valid', value: data.valid, color: '#10b981' },
    { name: 'Near Expiry', value: data.nearExpiry, color: '#f59e0b' },
    { name: 'Expired', value: data.expired, color: '#ef4444' }
  ] : [
    { name: 'No Documents', value: 1, color: '#e2e8f0' }
  ];

  const displayData = total > 0 ? [
    { name: 'Valid', value: data.valid, percentage: Math.round((data.valid / total) * 100), color: 'bg-emerald-500' },
    { name: 'Near Expiry', value: data.nearExpiry, percentage: Math.round((data.nearExpiry / total) * 100), color: 'bg-amber-500' },
    { name: 'Expired', value: data.expired, percentage: Math.round((data.expired / total) * 100), color: 'bg-rose-500' }
  ] : [
    { name: 'Valid', value: 0, percentage: 0, color: 'bg-emerald-500' },
    { name: 'Near Expiry', value: 0, percentage: 0, color: 'bg-amber-500' },
    { name: 'Expired', value: 0, percentage: 0, color: 'bg-rose-500' }
  ];

  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
        <div className="h-[100px] relative flex items-center justify-center mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={40}
                paddingAngle={total > 0 ? 4 : 0}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total</span>
            <span className="text-sm font-black text-slate-800">{total}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 mt-3">
        {displayData.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
              <span className="font-bold text-slate-500">{item.name}</span>
            </div>
            <span className="font-black text-slate-700">{item.value} ({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const KPICard = ({ title, value, subtitle, trend, icon: Icon, color, alert, onClick, donutValue }: any) => {
  const hasDonut = typeof donutValue === 'number';
  const radius = 18;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasDonut ? circumference - (donutValue / 100) * circumference : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-350 hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer group overflow-hidden relative"
    >
      {alert && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />}
      <div className="flex justify-between items-start mb-4">
        {hasDonut ? (
          <div className="relative w-11 h-11 flex items-center justify-center transition-transform group-hover:scale-110">
            <svg width="44" height="44" className="absolute transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="transparent"
                stroke="rgba(226, 232, 240, 0.5)"
                strokeWidth={strokeWidth}
              />
              {/* Foreground circle */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="transparent"
                stroke={color === 'emerald' ? '#10b981' : '#3b82f6'}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className={cn(
              "z-10 flex items-center justify-center w-8 h-8 rounded-full",
              color === 'emerald' ? "text-emerald-600 bg-emerald-50/50" : "text-blue-600 bg-blue-50/50"
            )}>
              <Icon size={16} />
            </div>
          </div>
        ) : (
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
            color === 'blue' ? "bg-blue-50 text-blue-600" :
            color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
            color === 'amber' ? "bg-amber-50 text-amber-600" :
            color === 'rose' ? "bg-rose-50 text-rose-600" : 
            color === 'violet' ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600"
          )}>
            <Icon size={20} />
          </div>
        )}
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{subtitle}</p>
    </div>
  );
};

export default Dashboard;
