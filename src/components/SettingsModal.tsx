import React, { useState } from "react";
import { X, Key, LogOut, ExternalLink, Check, Copy, AlertCircle } from "lucide-react";
import { REDIRECT_URI } from "../services/spotifyAuth";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSaveClientId: (id: string) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onManualCallback: (code: string, state: string) => void;
  authError: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onSaveClientId,
  isAuthenticated,
  onLogin,
  onLogout,
  onManualCallback,
  authError,
}) => {
  const [inputClientId, setInputClientId] = useState(clientId);
  const [manualCode, setManualCode] = useState("");
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveClientId(inputClientId);
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(REDIRECT_URI);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleProcessManualCode = () => {
    const trimmed = manualCode.trim();
    if (!trimmed) return;

    // Check if user pasted full redirect URL like http://localhost:8888/callback?code=...&state=...
    try {
      if (trimmed.includes("code=")) {
        const url = new URL(trimmed.startsWith("http") ? trimmed : `http://dummy.com?${trimmed}`);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state") || "";
        if (code) {
          onManualCallback(code, state);
          setManualCode("");
          return;
        }
      }
    } catch {
      // not a url, treat as raw code
    }

    onManualCallback(trimmed, "");
    setManualCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl glass-panel p-5 text-white shadow-2xl border border-white/10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-spotify-green" />
            <h2 className="text-sm font-bold tracking-wide">Ustawienia Spotify API</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Client ID config */}
        <div className="space-y-2">
          <label className="text-xs text-white/70 font-medium block">
            Spotify Client ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              placeholder="np. 4c3b2a1..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-spotify-green transition"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition active:scale-95"
            >
              Zapisz
            </button>
          </div>
        </div>

        {/* Redirect URI Info */}
        <div className="space-y-1.5 bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/60">Redirect URI (Spotify Dashboard):</span>
            <button
              onClick={handleCopyRedirect}
              className="flex items-center gap-1 text-[10px] text-spotify-green hover:underline"
            >
              {copiedRedirect ? (
                <>
                  <Check className="w-3 h-3" /> Skopiowano
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Kopiuj
                </>
              )}
            </button>
          </div>
          <div className="text-[11px] font-mono text-white/80 bg-black/40 px-2 py-1 rounded">
            {REDIRECT_URI}
          </div>
        </div>

        {/* Auth status & actions */}
        <div className="space-y-3 pt-1">
          {authError && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-spotify-green bg-spotify-green/10 px-3 py-2 rounded-xl border border-spotify-green/20 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-spotify-green animate-pulse" />
                  Połączono ze Spotify
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-white/60 hover:text-red-400 text-xs transition"
                >
                  <LogOut className="w-3 h-3" /> Wyloguj
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="w-full py-2.5 px-4 bg-spotify-green hover:bg-spotify-greenHover text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Zaloguj przez Spotify (OAuth)
            </button>
          )}
        </div>

        {/* Manual code input fallback */}
        {!isAuthenticated && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] text-white/50 block">
              Alternatywnie: wklej kod autoryzacji z adresu URL po zalogowaniu:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Wklej adres callback lub code..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-spotify-green"
              />
              <button
                onClick={handleProcessManualCode}
                className="px-2.5 py-1 bg-spotify-green/20 hover:bg-spotify-green/30 text-spotify-green rounded-xl text-[11px] font-semibold transition"
              >
                Autoryzuj
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
