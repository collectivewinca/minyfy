import React, { useState } from 'react';
import { BsPlusLg } from "react-icons/bs";
import { PiMusicNoteFill } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import axios from 'axios';

const CustomSection = ({ onTracksChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trackList, setTrackList] = useState([]);
  const [bulkInput, setBulkInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleBulkInputChange = (event) => {
    setBulkInput(event.target.value);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /* Commented out Spotify token function
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
  */

  /* Commented out Spotify track search
  const searchTrack = async (query) => {
    const accessToken = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.data.tracks.items;
  };
  */

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setError('Please enter a track name to search.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search Last.fm instead of Spotify
      const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(searchQuery)}&api_key=913f1b2c2126b54f985407d31d49da12&format=json&limit=8`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.trackmatches && data.results.trackmatches.track) {
        const tracks = data.results.trackmatches.track.map(track => ({
          name: track.name,
          artist: track.artist
        }));
        setSearchResults(tracks);
      } else {
        setError('No tracks found.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      setError('Failed to search tracks. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = (track) => {
    const trackString = `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist)}`;
    if (!trackList.includes(trackString)) {
      setTrackList([...trackList, trackString]);
      onTracksChange([...trackList, trackString]);
    }
  };

  const handleTrackRemove = (index) => {
    const newTrackList = trackList.filter((_, i) => i !== index);
    setTrackList(newTrackList);
    onTracksChange(newTrackList);
  };

  const handleBulkImport = () => {
    if (bulkInput.trim() === '') {
      setError('Please enter tracks to import.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tracks = bulkInput
        .split('\n')
        .map(track => track.trim())
        .filter(track => track !== '');

      const newTracks = [...trackList];
      let addedCount = 0;

      tracks.forEach(track => {
        if (!newTracks.includes(track)) {
          newTracks.push(track);
          addedCount++;
        }
      });

      setTrackList(newTracks);
      onTracksChange(newTracks);
      setLoadingProgress(`Added ${addedCount} new tracks.`);
      setBulkInput('');
    } catch (error) {
      console.error('Error importing tracks:', error);
      setError('Failed to import tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Add Custom Tracks</h2>
      
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Search for a track..."
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex items-center">
          <textarea
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter tracks (one per line)..."
            value={bulkInput}
            onChange={handleBulkInputChange}
            rows={3}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
            onClick={handleBulkImport}
            disabled={loading}
          >
            Import
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {loadingProgress && <p className="text-green-600 mt-2">{loadingProgress}</p>}
      
      {searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Search Results:</h3>
          <div className="space-y-2">
            {searchResults.map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-[#F4EFE6] rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <PiMusicNoteFill className="text-[#A18249]" />
                  <span>{capitalizeWords(track.name)} - {capitalizeWords(track.artist)}</span>
                </div>
                <button
                  onClick={() => handleTrackSelect(track)}
                  className="p-1 hover:bg-[#A18249] rounded-full"
                >
                  <BsPlusLg className="text-[#A18249]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {trackList.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Selected Tracks:</h3>
          <div className="space-y-2">
            {trackList.map((track, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#F4EFE6] rounded-lg">
                <div className="flex items-center gap-2">
                  <PiMusicNoteFill className="text-[#A18249]" />
                  <span>{track}</span>
                </div>
                <button
                  onClick={() => handleTrackRemove(index)}
                  className="p-1 hover:bg-red-100 rounded-full"
                >
                  <MdDelete className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSection;