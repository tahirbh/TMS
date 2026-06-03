/**
 * faceProfilesService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All face profile and recognition log operations go through Supabase so that
 * enrolled faces work on EVERY device globally (not just the enrolling device).
 *
 * Security model:
 *  • face_profiles: anon SELECT (needed for pre-login matching) | admin-only writes
 *  • face_recognition_logs: anon INSERT | admin-only SELECT
 */

import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FaceProfile {
  id: string;
  profile_id?: string;
  email: string;
  display_name: string;
  role: string;
  /** 128-element float array from face-api.js, stored as JSONB in Supabase */
  face_descriptor: number[];
  /** Base-64 JPEG thumbnail captured at enrolment time */
  snapshot_url?: string;
  status: 'approved' | 'pending' | 'rejected';
  /** The Supabase login password for this user, used for auto sign-in on face match */
  face_auth_key: string;
  last_recognized_at?: string;
  created_at: string;
}

export interface RecognitionLog {
  face_profile_id?: string;
  result: 'recognized' | 'unrecognized' | 'pending';
  matched_name?: string;
  matched_role?: string;
  confidence?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const faceProfilesService = {
  /**
   * Fetch all APPROVED face profiles.
   * Called before login — uses anon key (RLS allows this).
   */
  async listApproved(): Promise<FaceProfile[]> {
    const { data, error } = await (supabase as any)
      .from('face_profiles')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('faceProfilesService.listApproved:', error);
      throw new Error(error.message);
    }

    return (data ?? []).map(normalise);
  },

  /**
   * Fetch ALL face profiles (any status).
   * Requires admin session (enforced by RLS).
   */
  async listAll(): Promise<FaceProfile[]> {
    const { data, error } = await (supabase as any)
      .from('face_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(normalise);
  },

  /**
   * Enrol a new face profile.
   * Requires admin session.
   */
  async create(payload: {
    email: string;
    display_name: string;
    role: string;
    face_descriptor: number[];
    face_auth_key: string;        // user's Supabase login password
    snapshot_url?: string;
    profile_id?: string;
    status?: 'approved' | 'pending';
  }): Promise<FaceProfile> {
    const { data, error } = await (supabase as any)
      .from('face_profiles')
      .insert([{
        ...payload,
        status: payload.status ?? 'approved',
        face_descriptor: payload.face_descriptor,  // jsonb column accepts arrays
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return normalise(data);
  },

  /**
   * Update a face profile (status, last_recognized_at, etc.).
   */
  async update(id: string, patch: Partial<FaceProfile>): Promise<void> {
    const { error } = await (supabase as any)
      .from('face_profiles')
      .update(patch)
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  /**
   * Delete a face profile.
   * Requires admin session.
   */
  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('face_profiles')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  /**
   * Log a recognition attempt.
   * Works without a session (anon INSERT allowed by RLS).
   */
  async log(entry: RecognitionLog): Promise<void> {
    const { error } = await (supabase as any)
      .from('face_recognition_logs')
      .insert([entry]);

    // Log errors but don't throw — logging must never break the auth flow
    if (error) console.warn('faceProfilesService.log:', error.message);
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Supabase returns jsonb arrays as plain JS arrays already, but guard against
 * edge-cases where they might come back as a JSON string.
 */
function normalise(row: any): FaceProfile {
  return {
    ...row,
    face_descriptor: Array.isArray(row.face_descriptor)
      ? row.face_descriptor
      : JSON.parse(row.face_descriptor ?? '[]'),
  };
}
