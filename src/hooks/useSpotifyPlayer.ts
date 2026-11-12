import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchPlaybackState,
  spotifyPlay,
  spotifyPause,
  spotifyNext,
  spotifyPrevious,
  spotifySeek,
  spotifySetVolume,
  spotifySetShuffle,
  spotifySetRepeat,
} from "../services/spotifyApi";
import { SpotifyPlaybackState } from "../types";

export function useSpotifyPlayer(isAuthenticated: boolean) {
  const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState | null>(null);
  const [smoothProgressMs, setSmoothProgressMs] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);

  const baseProgressRef = useRef<number>(0);
  const lastSyncTimeRef = useRef<number>(performance.now());
  const isPlayingRef = useRef<boolean>(false);
  const durationRef = useRef<number>(0);

  // Seeking protection against stale Spotify API polling responses
  const lastSeekTimestampRef = useRef<number>(0);
  const expectedSeekPosRef = useRef<number>(0);

  // Sync state from Spotify API
  const refreshState = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const state = await fetchPlaybackState();
      if (state) {
        const now = performance.now();
        const elapsedSinceSeek = now - lastSeekTimestampRef.current;

        // If a seek happened within the last 2500ms, prevent stale progress rollback
        if (elapsedSinceSeek < 2500) {
          const expectedProgress =
            expectedSeekPosRef.current +
            (isPlayingRef.current ? elapsedSinceSeek : 0);
          const discrepancy = Math.abs((state.progress_ms || 0) - expectedProgress);

          if (discrepancy > 2500) {
            // Stale poll detected! Update metadata but keep the seeked progress
            isPlayingRef.current = state.is_playing;
            durationRef.current = state.item?.duration_ms || 0;
            if (state.device) setVolume(state.device.volume_percent);
            setPlaybackState((prev) =>
              prev
                ? {
                    ...prev,
                    is_playing: state.is_playing,
                    item: state.item,
                    device: state.device,
                    repeat_state: state.repeat_state,
                    shuffle_state: state.shuffle_state,
                  }
                : state
            );
            return;
          }
        }

        // Fresh synced response
        setPlaybackState(state);
        baseProgressRef.current = state.progress_ms || 0;
        lastSyncTimeRef.current = performance.now();
        isPlayingRef.current = state.is_playing;
        durationRef.current = state.item?.duration_ms || 0;
        setSmoothProgressMs(state.progress_ms || 0);
        if (state.device) {
          setVolume(state.device.volume_percent);
        }
      } else {
        // No active playback
        setPlaybackState(null);
      }
    } catch (err) {
      console.warn("Failed to refresh playback state:", err);
    }
  }, [isAuthenticated]);

  // Polling loop
  useEffect(() => {
    if (!isAuthenticated) return;

    refreshState();
    const interval = setInterval(refreshState, 1500);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshState]);

  // Smooth progress ticker
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isPlayingRef.current && durationRef.current > 0) {
        const elapsed = performance.now() - lastSyncTimeRef.current;
        const current = Math.min(
          baseProgressRef.current + elapsed,
          durationRef.current
        );
        setSmoothProgressMs(current);
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Controls
  const togglePlayPause = useCallback(async () => {
    if (!playbackState) return;
    const currentlyPlaying = playbackState.is_playing;

    // Optimistic update
    isPlayingRef.current = !currentlyPlaying;
    lastSyncTimeRef.current = performance.now();
    setPlaybackState((prev) =>
      prev ? { ...prev, is_playing: !currentlyPlaying } : null
    );

    try {
      if (currentlyPlaying) {
        await spotifyPause();
      } else {
        await spotifyPlay();
      }
      setTimeout(refreshState, 350);
    } catch (err) {
      console.error("Play/Pause failed:", err);
      refreshState();
    }
  }, [playbackState, refreshState]);

  const nextTrack = useCallback(async () => {
    setIsUpdating(true);
    try {
      await spotifyNext();
      setTimeout(refreshState, 400);
    } catch (err) {
      console.error("Next track failed:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [refreshState]);

  const prevTrack = useCallback(async () => {
    setIsUpdating(true);
    try {
      await spotifyPrevious();
      setTimeout(refreshState, 400);
    } catch (err) {
      console.error("Prev track failed:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [refreshState]);

  const seek = useCallback(
    async (targetMs: number) => {
      const now = performance.now();
      const clamped = Math.max(
        0,
        Math.min(targetMs, durationRef.current || targetMs)
      );

      // Lock expected position to prevent stale poll rollbacks
      lastSeekTimestampRef.current = now;
      expectedSeekPosRef.current = clamped;
      baseProgressRef.current = clamped;
      lastSyncTimeRef.current = now;
      setSmoothProgressMs(clamped);

      try {
        await spotifySeek(clamped);
        // Refresh with a short delay to verify
        setTimeout(refreshState, 500);
      } catch (err) {
        console.error("Seek failed:", err);
      }
    },
    [refreshState]
  );

  const changeVolume = useCallback(async (newVol: number) => {
    setVolume(newVol);
    try {
      await spotifySetVolume(newVol);
    } catch (err) {
      console.error("Volume change failed:", err);
    }
  }, []);

  const toggleShuffle = useCallback(async () => {
    if (!playbackState) return;
    const nextState = !playbackState.shuffle_state;
    setPlaybackState((prev) =>
      prev ? { ...prev, shuffle_state: nextState } : null
    );
    try {
      await spotifySetShuffle(nextState);
    } catch (err) {
      console.error("Toggle shuffle failed:", err);
      refreshState();
    }
  }, [playbackState, refreshState]);

  const toggleRepeat = useCallback(async () => {
    if (!playbackState) return;
    const states: ("off" | "context" | "track")[] = ["off", "context", "track"];
    const currentIdx = states.indexOf(playbackState.repeat_state);
    const nextState = states[(currentIdx + 1) % states.length];
    setPlaybackState((prev) =>
      prev ? { ...prev, repeat_state: nextState } : null
    );
    try {
      await spotifySetRepeat(nextState);
    } catch (err) {
      console.error("Toggle repeat failed:", err);
      refreshState();
    }
  }, [playbackState, refreshState]);

  return {
    playbackState,
    currentTrack: playbackState?.item || null,
    isPlaying: playbackState?.is_playing || false,
    smoothProgressMs,
    durationMs: playbackState?.item?.duration_ms || 0,
    volume,
    shuffleState: playbackState?.shuffle_state || false,
    repeatState: playbackState?.repeat_state || "off",
    isUpdating,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
    refreshState,
  };
}
