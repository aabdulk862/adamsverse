import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Stable reference for the getToken function, updated synchronously each render.
const tokenRef = { current: null };

// Singleton client — one GoTrueClient instance for the entire app.
let singletonClient = null;

function getOrCreateClient() {
  if (singletonClient) return singletonClient;
  singletonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (url, options = {}) => {
        const token = await tokenRef.current?.({ template: "supabase" });
        const headers = new Headers(options.headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(url, { ...options, headers });
      },
    },
  });
  return singletonClient;
}

export function useSupabaseClient() {
  const { getToken } = useAuth();
  // eslint-disable-next-line react-hooks/immutability
  tokenRef.current = getToken;
  const client = useMemo(() => getOrCreateClient(), []);
  return client;
}
