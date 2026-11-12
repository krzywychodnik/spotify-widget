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
