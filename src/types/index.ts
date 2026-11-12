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

export type CollapsedShape = 'rounded-square' | 'circle' | 'capsule';

export interface AppCustomization {
  // Positioning & Window
  collapseDirection: CollapseDirection;
  collapseDelayMs: number;
  
  // Animation
  animationType: AnimationType;
  animationSpeedMs: number;
  
  // Appearance & Colors
  accentColor: string;
  bgTheme: BackgroundTheme;
  bgBlur: number;       // in px (e.g. 10 - 50)
  bgOpacity: number;    // in % (e.g. 60 - 100)
  collapsedShape: CollapsedShape;
  
  // Lyrics
  lyricsFontSize: 'small' | 'medium' | 'large';
  lyricsGlow: boolean;
  activeLyricStyle: 'spotify-glow' | 'accent-gradient' | 'minimal-line';
}

export interface AppSettings extends AppCustomization {
  clientId: string;
}
