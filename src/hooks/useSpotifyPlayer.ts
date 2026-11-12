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

  // Sync state from Spotify API
  const refreshState = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const state = await fetchPlaybackState();
      if (state) {
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
        const current = Math.min(baseProgressRef.current + elapsed, durationRef.current);
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
    setPlaybackState(prev => (prev ? { ...prev, is_playing: !currentlyPlaying } : null));

    try {
      if (currentlyPlaying) {
        await spotifyPause();
      } else {
        await spotifyPlay();
      }
      setTimeout(refreshState, 300);
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
      baseProgressRef.current = targetMs;
      lastSyncTimeRef.current = performance.now();
      setSmoothProgressMs(targetMs);

      try {
        await spotifySeek(targetMs);
      } catch (err) {
        console.error("Seek failed:", err);
      }
    },
    []
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
    setPlaybackState(prev => (prev ? { ...prev, shuffle_state: nextState } : null));
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
    setPlaybackState(prev => (prev ? { ...prev, repeat_state: nextState } : null));
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
