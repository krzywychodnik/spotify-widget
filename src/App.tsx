import React, { useState, useEffect } from "react";
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer";
import { useLyrics } from "./hooks/useLyrics";
import { useWindowControl } from "./hooks/useWindowControl";
import { useCustomization } from "./hooks/useCustomization";
import { CollapsedWidget } from "./components/CollapsedWidget";
import { ExpandedPlayer } from "./components/ExpandedPlayer";
import { SettingsModal } from "./components/SettingsModal";

export const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    customization,
    updateCustomization,
    resetToDefaults,
  } = useCustomization();

  const {
    isAuthenticated,
    clientId,
    updateClientId,
    login,
    completeCallback,
    logout,
    authError,
  } = useSpotifyAuth();

  const {
    currentTrack,
    isPlaying,
    smoothProgressMs,
    durationMs,
    volume,
    shuffleState,
    repeatState,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
  } = useSpotifyPlayer(isAuthenticated);

  const { lyrics, activeLineIndex, isLoading: isLyricsLoading, scrollContainerRef } =
    useLyrics(currentTrack, smoothProgressMs);

  const {
    isExpanded,
    isCollapsing,
    isPinned,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    closeApp,
  } = useWindowControl(customization);

  // Listen for Tauri OAuth callback events from the Rust backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupTauriListener() {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen<{ code: string; state?: string }>(
          "spotify-oauth-callback",
          (event) => {
            if (event.payload?.code) {
              completeCallback(event.payload.code, event.payload.state || "");
            }
          }
        );
      } catch {
        // Not in Tauri environment or event not fired
      }
    }

    setupTauriListener();
    return () => {
      if (unlisten) unlisten();
    };
  }, [completeCallback]);

  // Handle URL callback if launched with query params or opened in browser
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state") || "";
    if (code) {
      completeCallback(code, state);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [completeCallback]);

  const progressPercent = durationMs > 0 ? (smoothProgressMs / durationMs) * 100 : 0;

  const animType = customization.animationType || "spring";
  const animDirectionClass = `anim-dir-${customization.collapseDirection || "top-right"}`;
  const animClass = isCollapsing
    ? `anim-collapse-${animType} ${animDirectionClass}`
    : `anim-expand-${animType} ${animDirectionClass}`;

  return (
    <main
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center p-1 overflow-hidden"
    >
      {isExpanded ? (
        <div className={`w-full h-full ${animClass}`}>
          <ExpandedPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            progressMs={smoothProgressMs}
            durationMs={durationMs}
            volume={volume}
            shuffleState={shuffleState}
            repeatState={repeatState}
            isPinned={isPinned}
            onTogglePin={togglePin}
            onTogglePlay={togglePlayPause}
            onNext={nextTrack}
            onPrev={prevTrack}
            onSeek={seek}
            onVolumeChange={changeVolume}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onCloseApp={closeApp}
            lyrics={lyrics}
            activeLineIndex={activeLineIndex}
            isLyricsLoading={isLyricsLoading}
            scrollContainerRef={scrollContainerRef}
            isAuthenticated={isAuthenticated}
            onLoginClick={() => setIsSettingsOpen(true)}
            customization={customization}
          />
        </div>
      ) : (
        <div className="w-full h-full animate-collapsed-entry flex items-center justify-center">
          <CollapsedWidget
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={togglePlayPause}
            onNext={nextTrack}
            onPrev={prevTrack}
            progressPercent={progressPercent}
            collapsedShape={customization.collapsedShape}
          />
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clientId={clientId}
        onSaveClientId={updateClientId}
        isAuthenticated={isAuthenticated}
        onLogin={login}
        onLogout={logout}
        onManualCallback={(code, state) => {
          completeCallback(code, state);
          setIsSettingsOpen(false);
        }}
        authError={authError}
        customization={customization}
        onUpdateCustomization={updateCustomization}
        onResetCustomization={resetToDefaults}
      />
    </main>
  );
};

export default App;
