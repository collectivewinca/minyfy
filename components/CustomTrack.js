import React, { useState } from 'react';
import { BsPlusLg } from "react-icons/bs";
import { PiMusicNoteFill } from "react-icons/pi";
import { IoRemoveOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

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
      alert('You can only add upto 10 unique tracks.');
    }
  };

  const removeFromTrackList = (trackToRemove) => {
    const updatedTrackList = trackList.filter((track) => track !== trackToRemove);
    setTrackList(updatedTrackList);
    onTracksChange(updatedTrackList);
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <div className="mt-5">
        <h2 className="md:text-xl text-base font-medium mb-4 font-jakarta">Search for Track</h2>
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500  rounded-l-xl"
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
                className=" p-1 rounded-md text-sm font-medium text-black hover:bg-[#A18249]"
                onClick={() => addToTrackList(track)}
              >
                <BsPlusLg className='text-2xl' />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="md:text-2xl text-lg font-medium mb-4 font-jakarta">Track List</h2>
        <ul className="md:pl-5 pl-1  list-disc text-lg">
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