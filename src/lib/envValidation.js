const REQUIRED_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

const OPTIONAL_VARS = [
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_GOOGLE_SHEET_URL",
];

/**
 * Validates that all required VITE_ environment variables are present.
 * Logs warnings to console in development mode for any missing vars.
 * @returns {{ missing: string[], warnings: string[] }}
 */
export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const varName of REQUIRED_VARS) {
    if (!import.meta.env[varName]) {
      missing.push(varName);
      warnings.push(`Missing required environment variable: ${varName}`);
    }
  }

  for (const varName of OPTIONAL_VARS) {
    if (!import.meta.env[varName]) {
      warnings.push(`Missing optional environment variable: ${varName} (some features may be unavailable)`);
    }
  }

  if (missing.length > 0 && import.meta.env.DEV) {
    console.warn(
      `[envValidation] Missing required environment variables:\n  - ${missing.join("\n  - ")}`,
    );
  }

  return { missing, warnings };
}
