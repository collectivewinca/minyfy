import React, { useState, useEffect } from 'react';

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
    <div className="mt-5 flex flex-col justify-start w-full md:w-[70%]">
      <div className="flex gap-4 justify-center mb-4">
        {['Worldwide', 'United States', 'Canada', 'France', 'Germany'].map(country => (
          <button
            key={country}
            className={`bg-transparent border-[2.5px] border-black px-4 py-1 rounded-xl text-lg font-medium ${
              selectedButton === country ? 'bg-[#78c144]' : 'hover:bg-[#78c144]'
            }`}
            onClick={() => handleCountrySelection(country)}
          >
            {country}
          </button>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">This Week&lsquo;s Top Tracks</h2>
      <ul className="pl-5 list-disc text-lg uppercase">
        {tracks.map((track, index) => (
          <li key={index}>{track}</li>
        ))}
      </ul>
    </div>
  );
};

export default TracksList;
