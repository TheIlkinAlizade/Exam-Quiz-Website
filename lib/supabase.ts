import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

// HARD GUARD (runtime safety)
if (!url || !anon) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// 🔥 TypeScript-safe narrowing (THIS fixes your TS error)
const SUPABASE_URL = url;
const SUPABASE_ANON = anon;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// service role client (server only usage)
export const serviceSupabase = createClient(
  SUPABASE_URL,
  service || SUPABASE_ANON
);

export function createUserClient(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}