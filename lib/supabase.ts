import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Server-only client using the service_role key, which bypasses Row Level
 * Security entirely. Never import this from a "use client" component or
 * expose SUPABASE_SERVICE_ROLE_KEY to the browser. */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }
  client = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // Next.js patches the global fetch to cache GET requests by default,
      // independently of a route's own `dynamic` setting. Supabase reads
      // must always be live, never served from that cache.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return client;
}

export const ARTWORKS_BUCKET = "artworks";
