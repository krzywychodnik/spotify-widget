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
  Image,
  Upload,
  Disc,
} from "lucide-react";
import { REDIRECT_URI } from "../services/spotifyAuth";
import {
  AppCustomization,
  CollapseDirection,
  AnimationType,
  BackgroundTheme,
  BackgroundType,
  CollapsedShape,
  BorderStyle,
  FontFamily,
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
  { name: "Spotify Green", color: "#1DB954" },
  { name: "Cyber Fiolet", color: "#A855F7" },
  { name: "Neon Cyjan", color: "#06B6D4" },
  { name: "Ognisty Karmin", color: "#F43F5E" },
  { name: "Złoty Bursztyn", color: "#F59E0B" },
  { name: "Arktyczna Biel", color: "#FFFFFF" },
];

const PRESET_BACKGROUNDS = [
  {
    name: "Cyberpunk City (GIF)",
    type: "image" as BackgroundType,
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHoxbXBzZTVuMnpoazB1ZmxzOTg5dzhzMW1qY2lhcmg1a2l1aWpjeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEjI6SIIHBdRxXI40/giphy.gif",
  },
  {
    name: "Lo-Fi Rainy Window (GIF)",
    type: "image" as BackgroundType,
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExenBhNWV1bXlsM3A3dDZyYms0NWlndnh1M2F1cW96czFpOXV1OHlydSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1V9K/giphy.gif",
  },
  {
    name: "Retro Sunset Synthwave",
    type: "image" as BackgroundType,
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDV4bnNsaHR5ZmVrcTJ3dmp5aHlsYmRycHVmYzU5MnAzZ3FnbHlvdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26tn33aiTi1jkl6H6/giphy.gif",
  },
  {
    name: "Deep Cosmic Galaxy",
    type: "image" as BackgroundType,
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
  },
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
  const [activeTab, setActiveTab] = useState<
    "backgrounds" | "appearance" | "player" | "spotify"
  >("backgrounds");
  const [inputClientId, setInputClientId] = useState(clientId);
  const [manualCode, setManualCode] = useState("");
  const [customUrlInput, setCustomUrlInput] = useState(customization.customBgUrl || "");
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateCustomization({
          bgType: isVideo ? "video" : "image",
          customBgUrl: dataUrl,
        });
        setCustomUrlInput(dataUrl.slice(0, 40) + "...");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (type: BackgroundType) => {
    onUpdateCustomization({
      bgType: type,
      customBgUrl: customUrlInput.trim(),
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-[360px] h-[540px] rounded-3xl glass-panel p-4 text-white shadow-2xl border border-white/10 flex flex-col gap-3 overflow-hidden">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: "var(--accent-color)" }} />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Centrum Personalizacji</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 bg-black/50 p-1 rounded-2xl border border-white/5 shrink-0 text-[10px]">
          <button
            onClick={() => setActiveTab("backgrounds")}
            className={`py-1.5 px-1 rounded-xl font-semibold transition flex flex-col items-center gap-0.5 ${
              activeTab === "backgrounds"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Image className="w-3.5 h-3.5" style={activeTab === "backgrounds" ? { color: "var(--accent-color)" } : {}} />
            Tło & Wideo
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`py-1.5 px-1 rounded-xl font-semibold transition flex flex-col items-center gap-0.5 ${
              activeTab === "appearance"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Palette className="w-3.5 h-3.5" style={activeTab === "appearance" ? { color: "var(--accent-color)" } : {}} />
            Animacje
          </button>

          <button
            onClick={() => setActiveTab("player")}
            className={`py-1.5 px-1 rounded-xl font-semibold transition flex flex-col items-center gap-0.5 ${
              activeTab === "player"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Disc className="w-3.5 h-3.5" style={activeTab === "player" ? { color: "var(--accent-color)" } : {}} />
            Muzyka
          </button>

          <button
            onClick={() => setActiveTab("spotify")}
            className={`py-1.5 px-1 rounded-xl font-semibold transition flex flex-col items-center gap-0.5 ${
              activeTab === "spotify"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Key className="w-3.5 h-3.5" style={activeTab === "spotify" ? { color: "var(--accent-color)" } : {}} />
            Spotify
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 lyrics-scroll-container">
          {/* TAB 1: BACKGROUNDS & MEDIA (ZDJĘCIA, WIDEO, GIF, ANIMACJE) */}
          {activeTab === "backgrounds" && (
            <div className="space-y-4 text-xs">
              {/* Wybór Typu Tła */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Typ tła
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "preset", label: "Domyślne szkło" },
                      { id: "aurora", label: "Cyber Zorza" },
                      { id: "particles", label: "Gwiezdny pył" },
                      { id: "mesh", label: "Mesh Gradient" },
                      { id: "image", label: "Zdjęcie / GIF" },
                      { id: "video", label: "Wideo MP4" },
                    ] as { id: BackgroundType; label: string }[]
                  ).map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => onUpdateCustomization({ bgType: bg.id })}
                      className={`py-2 px-1.5 rounded-xl text-[10px] font-medium border text-center transition flex flex-col items-center justify-center gap-1 ${
                        customization.bgType === bg.id
                          ? "border-[var(--accent-color)] bg-white/15 text-white font-bold shadow-sm"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jeśli wybrano Domyślne Szkło: Motywy */}
              {customization.bgType === "preset" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/80 block">
                    Motyw szkła
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: "glass", label: "Szkło Akrylowe" },
                        { id: "oled", label: "Czysty OLED" },
                        { id: "frosted", label: "Mroźne Szkło" },
                        { id: "gradient", label: "Gradient" },
                      ] as { id: BackgroundTheme; label: string }[]
                    ).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => onUpdateCustomization({ bgTheme: theme.id })}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-left transition ${
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
              )}

              {/* Jeśli wybrano Własne Zdjęcie / GIF / Wideo */}
              {(customization.bgType === "image" || customization.bgType === "video") && (
                <div className="space-y-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-white/80 flex items-center justify-between">
                      <span>Wklej URL lub załaduj z dysku</span>
                      <span className="text-[10px] text-white/40">
                        {customization.bgType === "video" ? "Wideo (MP4 / WebM)" : "Zdjęcie / GIF"}
                      </span>
                    </label>

                    {/* URL Input */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://... (.gif, .mp4, .jpg)"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                      <button
                        onClick={() => handleApplyCustomUrl(customization.bgType)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-semibold text-white transition active:scale-95"
                      >
                        Ustaw
                      </button>
                    </div>

                    {/* Local File Picker */}
                    <label className="mt-1.5 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 flex items-center justify-center gap-2 cursor-pointer transition text-[11px] text-white/70 hover:text-white">
                      <Upload className="w-3.5 h-3.5" style={{ color: "var(--accent-color)" }} />
                      <span>Wybierz plik z komputera</span>
                      <input
                        type="file"
                        accept={
                          customization.bgType === "video"
                            ? "video/mp4,video/webm"
                            : "image/*,.gif"
                        }
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Szybkie Presety Tła (Gotowe do 1-kliknięcia) */}
                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-white/50 block font-semibold">
                      Gotowe estetyczne tła:
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {PRESET_BACKGROUNDS.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => {
                            onUpdateCustomization({
                              bgType: p.type,
                              customBgUrl: p.url,
                            });
                            setCustomUrlInput(p.url);
                          }}
                          className="py-1 px-2 rounded-lg bg-black/40 hover:bg-white/10 border border-white/5 text-[10px] text-left text-white/70 truncate transition"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Przyciemnienie tła i Rozmycie (Dla custom mediów i animacji) */}
              <div className="space-y-2.5 bg-black/20 p-2.5 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/70">Przyciemnienie tła (dla czytelności):</span>
                    <span className="font-mono text-white/90 font-bold">
                      {customization.customBgDim}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={customization.customBgDim}
                    onChange={(e) =>
                      onUpdateCustomization({ customBgDim: Number(e.target.value) })
                    }
                    style={{ accentColor: "var(--accent-color)" }}
                    className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1 pt-1 border-t border-white/5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/70">Rozmycie tła (Blur):</span>
                    <span className="font-mono text-white/90 font-bold">
                      {customization.customBgBlur} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={customization.customBgBlur}
                    onChange={(e) =>
                      onUpdateCustomization({ customBgBlur: Number(e.target.value) })
                    }
                    style={{ accentColor: "var(--accent-color)" }}
                    className="w-full h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Styl Ramki Widgetu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Styl obramowania widgetu
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "glow", label: "Neonowa poświata" },
                      { id: "subtle", label: "Subtelna ramka" },
                      { id: "none", label: "Bez ramki" },
                      { id: "rainbow", label: "Zorza barw" },
                    ] as { id: BorderStyle; label: string }[]
                  ).map((border) => (
                    <button
                      key={border.id}
                      onClick={() => onUpdateCustomization({ borderStyle: border.id })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-left transition ${
                        customization.borderStyle === border.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {border.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANIMACJE, KIERUNKI I KOLORY */}
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
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-left transition ${
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
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-left transition ${
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
              <div className="space-y-1 bg-black/20 p-2.5 rounded-2xl border border-white/5">
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
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => onUpdateCustomization({ accentColor: preset.color })}
                      className={`w-6 h-6 rounded-full transition-transform border border-white/20 flex items-center justify-center ${
                        customization.accentColor.toLowerCase() === preset.color.toLowerCase()
                          ? "scale-125 ring-2 ring-white/60"
                          : "hover:scale-110 opacity-75 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {customization.accentColor.toLowerCase() === preset.color.toLowerCase() && (
                        <Check className="w-3 h-3 text-black stroke-[3]" />
                      )}
                    </button>
                  ))}
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
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-medium border text-center transition ${
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

          {/* TAB 3: ODTWARZACZ, OKŁADKA I TEKST */}
          {activeTab === "player" && (
            <div className="space-y-4 text-xs">
              {/* Odtwarzacz & Płyta */}
              <div className="space-y-2 bg-black/25 p-3 rounded-2xl border border-white/5">
                <span className="text-[11px] font-semibold text-white/80 block">
                  Efekty okładki utworu
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/70">Obracanie płyty winylowej</span>
                  <input
                    type="checkbox"
                    checked={customization.albumArtSpin}
                    onChange={(e) => onUpdateCustomization({ albumArtSpin: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[11px] text-white/70">Poświata za okładką (Ambient Glow)</span>
                  <input
                    type="checkbox"
                    checked={customization.albumArtGlow}
                    onChange={(e) => onUpdateCustomization({ albumArtGlow: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[11px] text-white/70">Animowany korektor (EQ Visualizer)</span>
                  <input
                    type="checkbox"
                    checked={customization.showVisualizer}
                    onChange={(e) => onUpdateCustomization({ showVisualizer: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Czcionka interfejsu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Krój czcionki
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "sans", label: "Nowoczesna" },
                      { id: "display", label: "Display" },
                      { id: "mono", label: "Monospace" },
                    ] as { id: FontFamily; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdateCustomization({ fontFamily: f.id })}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-medium border text-center transition ${
                        customization.fontFamily === f.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wyrównanie tekstu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Wyrównanie tekstu utworu
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "left", label: "Do lewej" },
                      { id: "center", label: "Wyśrodkowany" },
                    ] as { id: "left" | "center"; label: string }[]
                  ).map((align) => (
                    <button
                      key={align.id}
                      onClick={() => onUpdateCustomization({ lyricsAlign: align.id })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-center transition ${
                        customization.lyricsAlign === align.id
                          ? "border-[var(--accent-color)] bg-white/10 text-white font-bold"
                          : "border-white/5 bg-black/20 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rozmiar czcionki tekstu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/80 block">
                  Rozmiar czcionki tekstu
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
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-center transition ${
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
                      className={`py-1.5 px-2.5 rounded-xl text-[11px] font-medium border text-left transition ${
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

              {/* Opóźnienie zwijania */}
              <div className="space-y-1 bg-black/20 p-2.5 rounded-2xl border border-white/5">
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

          {/* TAB 4: SPOTIFY API */}
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
              <div className="space-y-1.5 bg-black/20 rounded-2xl p-2.5 border border-white/5">
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
