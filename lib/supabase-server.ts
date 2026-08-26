import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and fill in your Supabase project values."
  );
}

/**
 * A Supabase client scoped to one request, asserting the caller's
 * participant identity via the `x-participant-id` header. RLS policies
 * (see supabase/migrations/20260825230500_cards_rls.sql) key on this header
 * to enforce pre-reveal card privacy at the database level. Never share
 * this client across requests/participants — create one per call.
 */
export function createParticipantClient(participantId: string): SupabaseClient {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: { "x-participant-id": participantId },
    },
  });
}
