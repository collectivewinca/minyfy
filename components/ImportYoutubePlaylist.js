import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportPlaylist = ({ onTracksChange }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [error, setError] = useState('');

  const handlePlaylistUrlChange = (event) => {
    setPlaylistUrl(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUrlImport = async () => {
    if (playlistUrl.trim() === '') {
      setError('Please enter a YouTube playlist URL.');
      return;
    }

    try {
      const playlistId = extractYouTubePlaylistId(playlistUrl);
      if (!playlistId) {
        setError('Invalid YouTube playlist URL.');
        return;
      }

      await handlePlaylistSelect({ id: playlistId });
    } catch (error) {
      console.error('Error importing playlist:', error);
      setError('Failed to import playlist. Please check the URL and try again.');
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setError('Please enter a playlist name to search.');
      return;
    }

    try {
      const results = await searchYouTubePlaylists(searchQuery);
      setSearchResults(results.slice(0, 10));
      setError('');
    } catch (error) {
      console.error('Error searching playlists:', error);
      setError('Failed to search playlists. Please try again.');
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const tracks = await fetchYouTubePlaylistTracks(playlist.id);
      const formattedTracks = tracks.map(track => track.name);
      setAllTracks(formattedTracks);
      onTracksChange(formattedTracks);
      setError('');
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setError('Failed to import playlist. Please try again.');
    }
  };

  const extractYouTubePlaylistId = (url) => {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const searchYouTubePlaylists = async (query) => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10`
    );
    return response.data.items.map(item => ({
      id: item.id.playlistId,
      name: item.snippet.title,
      owner: item.snippet.channelTitle
    }));
  };

  const fetchYouTubePlaylistTracks = async (playlistId) => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
    );
    return response.data.items.map(item => ({
      name: item.snippet.title
    }));
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import YouTube Playlist</h2>
      
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter YouTube playlist URL..."
            value={playlistUrl}
            onChange={handlePlaylistUrlChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
            onClick={handleUrlImport}
          >
            Import
          </button>
        </div>

        <div className='text-center font-bold text-2xl'>OR</div>

        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Search for a playlist..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
      
      {searchResults.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Search Results</h2>
          <ul className="md:pl-5 pl-2 list-disc text-lg">
            {searchResults.map((playlist) => (
              <li key={playlist.id} onClick={() => handlePlaylistSelect(playlist)} className="cursor-pointer flex md:gap-4 gap-2 mb-2 w-full items-center">
                <button className="p-2 rounded-md bg-[#F4EFE6] text-black font-extrabold">
                  <PiMusicNoteFill className='md:text-2xl text-lg' />
                </button>
                <div className='font-base font-jakarta md:text-xl text-sm'>{playlist.name} - {playlist.owner}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Playlist Tracks</h2>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track) => (
              <li key={track} className="flex md:gap-4 gap-2 mb-2 w-full items-center">
                <button className="p-2 rounded-md bg-[#F4EFE6] text-black font-extrabold">
                  <PiMusicNoteFill className='md:text-2xl text-lg' />
                </button>
                <div className='font-base font-jakarta md:text-xl text-sm'>{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportPlaylist;
