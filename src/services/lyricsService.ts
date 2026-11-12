import { LyricLine, LRCLibResponse } from "../types";

const LRCLIB_BASE = "https://lrclib.net/api";

const lyricsCache = new Map<string, LyricLine[]>();

// Enhanced LRC parser supporting multiple timestamps, offsets, and varied millisecond formats
export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split("\n");
  const result: LyricLine[] = [];

  // Check for [offset: +/- ms]
  let offsetMs = 0;
  const offsetMatch = lrcText.match(/\[offset:\s*([+-]?\d+)\]/i);
  if (offsetMatch) {
    offsetMs = parseInt(offsetMatch[1], 10) || 0;
  }

  // Regex matching timestamp tags like [01:23.45], [01:23.456], [01:23], [01:23:45]
  const tagRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Ignore metadata tags like [ar:...], [ti:...], [al:...], [length:...]
    if (/^\[(ti|ar|al|au|by|length|offset|re|ve):/i.test(trimmed)) {
      continue;
    }

    const matches = Array.from(trimmed.matchAll(tagRegex));
    if (matches.length > 0) {
      // Clean text by stripping all timestamp brackets
      const cleanText = trimmed.replace(tagRegex, "").trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        let ms = 0;
        if (match[3]) {
          if (match[3].length === 1) {
            ms = parseInt(match[3], 10) * 100;
          } else if (match[3].length === 2) {
            ms = parseInt(match[3], 10) * 10;
          } else {
            ms = parseInt(match[3].slice(0, 3), 10);
          }
        }

        const calculatedTimeMs = Math.max(
          0,
          minutes * 60 * 1000 + seconds * 1000 + ms + offsetMs
        );

        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        result.push({
          timeMs: calculatedTimeMs,
          timeStr: `${pad(minutes)}:${pad(seconds)}`,
          text: cleanText || "♪",
        });
      }
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.timeMs - b.timeMs);
}

// Fallback parse plain text without timestamps
export function parsePlainLyrics(plain: string, durationMs: number): LyricLine[] {
  const lines = plain.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const interval = durationMs / lines.length;
  return lines.map((text, idx) => ({
    timeMs: Math.floor(idx * interval),
    timeStr: "--:--",
    text,
  }));
}

export async function fetchLyrics(
  trackName: string,
  artistName: string,
  albumName?: string,
  durationMs?: number,
  trackId?: string
): Promise<LyricLine[]> {
  const cacheKey = trackId || `${trackName}-${artistName}`;
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  const durationSec = durationMs ? Math.round(durationMs / 1000) : undefined;

  try {
    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });
    if (albumName) params.append("album_name", albumName);
    if (durationSec) params.append("duration", durationSec.toString());

    // 1. Try exact get endpoint
    const getRes = await fetch(`${LRCLIB_BASE}/get?${params.toString()}`);
    if (getRes.ok) {
      const data: LRCLibResponse = await getRes.json();
      if (data.syncedLyrics) {
        const parsed = parseLrc(data.syncedLyrics);
        if (parsed.length > 0) {
          lyricsCache.set(cacheKey, parsed);
          return parsed;
        }
      }
      if (data.plainLyrics && durationMs) {
        const parsed = parsePlainLyrics(data.plainLyrics, durationMs);
        lyricsCache.set(cacheKey, parsed);
        return parsed;
      }
    }

    // 2. Try search endpoint as fallback
    const searchRes = await fetch(
      `${LRCLIB_BASE}/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}`
    );
    if (searchRes.ok) {
      const results: LRCLibResponse[] = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const best = results.find((r) => !!r.syncedLyrics) || results[0];
        if (best.syncedLyrics) {
          const parsed = parseLrc(best.syncedLyrics);
          if (parsed.length > 0) {
            lyricsCache.set(cacheKey, parsed);
            return parsed;
          }
        }
        if (best.plainLyrics && durationMs) {
          const parsed = parsePlainLyrics(best.plainLyrics, durationMs);
          lyricsCache.set(cacheKey, parsed);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Error fetching lyrics from LRCLIB:", err);
  }

  return [];
}
