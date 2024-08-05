import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportPlaylist = ({ onTracksChange }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [error, setError] = useState('');

  const handlePlaylistUrlChange = (event) => {
    setPlaylistUrl(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUrlImport = async () => {
    if (playlistUrl.trim() === '') {
      setError('Please enter a Spotify playlist URL.');
      return;
    }

    try {
      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        setError('Invalid Spotify playlist URL.');
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
      const results = await searchPlaylists(searchQuery);
      setSearchResults(results.slice(0, 5));
      setError('');
    } catch (error) {
      console.error('Error searching playlists:', error);
      setError('Failed to search playlists. Please try again.');
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const tracks = await fetchPlaylistTracks(playlist.id);
      const formattedTracks = tracks.map(track => `${track.track.name} - ${track.track.artists[0].name}`);
      setAllTracks(formattedTracks);
      
      const initialSelectedTracks = formattedTracks.slice(0, 10);
      setSelectedTracks(initialSelectedTracks);
      onTracksChange(initialSelectedTracks);
      
      setError('');
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setError('Failed to import playlist. Please try again.');
    }
  };

  const toggleTrack = (track) => {
    if (selectedTracks.includes(track)) {
      const updatedTracks = selectedTracks.filter(t => t !== track);
      setSelectedTracks(updatedTracks);
      onTracksChange(updatedTracks);
    } else if (selectedTracks.length < 10) {
      const updatedTracks = [...selectedTracks, track];
      setSelectedTracks(updatedTracks);
      onTracksChange(updatedTracks);
    }
  };

  const extractPlaylistId = (url) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const searchPlaylists = async (query) => {
    const accessToken = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.data.playlists.items;
  };

  const fetchPlaylistTracks = async (playlistId) => {
    const accessToken = await getAccessToken();
    const playlistData = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return playlistData.data.tracks.items;
  };

  const getAccessToken = async () => {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return tokenResponse.data.access_token;
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Spotify Playlist</h2>
      
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter Spotify playlist URL..."
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
                <div className='font-base font-jakarta md:text-xl text-sm'>{playlist.name} - {playlist.owner.display_name}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Playlist Tracks</h2>
          <p className="text-sm text-gray-700">Select up to 10 tracks. Currently selected: {selectedTracks.length}</p>
          <p className="mb-2 text-base font-medium text-gray-900">Click on the track to select or unselect</p>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track) => (
              <li key={track} onClick={() => toggleTrack(track)} className="cursor-pointer flex md:gap-4 gap-2 mb-2 w-full items-center">
                <button
                  className={`p-2 rounded-md ${selectedTracks.includes(track) ? 'bg-[#A18249] text-white' : 'bg-[#F4EFE6] text-black'} font-extrabold`}
                >
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