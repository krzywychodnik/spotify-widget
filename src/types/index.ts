export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp ms
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyArtist {
  name: string;
  uri: string;
}

export interface SpotifyAlbumImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyAlbum {
  name: string;
  images: SpotifyAlbumImage[];
  uri: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaybackState {
  device?: SpotifyDevice;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
}

export interface LyricLine {
  timeMs: number;
  timeStr: string;
  text: string;
}

export interface LRCLibResponse {
  id: number;
  name: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

export type CollapseDirection =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export type AnimationType =
  | 'spring'
  | 'fade-zoom'
  | 'slide'
  | 'elastic'
  | 'fold'
  | 'minimal';

export type BackgroundTheme =
  | 'glass'
  | 'oled'
  | 'frosted'
  | 'gradient'
  | 'aurora'
  | 'particles'
  | 'mesh'
  | 'gif';

export interface PresetGif {
  id: string;
  label: string;
  file: string;
}

export const PRESET_GIFS: PresetGif[] = [
  { id: 'lofi-hiphop-1', label: 'Lofi Hip Hop (Deszcz & Kot)', file: '/backgrounds/lofi-hiphop-1.gif' },
  { id: 'freezing-12', label: 'Freezing (Zimowa herbata)', file: '/backgrounds/freezing-12.webp' },
  { id: 'lofi-girl-4', label: 'Lofi Girl (Spokojny dzień)', file: '/backgrounds/lofi-girl-4.webp' },
  { id: 'valorant-valorant-lose', label: 'Valorant (Defeat / Przegrana)', file: '/backgrounds/valorant-valorant-lose.gif' },
  { id: 'osaka-spin-3', label: 'Osaka Spin (Azumanga Daioh)', file: '/backgrounds/osaka-spin-3.gif' },
  { id: 'konata-lucky-star-22', label: 'Konata (Lucky Star Loading)', file: '/backgrounds/konata-lucky-star-22.gif' },
  { id: 'anime-girl-711', label: 'Anime Girl Dance (Taniec)', file: '/backgrounds/anime-girl-711.gif' },
  { id: 'anime-1482', label: 'Rikka Takanashi (Chuunibyou)', file: '/backgrounds/anime-1482.gif' },
  { id: 'anime-aesthetic-bus', label: 'Anime Girl (Chmury & Przystanek)', file: '/backgrounds/anime-aesthetic-bus.gif' },
];

export type CollapsedShape = 'rounded-square' | 'circle' | 'capsule';

export type ExpandTrigger = 'hover' | 'click';

export type CollapsedControlsMode = 'always' | 'hover' | 'none';

export type CollapsedProgressStyle = 'radial' | 'bar' | 'none';

export interface AppCustomization {
  // Positioning & Interaction
  collapseDirection: CollapseDirection;
  collapseDelayMs: number;
  expandTrigger: ExpandTrigger;
  
  // Animation
  animationType: AnimationType;
  animationSpeedMs: number;
  
  // Appearance & Colors
  accentColor: string;
  bgTheme: BackgroundTheme;
  activeGif?: string;
  bgBlur: number;       // in px (0 - 50)
  bgOpacity: number;    // in % (40 - 100)
  collapsedShape: CollapsedShape;
  
  // Collapsed Widget Customization
  collapsedControls: CollapsedControlsMode;
  collapsedProgressStyle: CollapsedProgressStyle;
  
  // Player & Effects
  albumArtSpin: boolean;     // vinyl spin animation
  albumArtGlow: boolean;     // ambient colorful glow behind album
  showVisualizer: boolean;   // animated visualizer bars
  
  // Lyrics
  lyricsFontSize: 'small' | 'medium' | 'large';
  lyricsAlign?: 'left' | 'center';
  lyricsGlow: boolean;
  activeLyricStyle: 'spotify-glow' | 'accent-gradient' | 'minimal-line';
}

export interface AppSettings extends AppCustomization {
  clientId: string;
}
