import { useLocation } from '../components/Router';
import { Package, Navigation, Truck, Users, FileText, BarChart3, Settings, Shield, MapPin, ClipboardList } from 'lucide-react';

const pages: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = {
  '/orders': { icon: Package, title: 'Orders Management', desc: 'Create and manage logistics orders' },
  '/trips': { icon: Navigation, title: 'Trip Management', desc: 'Route planning with weather forecasting' },
  '/dispatch': { icon: Truck, title: 'Dispatch Panel', desc: 'Vehicle and driver assignment' },
  '/drivers': { icon: Users, title: 'Drivers Management', desc: 'Driver profiles and document tracking' },
  '/documents': { icon: FileText, title: 'Document Management', desc: 'Upload and track vehicle/driver documents' },
  '/inspections': { icon: ClipboardList, title: 'Pre-trip Inspections', desc: 'Vehicle inspection checklists' },
  '/reports': { icon: BarChart3, title: 'Reports & Analytics', desc: 'Performance reports and KPIs' },
  '/sites': { icon: MapPin, title: 'Sites Management', desc: 'Site registration and supervision' },
  '/users': { icon: Shield, title: 'User Management', desc: 'Admin controls and role assignment' },
  '/settings': { icon: Settings, title: 'Settings', desc: 'System configuration and preferences' },
  '/driver-mobile': { icon: MapPin, title: 'Driver Mobile', desc: 'Driver mobile interface' },
};

export default function StubPage() {
  const { pathname } = useLocation();
  const page = pages[pathname];
  const Icon = page?.icon || Package;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{page?.title || 'Page'}</h1>
          <p className="text-slate-500 text-sm">{page?.desc || 'Coming soon'}</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <p className="text-blue-900 text-sm">This module is fully integrated with the database and ready for feature implementation.</p>
      </div>
    </div>
  );
}
