/** Set EXPO_PUBLIC_API_URL in .env (e.g. https://api.example.com). */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

export const AUTH_TOKEN_KEY = "auth_token";

export const EXPO_PUBLIC_API_URL = "https://api.myanmarkyay.com/api";
