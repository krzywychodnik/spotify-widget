import React from "react";
import { Play, Pause, SkipForward, SkipBack, Music2 } from "lucide-react";
import { SpotifyTrack, CollapsedShape, AppCustomization } from "../types";
import { DynamicBackground } from "./DynamicBackground";

interface CollapsedWidgetProps {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progressPercent: number;
  collapsedShape?: CollapsedShape;
  customization?: AppCustomization;
}

export const CollapsedWidget: React.FC<CollapsedWidgetProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  progressPercent,
  collapsedShape = "rounded-square",
  customization,
}) => {
  const albumArt = currentTrack?.album?.images?.[0]?.url;

  const getShapeClasses = () => {
    switch (collapsedShape) {
      case "circle":
        return {
          wrapper: "rounded-full",
          inner: "rounded-full",
        };
      case "capsule":
        return {
          wrapper: "rounded-[26px]",
          inner: "rounded-[22px]",
        };
      case "rounded-square":
      default:
        return {
          wrapper: "rounded-2xl",
          inner: "rounded-xl",
        };
    }
  };

  const shape = getShapeClasses();

  return (
    <div
      data-tauri-drag-region
      className={`group relative w-full h-full p-1.5 flex items-center justify-center cursor-pointer select-none transition-all duration-300 glass-panel-collapsed overflow-hidden shadow-2xl ${shape.wrapper}`}
    >
      {/* Background Media */}
      {customization && (
        <DynamicBackground customization={customization} isPlaying={isPlaying} />
      )}

      {/* Radial progress border around album art */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5 z-10">
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
          stroke="var(--accent-color)"
          className="transition-all duration-300"
          strokeWidth="2.5"
          strokeDasharray="260"
          strokeDashoffset={260 - (260 * Math.max(0, Math.min(100, progressPercent))) / 100}
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Album Artwork or placeholder */}
      <div
        className={`relative w-16 h-16 overflow-hidden shadow-md flex items-center justify-center bg-zinc-900 border border-white/10 z-10 ${shape.inner}`}
      >
        {albumArt ? (
          <img
            src={albumArt}
            alt={currentTrack?.name || "Album cover"}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              customization?.albumArtSpin && isPlaying
                ? "animate-vinyl-spin"
                : isPlaying
                ? "scale-105"
                : "scale-100 opacity-80"
            }`}
          />
        ) : (
          <Music2 className="w-7 h-7 text-white/30 animate-pulse" />
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
            style={{ backgroundColor: "var(--accent-color)" }}
            className="p-1.5 rounded-full text-black hover:scale-110 active:scale-95 transition shadow-lg"
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
