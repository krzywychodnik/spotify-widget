# 🎵 Spotify Floating Mini-Player & Lyrics Overlay

Nowoczesny, ultralekki widget desktopowy dla **Spotify** działający w trybie nakładki (**Always on Top**), zbudowany na silniku **Tauri v2** oraz **React + TypeScript + Tailwind CSS**.

Aplikacja pływa ponad grami, przeglądarką i programami, zajmuje minimalną ilość pamięci RAM (~20 MB) i oferuje inteligentne rozwijanie po najechaniu myszą oraz synchronizację tekstu piosenek w czasie rzeczywistym (**LRCLIB API**).

---

## ✨ Kluczowe Funkcje

- **📌 Zawsze na wierzchu & Bez ramek (Overlay):**
  - Brak systemowych ramek (`decorations: false`), przezroczyste tło (`transparent: true`) oraz właściwość `always_on_top: true`.
  - Estetyczny, ciemny motyw Spotify z efektem szkła akrylowego (**glassmorphism** / `backdrop-blur`).
- **🪟 Dwa stany okna (Smart Hover & Pin):**
  - **Tryb zwinięty (Collapsed / Idle ~92x92 px):** Kompaktowy widżet w rogu ekranu z okładką albumu, promienistym paskiem postępu i miniaturowymi kontrolkami (Play/Pause, Next/Prev).
  - **Tryb rozwinięty (Expanded na Hover):** Płynne, animowane rozszerzenie okna po najechaniu kursorem (`mouseenter`). Zawiera pełną okładkę, tytuł utworu, artystę, interaktywny pasek postępu (seek) oraz pełne przyciski odtwarzacza (Shuffle, Prev, Play/Pause, Next, Repeat, Volume slider) i sekcję z napisami.
  - **Automatyczne zwijanie:** Po zjechaniu kursorem (`mouseleave`) z inteligentnym opóźnieniem (debounce 380 ms).
  - **Tryb blokady (Pin / Lock 📌):** Przycisk pinezki w nagłówku zamraża okno w trybie rozwiniętym i ignoruje zjechanie kursorem.
  - **Przesuwanie (Draggable):** Możliwość chwycenia i swobodnego przeciągnięcia okna po całym ekranie (`data-tauri-drag-region`).
- **⚡ Pełna integracja ze Spotify Web API (Spotify Connect):**
  - **Autoryzacja OAuth 2.0 PKCE:** Bezpieczne logowanie bez ujawniania sekretu klienta. Wbudowany w backend serwer callback na `http://127.0.0.1:8888/callback` automatycznie przechwytuje kod autoryzacji.
  - **Wymagane uprawnienia (Scopes):** `user-read-playback-state`, `user-modify-playback-state`, `user-read-currently-playing`.
  - **Optymistyczna synchronizacja:** Płynny pasek postępu (`requestAnimationFrame`) i odświeżanie stanu co 1.5 sekundy.
- **🎤 Synchronizacja napisów w czasie rzeczywistym (LRCLIB API):**
  - Automatyczne pobieranie tekstu w formacie LRC (`https://lrclib.net/api/get` z fallbackiem na wyszukiwarkę).
  - Płynne autoscrollowanie do aktualnie śpiewanego wersu (styl Spotify / Apple Music).
  - Podświetlenie aktualnej linijki i podgląd nadchodzących wersów.
  - **Kliknięcie w wers przewija utwór** w Spotify do wskazanego momentu (`seek`).

---

## 🛠️ Wymagania i Konfiguracja Spotify

### 1. Rejestracja aplikacji w Spotify Developer Dashboard
1. Zaloguj się na [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Kliknij **Create App**:
   - **App name:** `Spotify Mini Player`
   - **App description:** `Desktop Floating Overlay`
   - **Redirect URI:** `http://localhost:8888/callback` *(ważne: dokładnie ten adres)*
   - **Which API/SDKs are you planning to use:** Wybierz **Web API**.
3. Zapisz aplikację i skopiuj swój **Client ID**.

---

## 🚀 Uruchomienie projektu

### Krok 1: Konfiguracja Client ID
Możesz podać Client ID w pliku `.env`:
```bash
cp .env.example .env
```
Wpisz w `.env`:
```env
VITE_SPOTIFY_CLIENT_ID=twoj_spotify_client_id
```
*(Client ID możesz także w każdej chwili wpisać lub zmienić bezpośrednio w widżecie w oknie ustawień ⚙️).*

### Krok 2: Uruchomienie widżetu
Skorzystaj z przygotowanego skryptu startowego:
```powershell
# W konsoli PowerShell:
.\run-widget.ps1

# Lub w zwykłym wierszu poleceń (CMD):
run-widget.bat
```
Możesz również uruchomić standardowo przez npm:
```bash
npm run tauri dev
```

---

## ⌨️ Sterowanie i Interakcja

| Akcja | Sterowanie |
| :--- | :--- |
| **Rozwinięcie widżetu** | Najedź kursorem myszy na widżet |
| **Zwinięcie widżetu** | Odsuń kursor poza widżet (zwinie się po 380ms) |
| **Przypięcie (Pin)** | Kliknij ikonę pinezki 📌 w prawym górnym rogu |
| **Przesuwanie okna** | Chwyć nagłówek lub widżet i przeciągnij w dowolne miejsce |
| **Przewijanie utworu** | Kliknij w dowolne miejsce paska postępu lub na dowolny wers w sekcji Lyrics |
| **Przełączanie zakładek** | Kliknij ikonę płyty (odtwarzacz) lub mikrofonu (tekst) w nagłówku |
| **Ustawienia API** | Kliknij ikonę zębatki ⚙️ w prawym górnym rogu |

---

## 🏗️ Architektura kodu

- `src-tauri/` - Natywny backend w Rust (Tauri v2):
  - `src/main.rs` - Konfiguracja okna, frameless/transparency/always-on-top, komendy resize oraz wbudowany serwer HTTP na porcie 8888 do bezobsługowego odbioru kodu OAuth PKCE.
  - `tauri.conf.json` & `capabilities/` - Uprawnienia okna i obsługa zdarzeń.
- `src/` - Frontend (React + TypeScript + Tailwind CSS):
  - `components/CollapsedWidget.tsx` - Dyskretny tryb zwinięty z radialnym progress barem i hover controls.
  - `components/ExpandedPlayer.tsx` - Pełny odtwarzacz ze wszystkimi kontrolkami, seekbarem i widokiem tekstu.
  - `components/LyricsView.tsx` - Synchronizowane napisy z LRCLIB, auto-scroll i seek-on-click.
  - `components/SettingsModal.tsx` - Konfiguracja Spotify Client ID, logowanie PKCE i pomoc w autoryzacji.
  - `services/spotifyAuth.ts` - Pełna implementacja OAuth 2.0 PKCE (code_verifier, code_challenge S256, auto refresh tokenów).
  - `services/spotifyApi.ts` - Klient Spotify Connect (play, pause, next, prev, seek, volume, shuffle, repeat).
  - `services/lyricsService.ts` - Klient LRCLIB i parser formatu LRC `[mm:ss.xx]`.
  - `hooks/` - Dedykowane hooki: `useWindowControl`, `useSpotifyPlayer`, `useSpotifyAuth`, `useLyrics`.

---

## 📄 Licencja

Projekt objęty licencją MIT.
