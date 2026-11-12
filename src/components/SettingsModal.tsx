import React, { useState } from "react";
import {
  X,
  Key,
  LogOut,
  ExternalLink,
  Check,
  Copy,
  AlertCircle,
  Palette,
  Sliders,
  RotateCcw,
  SlidersHorizontal,
  Wand2,
  Star,
  Languages,
} from "lucide-react";
import { REDIRECT_URI } from "../services/spotifyAuth";
import {
  AppCustomization,
  CollapseDirection,
  AnimationType,
  BackgroundTheme,
  CollapsedShape,
  CollapsedControlsMode,
  CollapsedProgressStyle,
  PRESET_GIFS,
} from "../types";
import { useTranslation } from "../i18n";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSaveClientId: (id: string) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onManualCallback: (code: string, state: string) => void;
  authError: string | null;
  customization: AppCustomization;
  onUpdateCustomization: (updates: Partial<AppCustomization>) => void;
  onResetCustomization: () => void;
}

interface ThemePresetConfig {
  id: string;
  accentColor: string;
  isAuthorFav?: boolean;
  settings: Partial<AppCustomization>;
}

const THEME_PRESET_CONFIGS: ThemePresetConfig[] = [
  {
    id: "author-mocha",
    accentColor: "#6F4A16",
    isAuthorFav: true,
    settings: {
      accentColor: "#6F4A16",
      bgTheme: "glass",
      bgOpacity: 88,
      bgBlur: 24,
      collapsedShape: "circle",
      animationType: "spring",
      albumArtSpin: true,
      albumArtGlow: true,
      showVisualizer: true,
      activeLyricStyle: "accent-gradient",
    },
  },
  {
    id: "spotify-classic",
    accentColor: "#1DB954",
    settings: {
      accentColor: "#1DB954",
      bgTheme: "oled",
      bgOpacity: 96,
      bgBlur: 10,
      collapsedShape: "rounded-square",
      animationType: "fade-zoom",
      albumArtSpin: false,
      albumArtGlow: true,
      showVisualizer: true,
      activeLyricStyle: "spotify-glow",
    },
  },
  {
    id: "cyber-neon",
    accentColor: "#A855F7",
    settings: {
      accentColor: "#A855F7",
      bgTheme: "aurora",
      bgOpacity: 80,
      bgBlur: 20,
      collapsedShape: "rounded-square",
      animationType: "elastic",
      albumArtSpin: true,
      albumArtGlow: true,
      showVisualizer: true,
      activeLyricStyle: "accent-gradient",
    },
  },
  {
    id: "aqua-frost",
    accentColor: "#06B6D4",
    settings: {
      accentColor: "#06B6D4",
      bgTheme: "frosted",
      bgOpacity: 75,
      bgBlur: 28,
      collapsedShape: "capsule",
      animationType: "slide",
      albumArtSpin: false,
      albumArtGlow: true,
      showVisualizer: true,
      activeLyricStyle: "spotify-glow",
    },
  },
  {
    id: "sunset-amber",
    accentColor: "#F59E0B",
    settings: {
      accentColor: "#F59E0B",
      bgTheme: "particles",
      bgOpacity: 85,
      bgBlur: 25,
      collapsedShape: "circle",
      animationType: "fold",
      albumArtSpin: true,
      albumArtGlow: true,
      showVisualizer: true,
      activeLyricStyle: "accent-gradient",
    },
  },
  {
    id: "sakura-lofi",
    accentColor: "#F43F5E",
    settings: {
      accentColor: "#F43F5E",
      bgTheme: "gif",
      activeGif: "lofi-girl-4",
      bgOpacity: 85,
      bgBlur: 8,
      collapsedShape: "rounded-square",
      animationType: "fade-zoom",
      albumArtSpin: true,
      albumArtGlow: true,
      showVisualizer: true,
      activeLyricStyle: "spotify-glow",
    },
  },
];

const COLOR_PRESETS = [
  {
    name: "Author's Favorite (#6F4A16)",
    color: "#6F4A16",
    isAuthorFav: true,
  },
  { name: "Spotify Green", color: "#1DB954" },
  { name: "Cyber Violet", color: "#A855F7" },
  { name: "Neon Cyan", color: "#06B6D4" },
  { name: "Crimson Rose", color: "#F43F5E" },
  { name: "Sunset Amber", color: "#F59E0B" },
  { name: "Arctic White", color: "#FFFFFF" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onSaveClientId,
  isAuthenticated,
  onLogin,
  onLogout,
  onManualCallback,
  authError,
  customization,
  onUpdateCustomization,
  onResetCustomization,
}) => {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const [activeTab, setActiveTab] = useState<"appearance" | "interaction" | "spotify">("appearance");
  const [inputClientId, setInputClientId] = useState(clientId);
  const [manualCode, setManualCode] = useState("");
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  if (!isOpen) return null;

  const handleSaveClientId = () => {
    onSaveClientId(inputClientId);
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(REDIRECT_URI);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleProcessManualCode = () => {
    const trimmed = manualCode.trim();
    if (!trimmed) return;

    try {
      if (trimmed.includes("code=")) {
        const url = new URL(trimmed.startsWith("http") ? trimmed : `http://dummy.com?${trimmed}`);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state") || "";
        if (code) {
          onManualCallback(code, state);
          setManualCode("");
          return;
        }
      }
    } catch {
      // not a url
    }

    onManualCallback(trimmed, "");
    setManualCode("");
  };

  const getPresetLabels = (id: string) => {
    switch (id) {
      case "author-mocha":
        return {
          name: t.settings.presets.authorMocha,
          desc: t.settings.presets.authorMochaDesc,
          badge: t.settings.presets.authorBadge,
        };
      case "spotify-classic":
        return {
          name: t.settings.presets.spotifyClassic,
          desc: t.settings.presets.spotifyClassicDesc,
          badge: t.settings.presets.classicBadge,
        };
      case "cyber-neon":
        return {
          name: t.settings.presets.cyberNeon,
          desc: t.settings.presets.cyberNeonDesc,
          badge: t.settings.presets.cyberBadge,
        };
      case "aqua-frost":
        return {
          name: t.settings.presets.aquaFrost,
          desc: t.settings.presets.aquaFrostDesc,
          badge: t.settings.presets.minimalBadge,
        };
      case "sunset-amber":
        return {
          name: t.settings.presets.sunsetAmber,
          desc: t.settings.presets.sunsetAmberDesc,
          badge: t.settings.presets.warmBadge,
        };
      case "sakura-lofi":
      default:
        return {
          name: t.settings.presets.lofiSakura,
          desc: t.settings.presets.lofiSakuraDesc,
          badge: t.settings.presets.lofiBadge,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-[94%] sm:max-w-[430px] max-h-[92%] sm:max-h-[560px] h-full sm:h-auto rounded-2xl glass-panel p-3.5 sm:p-4 text-white shadow-2xl border border-white/10 flex flex-col gap-3 overflow-hidden">
        {/* Header with Language Selector & Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: "var(--accent-color)" }} />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.settings.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px]">
              <Languages className="w-3 h-3 text-white/50 ml-1" />
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-1.5 py-0.5 rounded font-semibold transition ${
                    language === l.code
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/40 hover:text-white/80"
                  }`}
                  title={l.name}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
              title={t.common.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition flex items-center justify-center gap-1.5 truncate ${
              activeTab === "appearance"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Palette className="w-3 h-3 shrink-0" style={activeTab === "appearance" ? { color: "var(--accent-color)" } : {}} />
            <span>{t.settings.tabs.appearance}</span>
          </button>
          <button
            onClick={() => setActiveTab("interaction")}
            className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition flex items-center justify-center gap-1.5 truncate ${
              activeTab === "interaction"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 shrink-0" style={activeTab === "interaction" ? { color: "var(--accent-color)" } : {}} />
            <span>{t.settings.tabs.interaction}</span>
          </button>
          <button
            onClick={() => setActiveTab("spotify")}
            className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition flex items-center justify-center gap-1.5 truncate ${
              activeTab === "spotify"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Key className="w-3 h-3 shrink-0" style={activeTab === "spotify" ? { color: "var(--accent-color)" } : {}} />
            <span>{t.settings.tabs.spotify}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-1.5 lyrics-scroll-container">
          {/* TAB 1: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-4 text-xs">
              {/* 1. CURATED THEME PRESETS */}
              <div className="space-y-2 bg-black/25 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <label className="text-[11px] font-bold text-white tracking-wide">
                      {t.settings.presets.title}
                    </label>
                  </div>
                  <span className="text-[10px] text-white/40">{t.settings.presets.oneClick}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {THEME_PRESET_CONFIGS.map((preset) => {
                    const isSelected =
                      customization.accentColor.toLowerCase() === preset.settings.accentColor?.toLowerCase() &&
                      customization.bgTheme === preset.settings.bgTheme;
                    const labels = getPresetLabels(preset.id);

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onUpdateCustomization(preset.settings)}
                        className={`relative p-2 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 group ${
                          isSelected
                            ? "border-[var(--accent-color)] bg-white/15 ring-1 ring-[var(--accent-color)]/60 shadow-md"
                            : preset.isAuthorFav
                            ? "border-amber-500/40 bg-amber-500/10 hover:border-amber-400 hover:bg-amber-500/15"
                            : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        {/* Top row: color dot, title, badge */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                            <span className="text-[10px] sm:text-[10.5px] font-bold text-white truncate">
                              {labels.name}
                            </span>
                          </div>
                          {preset.isAuthorFav && (
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40 flex items-center gap-0.5 shrink-0 ml-1">
                              <Star className="w-2 h-2 fill-amber-300 text-amber-300" />
                              {labels.badge}
                            </span>
                          )}
                          {isSelected && !preset.isAuthorFav && (
                            <Check className="w-3 h-3 text-white/90 shrink-0 ml-1" />
                          )}
                        </div>

                        {/* Subtitle description */}
                        <p className="text-[9px] text-white/50 leading-tight line-clamp-1">
                          {labels.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-white/80">
                    {t.settings.accentColor.title}
                  </label>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {customization.accentColor}
                  </span>
                </div>

                {/* Swatches */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isFav = Boolean((preset as any).isAuthorFav);
                    const isSelected =
                      customization.accentColor.toLowerCase() === preset.color.toLowerCase();

                    return (
                      <div key={preset.color} className="relative group/color flex items-center">
                        <button
                          type="button"
                          onClick={() => onUpdateCustomization({ accentColor: preset.color })}
                          className={`w-6 h-6 rounded-full transition-all border flex items-center justify-center relative ${
                            isFav
                              ? "border-amber-400/90 ring-1 ring-amber-400/40"
                              : "border-white/20"
                          } ${
                            isSelected
                              ? "scale-125 ring-2 ring-white/70 shadow-lg"
                              : "hover:scale-110 opacity-80 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white stroke-[3] drop-shadow" />
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Custom color picker */}
                  <label
                    className="w-6 h-6 rounded-full border border-white/30 overflow-hidden cursor-pointer flex items-center justify-center hover:scale-110 transition bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500"
                    title={t.settings.accentColor.customColor}
                  >
                    <input
                      type="color"
                      value={customization.accentColor}
                      onChange={(e) => onUpdateCustomization({ accentColor: e.target.value })}
                      className="opacity-0 w-0 h-0 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Subtitle / badge info for active color */}
                {customization.accentColor.toLowerCase() === "#6f4a16" ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{t.settings.presets.authorFavNotice}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-white/50 px-0.5">
                    {t.settings.accentColor.activeColor}:{" "}
                    <span className="text-white font-mono">{customization.accentColor}</span>
                  </div>
                )}
              </div>

              {/* Collapse Direction (Anchor) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.collapseDirection.title}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "top-right", label: t.settings.collapseDirection.topRight },
                      { id: "top-left", label: t.settings.collapseDirection.topLeft },
                      { id: "bottom-right", label: t.settings.collapseDirection.bottomRight },
                      { id: "bottom-left", label: t.settings.collapseDirection.bottomLeft },
                      { id: "center", label: t.settings.collapseDirection.center },
                    ] as { id: CollapseDirection; label: string }[]
                  ).map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => onUpdateCustomization({ collapseDirection: dir.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left transition truncate ${
                        customization.collapseDirection === dir.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Style */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.animation.title}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "spring", label: t.settings.animation.spring },
                      { id: "fade-zoom", label: t.settings.animation.fadeZoom },
                      { id: "slide", label: t.settings.animation.slide },
                      { id: "elastic", label: t.settings.animation.elastic },
                      { id: "fold", label: t.settings.animation.fold },
                      { id: "minimal", label: t.settings.animation.minimal },
                    ] as { id: AnimationType; label: string }[]
                  ).map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => onUpdateCustomization({ animationType: anim.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left transition truncate ${
                        customization.animationType === anim.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Speed */}
              <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/70">{t.settings.animation.speedTitle}:</span>
                  <span className="font-mono text-white/90 font-bold">
                    {customization.animationSpeedMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="900"
                  step="20"
                  value={customization.animationSpeedMs}
                  onChange={(e) =>
                    onUpdateCustomization({ animationSpeedMs: Number(e.target.value) })
                  }
                  style={{ accentColor: "var(--accent-color)" }}
                  className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Background Style */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.background.title}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: "glass", label: t.settings.background.glass },
                      { id: "oled", label: t.settings.background.oled },
                      { id: "frosted", label: t.settings.background.frosted },
                      { id: "gradient", label: t.settings.background.gradient },
                      { id: "aurora", label: t.settings.background.aurora },
                      { id: "particles", label: t.settings.background.particles },
                      { id: "mesh", label: t.settings.background.mesh },
                      { id: "gif", label: t.settings.background.gif },
                    ] as { id: BackgroundTheme; label: string }[]
                  ).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => onUpdateCustomization({ bgTheme: theme.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition truncate ${
                        customization.bgTheme === theme.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GIF Selection */}
              {customization.bgTheme === "gif" && (
                <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-[var(--accent-color)]/30 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-white/90">
                      {t.settings.background.selectGif}
                    </label>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold">
                      {t.settings.background.offline}
                    </span>
                  </div>

                  <select
                    value={customization.activeGif || "lofi-hiphop-1"}
                    onChange={(e) => onUpdateCustomization({ activeGif: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-[var(--accent-color)] cursor-pointer"
                  >
                    {PRESET_GIFS.map((g) => (
                      <option key={g.id} value={g.id} className="bg-zinc-900 text-white py-1">
                        {g.label}
                      </option>
                    ))}
                  </select>

                  {/* GIF Preview */}
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                    <img
                      src={
                        PRESET_GIFS.find(
                          (g) => g.id === (customization.activeGif || "lofi-hiphop-1")
                        )?.file
                      }
                      alt="GIF Preview"
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-white/90 font-medium truncate">
                        {
                          PRESET_GIFS.find(
                            (g) => g.id === (customization.activeGif || "lofi-hiphop-1")
                          )?.label
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Opacity & Blur */}
              <div className="space-y-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/70">{t.settings.background.opacity}:</span>
                    <span className="font-mono text-white/90 font-bold">
                      {customization.bgOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={customization.bgOpacity}
                    onChange={(e) =>
                      onUpdateCustomization({ bgOpacity: Number(e.target.value) })
                    }
                    style={{ accentColor: "var(--accent-color)" }}
                    className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1 pt-1 border-t border-white/5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/70">{t.settings.background.blur}:</span>
                    <span className="font-mono text-white/90 font-bold">
                      {customization.bgBlur} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={customization.bgBlur}
                    onChange={(e) =>
                      onUpdateCustomization({ bgBlur: Number(e.target.value) })
                    }
                    style={{ accentColor: "var(--accent-color)" }}
                    className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Collapsed Widget Shape */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.shape.title}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "rounded-square", label: t.settings.shape.square },
                      { id: "circle", label: t.settings.shape.circle },
                      { id: "capsule", label: t.settings.shape.capsule },
                    ] as { id: CollapsedShape; label: string }[]
                  ).map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => onUpdateCustomization({ collapsedShape: shape.id })}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition ${
                        customization.collapsedShape === shape.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTROLS & INTERACTION */}
          {activeTab === "interaction" && (
            <div className="space-y-4 text-xs">
              {/* Expand Trigger */}
              <div className="space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <label className="text-[11px] font-semibold text-white/90 block">
                  {t.settings.interaction.expandTriggerTitle}
                </label>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    onClick={() => onUpdateCustomization({ expandTrigger: "hover" })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                      customization.expandTrigger !== "click"
                        ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                        : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t.settings.interaction.onHover}
                  </button>

                  <button
                    onClick={() => onUpdateCustomization({ expandTrigger: "click" })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                      customization.expandTrigger === "click"
                        ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                        : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t.settings.interaction.onClick}
                  </button>
                </div>
                <span className="text-[10px] text-white/40 block pt-1">
                  {customization.expandTrigger === "click"
                    ? t.settings.interaction.clickDesc
                    : t.settings.interaction.hoverDesc}
                </span>
              </div>

              {/* Buttons in Collapsed Widget */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.interaction.collapsedControlsTitle}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "hover", label: t.settings.interaction.controlsHover },
                      { id: "always", label: t.settings.interaction.controlsAlways },
                      { id: "none", label: t.settings.interaction.controlsHidden },
                    ] as { id: CollapsedControlsMode; label: string }[]
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onUpdateCustomization({ collapsedControls: m.id })}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition ${
                        customization.collapsedControls === m.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.interaction.progressIndicatorTitle}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "radial", label: t.settings.interaction.progressRadial },
                      { id: "bar", label: t.settings.interaction.progressBottom },
                      { id: "none", label: t.settings.interaction.progressNone },
                    ] as { id: CollapsedProgressStyle; label: string }[]
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onUpdateCustomization({ collapsedProgressStyle: p.id })}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition ${
                        customization.collapsedProgressStyle === p.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vinyl & Visualizer Effects */}
              <div className="space-y-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-white/85 font-medium block">
                      {t.settings.interaction.vinylSpin}
                    </span>
                    <span className="text-[10px] text-white/40 block">
                      {t.settings.interaction.vinylSpinDesc}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={customization.albumArtSpin}
                    onChange={(e) => onUpdateCustomization({ albumArtSpin: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[11px] text-white/70">
                    {t.settings.interaction.ambientGlow}
                  </span>
                  <input
                    type="checkbox"
                    checked={customization.albumArtGlow}
                    onChange={(e) => onUpdateCustomization({ albumArtGlow: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[11px] text-white/70">
                    {t.settings.interaction.eqVisualizer}
                  </span>
                  <input
                    type="checkbox"
                    checked={customization.showVisualizer}
                    onChange={(e) => onUpdateCustomization({ showVisualizer: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Lyrics Font Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.interaction.lyricsFontSizeTitle}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "small", label: t.settings.interaction.sizeSmall },
                      { id: "medium", label: t.settings.interaction.sizeMedium },
                      { id: "large", label: t.settings.interaction.sizeLarge },
                    ] as { id: "small" | "medium" | "large"; label: string }[]
                  ).map((size) => (
                    <button
                      key={size.id}
                      onClick={() => onUpdateCustomization({ lyricsFontSize: size.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                        customization.lyricsFontSize === size.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Lyric Line Style */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  {t.settings.interaction.activeLyricStyleTitle}
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(
                    [
                      { id: "spotify-glow", label: t.settings.interaction.styleGlow },
                      { id: "accent-gradient", label: t.settings.interaction.styleGradient },
                      { id: "minimal-line", label: t.settings.interaction.styleLine },
                    ] as {
                      id: "spotify-glow" | "accent-gradient" | "minimal-line";
                      label: string;
                    }[]
                  ).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onUpdateCustomization({ activeLyricStyle: style.id })}
                      className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium border text-left transition ${
                        customization.activeLyricStyle === style.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapse Delay */}
              <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/70">{t.settings.interaction.collapseDelayTitle}:</span>
                  <span className="font-mono text-white/90 font-bold">
                    {customization.collapseDelayMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={customization.collapseDelayMs}
                  onChange={(e) =>
                    onUpdateCustomization({ collapseDelayMs: Number(e.target.value) })
                  }
                  style={{ accentColor: "var(--accent-color)" }}
                  className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Reset Defaults */}
              <div className="pt-1">
                <button
                  onClick={onResetCustomization}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.settings.interaction.resetDefaults}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SPOTIFY API */}
          {activeTab === "spotify" && (
            <div className="space-y-3 text-xs">
              {/* Client ID config */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/70 font-semibold block">
                  {t.settings.spotify.clientId}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder={t.settings.spotify.pasteClientId}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-color)] transition"
                  />
                  <button
                    onClick={handleSaveClientId}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition active:scale-95"
                  >
                    {t.settings.spotify.save}
                  </button>
                </div>
              </div>

              {/* Redirect URI Info */}
              <div className="space-y-1.5 bg-black/20 rounded-xl p-2.5 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">{t.settings.spotify.redirectUri}:</span>
                  <button
                    onClick={handleCopyRedirect}
                    style={{ color: "var(--accent-color)" }}
                    className="flex items-center gap-1 text-[10px] hover:underline"
                  >
                    {copiedRedirect ? (
                      <>
                        <Check className="w-3 h-3" /> {t.settings.spotify.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> {t.settings.spotify.copy}
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-white/80 bg-black/40 px-2 py-1 rounded truncate">
                  {REDIRECT_URI}
                </div>
              </div>

              {/* Auth status & actions */}
              <div className="space-y-2 pt-1">
                {authError && (
                  <div className="flex items-start gap-1.5 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-xl border border-white/10 font-medium">
                    <span className="flex items-center gap-1.5 text-white">
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      />
                      {t.settings.spotify.connected}
                    </span>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-1 text-white/50 hover:text-red-400 text-xs transition"
                    >
                      <LogOut className="w-3 h-3" /> {t.settings.spotify.logout}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onLogin}
                    style={{ backgroundColor: "var(--accent-color)" }}
                    className="w-full py-2.5 px-4 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t.settings.spotify.loginWithSpotify}
                  </button>
                )}
              </div>

              {/* Manual code input fallback */}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] text-white/50 block">
                    {t.settings.spotify.manualFallback}
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder={t.settings.spotify.pasteCallbackPlaceholder}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                    <button
                      onClick={handleProcessManualCode}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold transition bg-white/10 hover:bg-white/20 text-white"
                    >
                      {t.settings.spotify.authorize}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
