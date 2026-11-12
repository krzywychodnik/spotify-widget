import { SpotifyPlaybackState } from "../types";
import { getStoredTokens, refreshAccessToken, getStoredClientId } from "./spotifyAuth";

const BASE_URL = "https://api.spotify.com/v1";

async function getValidToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.accessToken) {
    throw new Error("No Spotify access token available");
  }

  // Check if token is expired or expiring soon
  if (Date.now() >= tokens.expiresAt) {
    const clientId = getStoredClientId();
    if (!tokens.refreshToken || !clientId) {
      throw new Error("Session expired. Please log in again.");
    }
    const newTokens = await refreshAccessToken(tokens.refreshToken, clientId);
    return newTokens.accessToken;
  }

  return tokens.accessToken;
}

async function spotifyRequest<T = unknown>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T | null> {
  const token = await getValidToken();

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  // 204 No Content (normal for play, pause, seek, next, prev)
  if (response.status === 204) {
    return null;
  }

  if (response.status === 401) {
    // Attempt one automatic refresh
    const clientId = getStoredClientId();
    const tokens = getStoredTokens();
    if (tokens?.refreshToken && clientId) {
      const refreshed = await refreshAccessToken(tokens.refreshToken, clientId);
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${refreshed.accessToken}`,
      };
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, options);
      if (retryResponse.status === 204) return null;
      if (!retryResponse.ok) return null;
      return await retryResponse.json();
    }
    throw new Error("Unauthorized (401)");
  }

  if (!response.ok) {
    const errText = await response.text();
    console.warn(`Spotify API error ${response.status} on ${endpoint}:`, errText);
    return null;
  }

  return (await response.json()) as T;
}

export async function fetchPlaybackState(): Promise<SpotifyPlaybackState | null> {
  return await spotifyRequest<SpotifyPlaybackState>("/me/player");
}

export async function spotifyPlay(): Promise<void> {
  await spotifyRequest("/me/player/play", "PUT");
}

export async function spotifyPause(): Promise<void> {
  await spotifyRequest("/me/player/pause", "PUT");
}

export async function spotifyNext(): Promise<void> {
  await spotifyRequest("/me/player/next", "POST");
}

export async function spotifyPrevious(): Promise<void> {
  await spotifyRequest("/me/player/previous", "POST");
}

export async function spotifySeek(positionMs: number): Promise<void> {
  await spotifyRequest(`/me/player/seek?position_ms=${Math.floor(positionMs)}`, "PUT");
}

export async function spotifySetVolume(volumePercent: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(volumePercent)));
  await spotifyRequest(`/me/player/volume?volume_percent=${clamped}`, "PUT");
}

export async function spotifySetShuffle(state: boolean): Promise<void> {
  await spotifyRequest(`/me/player/shuffle?state=${state}`, "PUT");
}

export async function spotifySetRepeat(state: "off" | "track" | "context"): Promise<void> {
  await spotifyRequest(`/me/player/repeat?state=${state}`, "PUT");
}
