import { useState, useEffect, useCallback } from "react";
import { AppCustomization } from "../types";

export const DEFAULT_CUSTOMIZATION: AppCustomization = {
  // Positioning & Interaction
  collapseDirection: "top-right",
  collapseDelayMs: 450,
  expandTrigger: "hover",
  
  // Animation
  animationType: "spring",
  animationSpeedMs: 420,
  
  // Appearance & Colors
  accentColor: "#1DB954",
  bgTheme: "glass",
  activeGif: "lofi-hiphop-1",
  bgBlur: 36,
  bgOpacity: 88,
  collapsedShape: "rounded-square",
  
  // Collapsed Widget
  collapsedControls: "hover",
  collapsedProgressStyle: "radial",
  
  // Player & Effects
  albumArtSpin: false,
  albumArtGlow: true,
  showVisualizer: true,
  
  // Lyrics
  lyricsFontSize: "medium",
  lyricsGlow: true,
  activeLyricStyle: "spotify-glow",
};

const STORAGE_KEY = "spotify_widget_customization";

export function useCustomization() {
  const [customization, setCustomizationState] = useState<AppCustomization>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to read customization from localStorage", e);
    }
    return DEFAULT_CUSTOMIZATION;
  });

  const updateCustomization = useCallback((updates: Partial<AppCustomization>) => {
    setCustomizationState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save customization to localStorage", e);
      }
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setCustomizationState(DEFAULT_CUSTOMIZATION);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMIZATION));
    } catch (e) {
      console.warn("Failed to reset customization", e);
    }
  }, []);

  // Synchronize CSS custom properties with the document root
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--accent-color", customization.accentColor);
    root.style.setProperty("--accent-glow", `${customization.accentColor}66`);
    root.style.setProperty("--anim-duration", `${customization.animationSpeedMs}ms`);
    root.style.setProperty("--bg-blur", `${customization.bgBlur}px`);
    root.style.setProperty("--bg-opacity", `${customization.bgOpacity / 100}`);

    // Set dataset attributes for theme and collapse direction styling
    root.dataset.theme = customization.bgTheme;
    root.dataset.direction = customization.collapseDirection;
    root.dataset.anim = customization.animationType;
    root.dataset.shape = customization.collapsedShape;
  }, [customization]);

  return {
    customization,
    updateCustomization,
    resetToDefaults,
  };
}
