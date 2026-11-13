import React, { useEffect, useRef } from "react";
import { LyricLine, AppCustomization } from "../types";
import { Music, Loader2 } from "lucide-react";
import { useTranslation } from "../i18n";

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
  const { t } = useTranslation();
  const fontSize = customization?.lyricsFontSize || "medium";
  const lyricStyle = customization?.activeLyricStyle || "spotify-glow";
  const glow = customization?.lyricsGlow !== false;
  const textAlign = customization?.lyricsAlign || "left";
  const prevLineIndexRef = useRef<number>(-1);
  const prevLyricsRef = useRef<LyricLine[]>(lyrics);

  // Auto-scroll active line to center on mount, track change, and line progression
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoading || lyrics.length === 0) return;

    const lyricsChanged = prevLyricsRef.current !== lyrics;
    if (lyricsChanged) {
      prevLyricsRef.current = lyrics;
      prevLineIndexRef.current = -1;
    }

    if (activeLineIndex < 0) {
      if (lyricsChanged) {
        container.scrollTo({ top: 0, behavior: "auto" });
      }
      prevLineIndexRef.current = -1;
      return;
    }

    const activeEl = container.querySelector(
      `[data-lyric-index="${activeLineIndex}"]`
    ) as HTMLElement | null;

    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const relativeTop =
      activeRect.top - containerRect.top + container.scrollTop;
    const targetScroll =
      relativeTop - container.clientHeight / 2 + activeRect.height / 2;

    const prevIdx = prevLineIndexRef.current;
    const isConsecutive =
      !lyricsChanged && prevIdx >= 0 && Math.abs(activeLineIndex - prevIdx) === 1;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: isConsecutive ? "smooth" : "auto",
    });

    prevLineIndexRef.current = activeLineIndex;
  }, [activeLineIndex, lyrics, isLoading, scrollContainerRef]);

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
        <span className="text-xs">{t.lyrics.loadingLyrics}</span>
      </div>
    );
  }

  if (lyrics.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-2 select-none py-8 text-center px-4">
        <Music className="w-7 h-7 text-white/20 mb-1" />
        <span className="text-xs font-medium">{t.lyrics.noLyrics}</span>
        <span className="text-[10px] text-white/30">{t.lyrics.enjoyMusic}</span>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={`w-full h-full overflow-y-auto px-4 py-8 space-y-4 select-none lyrics-scroll-container ${
        textAlign === "center" ? "text-center" : "text-left"
      }`}
    >
      {lyrics.map((line, index) => {
        const isActive = index === activeLineIndex;

        // Custom styling for active lyric line based on user customization
        let activeClasses = "text-white scale-100 opacity-100";
        let activeInlineStyle: React.CSSProperties = {};

        if (isActive) {
          if (lyricStyle === "accent-gradient") {
            activeClasses = "font-extrabold text-[var(--accent-color)] scale-[1.03]";
            activeInlineStyle = {
              filter: glow ? "drop-shadow(0 0 10px var(--accent-glow))" : undefined,
            };
          } else if (lyricStyle === "minimal-line") {
            activeClasses = "font-bold text-white border-l-2 border-[var(--accent-color)] pl-2";
          } else {
            // Default "spotify-glow" style
            activeClasses =
              "font-bold text-white scale-[1.02] border-l-2 border-[var(--accent-color)] pl-2.5";
            activeInlineStyle = {
              textShadow: glow ? "0 0 14px var(--accent-glow)" : undefined,
            };
          }
        }

        return (
          <p
            key={`${line.timeMs}-${index}`}
            data-lyric-index={index}
            onClick={() => onSeek(line.timeMs)}
            style={activeInlineStyle}
            className={`cursor-pointer transition-all duration-300 leading-relaxed ${getFontSizeClasses(
              isActive
            )} ${
              isActive
                ? activeClasses
                : "text-white/40 hover:text-white/80 hover:scale-[1.01]"
            }`}
          >
            {line.text || "♪"}
          </p>
        );
      })}
      <div className="h-24" />
    </div>
  );
};
