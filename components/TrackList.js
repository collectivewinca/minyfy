import React, { useState, useEffect } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import { SiLastdotfm, SiSpotify, SiApplemusic, SiSoundcloud } from "react-icons/si";
import { FaLastfmSquare } from "react-icons/fa";
import axios from 'axios';

const TracksList = ({ onTracksChange }) => {
  const [selectedCountry, setSelectedCountry] = useState('Worldwide');
  const [tracks, setTracks] = useState([]);
  const [selectedButton, setSelectedButton] = useState('Worldwide');
  const [selectedService, setSelectedService] = useState('spotify');

  const countryPlaylistMap = {
    'Worldwide': '37i9dQZEVXbMDoHDwVN2tF',
    'United States': '37i9dQZEVXbLRQDuF5jeBp',
    'Canada': '37i9dQZEVXbKj23U1GF4IR',
    'France': '37i9dQZEVXbIPWwFssbupI',
    'India': '37i9dQZEVXbLZ52XmnySJg'
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

  const getSpotifyAccessToken = async () => {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return tokenResponse.data.access_token;
  };

  const fetchTracks = async (country, service) => {
    let trackList = [];

    if (service === 'lastfm') {
      let url = 'https://ws.audioscrobbler.com/2.0/?method=chart.getTopTracks&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json';
      if (country !== 'Worldwide') {
        url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${encodeURIComponent(country)}&api_key=913f1b2c2126b54f985407d31d49da12&limit=10&format=json`;
      }

      const response = await fetch(url);
      const data = await response.json();
      trackList = data.tracks.track.map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`);
    } else if (service === 'spotify') {
      const accessToken = await getSpotifyAccessToken();
      const playlistId = countryPlaylistMap[country];
      const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: 10,
          fields: 'items(track(name,artists(name)))'
        }
      });

      trackList = response.data.items.map(item => 
        `${item.track.name} - ${item.track.artists[0].name}`
      );
    }
    // Add other services here when implemented

    setTracks(trackList);
    onTracksChange(trackList);
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
      <div className="flex justify-center text-2xl items-center mb-1">
        <div className="font-jakarta mr-4">Choose Your Platfrom:</div>
        <button
          onClick={() => handleServiceSelection('spotify')}
          className={`p-2 ${selectedService === 'spotify' ? 'text-[#1ed760] bg-[#F4EFE6] rounded-full' : 'text-[#1ed760]'}`}
        >
          <SiSpotify className='text-3xl' />
        </button>
        <button
          onClick={() => handleServiceSelection('lastfm')}
          className={`p-2 ${selectedService === 'lastfm' ? 'text-[#ba0000] bg-[#F4EFE6] rounded-full' : 'text-[#ba0000]'}`}
        >
          <FaLastfmSquare className='text-3xl'  />
        </button>
        <button className="p-2 text-[#fb3c55]">
          <SiApplemusic className='text-3xl' />
        </button>
        <button className="p-2 text-[#f66f0e]">
          <SiSoundcloud className='text-4xl' />
        </button>
      </div>
      <h2 className="md:text-xl text-base  tracking-wider mb-4 font-jakarta">This Week&rsquo;s  Top Tracks - <span className='text-[#A18249] uppercase font-semibold'>{selectedService}</span> </h2>
      <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
        {tracks.map((track, index) => (
          <li key={index} className="flex md:gap-4 gap-2 mb-2 w-full items-center">
            <div className='p-2 rounded-md bg-[#F4EFE6] font-extrabold text-clack'><PiMusicNoteFill className='md:text-2xl text-lg '/></div>
            <div className='font-base font-jakarta md:text-xl text-sm'>{track}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TracksList;