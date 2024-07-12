import React, { useState, useEffect } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";

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
        <h2 className="text-2xl font-medium mb-4 font-jakarta">Select from this Week&lsquo;s Top Artists</h2>
        <ul className=" grid md:grid-cols-5 grid-cols-2  gap-2">
          {topArtists.map((artist) => (
            <li key={artist.name} className=''>
              <button
                className="cursor-pointer rounded-full text-sm font-jakarta  bg-[#f9d6bb] px-4 text-neutral-700   font-medium tracking-wide py-2 w-full text-center hover:bg-[#f48531] hover:text-black"
                onClick={() => handleArtistSelection(artist.name)}
              >
                {artist.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-medium mb-4 font-jakarta">Search for Artist</h2>
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-neutral-200 text-lg text-neutral-500  rounded-l-xl"
            placeholder="Enter artist name..."
            value={searchedArtist}
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

      {selectedArtist && (
        <div className="mt-5 font-jakarta">
          <h2 className="text-xl font-medium tracking-wider mb-4 font-jakarta">{selectedArtist}&lsquo;s Top Tracks</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <ul className="pl-5 list-disc text-lg uppercase">
            {topTracks.map((track) => (
              <li  className=" flex gap-4 mb-2 w-full items-center">
                <div className='p-2 rounded-md bg-[#f48531] font-extrabold text-white'><PiMusicNoteFill className='text-2xl'/></div>
                <div className='font-base font-jakarta text-xl'>{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArtistSection;
