import { SpotifyTokens } from "../types";

const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

const STORAGE_KEYS = {
  TOKENS: "spotify_tokens",
  CODE_VERIFIER: "spotify_code_verifier",
  AUTH_STATE: "spotify_auth_state",
  CLIENT_ID: "spotify_client_id",
};

export const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

export const REDIRECT_URI = "http://127.0.0.1:8888/callback";

// Generate random string for code verifier
function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Compute SHA-256 and base64url-encode
async function generateCodeChallenge(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function initiateSpotifyLogin(clientId: string): Promise<string> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);

  localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);
  localStorage.setItem(STORAGE_KEYS.CLIENT_ID, clientId);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state: state,
    scope: SCOPES,
  });

  return `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
}

export async function handleAuthCallback(
  code: string,
  returnedState: string,
  clientIdOverride?: string
): Promise<SpotifyTokens> {
  const storedState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  const codeVerifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  const clientId = clientIdOverride || localStorage.getItem(STORAGE_KEYS.CLIENT_ID);

  if (!codeVerifier) {
    throw new Error("Missing code verifier for PKCE exchange");
  }
  if (storedState && returnedState !== storedState) {
    console.warn("State mismatch in OAuth callback, proceeding with caution.");
  }
  if (!clientId) {
    throw new Error("Client ID is required for token exchange");
  }

  const bodyParams = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to exchange token with Spotify");
  }

  const data = await response.json();
  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // 60s buffer
  };

  saveTokens(tokens);
  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);

  return tokens;
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<SpotifyTokens> {
  const bodyParams = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to refresh token");
  }

  const data = await response.json();
  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  saveTokens(tokens);
  return tokens;
}

export function getStoredTokens(): SpotifyTokens | null {
  const json = localStorage.getItem(STORAGE_KEYS.TOKENS);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function saveTokens(tokens: SpotifyTokens): void {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
}

export function getStoredClientId(): string {
  return localStorage.getItem(STORAGE_KEYS.CLIENT_ID) || import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
}

export function saveStoredClientId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.CLIENT_ID, id.trim());
}
