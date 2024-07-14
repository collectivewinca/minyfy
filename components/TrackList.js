import React, { useState, useEffect } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";

const TracksList = ({ onTracksChange }) => {
  const [selectedCountry, setSelectedCountry] = useState('Worldwide');
  const [tracks, setTracks] = useState([]);
  const [selectedButton, setSelectedButton] = useState('Worldwide');

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleCountrySelection = (country) => {
    setSelectedCountry(country);
    setSelectedButton(country);
    fetchTracks(country);
  };

  const fetchTracks = async (country) => {
    let url = 'https://ws.audioscrobbler.com/2.0/?method=chart.getTopTracks&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json';
    if (country !== 'Worldwide') {
      url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${encodeURIComponent(country)}&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;
    }

    const response = await fetch(url);
    const data = await response.json();
    const trackList = data.tracks.track.map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`);
    setTracks(trackList);
    onTracksChange(trackList);
  };

  useEffect(() => {
    fetchTracks(selectedCountry);
  }, [selectedCountry]);

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <div className="flex flex-wrap md:flex-nowrap    justify-between mb-4 md:border-b-[1.5px] border-[#F4EFE6]">
        {['Worldwide', 'United States', 'Canada', 'France', 'Germany'].map(country => (
          <button
            key={country}
            className={`flex flex-col items-center justify-center w-full px-4 py-2 rounded-t-lg text-lg font-jakarta font-medium tracking-wide ${
              selectedButton === country ? 'text-black bg-[#F4EFE6] border-b-[3px] border-[#A18249]' : 'bg-transparent text-[#A18249] hover:bg-[#F4EFE6]  hover:text-black'
            }`}
            onClick={() => handleCountrySelection(country)}
          >
            {country}
          </button>
        ))}
      </div>
      <h2 className="text-xl font-medium tracking-wider mb-4 font-jakarta">This Week&rsquo;s Top Tracks</h2>
      <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
        {tracks.map((track, index) => (
          <li key={index} className=" flex md:gap-4 gap-2 mb-2 w-full items-center">
            <div className='p-2 rounded-md bg-[#F4EFE6] font-extrabold text-clack'><PiMusicNoteFill className='md:text-2xl text-lg '/></div>
            <div className='font-base font-jakarta md:text-xl text-lg'>{track}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TracksList;
