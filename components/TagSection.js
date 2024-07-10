import React, { useState, useEffect } from 'react';

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
    <div className="mt-5 flex flex-col justify-start w-full md:w-[70%]">
      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Select from This Week&lsquo;s Top Tags</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4  gap-2">
          {topTags.map((tag) => (
            <li key={tag.name}>
              <button
                className="cursor-pointer uppercase rounded-xl text-sm border-2 bg-[#78c144] border-black px-2 font-semibold tracking-wide py-1 w-full text-left hover:bg-gray-200"
                onClick={() => handleTagSelection(tag.name)}
              >
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Search for Tag</h2>
        <div className="flex gap-1 items-center">
          <input
            type="text"
            className="border-[2.5px] border-black px-4 py-1 rounded-xl text-lg font-medium w-full"
            placeholder="Enter tag name..."
            value={searchedTag}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#78c144] border-2 border-[#78c144] px-4 py-1 rounded-xl text-lg font-medium text-white hover:bg-[#5b9e44]"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {selectedTag && (
        <div className="mt-5">
          <h2 className="text-2xl font-semibold mb-4">Top Tracks for {selectedTag}</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <ul className="pl-5 list-disc text-lg">
            {topTracks.map((track) => (
              <li key={track}>
                {track}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TagSection;
