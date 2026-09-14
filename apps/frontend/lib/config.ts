/**
 * Single source of truth for where the local Trackr API lives.
 *
 * `NEXT_PUBLIC_API_URL` must already include the backend's global prefix
 * (`API_PREFIX`, default `api`) so every `api()` call agrees with it. The
 * default matches the backend's local defaults, which keeps a fresh clone
 * working even before `apps/frontend/.env.local` exists.
 */
const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

/** e.g. "http://localhost:3001/api" - never has a trailing slash. */
export const API_BASE_URL = (configured || DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  ""
);
