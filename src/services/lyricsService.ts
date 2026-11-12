import { LyricLine, LRCLibResponse } from "../types";

const LRCLIB_BASE = "https://lrclib.net/api";

const lyricsCache = new Map<string, LyricLine[]>();

// Parse LRC timestamp like [01:23.45] or [00:12.345] into milliseconds
export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split("\n");
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const match = trimmed.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let msPart = match[3];
      if (msPart.length === 2) {
        msPart = msPart + "0"; // e.g. .45 -> 450ms
      }
      const milliseconds = parseInt(msPart, 10);
      const timeMs = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
      const text = match[4].trim();

      result.push({
        timeMs,
        timeStr: `${match[1]}:${match[2]}`,
        text: text || "♪",
      });
    }
  }

  return result.sort((a, b) => a.timeMs - b.timeMs);
}

// Fallback parse plain text without timestamps
export function parsePlainLyrics(plain: string, durationMs: number): LyricLine[] {
  const lines = plain.split("\n").map(l => l.trim()).filter(Boolean);
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
        lyricsCache.set(cacheKey, parsed);
        return parsed;
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
        // Find best match with synced lyrics
        const best = results.find(r => !!r.syncedLyrics) || results[0];
        if (best.syncedLyrics) {
          const parsed = parseLrc(best.syncedLyrics);
          lyricsCache.set(cacheKey, parsed);
          return parsed;
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
