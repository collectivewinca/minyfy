import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportRedditPlaylist = ({ onTracksChange }) => {
  const [redditUrl, setRedditUrl] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedditUrlChange = (event) => {
    setRedditUrl(event.target.value);
  };

  const cleanTrackName = (track) => {
    // Remove number + dot/parenthesis only from start of string
    return track.replace(/^\d+[\.\)]?\s*/, '').trim();
  };

  const handleUrlImport = async () => {
    if (redditUrl.trim() === '') {
      setError('Please enter a Reddit post URL.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${redditUrl}.json`;
      const response = await axios.get(apiUrl);
      
      const postBody = response.data[0].data.children[0].data.selftext;
      const lines = postBody.split('\n').filter(line => line.trim());
      
      // Clean each track name by removing prefixes
      const validTracks = lines.map(line => cleanTrackName(line)).filter(line => line !== '');

      setAllTracks(validTracks);
      const initialSelectedTracks = validTracks.slice(0, 10); // Limit initial selection to 10
      setSelectedTracks(initialSelectedTracks);
      onTracksChange(initialSelectedTracks);
      setError('');
    } catch (error) {
      console.error('Error importing from Reddit:', error);
      setError('Failed to import playlist. Please check the URL and try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Reddit Playlist</h2>
      
      <div className="flex items-center">
        <input
          type="text"
          className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
          placeholder="Enter Reddit post URL..."
          value={redditUrl}
          onChange={handleRedditUrlChange}
        />
        <button
          className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
          onClick={handleUrlImport}
          disabled={loading}
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
      
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

export default ImportRedditPlaylist;
