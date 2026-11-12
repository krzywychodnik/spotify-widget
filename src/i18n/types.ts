export type Language = "en" | "pl";

export interface TranslationDictionary {
  common: {
    appName: string;
    close: string;
    cancel: string;
    save: string;
    reset: string;
    copied: string;
    copy: string;
    loading: string;
    error: string;
    language: string;
  };
  player: {
    noPlayback: string;
    playSomething: string;
    lyricsTab: string;
    playlistsTab: string;
    playerTab: string;
    collapseWidget: string;
    pinWindow: string;
    unpinWindow: string;
    settings: string;
    close: string;
    play: string;
    pause: string;
    previous: string;
    next: string;
    shuffle: string;
    repeat: string;
    repeatOff: string;
    repeatTrack: string;
    repeatContext: string;
    volume: string;
    mute: string;
    unmute: string;
    openPlaylists: string;
    yourPlaylists: string;
  };
  collapsed: {
    play: string;
    pause: string;
    previous: string;
    next: string;
  };
  lyrics: {
    loadingLyrics: string;
    noLyrics: string;
    enjoyMusic: string;
  };
  playlists: {
    title: string;
    searchPlaceholder: string;
    loadingPlaylists: string;
    noPlaylists: string;
    noSearchResults: string;
    trackCountOne: string;
    trackCountFew: string;
    trackCountMany: string;
    fetchError: string;
    play: string;
  };
  settings: {
    title: string;
    tabs: {
      appearance: string;
      interaction: string;
      spotify: string;
    };
    language: {
      title: string;
      en: string;
      pl: string;
    };
    presets: {
      title: string;
      oneClick: string;
      authorMocha: string;
      authorMochaDesc: string;
      authorBadge: string;
      authorFavNotice: string;
      spotifyClassic: string;
      spotifyClassicDesc: string;
      classicBadge: string;
      cyberNeon: string;
      cyberNeonDesc: string;
      cyberBadge: string;
      aquaFrost: string;
      aquaFrostDesc: string;
      minimalBadge: string;
      sunsetAmber: string;
      sunsetAmberDesc: string;
      warmBadge: string;
      lofiSakura: string;
      lofiSakuraDesc: string;
      lofiBadge: string;
    };
    accentColor: {
      title: string;
      activeColor: string;
      customColor: string;
    };
    collapseDirection: {
      title: string;
      topRight: string;
      topLeft: string;
      bottomRight: string;
      bottomLeft: string;
      center: string;
    };
    animation: {
      title: string;
      spring: string;
      fadeZoom: string;
      slide: string;
      elastic: string;
      fold: string;
      minimal: string;
      speedTitle: string;
    };
    background: {
      title: string;
      glass: string;
      oled: string;
      frosted: string;
      gradient: string;
      aurora: string;
      particles: string;
      mesh: string;
      gif: string;
      selectGif: string;
      offline: string;
      opacity: string;
      blur: string;
    };
    shape: {
      title: string;
      square: string;
      circle: string;
      capsule: string;
    };
    interaction: {
      expandTriggerTitle: string;
      onHover: string;
      onClick: string;
      hoverDesc: string;
      clickDesc: string;
      collapsedControlsTitle: string;
      controlsHover: string;
      controlsAlways: string;
      controlsHidden: string;
      progressIndicatorTitle: string;
      progressRadial: string;
      progressBottom: string;
      progressNone: string;
      vinylSpin: string;
      vinylSpinDesc: string;
      ambientGlow: string;
      eqVisualizer: string;
      lyricsFontSizeTitle: string;
      sizeSmall: string;
      sizeMedium: string;
      sizeLarge: string;
      activeLyricStyleTitle: string;
      styleGlow: string;
      styleGradient: string;
      styleLine: string;
      collapseDelayTitle: string;
      resetDefaults: string;
    };
    spotify: {
      clientId: string;
      pasteClientId: string;
      save: string;
      redirectUri: string;
      copy: string;
      copied: string;
      connected: string;
      logout: string;
      loginWithSpotify: string;
      manualFallback: string;
      pasteCallbackPlaceholder: string;
      authorize: string;
    };
  };
}
