import React, { useState, useEffect } from 'react';
import { Search, Music, Loader2 } from 'lucide-react';

const PlaylistViewer = () => {
  const [searchInput, setSearchInput] = useState('');
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Convert milliseconds to mm:ss format
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (playlist && playlist.tracks.length > 0 && !currentTrack) {
      setCurrentTrack(playlist.tracks[0]);
    }
  }, [playlist]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const isUrl = searchInput.includes('/');
      const params = isUrl ? `url=${searchInput}` : `search=${searchInput}`;
      const response = await fetch(`/api/soundcloud?${params}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch playlist');
      }
      
      const data = await response.json();
      console.log(data);
      setPlaylist(data);
      setCurrentTrack(null); // Reset current track when new playlist loads
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPlaylist(null);
      setCurrentTrack(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen p-4 space-y-4">
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-6 h-6 text-indigo-500" />
          <h2 className="text-lg font-semibold">SoundCloud Playlist Viewer</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter playlist URL or search term"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchInput.trim()}
            className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-2">Search</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p>{error}</p>
        </div>
      )}

      {currentTrack && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${currentTrack.permalink_url}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
            className="mb-4"
          />
        </div>
      )}

      {playlist && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{playlist.title}</h3>
            {playlist.description && (
              <p className="text-sm text-gray-500">{playlist.description}</p>
            )}
          </div>
          <div className="space-y-2">
            {playlist.tracks.map((track) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
                onClick={() => handleTrackClick(track)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{track.title}</h4>
                  <p className="text-sm text-gray-600">{track.creator}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDuration(track.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistViewer;