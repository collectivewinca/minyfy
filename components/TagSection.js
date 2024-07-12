import React, { useState, useEffect } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";

const TagSection = ({ onTracksChange }) => {
  const [topTags, setTopTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [searchedTag, setSearchedTag] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopTags();
  }, []);

  const fetchTopTags = async () => {
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.getTopTags&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setTopTags(data.tags.tag);
    } catch (error) {
      console.error('Error fetching top tags:', error);
    }
  };

  const fetchTopTracksByTag = async (tagName) => {
    const url = `https://ws.audioscrobbler.com/2.0/?method=tag.getTopTracks&tag=${encodeURIComponent(tagName)}&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        setError('No tracks found for this tag.');
        setTopTracks([]);
        onTracksChange([]); // Clear the tracks if there is an error
      } else {
        const trackList = data.tracks.track.map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`);
        setTopTracks(trackList);
        onTracksChange(trackList);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching top tracks by tag:', error);
    }
  };

  const handleTagSelection = (tagName) => {
    setSelectedTag(tagName);
    fetchTopTracksByTag(tagName);
  };

  const handleInputChange = (event) => {
    setSearchedTag(event.target.value);
  };

  const handleSearch = () => {
    if (searchedTag.trim() === '') {
      setError('Please enter a tag name.');
      setTopTracks([]);
      onTracksChange([]); // Clear the tracks if input is empty
      return;
    }
    setSelectedTag(searchedTag);
    fetchTopTracksByTag(searchedTag);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full md:w-[70%]">
      <div className="mt-5">
        <h2 className="md:text-2xl text-xl font-medium mb-4 font-jakarta">Select from This Week&rsquo;s Top Genres</h2>
        <ul className="grid md:grid-cols-5 grid-cols-2  gap-2">
          {topTags.map((tag) => (
            <li key={tag.name}>
              <button
                className="cursor-pointer rounded-full text-sm font-jakarta  bg-[#f9d6bb] px-4 text-neutral-700   font-medium tracking-wide py-2 w-full text-center hover:bg-[#f48531] hover:text-black"
                onClick={() => handleTagSelection(tag.name)}
              >
                {capitalizeWords(tag.name)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="md:text-2xl text-xl font-medium mb-4 font-jakarta">Search Genre</h2>
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-neutral-200 text-lg text-neutral-500  rounded-l-xl"
            placeholder="Enter tag name..."
            value={searchedTag}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#f48531] px-5 py-3 rounded-r-xl text-lg font-medium text-white hover:bg-[#fc9648]"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {selectedTag && (
        <div className="mt-5">
          <h2 className="text-xl font-medium tracking-wider mb-4 font-jakarta">Top Tracks for {selectedTag}</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {topTracks.map((track) => (
              <li key={track}  className=" flex md:gap-4 gap-2 mb-2 w-full items-center">
              <div className='p-2 rounded-md bg-[#f48531] font-extrabold text-white'><PiMusicNoteFill className='md:text-2xl text-lg '/></div>
              <div className='font-base font-jakarta md:text-xl text-lg'>{track}</div>
            </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TagSection;
