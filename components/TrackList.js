import React, { useState, useEffect } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import { SiApplemusic } from "react-icons/si";
import { FaLastfmSquare } from "react-icons/fa";
import axios from 'axios';

const TracksList = ({ onTracksChange }) => {
  const [selectedCountry, setSelectedCountry] = useState('Worldwide');
  const [tracks, setTracks] = useState([]);
  const [selectedButton, setSelectedButton] = useState('Worldwide');
  const [selectedService, setSelectedService] = useState('applemusic');
  const [appleMusicToken, setAppleMusicToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const appleMusicPlaylistMap = {
    'Worldwide': 'pl.d25f5d1181894928af76c85c967f8f31',
    'United States': 'pl.606afcbb70264d2eb2b51d8dbcfa6a12',
    'Canada': 'pl.79bac9045a2540e0b195e983df8ba569',
    'France': 'pl.6e8cfd81d51042648fa36c9df5236b8d',
    'India': 'pl.c0e98d2423e54c39b3df955c24df3cc5'
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleCountrySelection = (country) => {
    setSelectedCountry(country);
    setSelectedButton(country);
    fetchTracks(country, selectedService);
  };

  const handleServiceSelection = (service) => {
    setSelectedService(service);
    fetchTracks(selectedCountry, service);
  };

  const fetchAppleMusicToken = async () => {
    if (!appleMusicToken) {
      try {
        const tokenResponse = await axios.get('/api/generate-am-token');
        setAppleMusicToken(tokenResponse.data.token);
        return tokenResponse.data.token;
      } catch (error) {
        console.error('Error fetching Apple Music token:', error);
        return null;
      }
    }
    return appleMusicToken;
  };

  const fetchAppleMusicTracks = async (playlistId) => {
    try {
      const token = await fetchAppleMusicToken();
      if (!token) {
        throw new Error('Failed to get Apple Music token');
      }

      const response = await axios.get(`https://api.music.apple.com/v1/catalog/ca/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const trackList = response.data.data[0].relationships.tracks.data
      .slice(0, 10)  // Ensure we only take the first 10 tracks
      .map(track => 
        `${capitalizeWords(track.attributes.name)} - ${capitalizeWords(track.attributes.artistName)}`
      );

      return trackList;
    } catch (error) {
      console.error('Error fetching Apple Music tracks:', error);
      return [];
    }
  };

  const fetchTracks = async (country, service) => {
    setIsLoading(true);
    let trackList = [];

    if (service === 'lastfm') {
      let url = 'https://ws.audioscrobbler.com/2.0/?method=chart.getTopTracks&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json';
      if (country !== 'Worldwide') {
        url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${encodeURIComponent(country)}&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;
      }

      const response = await fetch(url);
      const data = await response.json();
      trackList = data.tracks.track.map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`);
    } else if (service === 'applemusic') {
      const playlistId = appleMusicPlaylistMap[country];
      trackList = await fetchAppleMusicTracks(playlistId);
    }

    setTracks(trackList);
    onTracksChange(trackList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTracks(selectedCountry, selectedService);
  }, [selectedCountry, selectedService]);

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      
      <div className="flex flex-wrap md:flex-nowrap justify-between mb-4 md:border-b-[1.5px] border-[#F4EFE6]">
        {['Worldwide', 'United States', 'Canada', 'France', 'India'].map(country => (
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
      <div className="flex flex-col md:flex-row  justify-center md:text-2xl text-lg items-center mb-1">
        <div className="font-jakarta mr-4">Choose Your Platform:</div>
        <div>
          <button
            onClick={() => handleServiceSelection('applemusic')}
            className={`p-2 ${selectedService === 'applemusic' ? 'text-[#fb3c55] bg-[#F4EFE6] rounded-full' : 'text-[#fb3c55]'}`}
          >
            <SiApplemusic className='text-3xl' />
          </button>
          <button
            onClick={() => handleServiceSelection('lastfm')}
            className={`p-2 ${selectedService === 'lastfm' ? 'text-[#ba0000] bg-[#F4EFE6] rounded-full' : 'text-[#ba0000]'}`}
          >
            <FaLastfmSquare className='text-3xl'  />
          </button>
        </div>
       
      </div>
      <h2 className="md:text-xl text-base  tracking-wider mb-4 font-jakarta">This Week&rsquo;s  Top Tracks - <span className='text-[#A18249] uppercase font-semibold'>{selectedService}</span> </h2>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-t-2 border-[#A18249]"></div>
        </div>
      ) : (
        <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
          {tracks.map((track, index) => (
            <li key={index} className="flex md:gap-4 gap-2 mb-2 w-full items-center">
              <div className='p-2 rounded-md bg-[#F4EFE6] font-extrabold text-clack'>
                <PiMusicNoteFill className='md:text-2xl text-lg '/>
              </div>
              <div className='font-base font-jakarta md:text-xl text-sm'>{track}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TracksList;
