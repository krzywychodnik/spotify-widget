import { useState, useEffect, useMemo, useRef } from "react";
import { fetchLyrics } from "../services/lyricsService";
import { LyricLine, SpotifyTrack } from "../types";

export function useLyrics(currentTrack: SpotifyTrack | null, progressMs: number) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Load lyrics when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
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

  return {
    lyrics,
    activeLineIndex,
    isLoading,
    scrollContainerRef,
  };
}
