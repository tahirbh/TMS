import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  permissions: string[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProfileAndPermissions(userId: string) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    setProfile(profileData as any);

    if (profileData) {
      // Autodetect location and update DB
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await (supabase.from('profiles') as any).update({
            last_known_lat: position.coords.latitude as any,
            last_known_lng: position.coords.longitude as any,
            last_login_at: new Date().toISOString()
          }).eq('id', userId);
        });
      }

      const { data: permData } = await (supabase
        .from('role_permissions') as any)
        .select('path')
        .eq('role', (profileData as any).role);
      
      if (permData) {
        setPermissions((permData as any[]).map((p: any) => p.path));
      } else {
        setPermissions([]);
      }
    } else {
      setPermissions([]);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfileAndPermissions(user.id);
  }

  async function refreshPermissions() {
    if (profile) {
      const { data: permData } = await (supabase
        .from('role_permissions') as any)
        .select('path')
        .eq('role', profile.role);
      
      if (permData) {
        setPermissions((permData as any[]).map((p: any) => p.path));
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndPermissions(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndPermissions(session.user.id);
      } else {
        setProfile(null);
        setPermissions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPermissions([]);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      permissions, 
      loading, 
      signIn, 
      signOut, 
      refreshProfile, 
      refreshPermissions 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
