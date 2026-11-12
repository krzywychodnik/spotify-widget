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
  
  // Appearance & Colors (Author's Favorite Mocha Theme by default)
  accentColor: "#6F4A16",
  bgTheme: "glass",
  activeGif: "lofi-hiphop-1",
  bgBlur: 24,
  bgOpacity: 88,
  collapsedShape: "circle",
  
  // Collapsed Widget
  collapsedControls: "hover",
  collapsedProgressStyle: "radial",
  
  // Player & Effects
  albumArtSpin: true,
  albumArtGlow: true,
  showVisualizer: true,
  
  // Lyrics
  lyricsFontSize: "medium",
  lyricsGlow: true,
  activeLyricStyle: "accent-gradient",
};

const STORAGE_KEY = "spotify_widget_customization";
const VERSION_KEY = "spotify_widget_customization_v";
const CURRENT_VERSION = 3;

export function useCustomization() {
  const [customization, setCustomizationState] = useState<AppCustomization>(() => {
    try {
      const savedVersion = Number(localStorage.getItem(VERSION_KEY) || 0);
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        // Migrate legacy green default to author's mocha brown (#6F4A16)
        if (savedVersion < CURRENT_VERSION) {
          if (!parsed.accentColor || parsed.accentColor.toLowerCase() === "#1db954") {
            parsed.accentColor = "#6F4A16";
          }
          if (!parsed.collapsedShape || parsed.collapsedShape === "rounded-square") {
            parsed.collapsedShape = "circle";
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
        }

        return { ...DEFAULT_CUSTOMIZATION, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to read customization from localStorage", e);
    }

    try {
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    } catch {}

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
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
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
