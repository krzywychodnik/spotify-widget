import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Pin,
  Settings,
  Music2,
  Mic,
  Disc3,
  GripHorizontal,
  X,
} from "lucide-react";
import { SpotifyTrack, LyricLine, AppCustomization } from "../types";
import { LyricsView } from "./LyricsView";

interface ExpandedPlayerProps {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  volume: number;
  shuffleState: boolean;
  repeatState: "off" | "context" | "track";
  isPinned: boolean;
  onTogglePin: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (ms: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onOpenSettings: () => void;
  onCloseApp: () => void;
  lyrics: LyricLine[];
  activeLineIndex: number;
  isLyricsLoading: boolean;
  scrollContainerRef: React.RefObject<any>;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  customization?: AppCustomization;
}

function formatTime(ms: number): string {
  if (!ms || isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({
  currentTrack,
  isPlaying,
  progressMs,
  durationMs,
  volume,
  shuffleState,
  repeatState,
  isPinned,
  onTogglePin,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onOpenSettings,
  onCloseApp,
  lyrics,
  activeLineIndex,
  isLyricsLoading,
  scrollContainerRef,
  isAuthenticated,
  onLoginClick,
  customization,
}) => {
  const [activeTab, setActiveTab] = useState<"player" | "lyrics">("player");
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const albumArt = currentTrack?.album?.images?.[0]?.url;
  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (durationMs <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * durationMs);
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      onVolumeChange(prevVolume > 0 ? prevVolume : 50);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="w-full h-full glass-panel rounded-3xl flex flex-col overflow-hidden text-white select-none transition-all duration-300 shadow-2xl border border-white/10">
      {/* Draggable Header */}
      <div
        data-tauri-drag-region
        className="h-11 px-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02] cursor-grab active:cursor-grabbing shrink-0"
      >
        <div data-tauri-drag-region className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/30" />
          <span
            data-tauri-drag-region
            className="text-[11px] font-semibold tracking-wider uppercase text-white/60"
          >
            Spotify Overlay
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Tab Switcher */}
          <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5 mr-1">
            <button
              onClick={() => setActiveTab("player")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                activeTab === "player"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/40 hover:text-white/80"
              }`}
              title="Odtwarzacz"
            >
              <Disc3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                activeTab === "lyrics"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/40 hover:text-white/80"
              }`}
              title="Tekst utworu"
            >
              <Mic className="w-3 h-3" style={{ color: "var(--accent-color)" }} />
              {lyrics.length > 0 && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--accent-color)" }}
                />
              )}
            </button>
          </div>

          {/* Pin toggle button */}
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition ${
              isPinned
                ? "bg-white/15 border border-white/20"
                : "text-white/40 hover:text-white hover:bg-white/10"
            }`}
            style={isPinned ? { color: "var(--accent-color)" } : {}}
            title={isPinned ? "Przypięte (nie zwinie się)" : "Przypnij okno (zawsze rozwinięte)"}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? "rotate-45" : ""}`} />
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Personalizacja i Ustawienia"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Close button */}
          <button
            onClick={onCloseApp}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/15 transition active:scale-95"
            title="Zamknij widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isAuthenticated ? (
        /* Not authenticated state */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
            style={{ color: "var(--accent-color)" }}
          >
            <Music2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Połącz ze Spotify</h3>
            <p className="text-xs text-white/50 max-w-[240px]">
              Skonfiguruj Client ID i zaloguj się, aby kontrolować odtwarzanie i widzieć napisy.
            </p>
          </div>
          <button
            onClick={onLoginClick}
            style={{ backgroundColor: "var(--accent-color)" }}
            className="px-4 py-2 text-black text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            Otwórz konfigurację
          </button>
        </div>
      ) : !currentTrack ? (
        /* Idle / Nothing Playing state */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 animate-pulse">
            <Music2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Brak odtwarzania</h3>
            <p className="text-xs text-white/40 max-w-[220px]">
              Uruchom odtwarzanie w aplikacji Spotify na komputerze lub telefonie.
            </p>
          </div>
        </div>
      ) : activeTab === "lyrics" ? (
        /* Lyrics View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mini Track Bar in Lyrics View */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 bg-black/20 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={albumArt}
                alt={currentTrack.name}
                className="w-7 h-7 rounded-md object-cover shadow-sm shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-[11px] font-semibold truncate text-white">
                  {currentTrack.name}
                </p>
                <p className="text-[10px] text-white/50 truncate">
                  {currentTrack.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
            </div>
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <LyricsView
              lyrics={lyrics}
              activeLineIndex={activeLineIndex}
              isLoading={isLyricsLoading}
              onSeek={onSeek}
              scrollContainerRef={scrollContainerRef}
              customization={customization}
            />
          </div>
        </div>
      ) : (
        /* Player View */
        <div className="flex-1 flex flex-col justify-between p-5 overflow-hidden">
          {/* Album Artwork & Info */}
          <div className="flex flex-col items-center text-center gap-3 mt-1">
            <div className="relative group/art w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
              {albumArt ? (
                <img
                  src={albumArt}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/art:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-12 h-12 text-white/20" />
                </div>
              )}
            </div>

            <div className="w-full max-w-[280px] space-y-1">
              <h2
                className="text-sm font-bold text-white truncate hover:whitespace-normal transition-all"
                title={currentTrack.name}
              >
                {currentTrack.name}
              </h2>
              <p className="text-xs text-white/60 truncate">
                {currentTrack.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Seekbar */}
          <div className="space-y-1 mt-2">
            <div
              onClick={handleSeekClick}
              className="group/seek relative w-full h-3 flex items-center cursor-pointer select-none"
            >
              <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden group-hover/seek:h-1.5 transition-all">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                  }}
                />
              </div>
              {/* Scrub thumb */}
              <div
                className="absolute w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100 transition-opacity -ml-1 pointer-events-none"
                style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-white/40 font-mono">
              <span>{formatTime(progressMs)}</span>
              <span>{formatTime(durationMs)}</span>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-4 my-1">
            <button
              onClick={onToggleShuffle}
              className="p-2 rounded-full transition relative"
              style={shuffleState ? { color: "var(--accent-color)" } : { color: "rgba(255,255,255,0.4)" }}
              title="Losowo (Shuffle)"
            >
              <Shuffle className="w-4 h-4" />
              {shuffleState && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--accent-color)" }}
                />
              )}
            </button>

            <button
              onClick={onPrev}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90"
              title="Poprzedni utwór"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              style={{
                backgroundColor: "var(--accent-color)",
                boxShadow: "0 10px 25px -5px var(--accent-glow)",
              }}
              className="p-3.5 rounded-full text-black hover:scale-105 active:scale-95 transition shadow-lg"
              title={isPlaying ? "Wstrzymaj" : "Odtwórz"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90"
              title="Następny utwór"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onToggleRepeat}
              className="p-2 rounded-full transition relative"
              style={
                repeatState !== "off"
                  ? { color: "var(--accent-color)" }
                  : { color: "rgba(255,255,255,0.4)" }
              }
              title={`Powtarzanie: ${repeatState}`}
            >
              {repeatState === "track" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatState !== "off" && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--accent-color)" }}
                />
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 px-2 pt-1">
            <button
              onClick={handleVolumeToggle}
              className="p-1 rounded-md text-white/50 hover:text-white transition"
              title={isMuted ? "Włącz dźwięk" : "Wycisz"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setIsMuted(false);
                onVolumeChange(val);
              }}
              style={{ accentColor: "var(--accent-color)" }}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              title={`Głośność: ${volume}%`}
            />
            <span className="text-[10px] text-white/40 w-6 text-right font-mono">
              {isMuted ? 0 : volume}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
