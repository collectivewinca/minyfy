import React, { useState } from 'react';

const CustomSection = ({ onTracksChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trackList, setTrackList] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      alert('Please enter a track name.');
      return;
    }

    const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
      searchQuery
    )}&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.error || !data.results.trackmatches.track) {
        alert('No tracks found.');
        setSearchResults([]);
      } else {
        const formattedResults = data.results.trackmatches.track.map(track => ({
          name: capitalizeWords(track.name),
          artist: capitalizeWords(track.artist),
          formattedString: `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist)}`
        }));
        setSearchResults(formattedResults.slice(0, 5));
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
      alert('You can add up to 10 unique tracks.');
    }
  };

  const removeFromTrackList = (trackToRemove) => {
    const updatedTrackList = trackList.filter((track) => track !== trackToRemove);
    setTrackList(updatedTrackList);
    onTracksChange(updatedTrackList);
  };

  return (
    <div className="mt-5 flex flex-col justify-start w-full md:w-[70%]">
      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Search for Track</h2>
        <div className="flex gap-1 items-center">
          <input
            type="text"
            className="border-[2.5px] border-black px-4 py-1 rounded-xl text-lg font-medium w-full"
            placeholder="Enter track name..."
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#78c144] border-2 border-[#78c144] px-4 py-1 rounded-xl text-lg font-medium text-white hover:bg-[#5b9e44]"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
        <ul className="pl-5 list-disc text-lg">
          {searchResults.map((track, index) => (
            <li key={index} className="flex justify-between items-center mb-1">
              <span><strong>{track.name}</strong> by {track.artist}</span>
              <button
                className="bg-[#78c144] border-2 border-[#78c144] px-4 py-1 rounded-xl text-sm font-medium text-white hover:bg-[#5b9e44]"
                onClick={() => addToTrackList(track)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Track List</h2>
        <ul className="pl-5 list-disc text-lg">
          {trackList.map((track, index) => (
            <li key={`${track}-${index}`} className="flex justify-between items-center mb-1">
              <span>{track}</span>
              <button
                className="bg-red-600 border-2 border-red-600 px-2 py-1 rounded-xl text-sm font-medium text-white hover:bg-red-400"
                onClick={() => removeFromTrackList(track)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSection;