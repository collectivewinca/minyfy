import React, { useState, useEffect } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import { SiLastdotfm, SiApplemusic, SiSoundcloud } from "react-icons/si";
import { FaLastfmSquare } from "react-icons/fa";
import axios from 'axios';

const TracksList = ({ onTracksChange }) => {
  const [selectedCountry, setSelectedCountry] = useState('Worldwide');
  const [tracks, setTracks] = useState([]);
  const [selectedButton, setSelectedButton] = useState('Worldwide');
  const [selectedService, setSelectedService] = useState('lastfm');
  const [appleMusicToken, setAppleMusicToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const countryPlaylistMap = {
    'Worldwide': '37i9dQZEVXbMDoHDwVN2tF',
    'United States': '37i9dQZEVXbLRQDuF5jeBp',
    'Canada': '37i9dQZEVXbKj23U1GF4IR',
    'France': '37i9dQZEVXbIPWwFssbupI',
    'India': '37i9dQZEVXbLZ52XmnySJg'
  };

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
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {['Worldwide', 'United States', 'Canada', 'France', 'India'].map((country) => (
            <button
              key={country}
              onClick={() => handleCountrySelection(country)}
              className={`px-4 py-2 rounded-full ${
                selectedButton === country
                  ? 'bg-[#A18249] text-white'
                  : 'bg-[#F4EFE6] text-neutral-500 hover:bg-[#A18249] hover:text-white'
              }`}
            >
              {country}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleServiceSelection('lastfm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              selectedService === 'lastfm'
                ? 'bg-[#A18249] text-white'
                : 'bg-[#F4EFE6] text-neutral-500 hover:bg-[#A18249] hover:text-white'
            }`}
          >
            <FaLastfmSquare className="text-xl" />
            Last.fm
          </button>
          <button
            onClick={() => handleServiceSelection('applemusic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              selectedService === 'applemusic'
                ? 'bg-[#A18249] text-white'
                : 'bg-[#F4EFE6] text-neutral-500 hover:bg-[#A18249] hover:text-white'
            }`}
          >
            <SiApplemusic className="text-xl" />
            Apple Music
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 text-center">Loading tracks...</div>
      ) : (
        <div className="mt-4">
          {tracks.map((track, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-[#F4EFE6] rounded-lg mb-2">
              <PiMusicNoteFill className="text-[#A18249]" />
              <span>{track}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TracksList;
