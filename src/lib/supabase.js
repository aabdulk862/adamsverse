import { createClient } from "@supabase/supabase-js";

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[supabase.js] Supabase anon key not configured. Auth and realtime will not work.",
    );
    return null;
  }

  // If user explicitly signed out, clear Supabase session tokens
  // BEFORE createClient reads them from localStorage
  const SIGNED_OUT_KEY = "adverse-signed-out";
  if (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(SIGNED_OUT_KEY)
  ) {
    localStorage.removeItem(SIGNED_OUT_KEY);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    }
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export as a proxy so existing code using `supabase.from(...)` etc. still works
// without changing every call site to `supabase().from(...)`
// Returns no-op functions when Supabase isn't configured
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabase();
      if (!client) {
        // Return safe no-ops so the app doesn't crash when Supabase isn't configured
        if (prop === "channel")
          return () => ({
            on: () => ({ subscribe: () => ({}) }),
            subscribe: () => ({}),
          });
        if (prop === "removeChannel") return () => {};
        if (prop === "auth")
          return {
            getSession: async () => ({ data: { session: null } }),
            onAuthStateChange: () => ({
              data: { subscription: { unsubscribe: () => {} } },
            }),
          };
        return () => {};
      }
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  },
);
