import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportPlaylist = ({ onTracksChange }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setPlaylistUrl(event.target.value);
  };

  const handleImport = async () => {
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

      const tracks = await fetchPlaylistTracks(playlistId);
      
      const formattedTracks = tracks.map(track => `${track.track.name} - ${track.track.artists[0].name}`);
      setAllTracks(formattedTracks);
      
      const initialSelectedTracks = formattedTracks.slice(0, 10);
      setSelectedTracks(initialSelectedTracks);
      onTracksChange(initialSelectedTracks);
      
      setError('');
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setError('Failed to import playlist. Please check the URL and try again.');
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

  const fetchPlaylistTracks = async (playlistId) => {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    // Get access token
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

    const accessToken = tokenResponse.data.access_token;

    // Fetch playlist data
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

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Spotify Playlist</h2>
      
      <div className="flex items-center">
        <input
          type="text"
          className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
          placeholder="Enter Spotify playlist URL..."
          value={playlistUrl}
          onChange={handleInputChange}
        />
        <button
          className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
          onClick={handleImport}
        >
          Import
        </button>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
      
      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Playlist Tracks</h2>
          <p className=" text-sm text-gray-700">Select up to 10 tracks. Currently selected: {selectedTracks.length}</p>
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