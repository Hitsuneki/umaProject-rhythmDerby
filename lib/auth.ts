import { createClient } from './supabase/server';

export async function getCurrentUserId(request?: Request): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : null;
  } catch (error) {
    console.error('getCurrentUserId error:', error);
    return null;
  }
}

/**
 * getCurrentUser
 * - Uses Supabase Auth to determine the user id
 * - Returns user object { id, username, email } or null
 */
export async function getCurrentUser(request?: Request): Promise<{ id: string; username?: string; email?: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) return null;

    // Fetch the public profile
    const { data: profile, error: dbError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', user.id)
      .single();

    if (dbError || !profile) return null;

    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
    };
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return null;
  }
}