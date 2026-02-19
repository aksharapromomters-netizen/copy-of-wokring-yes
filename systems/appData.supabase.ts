import { UserProfile } from '../types';
import { getDefaultSession, type SessionData } from '../data/mockSession';
import { supabase } from './supabase';
const USE_REMOTE = true; // Forced to true for production/Supabase usage
const FORCE_REMOTE = true;

const TABLE = 'profiles';
const XP_STORAGE_KEY = 'etiquette_lms_xp';

let currentProfileId: string | null = null;
let currentXP: number | null = null;

function generateUUID(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

// LocalStorage helper functions
export function saveXPToStorage(xp: number): void {
  try {
    localStorage.setItem(XP_STORAGE_KEY, xp.toString());
    console.log(`[XP Storage] Saved ${xp} XP to localStorage`);
  } catch (e) {
    console.error('[XP Storage] Failed to save to localStorage:', e);
  }
}

export function loadXPFromStorage(): number | null {
  try {
    const storedXP = localStorage.getItem(XP_STORAGE_KEY);
    if (storedXP) {
      const xp = parseInt(storedXP, 10);
      console.log(`[XP Storage] Loaded ${xp} XP from localStorage`);
      return xp;
    }
    return null;
  } catch (e) {
    console.error('[XP Storage] Failed to load from localStorage:', e);
    return null;
  }
}

export function clearXPFromStorage(): void {
  try {
    localStorage.removeItem(XP_STORAGE_KEY);
  } catch (e) {
    console.error('[XP Storage] Failed to clear from localStorage:', e);
  }
}

function rowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id ?? ''),
    email: String(row.email ?? ''),
    name: String(row.name ?? ''),
    role: (row.role === 'platform_admin' ? 'platform_admin' : 'employee') as UserProfile['role'],
    department: String(row.department ?? ''),
    avatar: String(row.avatar ?? ''),
    progress: (typeof row.progress === 'object' && row.progress !== null ? row.progress as Record<string, unknown> : {}) as UserProfile['progress'],
    assignedCourses: Array.isArray(row.assigned_courses) ? row.assigned_courses.map(String) : [],
    xp: typeof row.xp === 'number' ? row.xp : (typeof row.xp === 'string' ? parseInt(row.xp, 10) || 0 : 0)
  };
}

function profileToRow(profile: UserProfile): Record<string, unknown> {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    department: profile.department,
    avatar: profile.avatar,
    progress: profile.progress,
    assigned_courses: profile.assignedCourses
  };
}

export type { SessionData };
export { getDefaultSession };

export async function loadSession(): Promise<SessionData> {
  const defaultSession = getDefaultSession();

  // 1. Load local XP as fallback/cache
  const localXP = loadXPFromStorage();
  let effectiveXP = localXP ?? 0;

  // 2. Try Supabase (Source of Truth)
  try {
    if (USE_REMOTE) {
      const { data: rows, error } = await supabase.from(TABLE).select('*').order('id', { ascending: true });

      if (error) {
        console.error('loadSession Supabase failed:', error);
        // Fallback to local if server fails
        return {
          profile: {} as UserProfile,
          users: [],
          xp: effectiveXP
        };
      }

      if (!rows?.length) return { profile: {} as UserProfile, users: [], xp: 0 };

      const users = rows.map(rowToProfile);
      // Demo / no-auth: current profile is the admin row; fallback to first row if no admin.
      const adminIndex = rows.findIndex((r: Record<string, unknown>) => r.role === 'admin');
      const currentIndex = adminIndex >= 0 ? adminIndex : 0;
      const profile = users[currentIndex];
      const currentRow = rows[currentIndex];

      currentProfileId = profile.id;

      // SERVER AUTHORITY: Use server XP
      const serverXP = typeof currentRow?.xp === 'number' ? currentRow.xp : (typeof currentRow?.xp === 'string' ? parseInt(currentRow.xp, 10) || 0 : 0);

      console.log(`[XP Sync] Server: ${serverXP} | Local: ${localXP}`);

      // Update local storage to match server (Source of Truth)
      if (serverXP !== localXP) {
        saveXPToStorage(serverXP);
      }

      currentXP = serverXP;
      effectiveXP = serverXP;

      return { profile, users, xp: effectiveXP };
    }
  } catch (e) {
    console.error('loadSession failed:', e);
  }

  // Fallback if remote disabled or failed (and not caught above)
  currentXP = effectiveXP;
  return { ...defaultSession, xp: effectiveXP };
}

export async function fetchEmployees(): Promise<UserProfile[]> {
  console.log('[fetchEmployees] USE_REMOTE:', USE_REMOTE);

  if (!USE_REMOTE) return getDefaultSession().users;

  const { data: rows, error } = await supabase.from(TABLE).select('*').order('id', { ascending: true });
  if (error) {
    console.error('fetchEmployees failed:', error);
    throw error;
  }
  return (rows || []).map(rowToProfile);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const row = profileToRow(profile);
    currentProfileId = profile.id;
    if (!USE_REMOTE) return;
    const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' });
    if (error) console.error('saveProfile:', error);
  } catch (e) {
    console.error('saveProfile:', e);
  }
}

export async function saveUsers(users: UserProfile[]): Promise<void> {
  try {
    // Bulk admin-level upsert: replace/update all given profiles.
    const rows = users.map(profileToRow);
    if (!USE_REMOTE) return;
    const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (error) console.error('saveUsers:', error);
  } catch (e) {
    console.error('saveUsers:', e);
  }
}

export async function saveXP(xp: number): Promise<void> {
  if (currentProfileId == null) return;

  // Always save to localStorage first (instant, no network needed)
  saveXPToStorage(xp);

  // Then try to sync with Supabase
  try {
    if (!USE_REMOTE) return;
    const { error } = await supabase.from(TABLE).update({ xp }).eq('id', currentProfileId);
    if (error) console.warn('saveXP Supabase sync failed:', error);
  } catch (e) {
    console.warn('saveXP Supabase error (XP saved locally):', e);
  }
}

// User creation function for admins
export async function createUser(userData: {
  email?: string;
  name: string;
  role: 'platform_admin' | 'employee';
  department: string;
  assignedCourses?: string[];
}): Promise<{ profile: UserProfile; username: string; password: string; invited: boolean }> {
  const domain = import.meta.env.VITE_EMPLOYEE_LOGIN_DOMAIN || 'employees.local';

  // Clean email
  const email = (userData.email && userData.email.includes('@')
    ? userData.email
    : `${userData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${domain}`
  ).toLowerCase().trim();

  try {
    console.log('[CreateUser] Starting creation for:', email);

    // 1. Check if user already exists in user_roles
    // If so, we can't "create" them again, but we can update them?
    // For now, let's assume if they exist, it's an error or we return existing.

    // 2. Prepare Profile Object
    // We use a random UUID for the profile ID initially. 
    // When the user actually logs in via Google, AuthContext will need to link the real Auth ID.
    // BUT, to make the dashboard work immediately, we Insert a placeholder profile.
    const placeholderId = generateUUID();

    const newProfile: UserProfile = {
      id: placeholderId,
      email: email,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=b6e3f4`,
      progress: {} as UserProfile['progress'],
      assignedCourses: userData.assignedCourses || []
    };

    if (USE_REMOTE) {
      console.log('[CreateUser] USE_REMOTE is true. Attempting insert into user_roles...');
      // A. Insert into user_roles (Authorization Source of Truth)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          email: email,
          role: userData.role,
          // user_id is NULL until they sign in
          assigned_courses: userData.assignedCourses || [] // Backup column
        }); // .upsert() might be safer if we want to overwrite

      console.log('[CreateUser] user_roles insert completed. Error:', roleError);

      if (roleError) {
        // If duplicate, maybe they already exist.
        if (roleError.code === '23505') { // Unique violation
          throw new Error(`User with email ${email} already exists.`);
        }
        console.error('[CreateUser] user_roles insert failed:', roleError);
        throw new Error('Failed to authorize user in user_roles table.');
      }

      console.log('[CreateUser] Attempting insert into profiles...');
      // B. Insert into profiles (Data Source)
      // We relaxed the foreign key constraint so this should work now!
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileToRow(newProfile));

      console.log('[CreateUser] profiles insert completed. Error:', profileError);

      if (profileError) {
        console.error('[CreateUser] profiles insert failed:', profileError);
        // Partial failure: Role exists but profile failed. 
        // We should probably rollback or warn.
        // For now, throw.
        throw new Error('User authorized, but profile creation failed.');
      }

      console.log('[CreateUser] Success returning profile (Pre-seeded).');
      // INVITED IS FALSE because we are NOT sending emails anymore.
      return { profile: newProfile, username: '', password: '', invited: false };

    } else {
      // LOCAL FALLBACK
      // ... existing local logic ...
      const password = `${Math.random().toString(36).slice(2, 10)}!`;
      const localProfile = { ...newProfile, progress: { _localAuth: { username: email, password } } };
      return { profile: localProfile as unknown as UserProfile, username: email, password, invited: false };
    }

  } catch (e) {
    console.error('createUser:', e);
    throw e;
  }
}

async function inviteViaEdgeFunction(payload: {
  email: string;
  password?: string;
  name: string;
  role: 'platform_admin' | 'employee';
  department: string;
  avatar: string;
  assigned_courses: string[];
}): Promise<{ profile: UserProfile; username: string; password: string; invited: boolean }> {
  console.log('[InviteUser] invoking edge function via proxy: /supabase-functions/admin-invite-user');
  try {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const response = await fetch('/supabase-functions/admin-invite-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[InviteUser] edge function returned success');
    const returnedEmail = result?.email ? String(result.email) : payload.email;
    const newUserRemote: UserProfile = {
      id: generateUUID(),
      email: returnedEmail,
      name: payload.name,
      role: payload.role,
      department: payload.department,
      avatar: payload.avatar,
      progress: {} as UserProfile['progress'],
      assignedCourses: payload.assigned_courses || []
    };
    return { profile: newUserRemote, username: '', password: '', invited: true };
  } catch (err: any) {
    const useLocal = import.meta.env.VITE_USE_LOCAL_EMPLOYEE === 'true';
    if (!useLocal) throw err;
    const localUser: UserProfile = {
      id: generateUUID(),
      email: payload.email,
      name: payload.name,
      role: payload.role,
      department: payload.department,
      avatar: payload.avatar,
      progress: { _localAuth: { username: payload.email.split('@')[0], password: payload.password } } as unknown as UserProfile['progress'],
      assignedCourses: []
    };
    return { profile: localUser, username: payload.email.split('@')[0], password: payload.password, invited: false };
  }
}

// Delete user function for admins
export async function deleteUser(userId: string): Promise<void> {
  try {
    if (USE_REMOTE) {
      const { error } = await supabase.from(TABLE).delete().eq('id', userId);
      if (error) {
        console.error('deleteUser:', error);
        throw new Error('Failed to delete user');
      }
      console.log('deleteUser: Successfully deleted user', userId);
    }
  } catch (e) {
    console.error('deleteUser:', e);
    throw e;
  }
}

// Update user function for admins
export async function updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    if (USE_REMOTE) {
      // 1. Update Profiles Table
      const { data, error } = await supabase.from(TABLE).update({
        ...(updates.name && { name: updates.name }),
        ...(updates.department && { department: updates.department }),
        ...(updates.role && { role: updates.role }),
        ...(updates.assignedCourses && { assigned_courses: updates.assignedCourses })
      }).eq('id', userId).select().single();

      if (error) {
        console.error('updateUser:', error);
        throw new Error('Failed to update user');
      }

      const updatedProfile = rowToProfile(data);

      // 2. Sync assigned_courses to user_roles (if changed)
      if (updates.assignedCourses) {
        // We need the email to target user_roles comfortably, or we can use user_id if we have it.
        // The 'userId' passed here is the profile.id.
        // If the user has logged in, profile.id == auth.users.id == user_roles.user_id.
        // If PRE-SEEDED, profile.id is random. user_roles.user_id is NULL.
        // So we should try updating by EMAIL if possible, but we don't have email in arguments?
        // We have it in 'updatedProfile' though!

        if (updatedProfile.email) {
          console.log('[UpdateUser] Syncing courses to user_roles for', updatedProfile.email);
          await supabase.from('user_roles')
            .update({ assigned_courses: updates.assignedCourses })
            .eq('email', updatedProfile.email);
        }
      }

      console.log('updateUser: Successfully updated user', updatedProfile.email);
      return updatedProfile;
    }
    return null;
  } catch (e) {
    console.error('updateUser:', e);
    throw e;
  }
}

// Wrapper for RPC: Submit Course Completion
export async function submitCourseCompletion(courseId: string, score: number): Promise<{ success: boolean; newXP?: number; isPassed?: boolean; xpGained?: number }> {
  try {
    if (!USE_REMOTE) {
      // Local fallback simulation
      const passed = score >= 70;
      // Note: updating local state is handled by App.tsx, but we signal success here
      return { success: true, isPassed: passed, newXP: (currentXP || 0) + (passed ? 500 : 0) };
    }

    const { data, error } = await supabase.rpc('submit_course_completion', {
      course_id: courseId,
      score
    });

    if (error) {
      console.error('submitCourseCompletion RPC error:', error);
      throw error;
    }

    // Update local cache
    if (data?.new_xp) {
      currentXP = data.new_xp;
      saveXPToStorage(data.new_xp);
    }

    return {
      success: true,
      newXP: data.new_xp,
      isPassed: data.is_passed,
      xpGained: data.xp_gained
    };
  } catch (e) {
    console.error('submitCourseCompletion:', e);
    throw e;
  }
}

// Wrapper for RPC: Update Module Progress
export async function updateModuleProgress(courseId: string, moduleId: string): Promise<{ success: boolean; newXP?: number; xpGained?: number }> {
  try {
    if (!USE_REMOTE) {
      return { success: true, newXP: (currentXP || 0) + 200 };
    }

    const { data, error } = await supabase.rpc('update_module_progress', {
      course_id: courseId,
      module_id: moduleId
    });

    if (error) {
      console.error('updateModuleProgress RPC error:', error);
      throw error;
    }

    if (data?.new_xp) {
      currentXP = data.new_xp;
      saveXPToStorage(data.new_xp);
    }

    return {
      success: true,
      newXP: data.new_xp,
      xpGained: data.xp_gained
    };
  } catch (e) {
    console.error('updateModuleProgress:', e);
    throw e;
  }
}
