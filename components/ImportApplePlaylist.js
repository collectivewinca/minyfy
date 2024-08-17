import React, { useState, useEffect, useCallback } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportAppleMusicPlaylist = ({ onTracksChange }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [error, setError] = useState('');
  const [appleMusicToken, setAppleMusicToken] = useState('');



  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('/api/generate-am-token');
        setAppleMusicToken(response.data.token);
      } catch (error) {
        console.error('Error fetching Apple Music token:', error);
      }
    };

    fetchToken();
  }, []);

  const handlePlaylistUrlChange = (event) => {
    setPlaylistUrl(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUrlImport = async () => {
    if (playlistUrl.trim() === '') {
      setError('Please enter an Apple Music playlist URL.');
      return;
    }

    try {
      const playlistId = extractPlaylistId(playlistUrl);
      console.log('Playlist ID:', playlistId);
      if (!playlistId) {
        setError('Invalid Apple Music playlist URL.');
        return;
      }

      await handlePlaylistSelect({ id: `${playlistId}` });
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
      const tracks = await fetchPlaylistTracks(`${playlist.id}`);
      console.log('Fetched Tracks:', tracks); 
      setAllTracks(tracks);
      
      const initialSelectedTracks = tracks.slice(0, 10);
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
    const patterns = [
      /playlist\/[^\/]+\/([^\/]+)$/,
      /pl\.([a-zA-Z0-9]+)/
    ];
  
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // If the match starts with 'pl.', return it as is
        if (match[1].startsWith('pl.')) {
          return match[1];
        }
        // Otherwise, prepend 'pl.' to the match
        return `pl.${match[1]}`;
      }
    }
  
    return null;
  };
  

  const searchPlaylists = async (query) => {
    try {
      const response = await axios.get(
        `https://api.music.apple.com/v1/catalog/us/search?types=playlists&term=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${appleMusicToken}`
          }
        }
      );
      return response.data.results.playlists.data;
    } catch (error) {
      console.error('Error searching playlists:', error);
      throw error;
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const response = await axios.get(
        `https://api.music.apple.com/v1/catalog/us/playlists/${playlistId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${appleMusicToken}`
          }
        }
      );
  
      const trackList = response.data.data
        .slice(0, 30)  // Ensure we only take the first 10 tracks
        .map(track => 
          `${capitalizeWords(track.attributes.name)} - ${capitalizeWords(track.attributes.artistName)}`
        );
  
      return trackList;
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Apple Music Playlist</h2>
      
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter Apple Music playlist URL..."
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
                <div className='font-base font-jakarta md:text-xl text-sm'>{playlist.attributes.name} - {playlist.attributes.curatorName}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Playlist Tracks</h2>
          <p className="text-sm text-gray-700">Selected tracks: {selectedTracks.length}/10</p>
          <p className="mb-2 text-base font-medium text-gray-900">Click on the track to select or unselect</p>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track, index) => {
              const [name, artist] = track.split(' - ');
              return (
                <li 
                  key={index} 
                  onClick={() => toggleTrack(track)} 
                  className="cursor-pointer flex md:gap-4 gap-2 mb-2 w-full items-center"
                >
                  <button
                    className={`p-2 rounded-md ${selectedTracks.includes(track) ? 'bg-[#A18249] text-white' : 'bg-[#F4EFE6] text-black'} font-extrabold`}
                  >
                    <PiMusicNoteFill className='md:text-2xl text-lg' />
                  </button>
                  <div className='font-base font-jakarta md:text-xl text-sm'>{name} - {artist}</div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportAppleMusicPlaylist;
