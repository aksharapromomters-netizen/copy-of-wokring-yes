import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../systems/supabase';

type Role = 'hr' | 'employee';

type Profile = {
  id: string;
  role: Role;
  company_id?: string;
  email?: string;
  name?: string;
  department?: string;
  avatar?: string;
  progress?: Record<string, any>;
  assigned_courses?: string[];
  assignedCourses?: string[];
  xp?: number;
};

type AuthContextType = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  profileError: Error | null;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      console.log('[Auth] Initializing session...');
      setLoading(true);
      setProfileError(null);

      // Safety timeout
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn('[Auth] Initialization timed out, forcing loading=false');
          setLoading(false);
        }
      }, 5000);

      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('[Auth] Session found, loading profile...');
          const authUser = data.session.user;
          setUser(authUser);
          if (mounted) await loadProfile(authUser);
        } else {
          console.log('[Auth] No session found');
          if (mounted) setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        if (mounted) setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Auth] Auth state changed: ${event}`);
        if (session) {
          const authUser = session.user;
          if (mounted) setUser(authUser);
          setProfileError(null);

          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            // Avoid double loading if already loaded by init, but safe to call
            if (mounted) await loadProfile(authUser);
          }
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (authUser: any) => {
    if (!authUser || !authUser.email) {
      setLoading(false);
      return;
    }

    console.log('[Auth] Loading profile for user:', authUser.email);

    try {
      // 1. Check user_roles table
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (userRoleError || !userRoleData) {
        console.warn('[Auth] User not authorized (no record in user_roles):', authUser.email);
        await signOut();
        setProfileError(new Error("You are not authorized. Contact HR."));
        setLoading(false);
        return;
      }

      // 2. Link user_id if null (First time login)
      if (!userRoleData.user_id) {
        console.log('[Auth] Linking user_id to user_roles record...');
        const { error: linkError } = await supabase
          .from('user_roles')
          .update({ user_id: authUser.id })
          .eq('email', authUser.email);

        if (linkError) {
          console.error('[Auth] Failed to link user_id:', linkError);
        }
      }

      // 3. Claim Pre-seeded Profile (RPC)
      // This ensures that if the user was creating in AdminDashboard (via email) before login,
      // their profile is now "claimed" by this Auth ID.
      try {
        const { error: claimError } = await supabase.rpc('claim_profile_by_email');
        if (claimError) {
          console.warn('[Auth] claim_profile_by_email RPC error:', claimError.message);
          // Non-fatal, as it might just mean the function isn't deployed or RLS issues,
          // but we proceed to try fetch profile anyway.
        } else {
          console.log('[Auth] claim_profile_by_email executed successfully.');
        }
      } catch (rpcErr) {
        console.warn('[Auth] claim_profile_by_email RPC failed/not found:', rpcErr);
      }

      // 4. Fetch full profile details
      // Now that we've claimed, we should find the profile by ID (authUser.id)
      let finalProfile: Profile | null = null;

      const { data: profileById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileById) {
        finalProfile = profileById;
      }
      // logic continues...


      const role = userRoleData.role as Role; // strictly 'hr' or 'employee'

      if (finalProfile) {
        setProfile({
          ...finalProfile,
          role: role, // Override role from user_roles
          email: authUser.email,
          progress: finalProfile.progress || {},
          assigned_courses: finalProfile.assigned_courses || [],
          assignedCourses: finalProfile.assigned_courses || []
        });
      } else {
        // Create a FRESH profile in memory if profiles table entry doesn't exist yet
        console.log('[Auth] No profile found. Creating fresh one.');
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          role: role,
          name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          avatar: authUser.user_metadata?.avatar_url || '',
          department: 'Unassigned',
          progress: {},
          assigned_courses: []
        };

        // Sync to DB
        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();

        setProfile(createdProfile ? { ...createdProfile, role } : newProfile);
      }

    } catch (err: any) {
      console.error('[Auth] Profile load error:', err);
      setProfileError(err);
      // Ensure we don't hang
    } finally {
      setLoading(false);
    }
  };


  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error("Google Sign In Error:", error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, signInWithGoogle, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
