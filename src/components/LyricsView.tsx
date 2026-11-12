import React from "react";
import { LyricLine, AppCustomization } from "../types";
import { Mic, Music, Loader2 } from "lucide-react";

interface LyricsViewProps {
  lyrics: LyricLine[];
  activeLineIndex: number;
  isLoading: boolean;
  onSeek: (timeMs: number) => void;
  scrollContainerRef: React.RefObject<any>;
  customization?: AppCustomization;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  lyrics,
  activeLineIndex,
  isLoading,
  onSeek,
  scrollContainerRef,
  customization,
}) => {
  const fontSize = customization?.lyricsFontSize || "medium";
  const lyricStyle = customization?.activeLyricStyle || "spotify-glow";
  const glow = customization?.lyricsGlow !== false;
  const textAlign = customization?.lyricsAlign || "left";

  const getFontSizeClasses = (isActive: boolean) => {
    switch (fontSize) {
      case "small":
        return isActive ? "text-sm font-bold" : "text-xs font-medium";
      case "large":
        return isActive ? "text-lg font-bold" : "text-base font-medium";
      case "medium":
      default:
        return isActive ? "text-base font-bold" : "text-sm font-medium";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-2 select-none py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-color)]" />
        <span className="text-xs">Ładowanie tekstu z LRCLIB...</span>
      </div>
    );
  }

  if (lyrics.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-2 select-none py-8 text-center px-4">
        <Music className="w-7 h-7 text-white/20 mb-1" />
        <span className="text-xs font-medium">Brak zsynchronizowanego tekstu utworu</span>
        <span className="text-[10px] text-white/30">Ciesz się muzyką ♪</span>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="lyrics-scroll-container w-full h-full overflow-y-auto px-4 py-6 space-y-4 select-none relative scroll-smooth z-10"
    >
      <div className="h-10" /> {/* Top spacing so top lyrics can center */}
      {lyrics.map((line, index) => {
        const isActive = index === activeLineIndex;
        const isPast = index < activeLineIndex;

        return (
          <div
            key={`${line.timeMs}-${index}`}
            data-lyric-index={index}
            onClick={() => onSeek(line.timeMs)}
            className={`lyric-line cursor-pointer py-1.5 px-3 rounded-xl transition-all duration-300 ${
              textAlign === "center" ? "text-center" : "text-left"
            } ${getFontSizeClasses(isActive)} ${
              isActive
                ? `active style-${lyricStyle} bg-white/10 ${
                    textAlign === "left" ? "pl-3.5 border-l-2 border-[var(--accent-color)]" : ""
                  } ${glow ? "shadow-sm" : ""}`
                : isPast
                ? "inactive text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                : "inactive text-white/55 hover:text-white/80 hover:bg-white/[0.03]"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                textAlign === "center" ? "justify-center" : "justify-between"
              }`}
            >
              <span className="leading-snug tracking-wide">{line.text}</span>
              {isActive && (
                <Mic className="w-3.5 h-3.5 text-[var(--accent-color)] shrink-0 animate-pulse" />
              )}
            </div>
          </div>
        );
      })}
      <div className="h-16" /> {/* Bottom spacing so bottom lyrics can center */}
    </div>
  );
};
