import { describe, it, expect } from "vitest";
import { supabase } from "./supabase";

describe("supabase connection", () => {
  it("reaches the running Supabase instance", async () => {
    // No app tables exist yet (task 3), so hit PostgREST's root endpoint
    // directly — it responds with the OpenAPI spec as soon as the API and
    // its database connection are up, proving the URL/anon key are valid
    // and the instance is reachable.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: anonKey },
    });

    expect(response.ok).toBe(true);

    // Also confirm the shared client module itself is wired up correctly.
    expect(supabase).toBeTruthy();
  });
});
