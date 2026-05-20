// Force IDE refresh
import { useAuth } from './context/AuthContext';
import { RouterProvider, Switch, Route } from './components/Router';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ControlTower from './pages/ControlTower';
import TripsPage from './pages/TripsPage';
import VehiclesPage from './pages/VehiclesPage';
import StubPage from './pages/StubPages';
import NotFoundPage from './pages/NotFoundPage';
import UsersPage from './pages/UsersPage';
import SitesPage from './pages/SitesPage';
import DriversPage from './pages/DriversPage';
import OrdersPage from './pages/OrdersPage';
import LaborPage from './pages/LaborPage';
import MobilizationPage from './pages/MobilizationPage';
import SupervisorsPage from './pages/SupervisorsPage';
import BreakdownPage from './pages/BreakdownPage';
import DispatchPage from './pages/DispatchPage';
import TripAllowancesPage from './pages/TripAllowancesPage';
import PermissionsPage from './pages/PermissionsPage';
import TrailersPage from './pages/TrailersPage';
import FleetCombinationsPage from './pages/FleetCombinationsPage';
import SponsorsPage from './pages/SponsorsPage';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import RelationalSearch from './pages/RelationalSearch';
import DMSEngine from './pages/DMSEngine';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import KnowledgePage from './pages/KnowledgePage';
import DMSDashboardNew from './pages/DMSDashboard';
import DMSUploadDocument from './pages/UploadDocument';
import DMSDocuments from './pages/Documents';
import DMSArchived from './pages/Archived';
import DMSSampleResults from './pages/SampleResults';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function LocationSync() {
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.role !== 'driver') return;

    let intervalId: any;

    async function syncLocation() {
      if (!profile) return;
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await (supabase.from('employees') as any)
              .update({
                current_lat: position.coords.latitude as any,
                current_lng: position.coords.longitude as any,
                last_location_update: new Date().toISOString()
              } as any)
              .eq('id', profile.id);
            
            console.log('Location synced for driver:', profile.id);
          },
          (error) => {
            console.warn('Geolocation error:', error);
          }
        );
      }
    }

    // Initial sync
    syncLocation();

    // Sync every 5 minutes (300,050 ms)
    intervalId = setInterval(syncLocation, 300000);

    return () => clearInterval(intervalId);
  }, [profile]);

  return null;
}

function AuthGuard({ children, path }: { children: React.ReactNode, path: string }) {
  const { profile, permissions } = useAuth();
  
  if (!profile) return null; // Still loading profile
  
  // Admin has access to everything. Others check against role_permissions table.
  if (profile.role !== 'admin' && !permissions.includes(path)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

import ConfirmDialog from './components/ui/ConfirmDialog';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <RouterProvider>
      <LocationSync />
      <ConfirmDialog />
      <Layout>
        <Switch>
          <Route path="/" element={<Dashboard />} />
          <Route path="/control-tower" element={<AuthGuard path="/control-tower"><ControlTower /></AuthGuard>} />
          <Route path="/trips" element={<AuthGuard path="/trips"><TripsPage /></AuthGuard>} />
          <Route path="/trip-allowances" element={<AuthGuard path="/trip-allowances"><TripAllowancesPage /></AuthGuard>} />
          <Route path="/vehicles" element={<AuthGuard path="/vehicles"><VehiclesPage /></AuthGuard>} />
          <Route path="/trailers" element={<AuthGuard path="/trailers"><TrailersPage /></AuthGuard>} />
          <Route path="/fleet-combinations" element={<AuthGuard path="/fleet-combinations"><FleetCombinationsPage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard path="/orders"><OrdersPage /></AuthGuard>} />
          <Route path="/dispatch" element={<AuthGuard path="/dispatch"><DispatchPage /></AuthGuard>} />
          <Route path="/drivers" element={<AuthGuard path="/drivers"><DriversPage /></AuthGuard>} />
          <Route path="/labor" element={<AuthGuard path="/labor"><LaborPage /></AuthGuard>} />
          <Route path="/mobilization" element={<AuthGuard path="/mobilization"><MobilizationPage /></AuthGuard>} />
          <Route path="/supervisors" element={<AuthGuard path="/supervisors"><SupervisorsPage /></AuthGuard>} />
          <Route path="/breakdowns" element={<AuthGuard path="/breakdowns"><BreakdownPage /></AuthGuard>} />
          <Route path="/sites" element={<AuthGuard path="/sites"><SitesPage /></AuthGuard>} />
          <Route path="/inspections" element={<AuthGuard path="/inspections"><StubPage /></AuthGuard>} />
          <Route path="/reports" element={<AuthGuard path="/reports"><StubPage /></AuthGuard>} />
          <Route path="/users" element={<AuthGuard path="/users"><UsersPage /></AuthGuard>} />
          <Route path="/permissions" element={<AuthGuard path="/permissions"><PermissionsPage /></AuthGuard>} />
          <Route path="/driver-mobile" element={<AuthGuard path="/driver-mobile"><StubPage /></AuthGuard>} />
          <Route path="/sponsors" element={<AuthGuard path="/sponsors"><SponsorsPage /></AuthGuard>} />
          <Route path="/employee-master" element={<AuthGuard path="/employee-master"><EmployeeDetailsPage /></AuthGuard>} />
          <Route path="/vehicle-master" element={<AuthGuard path="/vehicle-master"><VehicleDetailsPage /></AuthGuard>} />
          <Route path="/search" element={<AuthGuard path="/search"><RelationalSearch /></AuthGuard>} />
          <Route path="/dms" element={<AuthGuard path="/dms"><DMSEngine /></AuthGuard>} />
          <Route path="/dms-dashboard" element={<DMSDashboardNew />} />
          <Route path="/upload" element={<DMSUploadDocument />} />
          <Route path="/documents" element={<DMSDocuments />} />
          <Route path="/archived" element={<DMSArchived />} />
          <Route path="/sample-results" element={<DMSSampleResults />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/settings" element={<AuthGuard path="/settings"><SettingsPage /></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard path="/notifications"><NotificationsPage /></AuthGuard>} />
          <Route path="" element={<NotFoundPage />} default />
        </Switch>
      </Layout>
    </RouterProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
