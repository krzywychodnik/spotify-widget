import { useState, useEffect, useCallback } from "react";
import { AppCustomization } from "../types";

export const DEFAULT_CUSTOMIZATION: AppCustomization = {
  collapseDirection: "top-right",
  collapseDelayMs: 450,
  animationType: "spring",
  animationSpeedMs: 420,
  
  // Background & Media
  bgType: "preset",
  bgTheme: "glass",
  customBgUrl: "",
  customBgDim: 50,
  customBgBlur: 4,
  bgBlur: 36,
  bgOpacity: 88,
  borderStyle: "glow",
  collapsedShape: "rounded-square",
  
  // Colors & Accent
  accentColor: "#1DB954",
  
  // Music & Album Art
  albumArtSpin: false,
  albumArtGlow: true,
  albumArtRadius: "rounded",
  showVisualizer: true,
  
  // Typography
  fontFamily: "sans",
  
  // Lyrics
  lyricsFontSize: "medium",
  lyricsAlign: "left",
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

    // Font family mapping
    if (customization.fontFamily === "mono") {
      root.style.fontFamily = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
    } else if (customization.fontFamily === "display") {
      root.style.fontFamily = '"Outfit", "Cabinet Grotesk", system-ui, sans-serif';
    } else {
      root.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }

    // Set dataset attributes for theme and collapse direction styling
    root.dataset.theme = customization.bgTheme;
    root.dataset.bgType = customization.bgType;
    root.dataset.direction = customization.collapseDirection;
    root.dataset.anim = customization.animationType;
    root.dataset.shape = customization.collapsedShape;
    root.dataset.border = customization.borderStyle;
  }, [customization]);

  return {
    customization,
    updateCustomization,
    resetToDefaults,
  };
}
