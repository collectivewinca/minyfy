import React, { useState, useEffect } from 'react';

const ArtistSection = ({ onTracksChange }) => {
  const [topArtists, setTopArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [searchedArtist, setSearchedArtist] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopArtists();
  }, []);

  const fetchTopArtists = async () => {
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setTopArtists(data.artists.artist);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  const fetchTopTracks = async (artistName) => {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        setError('Wrong Artist');
        setTopTracks([]);
        onTracksChange([]); // Clear the tracks if there is an error
      } else {
        const trackList = data.toptracks.track.map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`);
        setTopTracks(trackList);
        onTracksChange(trackList);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  const handleArtistSelection = (artistName) => {
    setSelectedArtist(artistName);
    fetchTopTracks(artistName);
  };

  const handleInputChange = (event) => {
    setSearchedArtist(event.target.value);
  };

  const handleSearch = () => {
    if (searchedArtist.trim() === '') {
      setError('Please enter an artist name.');
      setTopTracks([]);
      onTracksChange([]); // Clear the tracks if input is empty
      return;
    }
    setSelectedArtist(searchedArtist);
    fetchTopTracks(searchedArtist);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="mt-5 flex flex-col justify-start w-full md:w-[70%]">
      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Select from this Week's Top Artists</h2>
        <ul className=" grid grid-cols-4 gap-2">
          {topArtists.map((artist) => (
            <li key={artist.name}>
              <button
                className="cursor-pointer rounded-xl text-sm border-2 bg-[#78c144] border-black px-2 font-semibold tracking-wide py-1 w-full text-left hover:bg-gray-200"
                onClick={() => handleArtistSelection(artist.name)}
              >
                {artist.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-semibold mb-4">Search for Artist</h2>
        <div className="flex gap-1 items-center">
          <input
            type="text"
            className="border-[2.5px] border-black px-4 py-1 rounded-xl text-lg font-medium w-full"
            placeholder="Enter artist name..."
            value={searchedArtist}
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

      {selectedArtist && (
        <div className="mt-5">
          <h2 className="text-2xl font-semibold mb-4">{selectedArtist}'s Top Tracks</h2>
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

export default ArtistSection;
