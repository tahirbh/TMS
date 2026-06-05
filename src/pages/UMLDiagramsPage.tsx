import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Download,
  LayoutDashboard,
  Package,
  Radio,
  Navigation,
  MapPin as MapPinIcon,
  Truck,
  Container,
  Wrench,
  Settings,
  Users,
  UserPlus,
  UserCheck,
  Shield,
  FileText,
  Search,
  Map as MapIcon,
  Upload,
  Archive,
  Sparkles,
  CircleDollarSign,
  BookOpen,
  HelpCircle,
  Info,
  Bell,
  AlertTriangle,
  Scan,
  Database,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';

// ─── Utility ───────────────────────────────────────────────────────────────
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

// ─── UML Data ────────────────────────────────────────────────────────────────
interface UMLField {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  nullable?: boolean;
}

interface UMLEntity {
  id: string;
  title: string;
  color: string;
  gradient: string;
  fields: UMLField[];
  x?: number;
  y?: number;
}

interface UMLRelation {
  from: string;
  to: string;
  label: string;
  type: 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';
}

interface UMLWorkflow {
  steps: { id: string; label: string; sublabel?: string; color: string }[];
  arrows: { from: string; to: string; label?: string }[];
}

interface DiagramSlide {
  id: string;
  menuGroup: string;
  menuIcon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  entities: UMLEntity[];
  relations: UMLRelation[];
  workflow?: UMLWorkflow;
  description: string;
}

const DIAGRAMS: DiagramSlide[] = [
  // ── 1. Operations ──────────────────────────────────────────────────────────
  {
    id: 'operations',
    menuGroup: 'Operations',
    menuIcon: LayoutDashboard,
    title: 'Operations Module',
    subtitle: 'Dashboard · Control Tower · Orders · Dispatch · Trips',
    color: '#3b82f6',
    gradient: 'from-blue-600 to-indigo-600',
    description:
      'Core operational flow: Orders are raised, dispatched to trips, assigned to vehicles & drivers, tracked through the control tower and completed.',
    entities: [
      {
        id: 'orders',
        title: 'Orders',
        color: '#3b82f6',
        gradient: 'from-blue-500 to-blue-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'order_number', type: 'varchar' },
          { name: 'client_name', type: 'varchar' },
          { name: 'origin_site_id', type: 'uuid', fk: true },
          { name: 'destination_site_id', type: 'uuid', fk: true },
          { name: 'cargo_type', type: 'varchar' },
          { name: 'weight_tons', type: 'decimal' },
          { name: 'status', type: 'enum' },
          { name: 'created_at', type: 'timestamp' },
        ],
      },
      {
        id: 'trips',
        title: 'Trips',
        color: '#6366f1',
        gradient: 'from-indigo-500 to-violet-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'trip_number', type: 'varchar' },
          { name: 'order_id', type: 'uuid', fk: true },
          { name: 'vehicle_id', type: 'uuid', fk: true },
          { name: 'driver_id', type: 'uuid', fk: true },
          { name: 'trailer_id', type: 'uuid', fk: true, nullable: true },
          { name: 'origin_name', type: 'varchar' },
          { name: 'destination_name', type: 'varchar' },
          { name: 'origin_lat / lng', type: 'decimal' },
          { name: 'destination_lat / lng', type: 'decimal' },
          { name: 'route_distance_km', type: 'decimal' },
          { name: 'status', type: 'enum' },
          { name: 'scheduled_departure', type: 'timestamp' },
          { name: 'actual_departure', type: 'timestamp', nullable: true },
          { name: 'actual_arrival', type: 'timestamp', nullable: true },
          { name: 'start_odometer', type: 'decimal', nullable: true },
          { name: 'final_odometer', type: 'decimal', nullable: true },
          { name: 'gross_weight', type: 'decimal', nullable: true },
          { name: 'net_weight', type: 'decimal', nullable: true },
          { name: 'bayan_url', type: 'text', nullable: true },
          { name: 'manifest_url', type: 'text', nullable: true },
          { name: 'proof_of_delivery_url', type: 'text', nullable: true },
        ],
      },
      {
        id: 'sites',
        title: 'Sites',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'name', type: 'varchar' },
          { name: 'type', type: 'varchar' },
          { name: 'latitude', type: 'decimal' },
          { name: 'longitude', type: 'decimal' },
          { name: 'address', type: 'text', nullable: true },
        ],
      },
      {
        id: 'trip_ledger',
        title: 'Trip Ledger',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'trip_id', type: 'uuid', fk: true },
          { name: 'distance_km', type: 'decimal' },
          { name: 'cost_per_km', type: 'decimal' },
          { name: 'total_cost_sr', type: 'decimal' },
          { name: 'allowance_sr', type: 'decimal' },
          { name: 'calculated_at', type: 'timestamp' },
        ],
      },
    ],
    relations: [
      { from: 'orders', to: 'trips', label: '1 : N', type: 'one-to-many' },
      { from: 'orders', to: 'sites', label: 'origin', type: 'many-to-one' },
      { from: 'orders', to: 'sites', label: 'destination', type: 'many-to-one' },
      { from: 'trips', to: 'trip_ledger', label: '1 : 1', type: 'one-to-one' },
    ],
    workflow: {
      steps: [
        { id: 'order', label: 'Order Created', sublabel: 'Client Request', color: '#3b82f6' },
        { id: 'dispatch', label: 'Dispatch', sublabel: 'Assign Vehicle & Driver', color: '#6366f1' },
        { id: 'enroute', label: 'En Route', sublabel: 'Trip Started', color: '#f59e0b' },
        { id: 'arrived', label: 'Arrived', sublabel: 'Site Reached', color: '#8b5cf6' },
        { id: 'completed', label: 'Completed', sublabel: 'Ledger Calculated', color: '#10b981' },
      ],
      arrows: [
        { from: 'order', to: 'dispatch' },
        { from: 'dispatch', to: 'enroute' },
        { from: 'enroute', to: 'arrived' },
        { from: 'arrived', to: 'completed' },
      ],
    },
  },

  // ── 2. Fleet & Assets ──────────────────────────────────────────────────────
  {
    id: 'fleet',
    menuGroup: 'Fleet & Assets',
    menuIcon: Truck,
    title: 'Fleet & Assets Module',
    subtitle: 'Vehicles · Trailers · Fleet Combinations · Breakdowns',
    color: '#8b5cf6',
    gradient: 'from-violet-600 to-purple-700',
    description:
      'Manages the full lifecycle of tractors, trailers, combined fleet units and breakdown incidents with compliance validity tracking.',
    entities: [
      {
        id: 'vehicles',
        title: 'Vehicles',
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'registration_number', type: 'varchar' },
          { name: 'make', type: 'varchar' },
          { name: 'model', type: 'varchar' },
          { name: 'year', type: 'integer' },
          { name: 'type', type: 'enum' },
          { name: 'capacity_tons', type: 'decimal' },
          { name: 'color', type: 'varchar', nullable: true },
          { name: 'owner_name', type: 'varchar', nullable: true },
          { name: 'sequence_number', type: 'varchar', nullable: true },
          { name: 'authorized_driver', type: 'varchar', nullable: true },
          { name: 'status', type: 'enum' },
          { name: 'registration_expiry', type: 'date', nullable: true },
          { name: 'insurance_expiry', type: 'date', nullable: true },
          { name: 'authorization_expiry', type: 'date', nullable: true },
          { name: 'mvpi_expiry', type: 'date', nullable: true },
          { name: 'last_service_date', type: 'date', nullable: true },
          { name: 'next_service_date', type: 'date', nullable: true },
          { name: 'current_lat / lng', type: 'decimal', nullable: true },
          { name: 'notes', type: 'text', nullable: true },
        ],
      },
      {
        id: 'trailers',
        title: 'Trailers',
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'plate_number', type: 'varchar' },
          { name: 'type', type: 'varchar' },
          { name: 'capacity_tons', type: 'decimal' },
          { name: 'status', type: 'enum' },
          { name: 'insurance_expiry', type: 'date', nullable: true },
          { name: 'registration_expiry', type: 'date', nullable: true },
          { name: 'notes', type: 'text', nullable: true },
        ],
      },
      {
        id: 'fleet_combinations',
        title: 'Fleet Combinations',
        color: '#0ea5e9',
        gradient: 'from-sky-500 to-cyan-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'vehicle_id', type: 'uuid', fk: true },
          { name: 'trailer_id', type: 'uuid', fk: true },
          { name: 'name', type: 'varchar' },
          { name: 'status', type: 'enum' },
          { name: 'notes', type: 'text', nullable: true },
        ],
      },
      {
        id: 'breakdowns',
        title: 'Breakdowns',
        color: '#ef4444',
        gradient: 'from-red-500 to-rose-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'vehicle_id', type: 'uuid', fk: true },
          { name: 'trip_id', type: 'uuid', fk: true, nullable: true },
          { name: 'reported_by', type: 'uuid', fk: true },
          { name: 'location', type: 'varchar' },
          { name: 'description', type: 'text' },
          { name: 'status', type: 'enum' },
          { name: 'reported_at', type: 'timestamp' },
          { name: 'resolved_at', type: 'timestamp', nullable: true },
        ],
      },
    ],
    relations: [
      { from: 'fleet_combinations', to: 'vehicles', label: 'uses', type: 'many-to-one' },
      { from: 'fleet_combinations', to: 'trailers', label: 'uses', type: 'many-to-one' },
      { from: 'breakdowns', to: 'vehicles', label: 'reported on', type: 'many-to-one' },
    ],
    workflow: {
      steps: [
        { id: 'available', label: 'Available', sublabel: 'Ready for assignment', color: '#10b981' },
        { id: 'assigned', label: 'Assigned', sublabel: 'Linked to Trip', color: '#3b82f6' },
        { id: 'in_use', label: 'In Use', sublabel: 'Active Trip', color: '#f59e0b' },
        { id: 'breakdown', label: 'Breakdown', sublabel: 'Incident Filed', color: '#ef4444' },
        { id: 'maintenance', label: 'Maintenance', sublabel: 'Being Serviced', color: '#8b5cf6' },
      ],
      arrows: [
        { from: 'available', to: 'assigned' },
        { from: 'assigned', to: 'in_use' },
        { from: 'in_use', to: 'breakdown', label: 'incident' },
        { from: 'in_use', to: 'available', label: 'complete' },
        { from: 'breakdown', to: 'maintenance' },
        { from: 'maintenance', to: 'available' },
      ],
    },
  },

  // ── 3. Workforce ───────────────────────────────────────────────────────────
  {
    id: 'workforce',
    menuGroup: 'Workforce',
    menuIcon: Users,
    title: 'Workforce Module',
    subtitle: 'Employee Master · Drivers · Labor · Mobilization · Supervisors · Sponsors',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    description:
      'Complete workforce management — employees, drivers, labour contracts, mobilization planning, supervisor hierarchy and sponsor relationships.',
    entities: [
      {
        id: 'employees',
        title: 'Employees (profiles)',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'full_name', type: 'varchar' },
          { name: 'role', type: 'enum' },
          { name: 'sponsor_id', type: 'uuid', fk: true, nullable: true },
          { name: 'site_id', type: 'uuid', fk: true, nullable: true },
          { name: 'supervisor_id', type: 'uuid', fk: true, nullable: true },
          { name: 'iqama_number', type: 'varchar', nullable: true },
          { name: 'iqama_expiry', type: 'date', nullable: true },
          { name: 'passport_number', type: 'varchar', nullable: true },
          { name: 'passport_expiry', type: 'date', nullable: true },
          { name: 'driving_license_expiry', type: 'date', nullable: true },
          { name: 'status', type: 'enum' },
          { name: 'current_lat / lng', type: 'decimal', nullable: true },
          { name: 'last_location_update', type: 'timestamp', nullable: true },
        ],
      },
      {
        id: 'sponsors',
        title: 'Sponsors',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-yellow-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'name', type: 'varchar' },
          { name: 'contact_person', type: 'varchar', nullable: true },
          { name: 'phone', type: 'varchar', nullable: true },
          { name: 'email', type: 'varchar', nullable: true },
          { name: 'cr_number', type: 'varchar', nullable: true },
          { name: 'address', type: 'text', nullable: true },
        ],
      },
      {
        id: 'mobilization',
        title: 'Mobilization',
        color: '#6366f1',
        gradient: 'from-indigo-500 to-violet-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'employee_id', type: 'uuid', fk: true },
          { name: 'from_site_id', type: 'uuid', fk: true },
          { name: 'to_site_id', type: 'uuid', fk: true },
          { name: 'mobilization_date', type: 'date' },
          { name: 'status', type: 'enum' },
          { name: 'notes', type: 'text', nullable: true },
        ],
      },
    ],
    relations: [
      { from: 'employees', to: 'sponsors', label: 'sponsored by', type: 'many-to-one' },
      { from: 'employees', to: 'employees', label: 'supervisor', type: 'many-to-one' },
      { from: 'mobilization', to: 'employees', label: 'moves', type: 'many-to-one' },
    ],
    workflow: {
      steps: [
        { id: 'enrolled', label: 'Enrolled', sublabel: 'Employee Added', color: '#10b981' },
        { id: 'assigned_site', label: 'Site Assigned', sublabel: 'Initial Deployment', color: '#3b82f6' },
        { id: 'mobilized', label: 'Mobilized', sublabel: 'Transfer Request', color: '#8b5cf6' },
        { id: 'active', label: 'Active', sublabel: 'On-Site', color: '#f59e0b' },
        { id: 'offboarded', label: 'Offboarded', sublabel: 'Contract End', color: '#ef4444' },
      ],
      arrows: [
        { from: 'enrolled', to: 'assigned_site' },
        { from: 'assigned_site', to: 'active' },
        { from: 'active', to: 'mobilized', label: 'transfer' },
        { from: 'mobilized', to: 'active' },
        { from: 'active', to: 'offboarded' },
      ],
    },
  },

  // ── 4. Logistics & DMS ─────────────────────────────────────────────────────
  {
    id: 'logistics',
    menuGroup: 'Logistics & DMS',
    menuIcon: FileText,
    title: 'Logistics & DMS Module',
    subtitle: 'DMS Engine · Relational Search · Sites · Gov Data Lookup',
    color: '#0ea5e9',
    gradient: 'from-sky-500 to-cyan-600',
    description:
      'Document management, site master data, government data API integration and cross-entity relational search engine.',
    entities: [
      {
        id: 'documents',
        title: 'Documents',
        color: '#0ea5e9',
        gradient: 'from-sky-500 to-cyan-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'entity_type', type: 'enum' },
          { name: 'entity_id', type: 'uuid', fk: true },
          { name: 'type', type: 'varchar' },
          { name: 'file_url', type: 'text' },
          { name: 'expiry_date', type: 'date', nullable: true },
          { name: 'status', type: 'enum' },
          { name: 'uploaded_at', type: 'timestamp' },
          { name: 'notes', type: 'text', nullable: true },
        ],
      },
      {
        id: 'sites_entity',
        title: 'Sites',
        color: '#10b981',
        gradient: 'from-emerald-500 to-teal-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'name', type: 'varchar' },
          { name: 'type', type: 'varchar' },
          { name: 'latitude', type: 'decimal' },
          { name: 'longitude', type: 'decimal' },
          { name: 'region', type: 'varchar', nullable: true },
          { name: 'address', type: 'text', nullable: true },
          { name: 'contact_person', type: 'varchar', nullable: true },
          { name: 'is_active', type: 'boolean' },
        ],
      },
      {
        id: 'gov_lookup',
        title: 'Gov Lookup (API)',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-600',
        fields: [
          { name: 'muqeem_id (input)', type: 'varchar' },
          { name: 'full_name (response)', type: 'varchar' },
          { name: 'nationality (response)', type: 'varchar' },
          { name: 'iqama_expiry (response)', type: 'date' },
          { name: 'passport_number (response)', type: 'varchar' },
          { name: 'occupation (response)', type: 'varchar' },
        ],
      },
    ],
    relations: [
      { from: 'documents', to: 'documents', label: 'entity_type → employees/vehicles', type: 'one-to-many' },
    ],
    workflow: {
      steps: [
        { id: 'upload', label: 'Doc Upload', sublabel: 'File Attached', color: '#0ea5e9' },
        { id: 'classify', label: 'Classify', sublabel: 'Type & Entity', color: '#3b82f6' },
        { id: 'validate', label: 'Validate', sublabel: 'Expiry Checked', color: '#10b981' },
        { id: 'alert', label: 'Alert', sublabel: 'Near-Expiry Notice', color: '#f59e0b' },
        { id: 'expired', label: 'Expired', sublabel: 'Action Required', color: '#ef4444' },
      ],
      arrows: [
        { from: 'upload', to: 'classify' },
        { from: 'classify', to: 'validate' },
        { from: 'validate', to: 'alert', label: '≤30 days' },
        { from: 'alert', to: 'expired', label: 'no action' },
      ],
    },
  },

  // ── 5. AI DMS ──────────────────────────────────────────────────────────────
  {
    id: 'ai-dms',
    menuGroup: 'AI DMS',
    menuIcon: Sparkles,
    title: 'AI DMS Module',
    subtitle: 'Dashboard · Upload · Documents Registry · Archived · Sample Extractor',
    color: '#a855f7',
    gradient: 'from-purple-500 to-fuchsia-600',
    description:
      'AI-powered document intelligence: smart upload pipeline, OCR extraction, semantic search, archiving workflow and compliance sample extraction.',
    entities: [
      {
        id: 'ai_documents',
        title: 'AI Documents Registry',
        color: '#a855f7',
        gradient: 'from-purple-500 to-fuchsia-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'title', type: 'varchar' },
          { name: 'file_url', type: 'text' },
          { name: 'file_type', type: 'enum' },
          { name: 'size_bytes', type: 'integer' },
          { name: 'extracted_text', type: 'text', nullable: true },
          { name: 'ai_summary', type: 'text', nullable: true },
          { name: 'tags', type: 'jsonb', nullable: true },
          { name: 'status', type: 'enum' },
          { name: 'uploaded_by', type: 'uuid', fk: true },
          { name: 'uploaded_at', type: 'timestamp' },
          { name: 'archived_at', type: 'timestamp', nullable: true },
        ],
      },
      {
        id: 'sample_results',
        title: 'Sample Extractor Results',
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'document_id', type: 'uuid', fk: true },
          { name: 'extracted_fields', type: 'jsonb' },
          { name: 'confidence_score', type: 'decimal' },
          { name: 'reviewed', type: 'boolean' },
          { name: 'extracted_at', type: 'timestamp' },
        ],
      },
    ],
    relations: [
      { from: 'sample_results', to: 'ai_documents', label: 'extracted from', type: 'many-to-one' },
    ],
    workflow: {
      steps: [
        { id: 'upload_ai', label: 'Upload', sublabel: 'File Ingested', color: '#a855f7' },
        { id: 'ocr', label: 'OCR / Parse', sublabel: 'Text Extracted', color: '#3b82f6' },
        { id: 'ai_classify', label: 'AI Classify', sublabel: 'Tags & Summary', color: '#ec4899' },
        { id: 'registry', label: 'Registry', sublabel: 'Indexed & Searchable', color: '#10b981' },
        { id: 'archive', label: 'Archive', sublabel: 'Retired / Expired', color: '#94a3b8' },
      ],
      arrows: [
        { from: 'upload_ai', to: 'ocr' },
        { from: 'ocr', to: 'ai_classify' },
        { from: 'ai_classify', to: 'registry' },
        { from: 'registry', to: 'archive', label: 'retire' },
      ],
    },
  },

  // ── 6. Financials ─────────────────────────────────────────────────────────
  {
    id: 'financials',
    menuGroup: 'Financials',
    menuIcon: CircleDollarSign,
    title: 'Financials Module',
    subtitle: 'Trip Allowances · Ledger · Cost Calculation',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    description:
      'Financial tracking for trip-based allowances and cost calculations. Rates applied per km based on vehicle capacity; ledger auto-generated on trip completion.',
    entities: [
      {
        id: 'trip_ledger_fin',
        title: 'Trip Ledger',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'trip_id', type: 'uuid', fk: true },
          { name: 'distance_km', type: 'decimal' },
          { name: 'cost_per_km', type: 'decimal' },
          { name: 'total_cost_sr', type: 'decimal' },
          { name: 'allowance_sr', type: 'decimal' },
          { name: 'calculated_at', type: 'timestamp' },
        ],
      },
      {
        id: 'trip_allowances',
        title: 'Trip Allowances Config',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'vehicle_class', type: 'enum' },
          { name: 'rate_per_km', type: 'decimal' },
          { name: 'min_capacity_tons', type: 'decimal' },
          { name: 'effective_from', type: 'date' },
          { name: 'effective_to', type: 'date', nullable: true },
          { name: 'notes', type: 'text', nullable: true },
        ],
      },
      {
        id: 'trips_fin',
        title: 'Trips (Financial View)',
        color: '#6366f1',
        gradient: 'from-indigo-500 to-violet-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'trip_number', type: 'varchar' },
          { name: 'vehicle_id', type: 'uuid', fk: true },
          { name: 'driver_id', type: 'uuid', fk: true },
          { name: 'route_distance_km', type: 'decimal' },
          { name: 'actual_distance_km', type: 'decimal', nullable: true },
          { name: 'net_weight', type: 'decimal', nullable: true },
          { name: 'status', type: 'enum' },
        ],
      },
    ],
    relations: [
      { from: 'trip_ledger_fin', to: 'trips_fin', label: '1 : 1', type: 'one-to-one' },
      { from: 'trip_allowances', to: 'trip_ledger_fin', label: 'rate source', type: 'one-to-many' },
    ],
    workflow: {
      steps: [
        { id: 'trip_done', label: 'Trip Completed', sublabel: 'Status = Completed', color: '#10b981' },
        { id: 'calc_dist', label: 'Calc Distance', sublabel: 'Odometer Delta', color: '#3b82f6' },
        { id: 'apply_rate', label: 'Apply Rate', sublabel: 'Heavy ≥10T: 0.90 SR/km', color: '#f59e0b' },
        { id: 'save_ledger', label: 'Save Ledger', sublabel: 'Financial Record', color: '#a855f7' },
        { id: 'report', label: 'Allowance Report', sublabel: 'Dashboard Widget', color: '#6366f1' },
      ],
      arrows: [
        { from: 'trip_done', to: 'calc_dist' },
        { from: 'calc_dist', to: 'apply_rate' },
        { from: 'apply_rate', to: 'save_ledger' },
        { from: 'save_ledger', to: 'report' },
      ],
    },
  },

  // ── 7. Knowledge ───────────────────────────────────────────────────────────
  {
    id: 'knowledge',
    menuGroup: 'Knowledge',
    menuIcon: BookOpen,
    title: 'Knowledge Base Module',
    subtitle: 'System Spec & ERDs · FAQ / SOP · About TMS Pro',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-600',
    description:
      'Central knowledge hub: system architecture specs, ERD documentation, standard operating procedures (SOPs), FAQs and application metadata.',
    entities: [
      {
        id: 'knowledge_articles',
        title: 'Knowledge Articles',
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-teal-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'title', type: 'varchar' },
          { name: 'category', type: 'enum' },
          { name: 'content', type: 'text' },
          { name: 'tags', type: 'jsonb', nullable: true },
          { name: 'author_id', type: 'uuid', fk: true },
          { name: 'is_published', type: 'boolean' },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' },
        ],
      },
      {
        id: 'faqs',
        title: 'FAQ / SOP',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'question', type: 'text' },
          { name: 'answer', type: 'text' },
          { name: 'category', type: 'varchar' },
          { name: 'order_index', type: 'integer' },
          { name: 'is_active', type: 'boolean' },
        ],
      },
      {
        id: 'erds',
        title: 'ERD / System Specs',
        color: '#6366f1',
        gradient: 'from-indigo-500 to-violet-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'module_name', type: 'varchar' },
          { name: 'diagram_url', type: 'text' },
          { name: 'spec_document_url', type: 'text', nullable: true },
          { name: 'version', type: 'varchar' },
          { name: 'last_updated', type: 'date' },
        ],
      },
    ],
    relations: [
      { from: 'knowledge_articles', to: 'faqs', label: 'categorized in', type: 'one-to-many' },
      { from: 'erds', to: 'knowledge_articles', label: 'linked to', type: 'many-to-one' },
    ],
    workflow: {
      steps: [
        { id: 'author', label: 'Authored', sublabel: 'Content Created', color: '#06b6d4' },
        { id: 'review', label: 'Review', sublabel: 'SME Verified', color: '#f59e0b' },
        { id: 'publish', label: 'Published', sublabel: 'Visible to Users', color: '#10b981' },
        { id: 'search', label: 'Searched', sublabel: 'Full-text Index', color: '#3b82f6' },
        { id: 'archive_k', label: 'Archived', sublabel: 'Outdated Version', color: '#94a3b8' },
      ],
      arrows: [
        { from: 'author', to: 'review' },
        { from: 'review', to: 'publish' },
        { from: 'publish', to: 'search' },
        { from: 'publish', to: 'archive_k', label: 'update cycle' },
      ],
    },
  },

  // ── 8. Admin ────────────────────────────────────────────────────────────────
  {
    id: 'admin',
    menuGroup: 'Admin',
    menuIcon: Shield,
    title: 'Admin Module',
    subtitle: 'Users · Permissions · Settings · Notifications · Face ID Enroll',
    color: '#64748b',
    gradient: 'from-slate-600 to-slate-800',
    description:
      'System administration: user account management, role-based permission matrix, application settings, push notifications and biometric face-ID enrollment.',
    entities: [
      {
        id: 'users',
        title: 'Users',
        color: '#64748b',
        gradient: 'from-slate-500 to-slate-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'email', type: 'varchar' },
          { name: 'full_name', type: 'varchar' },
          { name: 'role', type: 'enum' },
          { name: 'is_active', type: 'boolean' },
          { name: 'face_id_enrolled', type: 'boolean' },
          { name: 'face_descriptor', type: 'jsonb', nullable: true },
          { name: 'created_at', type: 'timestamp' },
          { name: 'last_login', type: 'timestamp', nullable: true },
        ],
      },
      {
        id: 'role_permissions',
        title: 'Role Permissions',
        color: '#ef4444',
        gradient: 'from-red-500 to-rose-700',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'role', type: 'enum' },
          { name: 'path', type: 'varchar' },
          { name: 'can_access', type: 'boolean' },
          { name: 'can_edit', type: 'boolean' },
          { name: 'can_delete', type: 'boolean' },
        ],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'recipient_id', type: 'uuid', fk: true },
          { name: 'title', type: 'varchar' },
          { name: 'message', type: 'text' },
          { name: 'type', type: 'enum' },
          { name: 'is_read', type: 'boolean' },
          { name: 'created_at', type: 'timestamp' },
        ],
      },
      {
        id: 'settings',
        title: 'App Settings',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-600',
        fields: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'key', type: 'varchar' },
          { name: 'value', type: 'jsonb' },
          { name: 'category', type: 'varchar' },
          { name: 'updated_by', type: 'uuid', fk: true },
          { name: 'updated_at', type: 'timestamp' },
        ],
      },
    ],
    relations: [
      { from: 'role_permissions', to: 'users', label: 'governs', type: 'many-to-one' },
      { from: 'notifications', to: 'users', label: 'sent to', type: 'many-to-one' },
      { from: 'settings', to: 'users', label: 'updated by', type: 'many-to-one' },
    ],
    workflow: {
      steps: [
        { id: 'create_user', label: 'Create User', sublabel: 'Admin Action', color: '#64748b' },
        { id: 'assign_role', label: 'Assign Role', sublabel: 'Permission Matrix', color: '#ef4444' },
        { id: 'face_enroll', label: 'Face Enroll', sublabel: 'Biometric Capture', color: '#3b82f6' },
        { id: 'active_user', label: 'Active', sublabel: 'Login Enabled', color: '#10b981' },
        { id: 'notify', label: 'Notify', sublabel: 'Push Alerts Sent', color: '#f59e0b' },
      ],
      arrows: [
        { from: 'create_user', to: 'assign_role' },
        { from: 'assign_role', to: 'face_enroll' },
        { from: 'face_enroll', to: 'active_user' },
        { from: 'active_user', to: 'notify', label: 'events' },
      ],
    },
  },
];

// ─── Entity Card Component ────────────────────────────────────────────────────
const EntityCard = ({ entity }: { entity: UMLEntity }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex-shrink-0 w-52">
    <div className={`bg-gradient-to-r ${entity.gradient} px-3 py-2.5`}>
      <div className="flex items-center gap-1.5">
        <Database size={12} className="text-white/80" />
        <span className="text-white font-black text-xs uppercase tracking-widest truncate">{entity.title}</span>
      </div>
    </div>
    <div className="divide-y divide-slate-50">
      {entity.fields.map((f, i) => (
        <div key={i} className="flex items-center justify-between px-2.5 py-1 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-1.5 min-w-0">
            {f.pk && <span className="text-[8px] font-black text-amber-500 bg-amber-50 px-1 rounded">PK</span>}
            {f.fk && <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1 rounded">FK</span>}
            <span className={cn(
              "text-[10px] font-medium truncate",
              f.pk ? "text-amber-700 font-bold" : f.fk ? "text-blue-700" : "text-slate-700"
            )}>{f.name}</span>
          </div>
          <span className={cn(
            "text-[9px] font-mono shrink-0 ml-1",
            f.nullable ? "text-slate-300" : "text-slate-400"
          )}>{f.type}{f.nullable ? '?' : ''}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Relation Badge ───────────────────────────────────────────────────────────
const RelationBadge = ({ rel }: { rel: UMLRelation }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-xs">
    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{rel.from}</span>
    <ArrowRight size={12} className="text-slate-400 shrink-0" />
    <span className="text-slate-500 italic shrink-0">{rel.label}</span>
    <ArrowRight size={12} className="text-slate-400 shrink-0" />
    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{rel.to}</span>
  </div>
);

// ─── Workflow Step ────────────────────────────────────────────────────────────
const WorkflowSteps = ({ workflow }: { workflow: UMLWorkflow }) => (
  <div className="flex items-center gap-1 flex-wrap">
    {workflow.steps.map((step, i) => (
      <div key={step.id} className="flex items-center gap-1">
        <div className="flex flex-col items-center">
          <div
            className="w-24 px-2 py-2.5 rounded-xl text-white text-center shadow-md"
            style={{ background: step.color }}
          >
            <CheckCircle2 size={14} className="mx-auto mb-1 opacity-80" />
            <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{step.label}</p>
            {step.sublabel && (
              <p className="text-[8px] mt-0.5 opacity-80 leading-tight">{step.sublabel}</p>
            )}
          </div>
        </div>
        {i < workflow.steps.length - 1 && (
          <div className="flex items-center gap-0.5 text-slate-300">
            <div className="w-3 h-px bg-slate-300" />
            <ArrowRight size={10} className="text-slate-400" />
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── Main Slide View ──────────────────────────────────────────────────────────
const DiagramSlideView = ({ slide }: { slide: DiagramSlide }) => {
  const Icon = slide.menuIcon;
  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${slide.gradient} rounded-2xl p-5 text-white flex-shrink-0`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{slide.menuGroup} Module · UML</p>
              <h2 className="text-xl font-black tracking-tight">{slide.title}</h2>
              <p className="text-xs text-white/70 mt-0.5">{slide.subtitle}</p>
            </div>
          </div>
          <div className="hidden lg:block text-right text-xs text-white/60 max-w-xs">
            <p className="leading-relaxed">{slide.description}</p>
          </div>
        </div>
      </div>

      {/* Entities Grid */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-5">
          {/* Entity Cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database size={14} className="text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Entities (Tables)</h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {slide.entities.map(entity => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          </div>

          {/* Relations */}
          {slide.relations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw size={14} className="text-slate-400" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Relationships</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {slide.relations.map((rel, i) => (
                  <RelationBadge key={i} rel={rel} />
                ))}
              </div>
            </div>
          )}

          {/* Workflow */}
          {slide.workflow && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-slate-400" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Process Workflow</h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 overflow-x-auto shadow-sm">
                <WorkflowSteps workflow={slide.workflow} />
              </div>
            </div>
          )}

          {/* Description (mobile) */}
          <div className="lg:hidden bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-700 leading-relaxed">{slide.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main UML Page ────────────────────────────────────────────────────────────
export default function UMLDiagramsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = DIAGRAMS.length;
  const slide = DIAGRAMS[currentSlide];

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % total);
      }, 6000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, total]);

  const goTo = (idx: number) => {
    setCurrentSlide(Math.max(0, Math.min(total - 1, idx)));
  };
  const prev = () => goTo(currentSlide - 1);
  const next = () => goTo((currentSlide + 1) % total);

  const SlideIcon = slide.menuIcon;

  return (
    <div className={cn(
      "flex flex-col gap-4 transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-[9999] bg-slate-50 p-6" : "p-6 h-[calc(100vh-80px)]"
    )}>
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">UML Architecture Diagrams</h1>
          <p className="text-slate-500 text-sm">Complete module data models, entity relationships & process workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              isPlaying
                ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            )}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play Slideshow'}
          </button>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar: Slide Picker */}
        <div className="w-44 flex-shrink-0 flex flex-col gap-1.5 overflow-y-auto">
          {DIAGRAMS.map((d, i) => {
            const DIcon = d.menuIcon;
            return (
              <button
                key={d.id}
                onClick={() => goTo(i)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all text-xs font-bold border",
                  i === currentSlide
                    ? "border-transparent text-white shadow-lg"
                    : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                )}
                style={i === currentSlide ? { background: d.color } : {}}
              >
                <DIcon size={14} className="shrink-0" />
                <span className="truncate">{d.menuGroup}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-3">
          {/* Slide frame */}
          <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-auto p-5 shadow-inner">
            <DiagramSlideView slide={slide} />
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-slate-600"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-slate-600"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-xs font-bold text-slate-400 ml-1">
                {currentSlide + 1} / {total}
              </span>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {DIAGRAMS.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => goTo(i)}
                  className="transition-all rounded-full"
                  style={{
                    width: i === currentSlide ? 20 : 8,
                    height: 8,
                    background: i === currentSlide ? d.color : '#cbd5e1',
                  }}
                />
              ))}
            </div>

            <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              <SlideIcon size={12} />
              {slide.menuGroup}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
