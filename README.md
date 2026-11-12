# Spotify Floating Widget

A lightweight desktop overlay widget for Spotify built with **Tauri v2**, **React 18**, **TypeScript**, and **Tailwind CSS**. It stays on top of full-screen applications, games, and browser windows, providing playback controls, synchronized lyrics, and playlist browsing without taking focus.

---

## Features

### Window Modes & Behavior
* **Always on Top & Frameless:** Borderless transparent window with hardware-accelerated acrylic/glassmorphism blur (`backdrop-filter`).
* **Collapsed Mode (104×104 px):** Compact corner icon displaying album artwork, a radial or linear progress ring, and playback controls. Resizing is locked while collapsed to prevent accidental layout breakage.
* **Vinyl Disc Animation:** Optional spinning vinyl disc animation during playback. Controls stay upright and stationary on top of the spinning disc.
* **Smart Expand / Collapse:**
  * Expands on mouse hover (`mouseenter`) or click.
  * Collapses automatically on mouse leave (`mouseleave`) with a configurable delay (default 380 ms).
  * **Pin (📌):** Locks the window in expanded mode, ignoring hover leave events.
* **Fluid Responsiveness & Memory:** Expanded window is freely resizable; album art maintains aspect ratio, and custom window dimensions persist in `localStorage`.
* **Drag to Move:** Click and drag anywhere across the title bar or collapsed widget (`data-tauri-drag-region`). Image dragging is disabled globally to prevent ghosting.

### Player & Playback Control
* **Playback Controls:** Play, pause, skip forward, skip backward, shuffle toggle, repeat mode cycling (off / track / context), and volume slider.
* **Live Seek Bar:** Interactive progress slider driven by `requestAnimationFrame` for 60 FPS smooth interpolation between Spotify API polling cycles.
* **Spotify Connect Integration:** Commands execute via Spotify Web API against the currently active playback device.

### User Playlists
* **Dedicated Playlists Tab:** Access your Spotify library from the header icon or by clicking the album cover/vinyl disc on the player screen.
* **Live Search Filter:** Instant client-side search filtering playlists by name and description.
* **One-Click Playback:** Click any playlist card to immediately play it via `PUT /v1/me/player/play` (`context_uri`).
* **Metadata & Ownership:** Displays cover thumbnails, track counts with grammatical formatting, and ownership tags (displaying "Ty" for your own playlists).

### Synchronized Lyrics (LRCLIB)
* **Real-Time Karaoke Scrolling:** Automatically fetches synchronized time-stamped `.lrc` lyrics from the LRCLIB API.
* **Click-to-Seek:** Clicking any lyric line immediately jumps Spotify playback to that timestamp.
* **Visual Focus:** Highlights the active line, dims surrounding text, and smooth-scrolls to keep the current verse centered.

### Themes & Customization
* **Background Engines:**
  * **Canvas Particles:** Animated floating cosmic dust synchronized with playback tempo.
  * **Animated GIF/Video:** Built-in offline animated loop presets with adjustable blur and opacity.
  * **Aurora Gradient:** Radial multi-color gradient animation.
  * **Glass / OLED:** Classic dark translucent acrylic or pitch-black OLED background.
* **Accent Colors:** Custom color presets and hex picker with live CSS variable updates (`--accent-color`, `--accent-glow`).
* **Collapsed Shapes:** Rounded square, circle, or capsule.
* **Collapsed Progress Style:** Radial ring around artwork, bottom linear bar, or disabled.
* **Animation Styles:** Spring, smooth, snappy, or bounce transitions with configurable collapse origin directions.

---

## Prerequisites & Spotify Setup

### 1. Register Spotify Developer App
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create App**:
   * **App name:** `Spotify Mini Player`
   * **App description:** `Desktop Floating Overlay`
   * **Redirect URI:** `http://127.0.0.1:8888/callback` *(Must use `127.0.0.1`, not `localhost`)*
   * **APIs used:** Select **Web API**.
3. Save the application and copy the **Client ID**.

### 2. Authorization & Scopes
Authentication uses **OAuth 2.0 PKCE** (Proof Key for Code Exchange). An embedded Rust HTTP server runs on `127.0.0.1:8888` to receive the authorization code redirect automatically.

Required scopes:
* `user-read-playback-state`
* `user-modify-playback-state`
* `user-read-currently-playing`
* `playlist-read-private`
* `playlist-read-collaborative`

---

## Installation & Running

### Portable Executable (Windows)
Run the precompiled standalone executable from the repository root:
```text
Spotify-Widget.exe
```
Requires [Microsoft Edge WebView2 Evergreen Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (preinstalled on Windows 10/11).

---

### Development Setup

#### System Requirements
* **Node.js:** v18+ and `npm`
* **Rust:** Stable toolchain (`rustc`, `cargo`)
* **C++ Compiler:** MSVC (Visual Studio C++ Build Tools) or LLVM-MinGW

#### Steps
1. Clone repository and navigate to root:
   ```bash
   git clone https://github.com/your-username/spotify-widget.git
   cd spotify-widget
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. (Optional) Set your Spotify Client ID in `.env`:
   ```bash
   cp .env.example .env
   # Edit VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   ```
   *Note: Client ID can also be entered directly in the app settings modal (⚙️).*
4. Run in development mode:
   ```bash
   npm run tauri dev
   ```
5. Build production release binary:
   ```bash
   npm run tauri build
   ```
   The compiled binary is output to `src-tauri/target/release/spotify-widget.exe`.

---

## Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Expand Widget** | Hover cursor over the collapsed widget or click it |
| **Collapse Widget** | Move cursor outside the expanded player (collapses after 380 ms) |
| **Pin / Unpin (Lock)** | Click the pin icon (📌) in the top header |
| **Open Playlists View** | Click the playlist tab icon in header or click the album cover/vinyl disc |
| **Search Playlists** | Type in the search bar on the playlists tab to filter instantly |
| **Switch to Lyrics** | Click the microphone icon (🎤) in the header |
| **Seek in Track** | Click on the playback progress bar or click any lyric line |
| **Move Window** | Click and drag the header or the collapsed widget |
| **Resize Window** | Drag any window border or corner when expanded |
| **Settings & Auth** | Click the gear icon (⚙️) in the top header |
| **Close App** | Click the exit button (✕) in the top header |

---

## Project Structure

```text
├── src/                          # React Frontend
│   ├── components/
│   │   ├── CollapsedWidget.tsx   # 104x104 collapsed widget, radial bar, hover controls
│   │   ├── ExpandedPlayer.tsx    # Full player view, header tabs, aspect-ratio cover
│   │   ├── LyricsView.tsx        # LRCLIB synchronized lyrics list, auto-scrolling
│   │   ├── PlaylistsView.tsx     # User playlist catalog, live search, context playback
│   │   ├── SettingsModal.tsx     # Client ID, OAuth login, customization preferences
│   │   └── ParticlesBackground.tsx # Canvas cosmic particles engine
│   ├── hooks/
│   │   ├── useSpotifyAuth.ts     # PKCE login lifecycle and token state
│   │   ├── useSpotifyPlayer.ts   # Playback polling, seek, and control mutations
│   │   ├── useLyrics.ts          # LRCLIB API query, parsing, and time alignment
│   │   ├── useWindowControl.ts   # Hover expand/collapse, pinning, size persistence
│   │   └── useCustomization.ts   # Themes, colors, animations storage
│   ├── services/
│   │   ├── spotifyAuth.ts        # PKCE challenge generator, token refresh, redirect
│   │   ├── spotifyApi.ts         # REST client for Spotify Web API (/me, /player, /playlists)
│   │   └── lyricsService.ts      # LRCLIB fetch and [mm:ss.xx] parser
│   ├── types/                    # TypeScript interfaces for Spotify, lyrics, and settings
│   ├── index.css                 # Tailwind utilities, acrylic glass, animations
│   └── App.tsx                   # Root state orchestration and Tauri event bindings
├── src-tauri/                    # Tauri v2 Backend (Rust)
│   ├── src/
│   │   └── main.rs               # Frameless window setup, resize commands, OAuth server
│   ├── capabilities/             # Tauri security capabilities and plugin permissions
│   ├── Cargo.toml                # Rust dependencies (tauri, tiny_http, serde)
│   └── tauri.conf.json           # Window dimensions, transparency, build configuration
├── Spotify-Widget.exe            # Precompiled standalone Windows executable
└── package.json                  # NPM scripts and frontend dependencies
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
