export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

export const AUTH_TOKEN_KEY = "auth_token";
export const REMEMBERED_LOGIN_KEY = "remembered_login";

export const EXPO_PUBLIC_API_URL = "https://api-client.burma90.com/api";

/** AES-128 key for mobile-only encrypted odds/results/live-stream payloads. */
export const APP_PAYLOAD_KEY = process.env.EXPO_PUBLIC_APP_PAYLOAD_KEY ?? "";
