/**
 * Supabase browser client.
 *
 * SECURITY MODEL (project brief):
 * - The browser only ever holds the project URL + anon/publishable key
 *   (both are public, designed-by-Supabase-to-be-public values).
 * - The service-role key NEVER enters this file, NEXT_PUBLIC_* variables,
 *   the repository, or the client bundle.
 * - The real security boundary is database RLS (default deny) plus the
 *   trusted Edge Function that writes enquiries (Stage 4).
 *
 * `getSupabaseBrowserClient()` returns null when the environment variables
 * are not configured, so UI can show honest "not configured" states instead
 * of crashing. This matches the brief: never fake a working backend.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Not configured — callers must handle this honestly (no fake success).
    return null;
  }

  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cached;
}

/** True when the public Supabase environment values are present. */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
