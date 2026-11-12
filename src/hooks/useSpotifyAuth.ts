import { useState, useEffect, useCallback } from "react";
import {
  getStoredTokens,
  getStoredClientId,
  saveStoredClientId,
  clearTokens,
  initiateSpotifyLogin,
  handleAuthCallback,
} from "../services/spotifyAuth";
import { SpotifyTokens } from "../types";

export function useSpotifyAuth() {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(() => getStoredTokens());
  const [clientId, setClientId] = useState<string>(() => getStoredClientId());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = Boolean(tokens && tokens.accessToken);

  // Sync tokens on mount
  useEffect(() => {
    const current = getStoredTokens();
    if (current) setTokens(current);
  }, []);

  const updateClientId = useCallback((newId: string) => {
    saveStoredClientId(newId);
    setClientId(newId);
  }, []);

  const login = useCallback(async () => {
    const activeId = clientId.trim() || getStoredClientId();
    if (!activeId) {
      setAuthError("Wprowadź Spotify Client ID przed logowaniem.");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      const authUrl = await initiateSpotifyLogin(activeId);
      // Try Tauri opener if running inside Tauri, else window.open / location
      try {
        const { openUrl } = await import("@tauri-apps/plugin-opener");
        await openUrl(authUrl);
      } catch {
        window.open(authUrl, "_blank");
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const completeCallback = useCallback(
    async (code: string, state: string) => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const activeId = clientId.trim() || getStoredClientId();
        const newTokens = await handleAuthCallback(code, state, activeId);
        setTokens(newTokens);
      } catch (err: unknown) {
        setAuthError(err instanceof Error ? err.message : "Błąd autoryzacji");
      } finally {
        setIsLoading(false);
      }
    },
    [clientId]
  );

  const logout = useCallback(() => {
    clearTokens();
    setTokens(null);
  }, []);

  return {
    isAuthenticated,
    tokens,
    clientId,
    updateClientId,
    login,
    completeCallback,
    logout,
    isLoading,
    authError,
    setAuthError,
  };
}
