import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Play, Music, Loader2, RotateCw, ListMusic } from "lucide-react";
import { SpotifyPlaylist } from "../types";
import { fetchUserPlaylists, fetchCurrentUser, SpotifyUserProfile } from "../services/spotifyApi";

interface PlaylistsViewProps {
  onPlayPlaylist: (uri: string) => void;
  onBackToPlayer?: () => void;
}

function formatTrackCount(count?: number): string | null {
  if (typeof count !== "number" || count <= 0) return null;
  if (count === 1) return "1 utwór";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} utwory`;
  }
  return `${count} utworów`;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  onPlayPlaylist,
}) => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentUser, setCurrentUser] = useState<SpotifyUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, user] = await Promise.all([
        fetchUserPlaylists(50),
        fetchCurrentUser(),
      ]);
      setPlaylists(items);
      if (user) {
        setCurrentUser(user);
      }
    } catch (err: any) {
      setError("Nie udało się pobrać playlist. Upewnij się, że jesteś zalogowany ze zaktualizowanymi uprawnieniami.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPlaylists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [playlists, searchQuery]);

  const handleSelect = (uri: string) => {
    setPlayingUri(uri);
    onPlayPlaylist(uri);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none z-10 bg-black/35 backdrop-blur-md">
      {/* Search Header */}
      <div className="p-3 border-b border-white/5 bg-black/30 backdrop-blur-md space-y-2 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj w swoich playlistach..."
            className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/10 focus:border-[var(--accent-color)] rounded-xl py-2 pl-10 pr-9 text-xs text-white placeholder-white/40 focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition"
              title="Wyczyść"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-[10px] text-white/50 px-1">
          <span>
            {isLoading
              ? "Ładowanie playlist..."
              : `Znaleziono: ${filteredPlaylists.length} ${
                  searchQuery ? `(z ${playlists.length})` : ""
                }`}
          </span>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1 text-white/50 hover:text-white transition disabled:opacity-30"
            title="Odśwież playlisty"
          >
            <RotateCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Odśwież</span>
          </button>
        </div>
      </div>

      {/* Playlist List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 lyrics-scroll-container">
        {isLoading && playlists.length === 0 ? (
          <div className="w-full h-48 flex flex-col items-center justify-center gap-2 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-color)]" />
            <span className="text-xs">Pobieranie playlist ze Spotify...</span>
          </div>
        ) : error ? (
          <div className="w-full p-4 text-center space-y-3">
            <p className="text-xs text-red-300/90 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {error}
            </p>
            <button
              onClick={loadData}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="w-full h-48 flex flex-col items-center justify-center gap-2 text-white/40 text-center px-4">
            <ListMusic className="w-8 h-8 text-white/20 mb-1" />
            <span className="text-xs font-medium">
              {searchQuery ? `Brak wyników dla „${searchQuery}”` : "Brak playlist na Twoim koncie"}
            </span>
          </div>
        ) : (
          filteredPlaylists.map((pl) => {
            const coverUrl = pl.images?.[0]?.url;
            const isSelected = playingUri === pl.uri;
            const trackCountText = formatTrackCount(pl.tracks?.total);
            const isOwn =
              (currentUser?.id && pl.owner?.id === currentUser.id) ||
              (pl.owner?.id && pl.owner.id.length > 20 && !pl.owner.display_name) ||
              pl.owner?.id === "31e5gsqk4tezihn5tju2n6trb5nu";

            const ownerName = isOwn
              ? "Ty"
              : pl.owner?.display_name && pl.owner.display_name !== pl.owner.id
              ? pl.owner.display_name
              : "Spotify";

            return (
              <div
                key={pl.id}
                onClick={() => handleSelect(pl.uri)}
                className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white/15 border-[var(--accent-color)] shadow-sm"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 pr-2">
                  {/* Playlist Cover */}
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0 shadow-sm">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={pl.name}
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <Music className="w-5 h-5" />
                      </div>
                    )}
                    {/* Play hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Play className="w-4 h-4 fill-white text-white drop-shadow" />
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="overflow-hidden flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate group-hover:text-[var(--accent-color)] transition-colors">
                      {pl.name}
                    </h4>
                    <p className="text-[10px] text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                      {trackCountText ? (
                        <>
                          <span>{trackCountText}</span>
                          <span>•</span>
                        </>
                      ) : (
                        <>
                          <span>Playlista</span>
                          <span>•</span>
                        </>
                      )}
                      <span className="truncate">{ownerName}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Play Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(pl.uri);
                  }}
                  style={{
                    backgroundColor: isSelected ? "var(--accent-color)" : "transparent",
                  }}
                  className={`p-2 rounded-full transition shadow-md shrink-0 ${
                    isSelected
                      ? "text-black scale-105"
                      : "text-white/60 hover:text-black hover:bg-[var(--accent-color)] group-hover:text-white"
                  }`}
                  title={`Odtwórz ${pl.name}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
