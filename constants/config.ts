export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

export const AUTH_TOKEN_KEY = "auth_token";

export const EXPO_PUBLIC_API_URL = "https://api.myanmarkyay.com/api";

/** Free live football streams (separate from main betting API). */
export const LIVE_MATCHES_API_URL =
  "https://footballapi.spacetechmm.com/free-live-matches";
