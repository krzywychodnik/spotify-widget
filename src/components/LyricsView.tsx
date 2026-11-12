import React from "react";
import { LyricLine } from "../types";
import { Mic, Music, Loader2 } from "lucide-react";

interface LyricsViewProps {
  lyrics: LyricLine[];
  activeLineIndex: number;
  isLoading: boolean;
  onSeek: (timeMs: number) => void;
  scrollContainerRef: React.RefObject<any>;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  lyrics,
  activeLineIndex,
  isLoading,
  onSeek,
  scrollContainerRef,
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-2 select-none py-8">
        <Loader2 className="w-5 h-5 animate-spin text-spotify-green" />
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
      className="lyrics-scroll-container w-full h-full overflow-y-auto px-4 py-6 space-y-4 select-none relative scroll-smooth"
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
            className={`lyric-line cursor-pointer py-1 px-2 rounded-lg transition-all duration-300 text-left ${
              isActive
                ? "active text-base sm:text-lg text-white font-bold bg-white/5 pl-3 border-l-2 border-spotify-green shadow-sm"
                : isPast
                ? "text-xs sm:text-sm text-white/30 font-medium hover:text-white/60 hover:bg-white/[0.02]"
                : "text-xs sm:text-sm text-white/50 font-medium hover:text-white/80 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="leading-snug tracking-wide">{line.text}</span>
              {isActive && (
                <Mic className="w-3.5 h-3.5 text-spotify-green shrink-0 animate-pulse" />
              )}
            </div>
          </div>
        );
      })}
      <div className="h-16" /> {/* Bottom spacing so bottom lyrics can center */}
    </div>
  );
};
