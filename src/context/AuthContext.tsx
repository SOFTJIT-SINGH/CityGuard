import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: (userId?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ session: null, user: null, profile: null, loading: true, refreshProfile: async () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const profileRef = React.useRef<any>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && JSON.stringify(data) !== JSON.stringify(profileRef.current)) {
        profileRef.current = data;
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile in AuthContext:', err);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Initial session error:', error.message);
        if (error.message.includes('Refresh Token Not Found')) {
          supabase.auth.signOut();
        }
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const authValue = React.useMemo(() => ({
    session,
    user,
    profile,
    loading,
    refreshProfile: async (userId?: string) => {
      if (userId) {
        await fetchProfile(userId);
      } else if (user?.id) {
        await fetchProfile(user.id);
      }
    }
  }), [session, user, profile, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);