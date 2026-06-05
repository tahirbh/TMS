import { useState } from 'react';
import {
  Users,
  Truck,
  Package,
  Radio,
  Navigation,
  Shield,
  UserCheck,
  FileText,
  CircleDollarSign,
  Settings,
  Bell,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  Sparkles,
  BookOpen,
  Scan,
  Eye,
  Edit3,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Activity,
  LayoutDashboard,
  Network,
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const cn = (...c: (string | undefined | false | null)[]) => c.filter(Boolean).join(' ');

// ─── Actor Definitions ────────────────────────────────────────────────────────
interface Actor {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
  description: string;
  responsibilities: string[];
  canAccess: string[];
}

const ACTORS: Actor[] = [
  {
    id: 'admin',
    name: 'System Administrator',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'Full unrestricted access to all modules. Manages users, permissions, system configuration and audit logs.',
    responsibilities: [
      'Create / manage user accounts & roles',
      'Configure role-based permission matrix',
      'Enroll Face-ID biometrics for users',
      'Access all operational and financial data',
      'Manage sponsors, sites and master data',
      'Override any system state',
      'View all notifications and alerts',
      'Manage system settings and integrations',
    ],
    canAccess: ['All Modules'],
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    icon: Radio,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Core operations role. Receives orders, assigns vehicles and drivers, creates trips and monitors live fleet status.',
    responsibilities: [
      'View and manage transport orders',
      'Assign vehicles, trailers & drivers to orders',
      'Create and dispatch trips',
      'Monitor Control Tower live map',
      'Upload Bayan / Manifest documents',
      'Force site sync on trips',
      'Verify net weight at destination',
      'Monitor fleet availability & breakdowns',
    ],
    canAccess: ['Dashboard', 'Orders', 'Dispatch', 'Trips', 'Control Tower', 'Vehicles', 'Trailers', 'Drivers', 'Breakdowns'],
  },
  {
    id: 'driver',
    name: 'Driver',
    icon: Truck,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'Mobile field operator. Views assigned trips, updates trip status at each milestone and uploads proof of delivery.',
    responsibilities: [
      'View assigned trip details & route map',
      'Enter start odometer and depart',
      'Report arrival at destination',
      'Enter gross weight on arrival',
      'Enter final odometer on return',
      'Enter net weight on completion',
      'Upload Bayan, Manifest, and POD',
      'Location auto-syncs every 5 minutes',
    ],
    canAccess: ['Trips (Assigned Only)', 'Driver Mobile View'],
  },
  {
    id: 'supervisor',
    name: 'Site Supervisor',
    icon: UserCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Oversees site-level workforce and operations. Views employee data, site assignments, mobilization and compliance.',
    responsibilities: [
      'View employees assigned to their sites',
      'Monitor workforce mobilization',
      'View site-level compliance reports',
      'View vehicle and driver assignments',
      'Manage labor bookings',
      'View document validity status',
    ],
    canAccess: ['Dashboard', 'Employees', 'Supervisors', 'Sites', 'Labor', 'Mobilization'],
  },
  {
    id: 'viewer',
    name: 'Viewer / Auditor',
    icon: Eye,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    description: 'Read-only access granted by admin. Can view operational data, documents and reports but cannot modify anything.',
    responsibilities: [
      'View all assigned modules (read-only)',
      'Download and review documents',
      'View compliance reports',
      'View trip history and logs',
      'View financial allowance reports',
    ],
    canAccess: ['Varies — permission-controlled by Admin'],
  },
];

// ─── ERD Entities ─────────────────────────────────────────────────────────────
interface ERDTable {
  id: string;
  name: string;
  schema: string;
  color: string;
  gradient: string;
  columns: { name: string; type: string; pk?: boolean; fk?: boolean; unique?: boolean; nullable?: boolean; note?: string }[];
  relations: { table: string; type: '1:N' | 'N:1' | '1:1' | 'N:N'; via?: string }[];
}

const ERD_TABLES: ERDTable[] = [
  {
    id: 'profiles',
    name: 'profiles',
    schema: 'Users & Auth',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: 'Supabase Auth UID' },
      { name: 'full_name', type: 'varchar(255)' },
      { name: 'email', type: 'varchar(255)', unique: true },
      { name: 'phone', type: 'varchar(50)', nullable: true },
      { name: 'role', type: 'enum(admin,dispatcher,driver,supervisor)', note: 'Controls permission matrix' },
      { name: 'face_descriptor', type: 'jsonb', nullable: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'created_at', type: 'timestamptz' },
      { name: 'last_login', type: 'timestamptz', nullable: true },
    ],
    relations: [
      { table: 'employees', type: '1:1', via: 'id → employees.id' },
      { table: 'role_permissions', type: '1:N', via: 'role → role_permissions.role' },
      { table: 'trips', type: '1:N', via: 'id → trips.driver_id' },
    ],
  },
  {
    id: 'employees',
    name: 'employees',
    schema: 'Workforce',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true, fk: true, note: '→ profiles.id' },
      { name: 'sponsor_id', type: 'uuid', fk: true, nullable: true, note: '→ sponsors.id' },
      { name: 'site_id', type: 'uuid', fk: true, nullable: true, note: '→ sites.id' },
      { name: 'supervisor_id', type: 'uuid', fk: true, nullable: true, note: '→ employees.id (self-ref)' },
      { name: 'iqama_number', type: 'varchar(20)', nullable: true },
      { name: 'iqama_expiry', type: 'date', nullable: true },
      { name: 'passport_number', type: 'varchar(30)', nullable: true },
      { name: 'passport_expiry', type: 'date', nullable: true },
      { name: 'driving_license_number', type: 'varchar(30)', nullable: true },
      { name: 'driving_license_expiry', type: 'date', nullable: true },
      { name: 'status', type: 'enum(available,on_trip,on_leave)' },
      { name: 'current_lat', type: 'decimal(10,8)', nullable: true },
      { name: 'current_lng', type: 'decimal(11,8)', nullable: true },
      { name: 'last_location_update', type: 'timestamptz', nullable: true },
    ],
    relations: [
      { table: 'profiles', type: 'N:1' },
      { table: 'sponsors', type: 'N:1' },
      { table: 'sites', type: 'N:1' },
      { table: 'documents', type: '1:N', via: "entity_type='employee'" },
      { table: 'trips', type: '1:N', via: 'id → trips.driver_id' },
    ],
  },
  {
    id: 'vehicles',
    name: 'vehicles',
    schema: 'Fleet & Assets',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-700',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'registration_number', type: 'varchar(50)', unique: true },
      { name: 'make', type: 'varchar(100)' },
      { name: 'model', type: 'varchar(100)' },
      { name: 'year', type: 'integer' },
      { name: 'type', type: 'enum(truck,trailer,van,tanker,flatbed)' },
      { name: 'capacity_tons', type: 'decimal(8,2)' },
      { name: 'color', type: 'varchar(50)', nullable: true },
      { name: 'owner_name', type: 'varchar(255)', nullable: true },
      { name: 'sequence_number', type: 'varchar(50)', nullable: true },
      { name: 'authorized_driver', type: 'varchar(255)', nullable: true },
      { name: 'status', type: 'enum(available,in_use,maintenance,inactive)' },
      { name: 'registration_expiry', type: 'date', nullable: true },
      { name: 'insurance_expiry', type: 'date', nullable: true },
      { name: 'authorization_expiry', type: 'date', nullable: true },
      { name: 'mvpi_expiry', type: 'date', nullable: true },
      { name: 'last_service_date', type: 'date', nullable: true },
      { name: 'next_service_date', type: 'date', nullable: true },
      { name: 'current_lat', type: 'decimal(10,8)', nullable: true },
      { name: 'current_lng', type: 'decimal(11,8)', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
    ],
    relations: [
      { table: 'trips', type: '1:N', via: 'id → trips.vehicle_id' },
      { table: 'fleet_combinations', type: '1:N' },
      { table: 'breakdowns', type: '1:N', via: 'id → breakdowns.vehicle_id' },
      { table: 'documents', type: '1:N', via: "entity_type='vehicle'" },
    ],
  },
  {
    id: 'trailers',
    name: 'trailers',
    schema: 'Fleet & Assets',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'plate_number', type: 'varchar(50)', unique: true },
      { name: 'type', type: 'varchar(50)', note: 'flatbed / tanker / curtainsider…' },
      { name: 'capacity_tons', type: 'decimal(8,2)' },
      { name: 'status', type: 'enum(available,in_use,maintenance)' },
      { name: 'insurance_expiry', type: 'date', nullable: true },
      { name: 'registration_expiry', type: 'date', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
    ],
    relations: [
      { table: 'trips', type: '1:N', via: 'id → trips.trailer_id' },
      { table: 'fleet_combinations', type: '1:N' },
    ],
  },
  {
    id: 'orders',
    name: 'orders',
    schema: 'Operations',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'order_number', type: 'varchar(50)', unique: true },
      { name: 'site_id', type: 'uuid', fk: true, note: '→ sites.id' },
      { name: 'created_by', type: 'uuid', fk: true, note: '→ profiles.id' },
      { name: 'pickup_location', type: 'varchar(255)' },
      { name: 'delivery_location', type: 'varchar(255)' },
      { name: 'pickup_lat / pickup_lng', type: 'decimal', nullable: true },
      { name: 'delivery_lat / delivery_lng', type: 'decimal', nullable: true },
      { name: 'material_type', type: 'varchar(255)' },
      { name: 'quantity_tons', type: 'decimal(8,2)' },
      { name: 'trailer_type', type: 'varchar(50)' },
      { name: 'priority', type: 'enum(low,normal,high,urgent)' },
      { name: 'status', type: 'enum(pending,assigned,in_progress,completed,cancelled)' },
      { name: 'required_date', type: 'date' },
      { name: 'required_vehicles', type: 'integer' },
      { name: 'assigned_vehicles', type: 'integer' },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz' },
    ],
    relations: [
      { table: 'trips', type: '1:N', via: 'id → trips.order_id' },
      { table: 'sites', type: 'N:1', via: 'site_id → sites.id' },
    ],
  },
  {
    id: 'trips',
    name: 'trips',
    schema: 'Operations',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'trip_number', type: 'varchar(50)', unique: true },
      { name: 'order_id', type: 'uuid', fk: true, note: '→ orders.id' },
      { name: 'vehicle_id', type: 'uuid', fk: true, note: '→ vehicles.id' },
      { name: 'driver_id', type: 'uuid', fk: true, note: '→ employees.id' },
      { name: 'trailer_id', type: 'uuid', fk: true, nullable: true, note: '→ trailers.id' },
      { name: 'dispatcher_id', type: 'uuid', fk: true, note: '→ profiles.id' },
      { name: 'origin_name / destination_name', type: 'varchar' },
      { name: 'origin_lat / origin_lng', type: 'decimal', nullable: true },
      { name: 'destination_lat / destination_lng', type: 'decimal', nullable: true },
      { name: 'route_distance_km', type: 'decimal(8,2)' },
      { name: 'actual_distance_km', type: 'decimal(8,2)', nullable: true },
      { name: 'status', type: 'enum(assigned,enroute,delivered,completed)' },
      { name: 'scheduled_departure', type: 'timestamptz' },
      { name: 'actual_departure', type: 'timestamptz', nullable: true },
      { name: 'arrived_at', type: 'timestamptz', nullable: true },
      { name: 'actual_arrival', type: 'timestamptz', nullable: true },
      { name: 'start_odometer', type: 'decimal', nullable: true },
      { name: 'arrival_odometer', type: 'decimal', nullable: true },
      { name: 'final_odometer', type: 'decimal', nullable: true },
      { name: 'gross_weight', type: 'decimal', nullable: true },
      { name: 'net_weight', type: 'decimal', nullable: true },
      { name: 'bayan_url', type: 'text', nullable: true },
      { name: 'manifest_url', type: 'text', nullable: true },
      { name: 'proof_of_delivery_url', type: 'text', nullable: true },
    ],
    relations: [
      { table: 'orders', type: 'N:1' },
      { table: 'vehicles', type: 'N:1' },
      { table: 'employees', type: 'N:1', via: 'driver_id' },
      { table: 'trailers', type: 'N:1' },
      { table: 'trip_ledger', type: '1:1' },
    ],
  },
  {
    id: 'trip_ledger',
    name: 'trip_ledger',
    schema: 'Financials',
    color: '#f59e0b',
    gradient: 'from-yellow-500 to-amber-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'trip_id', type: 'uuid', fk: true, unique: true, note: '→ trips.id' },
      { name: 'distance_km', type: 'decimal(10,2)' },
      { name: 'cost_per_km', type: 'decimal(6,2)', note: '0.60 SR or 0.90 SR' },
      { name: 'total_cost_sr', type: 'decimal(12,2)' },
      { name: 'allowance_sr', type: 'decimal(12,2)' },
      { name: 'calculated_at', type: 'timestamptz' },
    ],
    relations: [
      { table: 'trips', type: 'N:1', via: '1:1 on trip_id' },
    ],
  },
  {
    id: 'sites',
    name: 'sites',
    schema: 'Logistics',
    color: '#0ea5e9',
    gradient: 'from-sky-500 to-cyan-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'name', type: 'varchar(255)', unique: true },
      { name: 'type', type: 'varchar(100)' },
      { name: 'latitude', type: 'decimal(10,8)', nullable: true },
      { name: 'longitude', type: 'decimal(11,8)', nullable: true },
      { name: 'region', type: 'varchar(100)', nullable: true },
      { name: 'address', type: 'text', nullable: true },
      { name: 'contact_person', type: 'varchar(255)', nullable: true },
      { name: 'supervisor_id', type: 'uuid', fk: true, nullable: true, note: '→ profiles.id' },
      { name: 'is_active', type: 'boolean' },
    ],
    relations: [
      { table: 'orders', type: '1:N' },
      { table: 'employees', type: '1:N' },
    ],
  },
  {
    id: 'sponsors',
    name: 'sponsors',
    schema: 'Workforce',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-yellow-500',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'name', type: 'varchar(255)' },
      { name: 'contact_person', type: 'varchar(255)', nullable: true },
      { name: 'phone', type: 'varchar(50)', nullable: true },
      { name: 'email', type: 'varchar(255)', nullable: true },
      { name: 'cr_number', type: 'varchar(50)', nullable: true },
      { name: 'address', type: 'text', nullable: true },
    ],
    relations: [
      { table: 'employees', type: '1:N' },
    ],
  },
  {
    id: 'documents',
    name: 'documents',
    schema: 'DMS',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'entity_type', type: "enum('employee','vehicle')" },
      { name: 'entity_id', type: 'uuid', note: 'Polymorphic FK → employees/vehicles' },
      { name: 'type', type: 'varchar(100)', note: 'Iqama / Driving License / MVPI…' },
      { name: 'file_url', type: 'text' },
      { name: 'expiry_date', type: 'date', nullable: true },
      { name: 'status', type: "enum(valid,near_expiry,expired)" },
      { name: 'uploaded_by', type: 'uuid', fk: true, note: '→ profiles.id' },
      { name: 'uploaded_at', type: 'timestamptz' },
      { name: 'notes', type: 'text', nullable: true },
    ],
    relations: [
      { table: 'employees', type: 'N:1', via: "entity_type='employee'" },
      { table: 'vehicles', type: 'N:1', via: "entity_type='vehicle'" },
    ],
  },
  {
    id: 'fleet_combinations',
    name: 'fleet_combinations',
    schema: 'Fleet & Assets',
    color: '#8b5cf6',
    gradient: 'from-purple-400 to-violet-600',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'vehicle_id', type: 'uuid', fk: true, note: '→ vehicles.id' },
      { name: 'trailer_id', type: 'uuid', fk: true, nullable: true, note: '→ trailers.id' },
      { name: 'driver_id', type: 'uuid', fk: true, nullable: true, note: '→ employees.id' },
      { name: 'name', type: 'varchar(255)' },
      { name: 'status', type: 'enum(active,inactive)' },
      { name: 'notes', type: 'text', nullable: true },
    ],
    relations: [
      { table: 'vehicles', type: 'N:1' },
      { table: 'trailers', type: 'N:1' },
    ],
  },
  {
    id: 'breakdowns',
    name: 'breakdowns',
    schema: 'Fleet & Assets',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-700',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'vehicle_id', type: 'uuid', fk: true, note: '→ vehicles.id' },
      { name: 'trip_id', type: 'uuid', fk: true, nullable: true, note: '→ trips.id' },
      { name: 'reported_by', type: 'uuid', fk: true, note: '→ profiles.id' },
      { name: 'location', type: 'varchar(255)' },
      { name: 'description', type: 'text' },
      { name: 'status', type: 'enum(open,in_progress,resolved)' },
      { name: 'reported_at', type: 'timestamptz' },
      { name: 'resolved_at', type: 'timestamptz', nullable: true },
    ],
    relations: [
      { table: 'vehicles', type: 'N:1' },
      { table: 'trips', type: 'N:1' },
    ],
  },
  {
    id: 'role_permissions',
    name: 'role_permissions',
    schema: 'Admin',
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-700',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'role', type: 'enum(admin,dispatcher,driver,supervisor)' },
      { name: 'path', type: 'varchar(255)', note: 'App route path e.g. /trips' },
      { name: 'can_access', type: 'boolean' },
      { name: 'can_edit', type: 'boolean' },
      { name: 'can_delete', type: 'boolean' },
    ],
    relations: [
      { table: 'profiles', type: 'N:1', via: 'role → profiles.role' },
    ],
  },
];

// ─── SOP Steps ────────────────────────────────────────────────────────────────
interface SOPStep {
  actor: string;
  action: string;
  system: string;
  result: string;
  critical?: boolean;
}

interface SOPProcess {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  gradient: string;
  description: string;
  steps: SOPStep[];
}

const SOP_PROCESSES: SOPProcess[] = [
  {
    id: 'order-to-trip',
    title: 'Order-to-Trip Dispatch SOP',
    icon: Radio,
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'End-to-end process from client transport request to trip dispatch and resource locking.',
    steps: [
      { actor: 'Dispatcher / Admin', action: 'Create new transport order', system: 'Orders Module → Create New Order form', result: 'Order created with status = pending, auto-generated ORD-XXXXXX number', critical: true },
      { actor: 'Dispatcher', action: 'Navigate to Dispatch Console', system: 'Dispatch Page → Pending Orders list', result: 'All pending orders visible with priority badge' },
      { actor: 'Dispatcher', action: 'Select order and click Dispatch', system: 'Dispatch Modal opens', result: 'Route map and weather forecast load for the order route' },
      { actor: 'Dispatcher', action: 'Select available truck, trailer (optional), driver and schedule time', system: 'Dispatch Modal form', result: 'Fleet combinations auto-populate if a truck+trailer combination exists', critical: true },
      { actor: 'System', action: 'Finalize & Dispatch Trip', system: 'Supabase: creates trip record', result: 'Trip created (status=assigned) · Order → assigned · Vehicle → in_use · Trailer → in_use · Driver → on_trip' },
      { actor: 'Driver', action: 'Views assigned trip in Trips Page', system: 'Trips Page → Driver Cockpit panel', result: 'Trip details, route, and departure instructions visible' },
    ],
  },
  {
    id: 'trip-lifecycle',
    title: 'Trip Lifecycle & Status Progression SOP',
    icon: Navigation,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-600',
    description: 'Step-by-step trip status transitions from Assigned → En Route → Delivered → Completed with all data capture points.',
    steps: [
      { actor: 'Driver', action: 'Enter Start Odometer reading', system: 'Trips Page → Driver Cockpit → Start Odometer field', result: 'Odometer value recorded in trips.start_odometer' },
      { actor: 'Driver', action: 'Click "Start Trip"', system: 'updateTripStatus(assigned → enroute)', result: 'Status = enroute, actual_departure = NOW(), employee.current_lat/lng synced', critical: true },
      { actor: 'Control Tower', action: 'Live map shows vehicle moving', system: 'Control Tower → Live GPS feed', result: 'Driver location auto-syncs every 5 minutes via geolocation API' },
      { actor: 'Driver', action: 'Enter Arrival Odometer + Gross Weight at destination', system: 'Driver Cockpit → Arrival fields', result: 'Arrival data stored locally' },
      { actor: 'Driver', action: 'Click "Report Arrival"', system: 'updateTripStatus(enroute → delivered)', result: 'Status = delivered, arrived_at = NOW(), employee location synced to destination', critical: true },
      { actor: 'Dispatcher', action: 'Upload Bayan document', system: 'Dispatcher Control panel → Upload Bayan button', result: 'bayan_url saved in trips, document linked to Google Drive' },
      { actor: 'Driver', action: 'Enter Final Odometer + Net Weight on return', system: 'Driver Cockpit → Final fields', result: 'Final data stored locally' },
      { actor: 'Driver', action: 'Click "Complete Trip"', system: 'updateTripStatus(delivered → completed)', result: 'Status = completed, actual_arrival = NOW(), financials auto-calculated', critical: true },
      { actor: 'System (Auto)', action: 'Calculate & Save Ledger', system: 'calculateAndSaveLedger() → trip_ledger table', result: 'Distance = (final - start odo), Rate = 0.90 SR/km (≥10T) or 0.60 SR/km, Allowance saved' },
      { actor: 'System (Auto)', action: 'Release Resources', system: 'Supabase batch updates', result: 'Vehicle → available · Driver → available · Order → completed' },
    ],
  },
  {
    id: 'employee-onboarding',
    title: 'Employee Onboarding & Compliance SOP',
    icon: Users,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Complete process for adding employees, capturing compliance documents and face-ID biometric enrollment.',
    steps: [
      { actor: 'Admin', action: 'Create user account in Users module', system: 'Users Page → Create User form', result: 'Supabase Auth user created, profiles record inserted with assigned role' },
      { actor: 'Admin', action: 'Go to Employee Master and add employee profile', system: 'Employee Details Page → Add Employee form', result: 'employees record linked to profile via same UUID, compliance fields populated', critical: true },
      { actor: 'Admin', action: 'Upload compliance documents (Iqama, Passport, Driving License, SEC ID)', system: 'DMS Engine / Document Browser', result: 'documents records created with entity_type=employee, expiry dates stored, status auto-classified' },
      { actor: 'System (Auto)', action: 'Classify document validity', system: 'Document status engine', result: 'status = valid (>30 days) / near_expiry (≤30 days) / expired (<today)' },
      { actor: 'Admin', action: 'Optionally run Gov Lookup for Muqeem data', system: 'Gov Lookup Page → scan Muqeem card', result: 'Biometric data, name, iqama expiry auto-populated from government API response' },
      { actor: 'Admin', action: 'Enroll Face-ID biometric', system: 'Face ID Enroll Page → scan employee face', result: 'face_descriptor (128-vector array) stored in profiles, face_id_enrolled = true', critical: true },
      { actor: 'Admin', action: 'Assign employee to sponsor and site', system: 'Employee Master → sponsor_id, site_id', result: 'Employee linked to sponsor organization and deployment site' },
      { actor: 'Admin / Supervisor', action: 'Monitor compliance on Dashboard', system: 'Dashboard → Validity Donut Charts', result: 'Real-time compliance rate, near-expiry count visible. Red alert when docs expire' },
    ],
  },
  {
    id: 'vehicle-compliance',
    title: 'Vehicle Fleet Compliance SOP',
    icon: Truck,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-700',
    description: 'Adding and maintaining vehicle assets with compliance validity tracking (Registration, Insurance, MVPI, Authorization).',
    steps: [
      { actor: 'Admin / Dispatcher', action: 'Add vehicle via Add Vehicle form or CSV import', system: 'Vehicles Page → Add Vehicle / Import CSV', result: 'vehicles record created with all compliance dates. Batch import via CSV modal supported', critical: true },
      { actor: 'Admin', action: 'Set all validity dates: Reg Expiry, Insurance, Authorization, MVPI', system: 'Vehicle form → Validity & Authorization section', result: 'Expiry dates stored; Dashboard donut charts reflect live counts' },
      { actor: 'System (Auto)', action: 'Expiry badge coloring in vehicle table', system: 'VehiclesPage → expiryBadge() function', result: 'Expired = Red, ≤30 days = Amber, Valid = Green — displayed inline in fleet table' },
      { actor: 'Admin / Dispatcher', action: 'Upload vehicle documents (Insurance certificate, MVPI report)', system: 'Vehicle detail panel → DocumentBrowser', result: 'documents records created with entity_type=vehicle' },
      { actor: 'Admin', action: 'Create Fleet Combinations for regular pairings', system: 'Fleet Combinations Page', result: 'Truck + Trailer + Driver pre-configured; auto-populated in Dispatch Modal' },
      { actor: 'System (Auto)', action: 'Track breakdown events', system: 'Breakdowns Page', result: 'Breakdown reported → vehicle status = maintenance → resolved → status = available' },
    ],
  },
  {
    id: 'dms-ai',
    title: 'AI DMS Document Intelligence SOP',
    icon: Sparkles,
    color: '#a855f7',
    gradient: 'from-purple-500 to-fuchsia-600',
    description: 'AI-powered document upload, OCR extraction, semantic indexing and archiving workflow.',
    steps: [
      { actor: 'Any User', action: 'Upload document via AI DMS Upload page', system: 'Upload Document Page → drag-and-drop or file picker', result: 'File uploaded to Supabase Storage, record created in AI documents registry' },
      { actor: 'System (AI)', action: 'OCR text extraction runs automatically', system: 'AI extraction pipeline', result: 'extracted_text field populated; document becomes searchable', critical: true },
      { actor: 'System (AI)', action: 'AI classifies document, generates tags and summary', system: 'AI classification service', result: 'ai_summary and tags[]  stored; document categorized by type' },
      { actor: 'Any User', action: 'Search documents via Relational Search', system: 'Relational Search Page → full-text search', result: 'Cross-entity search across employees, vehicles, documents, sites in single query' },
      { actor: 'Any User', action: 'Use Sample Extractor for compliance data', system: 'Sample Extractor → Extract Samples button', result: 'Structured compliance fields extracted with confidence scores; reviewed and approved' },
      { actor: 'Admin', action: 'Archive expired or superseded documents', system: 'Archived Documents Page', result: 'Document status = archived, removed from active registry, preserved in history' },
    ],
  },
  {
    id: 'permissions',
    title: 'Role & Permission Management SOP',
    icon: Lock,
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-800',
    description: 'Admin-controlled role-based access control (RBAC) for all system routes and capabilities.',
    steps: [
      { actor: 'Admin', action: 'Go to Admin → Permissions page', system: 'Permissions Page → Role Permission Matrix', result: 'Grid showing all roles vs. all route paths' },
      { actor: 'Admin', action: 'Toggle can_access / can_edit / can_delete per role+path', system: 'role_permissions table update', result: 'Permission saved immediately; next login reflects new access', critical: true },
      { actor: 'System (Auto)', action: 'AuthGuard checks on each route navigation', system: 'App.tsx → AuthGuard component → permissions[] array', result: 'If profile.role !== admin AND path not in permissions → Access Denied screen shown' },
      { actor: 'Admin', action: 'Enroll Face-ID for security-sensitive users', system: 'Face ID Enroll Page → camera capture', result: '128-D face descriptor stored in profiles, used for biometric login verification' },
      { actor: 'Admin', action: 'Toggle MacOS Mode for presentation', system: 'TopNav → MacOS Mode button', result: 'UI switches to macOS-style layout with dock navigation and blurred wallpaper' },
      { actor: 'System', action: 'JWT token validated on every Supabase request', system: 'Supabase RLS (Row Level Security)', result: 'Even if UI bypassed, DB enforces auth at data layer', critical: true },
    ],
  },
];

// ─── Components ───────────────────────────────────────────────────────────────
const ERDTableCard = ({ table, expanded, onToggle }: { table: ERDTable; expanded: boolean; onToggle: () => void }) => (
  <div className={cn(
    "bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-300",
    expanded ? "border-slate-300 shadow-md" : "border-slate-100 hover:border-slate-200"
  )}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-left"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full`} style={{ background: table.color }} />
        <div>
          <span className="font-black text-slate-800 text-sm font-mono">{table.name}</span>
          <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{table.schema}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-bold">{table.columns.length} cols</span>
        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </div>
    </button>

    {expanded && (
      <div className="border-t border-slate-50">
        {/* Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 py-1.5 text-slate-400 font-black uppercase tracking-widest">Column</th>
                <th className="text-left px-3 py-1.5 text-slate-400 font-black uppercase tracking-widest">Type</th>
                <th className="text-left px-3 py-1.5 text-slate-400 font-black uppercase tracking-widest">Flags</th>
                <th className="text-left px-3 py-1.5 text-slate-400 font-black uppercase tracking-widest">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.columns.map((col, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-1.5 font-mono font-bold text-slate-700">{col.name}</td>
                  <td className="px-3 py-1.5 font-mono text-slate-400">{col.type}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex gap-1">
                      {col.pk && <span className="px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-black">PK</span>}
                      {col.fk && <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-black">FK</span>}
                      {col.unique && <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[8px] font-black">UQ</span>}
                      {col.nullable && <span className="px-1 py-0.5 bg-slate-100 text-slate-400 rounded text-[8px] font-black">NULL</span>}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-slate-400 italic">{col.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Relations */}
        {table.relations.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Relationships</p>
            <div className="flex flex-wrap gap-1.5">
              {table.relations.map((rel, i) => (
                <div key={i} className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg px-2 py-1 text-[9px] shadow-sm">
                  <span className="font-black text-slate-600">{table.name}</span>
                  <ArrowRight size={8} className="text-slate-300" />
                  <span className="font-bold" style={{ color: table.color }}>{rel.type}</span>
                  <ArrowRight size={8} className="text-slate-300" />
                  <span className="font-black text-slate-600">{rel.table}</span>
                  {rel.via && <span className="text-slate-300 italic ml-1">({rel.via})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

const SOPStepRow = ({ step, index }: { step: SOPStep; index: number }) => (
  <div className={cn(
    "flex gap-3 p-3 rounded-xl border transition-colors",
    step.critical ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-100"
  )}>
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5",
      step.critical ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
    )}>
      {index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{step.actor}</span>
        {step.critical && <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-0.5"><AlertTriangle size={8} /> Critical Step</span>}
      </div>
      <p className="text-xs font-bold text-slate-800">{step.action}</p>
      <p className="text-[10px] text-blue-600 font-bold mt-0.5 flex items-center gap-1"><Activity size={9} /> {step.system}</p>
      <p className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1"><CheckCircle2 size={9} /> {step.result}</p>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'actors' | 'erd' | 'sop';

export default function ERDPage() {
  const [activeTab, setActiveTab] = useState<Tab>('actors');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['profiles', 'trips', 'orders']));
  const [expandedSOP, setExpandedSOP] = useState<string>('order-to-trip');
  const [schemaFilter, setSchemaFilter] = useState('All');

  const schemas = ['All', ...Array.from(new Set(ERD_TABLES.map(t => t.schema)))];
  const filteredTables = schemaFilter === 'All' ? ERD_TABLES : ERD_TABLES.filter(t => t.schema === schemaFilter);

  const toggleTable = (id: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'actors', label: 'Actors & Use Cases', icon: Users },
    { id: 'erd', label: 'Full ERD', icon: Database },
    { id: 'sop', label: 'App SOP', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Network size={20} className="text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">ERD, Actors & App SOP</h1>
            </div>
            <p className="text-slate-500 text-sm">Complete data model · actor roles · standard operating procedures</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* ── ACTORS TAB ── */}
        {activeTab === 'actors' && (
          <div className="p-6 space-y-6">
            {/* System boundary header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h2 className="font-black text-lg">TMS Pro — System Boundary</h2>
                  <p className="text-slate-400 text-xs">4 actor roles interact with the system through permission-controlled routes</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Total Routes', value: '30+', color: '#3b82f6' },
                  { label: 'Actor Roles', value: '4', color: '#10b981' },
                  { label: 'DB Tables', value: '13+', color: '#8b5cf6' },
                  { label: 'Auth Layer', value: 'Supabase RLS', color: '#f59e0b' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ACTORS.map(actor => {
                const Icon = actor.icon;
                return (
                  <div key={actor.id} className={cn("bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all", actor.border)}>
                    {/* Actor Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", actor.bg)}>
                        <Icon size={22} className={actor.color} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-sm">{actor.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                          Role: <span className={cn("font-black", actor.color)}>{actor.id}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{actor.description}</p>

                    {/* Use Cases */}
                    <div className="mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Use Cases / Responsibilities</p>
                      <div className="space-y-1">
                        {actor.responsibilities.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 size={10} className={cn("shrink-0 mt-0.5", actor.color)} />
                            <span className="text-[10px] text-slate-600">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accessible Modules */}
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Module Access</p>
                      <div className="flex flex-wrap gap-1">
                        {actor.canAccess.map((m, i) => (
                          <span key={i} className={cn("text-[9px] font-black px-2 py-0.5 rounded-full", actor.bg, actor.color)}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interaction Matrix */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <Network size={16} className="text-blue-600" />
                  Actor × Feature Interaction Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">What each actor can do in each system area</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 font-black text-slate-500 uppercase tracking-widest">Feature Area</th>
                      {[
                        { id: 'admin', label: 'Admin', color: '#ef4444' },
                        { id: 'dispatcher', label: 'Dispatcher', color: '#3b82f6' },
                        { id: 'driver', label: 'Driver', color: '#f97316' },
                        { id: 'supervisor', label: 'Supervisor', color: '#10b981' },
                      ].map(r => (
                        <th key={r.id} className="text-center px-4 py-2.5 font-black text-slate-500 uppercase tracking-widest">
                          <span style={{ color: r.color }}>{r.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { area: 'Dashboard', admin: 'Full', dispatcher: 'Full', driver: 'Own stats', supervisor: 'Site stats' },
                      { area: 'Orders Management', admin: 'CRUD', dispatcher: 'CRUD', driver: '—', supervisor: 'View' },
                      { area: 'Dispatch Console', admin: 'Full', dispatcher: 'Full', driver: '—', supervisor: '—' },
                      { area: 'Trips — Driver Cockpit', admin: 'Full', dispatcher: 'Monitor', driver: 'Status update', supervisor: 'View' },
                      { area: 'Control Tower (Live Map)', admin: 'Full', dispatcher: 'Full', driver: '—', supervisor: 'View' },
                      { area: 'Vehicles & Trailers', admin: 'CRUD', dispatcher: 'View + status', driver: '—', supervisor: 'View' },
                      { area: 'Fleet Combinations', admin: 'CRUD', dispatcher: 'View', driver: '—', supervisor: '—' },
                      { area: 'Breakdowns', admin: 'CRUD', dispatcher: 'CRUD', driver: 'Report', supervisor: 'View' },
                      { area: 'Employee Master', admin: 'CRUD', dispatcher: 'View', driver: 'Own profile', supervisor: 'View site' },
                      { area: 'Drivers', admin: 'CRUD', dispatcher: 'View', driver: '—', supervisor: '—' },
                      { area: 'Labor & Mobilization', admin: 'CRUD', dispatcher: 'View', driver: '—', supervisor: 'CRUD' },
                      { area: 'Sponsors', admin: 'CRUD', dispatcher: 'View', driver: '—', supervisor: 'View' },
                      { area: 'DMS / Documents', admin: 'Full', dispatcher: 'Upload', driver: 'Upload POD', supervisor: 'View' },
                      { area: 'Sites', admin: 'CRUD', dispatcher: 'View', driver: '—', supervisor: 'Manage own' },
                      { area: 'Gov Lookup', admin: 'Full', dispatcher: 'View', driver: '—', supervisor: '—' },
                      { area: 'AI DMS', admin: 'Full', dispatcher: 'Use', driver: '—', supervisor: 'View' },
                      { area: 'Trip Allowances', admin: 'Full', dispatcher: 'View', driver: 'View own', supervisor: 'View' },
                      { area: 'Users & Permissions', admin: 'Full', dispatcher: '—', driver: '—', supervisor: '—' },
                      { area: 'Settings', admin: 'Full', dispatcher: 'Own prefs', driver: 'Own prefs', supervisor: 'Own prefs' },
                      { area: 'Face ID Enroll', admin: 'Full', dispatcher: '—', driver: '—', supervisor: '—' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 font-bold text-slate-700">{row.area}</td>
                        {[row.admin, row.dispatcher, row.driver, row.supervisor].map((val, j) => (
                          <td key={j} className="px-4 py-2 text-center">
                            {val === '—' ? (
                              <span className="text-slate-200 font-black">—</span>
                            ) : (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full font-black",
                                val === 'Full' || val === 'CRUD' ? 'bg-emerald-50 text-emerald-600' :
                                val.includes('View') ? 'bg-blue-50 text-blue-600' :
                                'bg-amber-50 text-amber-600'
                              )}>{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ERD TAB ── */}
        {activeTab === 'erd' && (
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filter by Schema:</span>
              {schemas.map(s => (
                <button
                  key={s}
                  onClick={() => setSchemaFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    schemaFilter === s
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => setExpandedTables(new Set(filteredTables.map(t => t.id)))}
                className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ChevronDown size={12} /> Expand All
              </button>
              <button
                onClick={() => setExpandedTables(new Set())}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <ChevronUp size={12} /> Collapse All
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
              {[
                { label: 'PK — Primary Key', color: 'bg-amber-100 text-amber-700' },
                { label: 'FK — Foreign Key', color: 'bg-blue-100 text-blue-700' },
                { label: 'UQ — Unique Constraint', color: 'bg-purple-100 text-purple-700' },
                { label: 'NULL — Nullable Field', color: 'bg-slate-100 text-slate-500' },
              ].map(l => (
                <span key={l.label} className={cn("text-[9px] font-black px-2 py-1 rounded", l.color)}>{l.label}</span>
              ))}
            </div>

            {/* Schema group headers + tables */}
            {schemas.filter(s => s !== 'All').filter(s => schemaFilter === 'All' || s === schemaFilter).map(schema => (
              <div key={schema}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{schema}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {filteredTables.filter(t => t.schema === schema).map(table => (
                    <ERDTableCard
                      key={table.id}
                      table={table}
                      expanded={expandedTables.has(table.id)}
                      onToggle={() => toggleTable(table.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SOP TAB ── */}
        {activeTab === 'sop' && (
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-5 text-white">
              <h2 className="font-black text-lg mb-1">Standard Operating Procedures</h2>
              <p className="text-slate-400 text-xs">Step-by-step operational processes with actor responsibilities and system actions. Critical steps marked in amber.</p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-400"><AlertTriangle size={12} /> Critical Step</div>
                <div className="flex items-center gap-1.5 text-xs text-blue-300"><Activity size={12} /> System Action</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300"><CheckCircle2 size={12} /> Expected Result</div>
              </div>
            </div>

            {SOP_PROCESSES.map(proc => {
              const Icon = proc.icon;
              const isOpen = expandedSOP === proc.id;
              return (
                <div key={proc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedSOP(isOpen ? '' : proc.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${proc.gradient}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-sm">{proc.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{proc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400">{proc.steps.length} steps</span>
                      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 p-5 space-y-2">
                      {proc.steps.map((step, i) => (
                        <SOPStepRow key={i} step={step} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* SOP Summary Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  SOP Quick Reference Summary
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 font-black text-slate-400 uppercase tracking-widest">SOP Process</th>
                      <th className="text-left px-4 py-2.5 font-black text-slate-400 uppercase tracking-widest">Primary Actor</th>
                      <th className="text-left px-4 py-2.5 font-black text-slate-400 uppercase tracking-widest">Trigger</th>
                      <th className="text-left px-4 py-2.5 font-black text-slate-400 uppercase tracking-widest">End State</th>
                      <th className="text-left px-4 py-2.5 font-black text-slate-400 uppercase tracking-widest">Steps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { proc: 'Order-to-Trip Dispatch', actor: 'Dispatcher', trigger: 'Client transport request', end: 'Trip created, resources locked', steps: 6 },
                      { proc: 'Trip Lifecycle', actor: 'Driver + Dispatcher', trigger: 'Trip assigned to driver', end: 'Trip completed, ledger calculated, resources released', steps: 10 },
                      { proc: 'Employee Onboarding', actor: 'Admin', trigger: 'New hire joining', end: 'User active, docs uploaded, face enrolled', steps: 8 },
                      { proc: 'Vehicle Fleet Compliance', actor: 'Admin / Dispatcher', trigger: 'New vehicle acquisition', end: 'Vehicle in fleet with all compliance dates tracked', steps: 6 },
                      { proc: 'AI DMS Document Intelligence', actor: 'Any User', trigger: 'Document received / needed', end: 'Document indexed, searchable, archived', steps: 6 },
                      { proc: 'Role & Permission Management', actor: 'Admin', trigger: 'User role change or new user', end: 'Permissions active, access enforced at DB + UI level', steps: 6 },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-slate-800">{row.proc}</td>
                        <td className="px-4 py-2.5 text-blue-600 font-bold">{row.actor}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.trigger}</td>
                        <td className="px-4 py-2.5 text-emerald-600 font-medium">{row.end}</td>
                        <td className="px-4 py-2.5">
                          <span className="bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-full text-[10px]">{row.steps}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
