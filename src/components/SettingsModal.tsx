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

const COLOR_PRESETS = [
  {
    name: "Author's Favorite (#6F4A16)",
    color: "#6F4A16",
    isAuthorFav: true,
    tooltip: "Author's favorite theme color (#6F4A16)",
  },
  { name: "Spotify Green", color: "#1DB954" },
  { name: "Cyber Fiolet", color: "#A855F7" },
  { name: "Neon Cyjan", color: "#06B6D4" },
  { name: "Ognisty Karmin", color: "#F43F5E" },
  { name: "Złoty Bursztyn", color: "#F59E0B" },
  { name: "Arktyczna Biel", color: "#FFFFFF" },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-[340px] max-h-[520px] rounded-2xl glass-panel p-4 text-white shadow-2xl border border-white/10 flex flex-col gap-3 overflow-hidden">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: "var(--accent-color)" }} />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Ustawienia Widgetu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Original 3-tab layout) */}
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 ${
              activeTab === "appearance"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Palette className="w-3 h-3" style={activeTab === "appearance" ? { color: "var(--accent-color)" } : {}} />
            Wygląd
          </button>
          <button
            onClick={() => setActiveTab("interaction")}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 ${
              activeTab === "interaction"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" style={activeTab === "interaction" ? { color: "var(--accent-color)" } : {}} />
            Sterowanie
          </button>
          <button
            onClick={() => setActiveTab("spotify")}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 ${
              activeTab === "spotify"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Key className="w-3 h-3" style={activeTab === "spotify" ? { color: "var(--accent-color)" } : {}} />
            Spotify API
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 lyrics-scroll-container">
          {/* TAB 1: WYGLĄD (KIERUNKI, ANIMACJE, KOLORY, MOTYWY) */}
          {activeTab === "appearance" && (
            <div className="space-y-4 text-xs">
              {/* Kierunek Zwijania */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Kierunek zwijania (Kotwica)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "top-right", label: "Prawy górny ↗" },
                      { id: "top-left", label: "Lewy górny ↖" },
                      { id: "bottom-right", label: "Prawy dolny ↘" },
                      { id: "bottom-left", label: "Lewy dolny ↙" },
                      { id: "center", label: "Do środka ⦿" },
                    ] as { id: CollapseDirection; label: string }[]
                  ).map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => onUpdateCustomization({ collapseDirection: dir.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left transition ${
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

              {/* Styl Animacji */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Styl animacji otwierania/zwijania
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "spring", label: "Płynna sprężyna" },
                      { id: "fade-zoom", label: "Kinowy zoom & blur" },
                      { id: "slide", label: "Czysty slide" },
                      { id: "elastic", label: "Elastyczny pop" },
                      { id: "fold", label: "3D Acrylic fold" },
                      { id: "minimal", label: "Minimalistyczna" },
                    ] as { id: AnimationType; label: string }[]
                  ).map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => onUpdateCustomization({ animationType: anim.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left transition ${
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

              {/* Szybkość animacji */}
              <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/70">Długość animacji:</span>
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

              {/* Kolor Wiodący (Accent) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-white/80">
                    Kolor wiodący (Akcent)
                  </label>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {customization.accentColor}
                  </span>
                </div>
                {/* Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((preset) => {
                    const isFav = Boolean((preset as any).isAuthorFav);
                    const isSelected =
                      customization.accentColor.toLowerCase() === preset.color.toLowerCase();

                    return (
                      <div key={preset.color} className="relative group/color flex items-center">
                        <button
                          onClick={() => onUpdateCustomization({ accentColor: preset.color })}
                          className={`w-6 h-6 rounded-full transition-transform border flex items-center justify-center relative ${
                            isFav
                              ? "border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                              : "border-white/20"
                          } ${
                            isSelected
                              ? "scale-125 ring-2 ring-white/60"
                              : "hover:scale-110 opacity-75 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: preset.color }}
                          title={(preset as any).tooltip || preset.name}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white stroke-[3] drop-shadow" />
                          )}
                          {isFav && (
                            <span className="absolute -top-1.5 -right-1.5 text-[8px] leading-none pointer-events-none select-none filter drop-shadow">
                              ⭐
                            </span>
                          )}
                        </button>

                        {/* Tooltip for Author's Favorite */}
                        {isFav && (
                          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/color:flex flex-col items-center z-30 pointer-events-none">
                            <span className="bg-zinc-900/95 text-amber-200 border border-amber-500/40 text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                              Author's Favorite (Theme Choice)
                            </span>
                            <span className="w-1.5 h-1.5 bg-zinc-900 border-r border-b border-amber-500/40 rotate-45 -mt-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Custom color picker */}
                  <label
                    className="w-6 h-6 rounded-full border border-white/30 overflow-hidden cursor-pointer flex items-center justify-center hover:scale-110 transition bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500"
                    title="Wybierz własny kolor"
                  >
                    <input
                      type="color"
                      value={customization.accentColor}
                      onChange={(e) => onUpdateCustomization({ accentColor: e.target.value })}
                      className="opacity-0 w-0 h-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Styl Tła & Szkła */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Styl tła
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "glass", label: "Szkło Akrylowe" },
                      { id: "oled", label: "Czysty OLED" },
                      { id: "frosted", label: "Mroźne Szkło" },
                      { id: "gradient", label: "Neon Gradient" },
                      { id: "aurora", label: "Dynamiczna Zorza" },
                      { id: "particles", label: "Gwiezdny Pył" },
                      { id: "mesh", label: "Mesh Gradient" },
                      { id: "gif", label: "Animowany GIF" },
                    ] as { id: BackgroundTheme; label: string }[]
                  ).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => onUpdateCustomization({ bgTheme: theme.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left transition ${
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

              {/* Wybór konkretnego GIF-a (nowy select po zaznaczeniu opcji tła GIF) */}
              {customization.bgTheme === "gif" && (
                <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-[var(--accent-color)]/30 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-white/90">
                      Wybierz animowany GIF w tle
                    </label>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold">
                      Offline
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

                  {/* Podgląd wybranego GIF-a */}
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

              {/* Przezroczystość & Blur */}
              <div className="space-y-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/70">Krycie tła (Opacity):</span>
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
                    <span className="text-white/70">Rozmycie (Blur):</span>
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

              {/* Kształt po zwinięciu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Kształt zwiniętego widgetu
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "rounded-square", label: "Kwadrat" },
                      { id: "circle", label: "Koło" },
                      { id: "capsule", label: "Kapsułka" },
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

          {/* TAB 2: STEROWANIE & ZWINIĘTY WIDGET */}
          {activeTab === "interaction" && (
            <div className="space-y-4 text-xs">
              {/* Sposób rozwijania: Na klik vs Na najechanie */}
              <div className="space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <label className="text-[11px] font-semibold text-white/90 block">
                  Sposób rozwijania widgetu
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
                    Na najechanie myszką
                  </button>

                  <button
                    onClick={() => onUpdateCustomization({ expandTrigger: "click" })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                      customization.expandTrigger === "click"
                        ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                        : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Tylko po kliknięciu
                  </button>
                </div>
                <span className="text-[10px] text-white/40 block pt-1">
                  {customization.expandTrigger === "click"
                    ? "Widget rozwinie się dopiero po kliknięciu. Nie rozwinie się przypadkowo przy przejechaniu myszką."
                    : "Widget rozwija się automatycznie, gdy wjedziesz kursorem w jego obszar."}
                </span>
              </div>

              {/* Kontrolki w zwiniętym widżecie */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Przyciski w zwiniętym widżecie
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "hover", label: "Na hover" },
                      { id: "always", label: "Zawsze" },
                      { id: "none", label: "Ukryte" },
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

              {/* Styl paska postępu w zwiniętym widżecie */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Wskaźnik postępu w zwiniętym widżecie
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "radial", label: "Okrągły" },
                      { id: "bar", label: "Na dole" },
                      { id: "none", label: "Brak" },
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

              {/* Efekty winylu i korektora */}
              <div className="space-y-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-white/85 font-medium block">
                      Obracanie płyty winylowej
                    </span>
                    <span className="text-[10px] text-white/40 block">
                      Zmienia okładkę w okrągły, obracający się winyl
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
                  <span className="text-[11px] text-white/70">Poświata za okładką (Ambient Glow)</span>
                  <input
                    type="checkbox"
                    checked={customization.albumArtGlow}
                    onChange={(e) => onUpdateCustomization({ albumArtGlow: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[11px] text-white/70">Animowany korektor (EQ Visualizer)</span>
                  <input
                    type="checkbox"
                    checked={customization.showVisualizer}
                    onChange={(e) => onUpdateCustomization({ showVisualizer: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Rozmiar czcionki tekstu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Rozmiar czcionki tekstu utworu
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "small", label: "Mała" },
                      { id: "medium", label: "Średnia" },
                      { id: "large", label: "Duża" },
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

              {/* Styl aktywnego wersu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Styl aktywnego wersu tekstu
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(
                    [
                      { id: "spotify-glow", label: "Pasek + Poświata akcentu" },
                      { id: "accent-gradient", label: "Tekst w kolorze akcentu" },
                      { id: "minimal-line", label: "Czysty pasek" },
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

              {/* Opóźnienie autozwijania */}
              <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/70">Opóźnienie zwijania po zjechaniu kursoru:</span>
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

              {/* Reset Button */}
              <div className="pt-1">
                <button
                  onClick={onResetCustomization}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Przywróć ustawienia domyślne
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
                  Spotify Client ID
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="Wklej Client ID..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-color)] transition"
                  />
                  <button
                    onClick={handleSaveClientId}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition active:scale-95"
                  >
                    Zapisz
                  </button>
                </div>
              </div>

              {/* Redirect URI Info */}
              <div className="space-y-1.5 bg-black/20 rounded-xl p-2.5 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">Redirect URI (Spotify Dashboard):</span>
                  <button
                    onClick={handleCopyRedirect}
                    style={{ color: "var(--accent-color)" }}
                    className="flex items-center gap-1 text-[10px] hover:underline"
                  >
                    {copiedRedirect ? (
                      <>
                        <Check className="w-3 h-3" /> Skopiowano
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Kopiuj
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
                      Połączono ze Spotify
                    </span>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-1 text-white/50 hover:text-red-400 text-xs transition"
                    >
                      <LogOut className="w-3 h-3" /> Wyloguj
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onLogin}
                    style={{ backgroundColor: "var(--accent-color)" }}
                    className="w-full py-2.5 px-4 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Zaloguj przez Spotify (OAuth)
                  </button>
                )}
              </div>

              {/* Manual code input fallback */}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] text-white/50 block">
                    Alternatywnie: wklej adres callback lub kod:
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Wklej callback URL lub code..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                    <button
                      onClick={handleProcessManualCode}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold transition bg-white/10 hover:bg-white/20 text-white"
                    >
                      Autoryzuj
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
