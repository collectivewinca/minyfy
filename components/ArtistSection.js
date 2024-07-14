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
    <div className="my-5 flex flex-col justify-start w-full">
      <div className="mt-5">
        <h2 className="md:text-2xl text-xl font-medium mb-4 font-jakarta">Select from this Week&rsquo;s Top Artists</h2>
        <ul className=" grid md:grid-cols-5 grid-cols-2  gap-2">
          {topArtists.map((artist) => (
            <li key={artist.name} className=''>
              <button
                className="cursor-pointer rounded-full text-sm font-jakarta  bg-[#F4EFE6] px-4 text-neutral-700   font-medium tracking-wide py-2 w-full text-center hover:bg-[#f0e6d4] hover:text-black"
                onClick={() => handleArtistSelection(artist.name)}
              >
                {artist.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h2 className="md:text-2xl text-xl  font-medium mb-4 font-jakarta">Search for Artist</h2>
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] text-lg   rounded-l-xl"
            placeholder="Enter artist name..."
            value={searchedArtist}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl text-lg font-medium text-white hover:opacity-80"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {selectedArtist && (
        <div className="mt-5 font-jakarta">
          <h2 className="text-xl font-medium tracking-wider mb-4 font-jakarta">{selectedArtist}&rsquo;s Top Tracks</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <ul className="md:pl-5 pl-2  list-disc text-lg uppercase">
            {topTracks.map((track) => (
              <li key={track}  className=" flex md:gap-4 gap-2 mb-2 w-full items-center">
                <div className='p-2 rounded-md bg-[#F4EFE6] font-extrabold text-black'><PiMusicNoteFill className='md:text-2xl text-lg '/></div>
                <div className='font-base font-jakarta md:text-xl text-lg'>{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArtistSection;
