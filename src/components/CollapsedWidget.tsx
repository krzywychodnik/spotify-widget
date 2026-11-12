import React from "react";
import { Play, Pause, SkipForward, SkipBack, Music2 } from "lucide-react";
import { SpotifyTrack, AppCustomization } from "../types";

interface CollapsedWidgetProps {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExpand: () => void;
  progressPercent: number;
  customization?: AppCustomization;
}

export const CollapsedWidget: React.FC<CollapsedWidgetProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onExpand,
  progressPercent,
  customization,
}) => {
  const albumArt = currentTrack?.album?.images?.[0]?.url;
  const isVinyl = !!customization?.albumArtSpin;
  const controlsMode = customization?.collapsedControls || "hover";
  const progressStyle = customization?.collapsedProgressStyle || "radial";
  const shape = customization?.collapsedShape || "rounded-square";

  const getShapeClasses = () => {
    switch (shape) {
      case "circle":
        return {
          wrapper: "rounded-full",
          inner: "rounded-full",
        };
      case "capsule":
        return {
          wrapper: "rounded-[26px]",
          inner: isVinyl ? "rounded-full" : "rounded-[22px]",
        };
      case "rounded-square":
      default:
        return {
          wrapper: "rounded-2xl",
          inner: isVinyl ? "rounded-full" : "rounded-xl",
        };
    }
  };

  const shapeClasses = getShapeClasses();

  const handleWidgetClick = () => {
    // Expand when clicking anywhere on the collapsed widget (unless clicking a control button)
    onExpand();
  };

  return (
    <div
      data-tauri-drag-region
      onClick={handleWidgetClick}
      className={`group relative w-full h-full p-1.5 flex items-center justify-center cursor-pointer select-none transition-all duration-300 glass-panel-collapsed overflow-hidden shadow-2xl ${shapeClasses.wrapper}`}
    >
      {/* 1. Radial progress border around album art */}
      {progressStyle === "radial" && (
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
      )}

      {/* 2. Bottom linear progress bar */}
      {progressStyle === "bar" && (
        <div className="absolute bottom-1 left-2.5 right-2.5 h-1 bg-white/15 rounded-full overflow-hidden z-20 pointer-events-none">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: "var(--accent-color)",
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            }}
          />
        </div>
      )}

      {/* Album Artwork or Vinyl Disc */}
      <div
        className={`relative w-16 h-16 overflow-hidden shadow-md flex items-center justify-center bg-zinc-950 border border-white/10 z-10 ${
          shapeClasses.inner
        } ${isVinyl && isPlaying ? "animate-vinyl-spin" : ""}`}
      >
        {albumArt ? (
          <img
            src={albumArt}
            alt="Album cover"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isPlaying && !isVinyl ? "scale-105" : "scale-100 opacity-90"
            }`}
          />
        ) : (
          <Music2 className="w-7 h-7 text-white/30 animate-pulse" />
        )}

        {/* Vinyl center pin */}
        {isVinyl && (
          <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-zinc-950 border border-white/40 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/60" />
          </div>
        )}

        {/* Miniature Controls overlay based on collapsedControls setting */}
        {controlsMode !== "none" && (
          <div
            className={`absolute inset-0 bg-black/60 transition-opacity duration-200 flex items-center justify-center gap-1 backdrop-blur-sm ${
              controlsMode === "always" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition active:scale-90"
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
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition active:scale-90"
              title="Następny"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
