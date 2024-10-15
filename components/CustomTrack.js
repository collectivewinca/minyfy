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
    const lines = event.target.value.split('\n');
    if (lines.length > 11) {
      alert('Please limit your input to 10 lines.');
      setBulkInput(lines.slice(0, 10).join('\n'));
    } else {
      setBulkInput(event.target.value);
    }
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
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

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      alert('Please enter a track name.');
      return;
    }

    try {
      const tracks = await searchTrack(searchQuery);
      if (tracks.length === 0) {
        alert('No tracks found.');
        setSearchResults([]);
      } else {
        const formattedResults = tracks.map(track => ({
          name: capitalizeWords(track.name),
          artist: capitalizeWords(track.artists[0].name),
          formattedString: `${capitalizeWords(track.name)} - ${capitalizeWords(track.artists[0].name)}`
        }));
        setSearchResults(formattedResults);
        setError('');
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      alert('An error occurred while searching for tracks.');
    }
  };

  const addToTrackList = (track) => {
    const formattedTrack = `${track.name} - ${track.artist}`;
    if (trackList.length < 10 && !trackList.includes(formattedTrack)) {
      const updatedTrackList = [...trackList, formattedTrack];
      setTrackList(updatedTrackList);
      onTracksChange(updatedTrackList);
    } else if (trackList.includes(formattedTrack)) {
      alert('This track is already in your list.');
    } else {
      alert('You can only add up to 10 unique tracks.');
    }
  };

  const removeFromTrackList = (trackToRemove) => {
    const updatedTrackList = trackList.filter((track) => track !== trackToRemove);
    setTrackList(updatedTrackList);
    onTracksChange(updatedTrackList);
  };

  const handleBulkAdd = async () => {
    setLoading(true);
  
    // Clean the bulk input by removing unnecessary quotes and trimming whitespace
    const tracks = bulkInput
      .split('\n')
      .map(line => line.replace(/["']/g, '').trim())  // Remove quotes and trim whitespace
      .filter(track => track !== '');
  
    const updatedTrackList = [...trackList];
    const skippedTracks = [];
    const invalidTracks = [];
  
  
    for (let i = 0; i < tracks.length && updatedTrackList.length < 10; i++) {
      setLoadingProgress(`${i + 1}/${tracks.length}`);
  
      const track = tracks[i];
  
      try {
        const searchResults = await searchTrack(track);
        if (searchResults.length > 0) {
          const foundTrack = searchResults[0];
          const formattedTrack = `${capitalizeWords(foundTrack.name)} - ${capitalizeWords(foundTrack.artists[0].name)}`;
          if (!updatedTrackList.includes(formattedTrack)) {
            updatedTrackList.push(formattedTrack);
          }
        } else {
          skippedTracks.push(track);
        }
      } catch (error) {
        console.error('Error searching track:', error);
        skippedTracks.push(track);
      }
    }
  
    setTrackList(updatedTrackList);
    onTracksChange(updatedTrackList);
    setBulkInput('');
    setLoading(false);
    setLoadingProgress('');
  
    // Notify the user about invalid format tracks
    if (invalidTracks.length > 0) {
      alert(`The following tracks were in the wrong format and skipped:\n${invalidTracks.join('\n')}\nPlease use the format: trackName - artistName for accurate results.`);
    }
  
    // Notify the user about skipped tracks that weren't found
    if (skippedTracks.length > 0) {
      alert(`The following tracks were not found and skipped:\n${skippedTracks.join('\n')}`);
    }
  
    if (updatedTrackList.length === 10) {
      alert('Maximum of 10 tracks reached. Some tracks may not have been added.');
    }
  };
  

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <div className="mt-5">
        <h2 className="md:text-xl text-base font-medium mb-4 font-jakarta">Search for Track</h2>
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter track name..."
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="md:text-xl text-base font-medium mb-4 font-jakarta">Search Results</h2>
        <ul className="md:pl-5 pl-1 list-disc text-lg">
          {searchResults.map((track, index) => (
            <li key={index} className="flex justify-between items-center font-jakarta mb-1">
              <div className='flex gap-2 items-center'>
                <PiMusicNoteFill className="text-[#A18249] md:text-xl text-sm" />
                <span><strong className='font-semibold'>{track.name}</strong> by {track.artist}</span>
              </div>
              
              <button
                className="p-1 rounded-md text-sm font-medium text-black hover:bg-[#A18249]"
                onClick={() => addToTrackList(track)}
              >
                <BsPlusLg className='text-2xl' />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="md:text-xl text-base font-medium mb-4 font-jakarta">Multi-Track Search</h2>
        <p className="text-sm text-gray-600 mb-2">Enter up to 10 tracks (one per line) -  <strong>Use Format : Track Name - Artist Name </strong> </p>
        <textarea
          className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-base text-sm text-neutral-500 rounded-xl mb-2"
          placeholder={`Dance The Night - Dua Lipa\nWhat Was I Made For? - Billie Eilish\nPaint The Town Red - Doja Cat\n....`}
          rows="10"
          value={bulkInput}
          onChange={handleBulkInputChange}
        />

        <button
          className="bg-[#A18249] px-5 py-3 rounded-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
          onClick={handleBulkAdd}
          disabled={loading}
        >
          {loading ? `Adding Tracks... ${loadingProgress}` : 'Add Tracks'}
        </button>
      </div>

      

      <div className="mt-5">
        <h2 className="md:text-2xl text-lg font-medium mb-4 font-jakarta">Track List</h2>
        <ul className="md:pl-5 pl-1 list-disc text-lg">
          {trackList.map((track, index) => (
            <li key={`${track}-${index}`} className="flex font-jakarta justify-between items-center mb-1">
              <div className='flex gap-2 items-center'>
                <PiMusicNoteFill className="text-[#A18249] md:text-xl text-sm" />
                <span>{track}</span>
              </div>
              <button
                className="p-1 rounded-md text-sm font-medium text-black hover:bg-[#A18249]"
                onClick={() => removeFromTrackList(track)}
              >
                <MdDelete className='text-2xl' />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSection;