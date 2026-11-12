import React from "react";
import { Play, Pause, SkipForward, SkipBack, Music2 } from "lucide-react";
import { SpotifyTrack } from "../types";

interface CollapsedWidgetProps {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progressPercent: number;
}

export const CollapsedWidget: React.FC<CollapsedWidgetProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  progressPercent,
}) => {
  const albumArt = currentTrack?.album?.images?.[0]?.url;

  return (
    <div
      data-tauri-drag-region
      className="group relative w-full h-full rounded-2xl p-1.5 flex items-center justify-center cursor-pointer select-none transition-all duration-300 glass-panel-collapsed overflow-hidden shadow-2xl"
    >
      {/* Radial progress border around album art */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
        <circle
          cx="50%"
          cy="50%"
          r="42%"
          className="stroke-white/10"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="50%"
          cy="50%"
          r="42%"
          className="stroke-spotify-green transition-all duration-300"
          strokeWidth="2.5"
          strokeDasharray="260"
          strokeDashoffset={260 - (260 * Math.max(0, Math.min(100, progressPercent))) / 100}
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Album Artwork or Spotify placeholder */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-zinc-900 border border-white/10">
        {albumArt ? (
          <img
            src={albumArt}
            alt={currentTrack?.name || "Album cover"}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isPlaying ? "scale-105" : "scale-100 opacity-80"
            }`}
          />
        ) : (
          <Music2 className="w-7 h-7 text-spotify-muted animate-pulse" />
        )}

        {/* Hover overlay with miniature controls */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
            title="Poprzedni"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="p-1.5 rounded-full bg-spotify-green text-black hover:scale-110 active:scale-95 transition shadow-lg"
            title={isPlaying ? "Wstrzymaj" : "Odtwórz"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
            title="Następny"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
