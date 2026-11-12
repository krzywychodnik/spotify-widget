import { useState, useEffect, useMemo, useRef } from "react";
import { fetchLyrics } from "../services/lyricsService";
import { LyricLine, SpotifyTrack } from "../types";

export function useLyrics(currentTrack: SpotifyTrack | null, progressMs: number) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const prevLineIndexRef = useRef<number>(-1);

  // Load lyrics when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      prevLineIndexRef.current = -1;
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    const primaryArtist = currentTrack.artists[0]?.name || "";
    fetchLyrics(
      currentTrack.name,
      primaryArtist,
      currentTrack.album?.name,
      currentTrack.duration_ms,
      currentTrack.id
    )
      .then((fetched) => {
        if (!isCancelled) {
          setLyrics(fetched);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyrics([]);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.id]);

  // Compute active lyric line with exact binary search
  const activeLineIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;

    let low = 0;
    let high = lyrics.length - 1;
    let foundIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lyrics[mid].timeMs <= progressMs) {
        foundIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return foundIndex;
  }, [lyrics, progressMs]);

  // Auto-scroll active line to center
  useEffect(() => {
    if (activeLineIndex < 0 || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const activeEl = container.querySelector(
      `[data-lyric-index="${activeLineIndex}"]`
    ) as HTMLElement;

    if (activeEl) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const relativeTop =
        activeRect.top - containerRect.top + container.scrollTop;
      const targetScroll =
        relativeTop - container.clientHeight / 2 + activeRect.height / 2;

      // If user jumped (seeked) to a far line, use instant scroll
      // Otherwise, use smooth scroll for consecutive line progression
      const prevIdx = prevLineIndexRef.current;
      const isConsecutive = prevIdx >= 0 && Math.abs(activeLineIndex - prevIdx) === 1;

      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: isConsecutive ? "smooth" : "auto",
      });

      prevLineIndexRef.current = activeLineIndex;
    }
  }, [activeLineIndex]);

  return {
    lyrics,
    activeLineIndex,
    isLoading,
    scrollContainerRef,
  };
}
