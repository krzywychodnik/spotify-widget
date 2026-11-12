# 🎵 Spotify Floating Mini-Player & Lyrics Overlay

A sleek, ultra-lightweight desktop overlay for Spotify that stays **always on top** of all your applications and games. It features an intelligent auto-collapsing interface, full playback control, and real-time synchronized lyrics.

Built with **[Tauri](https://tauri.app/)** and **React** for maximum performance and minimal RAM footprint (~20 MB).

---

## ✨ Key Features

- **📌 Always On Top & Frameless:** Floats over any application, browser, or windowed game with a modern translucent glassmorphism design.
- **✨ Smart Collapsing (Hover to Expand):**
  - **Idle / Collapsed:** A tiny, unobtrusive dock/square with basic playback controls.
  - **Hover / Expanded:** Smoothly expands on mouse hover to reveal album art, song details, interactive seekbar, full controls, and synchronized lyrics.
- **🔒 Pin / Lock Mode:** One-click pin button (📌) keeps the player locked in expanded mode, ignoring mouse leave.
- **🎤 Synchronized Lyrics (Karaoke Mode):** Fetches real-time, timestamped lyrics via the [LRCLIB](https://lrclib.net/) API. Follow along line-by-line or click any lyric line to seek directly to that part of the song!
- **⚡ Spotify Connect Integration:** Native playback control (Play, Pause, Next, Previous, Volume, Seek) using the official Spotify Web API via secure OAuth PKCE.
- **🚀 Ultra Low Resource Usage:** Powered by Rust/Tauri—virtually zero CPU impact and ~90% less RAM usage compared to standard Electron apps.

---

## 🛠️ Tech Stack

- **Framework:** [Tauri v2](https://tauri.app/) (Rust backend)
- **Frontend:** React + TypeScript + Tailwind CSS
- **APIs:** 
  - [Spotify Web API](https://developer.spotify.com/documentation/web-api) (playback controls & metadata)
  - [LRCLIB](https://lrclib.net/) (free, real-time synchronized lyrics)
- **Auth:** OAuth 2.0 PKCE flow (no client secret exposed)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- A **Spotify Premium** account (required for Spotify Connect API playback controls)

### 1. Spotify App Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create App**:
   - **App name:** `Spotify Mini Player`
   - **Redirect URI:** `http://localhost:8888/callback`
   - **APIs used:** Select **Web API**.
3. Copy your **Client ID** from app settings.

### 2. Installation & Run

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install

# Create environment config
cp .env.example .env
# Paste your SPOTIFY_CLIENT_ID into .env

# Run in development mode
npm run tauri dev
```

---

## ⌨️ Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Expand Player** | Hover mouse over the widget |
| **Collapse Player** | Move mouse away from the widget |
| **Pin / Unpin** | Click the 📌 icon in top-right corner |
| **Drag Window** | Click and drag the widget header |
| **Seek Lyric** | Click any lyric verse to jump to that timestamp |

---

## 📄 License

This project is licensed under the MIT License.
