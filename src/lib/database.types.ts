export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'dispatcher' | 'supervisor' | 'driver'
          phone: string
          avatar_url: string
          is_active: boolean
          site_id: string | null
          last_known_lat: number | null
          last_known_lng: number | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email?: string
          role?: 'admin' | 'dispatcher' | 'supervisor' | 'driver'
          phone?: string
          avatar_url?: string
          is_active?: boolean
          site_id?: string | null
          last_known_lat?: number | null
          last_known_lng?: number | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'dispatcher' | 'supervisor' | 'driver'
          phone?: string
          avatar_url?: string
          is_active?: boolean
          site_id?: string | null
          last_known_lat?: number | null
          last_known_lng?: number | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          name: string
          code: string
          address: string
          city: string
          country: string
          latitude: number | null
          longitude: number | null
          supervisor_id: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string
          city?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          supervisor_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string
          city?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          supervisor_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          registration_number: string
          make: string
          model: string
          year: number
          type: 'truck' | 'trailer' | 'van' | 'tanker' | 'flatbed'
          capacity_tons: number
          status: 'available' | 'in_use' | 'maintenance' | 'inactive'
          current_driver_id: string | null
          current_trip_id: string | null
          last_service_date: string | null
          next_service_date: string | null
          registration_expiry: string | null
          insurance_expiry: string | null
          authorized_driver: string | null
          authorization_expiry: string | null
          mvpi_expiry: string | null
          sequence_number: string | null
          owner_name: string | null
          color: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_number: string
          make?: string
          model?: string
          year?: number
          type?: 'truck' | 'trailer' | 'van' | 'tanker' | 'flatbed'
          capacity_tons?: number
          status?: 'available' | 'in_use' | 'maintenance' | 'inactive'
          current_driver_id?: string | null
          current_trip_id?: string | null
          last_service_date?: string | null
          next_service_date?: string | null
          registration_expiry?: string | null
          insurance_expiry?: string | null
          authorized_driver?: string | null
          authorization_expiry?: string | null
          mvpi_expiry?: string | null
          sequence_number?: string | null
          owner_name?: string | null
          color?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_number?: string
          make?: string
          model?: string
          year?: number
          type?: 'truck' | 'trailer' | 'van' | 'tanker' | 'flatbed'
          capacity_tons?: number
          status?: 'available' | 'in_use' | 'maintenance' | 'inactive'
          current_driver_id?: string | null
          current_trip_id?: string | null
          last_service_date?: string | null
          next_service_date?: string | null
          registration_expiry?: string | null
          insurance_expiry?: string | null
          authorized_driver?: string | null
          authorization_expiry?: string | null
          mvpi_expiry?: string | null
          sequence_number?: string | null
          owner_name?: string | null
          color?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          profile_id: string
          license_number: string
          license_class: string
          license_expiry: string | null
          id_number: string
          id_expiry: string | null
          medical_expiry: string | null
          status: 'available' | 'on_trip' | 'off_duty' | 'suspended'
          total_trips: number
          total_distance: number
          current_lat: number | null
          current_lng: number | null
          last_location_update: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          license_number?: string
          license_class?: string
          license_expiry?: string | null
          id_number?: string
          id_expiry?: string | null
          medical_expiry?: string | null
          status?: 'available' | 'on_trip' | 'off_duty' | 'suspended'
          total_trips?: number
          total_distance?: number
          current_lat?: number | null
          current_lng?: number | null
          last_location_update?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          license_number?: string
          license_class?: string
          license_expiry?: string | null
          id_number?: string
          id_expiry?: string | null
          medical_expiry?: string | null
          status?: 'available' | 'on_trip' | 'off_duty' | 'suspended'
          total_trips?: number
          total_distance?: number
          current_lat?: number | null
          current_lng?: number | null
          last_location_update?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          site_id: string
          created_by: string
          material_type: string
          trailer_type: 'standard' | 'flatbed' | 'tanker' | 'refrigerated' | 'curtainsider'
          required_vehicles: number
          assigned_vehicles: number
          quantity_tons: number
          pickup_location: string
          pickup_lat: number | null
          pickup_lng: number | null
          delivery_location: string
          delivery_lat: number | null
          delivery_lng: number | null
          required_date: string | null
          notes: string
          status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          site_id: string
          created_by: string
          material_type?: string
          trailer_type?: 'standard' | 'flatbed' | 'tanker' | 'refrigerated' | 'curtainsider'
          required_vehicles?: number
          assigned_vehicles?: number
          quantity_tons?: number
          pickup_location?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          delivery_location?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          required_date?: string | null
          notes?: string
          status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          site_id?: string
          created_by?: string
          material_type?: string
          trailer_type?: 'standard' | 'flatbed' | 'tanker' | 'refrigerated' | 'curtainsider'
          required_vehicles?: number
          assigned_vehicles?: number
          quantity_tons?: number
          pickup_location?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          delivery_location?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          required_date?: string | null
          notes?: string
          status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          trip_number: string
          order_id: string
          vehicle_id: string
          driver_id: string
          dispatcher_id: string
          inspection_id: string | null
          origin_name: string
          origin_lat: number | null
          origin_lng: number | null
          destination_name: string
          destination_lat: number | null
          destination_lng: number | null
          waypoints: Json
          cities_en_route: string[]
          route_distance_km: number
          scheduled_departure: string | null
          actual_departure: string | null
          scheduled_arrival: string | null
          actual_arrival: string | null
          arrived_at: string | null
          status: 'assigned' | 'enroute' | 'arrived_site' | 'loading' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
          manifest_url: string
          delivery_note_url: string
          proof_of_delivery_url: string
          actual_distance_km: number
          fuel_consumed: number
          notes: string
          net_weight: number
          bayan_url: string
          pod_url: string
          start_odometer: number
          arrival_odometer: number
          final_odometer: number
          gross_weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_number?: string
          order_id: string
          vehicle_id: string
          driver_id: string
          dispatcher_id: string
          inspection_id?: string | null
          origin_name?: string
          origin_lat?: number | null
          origin_lng?: number | null
          destination_name?: string
          destination_lat?: number | null
          destination_lng?: number | null
          waypoints?: Json
          cities_en_route?: string[]
          route_distance_km?: number
          scheduled_departure?: string | null
          actual_departure?: string | null
          scheduled_arrival?: string | null
          actual_arrival?: string | null
          arrived_at?: string | null
          status?: 'assigned' | 'enroute' | 'arrived_site' | 'loading' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
          manifest_url?: string
          delivery_note_url?: string
          proof_of_delivery_url?: string
          actual_distance_km?: number
          fuel_consumed?: number
          notes?: string
          net_weight?: number
          bayan_url?: string
          pod_url?: string
          start_odometer?: number
          arrival_odometer?: number
          final_odometer?: number
          gross_weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_number?: string
          order_id?: string
          vehicle_id?: string
          driver_id?: string
          dispatcher_id?: string
          inspection_id?: string | null
          origin_name?: string
          origin_lat?: number | null
          origin_lng?: number | null
          destination_name?: string
          destination_lat?: number | null
          destination_lng?: number | null
          waypoints?: Json
          cities_en_route?: string[]
          route_distance_km?: number
          scheduled_departure?: string | null
          actual_departure?: string | null
          scheduled_arrival?: string | null
          actual_arrival?: string | null
          arrived_at?: string | null
          status?: 'assigned' | 'enroute' | 'arrived_site' | 'loading' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
          manifest_url?: string
          delivery_note_url?: string
          proof_of_delivery_url?: string
          actual_distance_km?: number
          fuel_consumed?: number
          notes?: string
          net_weight?: number
          bayan_url?: string
          pod_url?: string
          start_odometer?: number
          arrival_odometer?: number
          final_odometer?: number
          gross_weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role: string
          path: string
          created_at: string
        }
        Insert: {
          id?: string
          role: string
          path: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          path?: string
          created_at?: string
        }
      }
      labor: {
        Row: {
          id: string
          name: string
          iqama_number: string
          nationality: string
          profession: string
          phone: string | null
          status: 'available' | 'deployed' | 'on_leave'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          iqama_number: string
          nationality?: string
          profession?: string
          phone?: string | null
          status?: 'available' | 'deployed' | 'on_leave'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          iqama_number?: string
          nationality?: string
          profession?: string
          phone?: string | null
          status?: 'available' | 'deployed' | 'on_leave'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      labor_mobilization: {
        Row: {
          id: string
          labor_id: string
          site_id: string
          supervisor_id: string | null
          start_date: string
          end_date: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          labor_id: string
          site_id: string
          supervisor_id?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          labor_id?: string
          site_id?: string
          supervisor_id?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      breakdown_requests: {
        Row: {
          id: string
          vehicle_id: string
          reported_by: string
          description: string
          status: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          reported_by: string
          description: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          reported_by?: string
          description?: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_ledger: {
        Row: {
          id: string
          trip_id: string
          distance_km: number
          allowance_sr: number
          cost_per_km: number
          total_cost_sr: number
          calculated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          distance_km?: number
          allowance_sr?: number
          cost_per_km?: number
          total_cost_sr?: number
          calculated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          distance_km?: number
          allowance_sr?: number
          cost_per_km?: number
          total_cost_sr?: number
          calculated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Site = Database['public']['Tables']['sites']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Driver = Database['public']['Tables']['drivers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type RolePermission = Database['public']['Tables']['role_permissions']['Row']
export type Labor = Database['public']['Tables']['labor']['Row']
export type LaborMobilization = Database['public']['Tables']['labor_mobilization']['Row']
export type BreakdownRequest = Database['public']['Tables']['breakdown_requests']['Row']
export type TripLedger = Database['public']['Tables']['trip_ledger']['Row']
