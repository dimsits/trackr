/**
 * Environment validation for the Trackr API (local development only).
 *
 * Rules of the house:
 *  - Every message names the offending variable, never its value.
 *  - R2 is optional: leave all four variables unset to run without file storage.
 */

/** The four variables that must be present together to enable file storage. */
export const R2_REQUIRED_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
] as const;

type EnvLike = Record<string, unknown>;

function read(env: EnvLike, key: string): string | undefined {
  const value = env[key];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Strips leading/trailing slashes so `api`, `/api` and `/api/` all mean `api`. */
export function normalizeApiPrefix(raw?: string): string {
  return (raw ?? 'api').trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

/** Splits the comma-separated CORS allow-list, falling back to the dev frontend. */
export function parseCorsOrigins(raw?: string): string[] {
  const origins = (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : ['http://localhost:3000'];
}

/** True only when every R2 variable required to talk to object storage is set. */
export function isR2Configured(env: EnvLike = process.env): boolean {
  return R2_REQUIRED_VARS.every((key) => read(env, key) !== undefined);
}

/** The R2 variables that are still missing (used for actionable error text). */
export function missingR2Vars(env: EnvLike = process.env): string[] {
  return R2_REQUIRED_VARS.filter((key) => read(env, key) === undefined);
}

/**
 * Validates the merged environment. Passed to `ConfigModule.forRoot({ validate })`,
 * so a misconfigured app fails at boot with one aggregated, readable report.
 */
export function validateEnv(config: EnvLike): EnvLike {
  const errors: string[] = [];

  // --- Database -----------------------------------------------------------
  const databaseUrl = read(config, 'DATABASE_URL');
  if (!databaseUrl) {
    errors.push(
      'DATABASE_URL is missing. Copy apps/backend/.env.example to apps/backend/.env, or run `npm run setup`.',
    );
  } else if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    errors.push(
      'DATABASE_URL is invalid: it must be a postgresql:// connection string.',
    );
  }

  // --- Auth ---------------------------------------------------------------
  const jwtSecret = read(config, 'JWT_SECRET');
  if (!jwtSecret) {
    errors.push(
      'JWT_SECRET is missing. `npm run setup` generates a random development secret for you.',
    );
  }

  // --- HTTP ---------------------------------------------------------------
  const port = read(config, 'PORT');
  if (port !== undefined) {
    const parsed = Number(port);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      errors.push(
        'PORT is invalid: it must be an integer between 1 and 65535.',
      );
    }
  }

  // --- Object storage -----------------------------------------------------
  const missing = missingR2Vars(config);
  if (missing.length > 0 && missing.length < R2_REQUIRED_VARS.length) {
    // Partially configured is always a mistake - all-or-nothing is the contract.
    errors.push(
      `Object storage is partially configured. Set the remaining variables or unset them all: ${missing.join(', ')}.`,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  return config;
}
