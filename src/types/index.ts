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

export type BackgroundTheme = 'glass' | 'oled' | 'frosted' | 'gradient';

export type BackgroundType =
  | 'preset'
  | 'image'
  | 'video'
  | 'aurora'
  | 'particles'
  | 'mesh';

export type CollapsedShape = 'rounded-square' | 'circle' | 'capsule';

export type BorderStyle = 'glow' | 'subtle' | 'none' | 'rainbow';

export type FontFamily = 'system' | 'sans' | 'mono' | 'display';

export interface AppCustomization {
  // Positioning & Window
  collapseDirection: CollapseDirection;
  collapseDelayMs: number;
  
  // Animation
  animationType: AnimationType;
  animationSpeedMs: number;
  
  // Background & Media
  bgType: BackgroundType;
  bgTheme: BackgroundTheme;
  customBgUrl: string;       // image, gif, or video URL / local path
  customBgDim: number;       // in % (0 - 90%)
  customBgBlur: number;      // in px (0 - 40px)
  bgBlur: number;            // in px (0 - 50px)
  bgOpacity: number;         // in % (30 - 100%)
  borderStyle: BorderStyle;
  collapsedShape: CollapsedShape;
  
  // Accent & Colors
  accentColor: string;
  
  // Album Art & Music
  albumArtSpin: boolean;     // vinyl spin animation when playing
  albumArtGlow: boolean;     // colorful ambient glow behind album
  albumArtRadius: 'normal' | 'rounded' | 'circle';
  showVisualizer: boolean;   // animated simulated EQ visualizer bars
  
  // Typography
  fontFamily: FontFamily;
  
  // Lyrics
  lyricsFontSize: 'small' | 'medium' | 'large';
  lyricsAlign: 'left' | 'center';
  lyricsGlow: boolean;
  activeLyricStyle: 'spotify-glow' | 'accent-gradient' | 'minimal-line';
}

export interface AppSettings extends AppCustomization {
  clientId: string;
}
