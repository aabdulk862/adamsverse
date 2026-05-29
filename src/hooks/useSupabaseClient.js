import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: async () => {
          const token = await getToken();
          return token
            ? { Authorization: `Bearer ${token}` }
            : {};
        },
      },
    });
  }, [getToken]);

  return client;
}
