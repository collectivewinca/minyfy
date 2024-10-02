import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { PiMusicNoteFill } from "react-icons/pi";

const ArtistSection = ({ onTracksChange }) => {
  const [topArtists, setTopArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [searchedArtist, setSearchedArtist] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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

  const getAccessToken = async () => {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    try {
      const tokenResponse = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return tokenResponse.data.access_token;
    } catch (error) {
      console.error('Error fetching Spotify token:', error);
      setError('Failed to connect to Spotify.');
      return null;
    }
  };

  const fetchSpotifyArtists = async (artistName) => {
    const token = await getAccessToken();
    if (!token) {
      setError('Unable to get Spotify access token.');
      return;
    }

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const artists = response.data.artists.items;
      if (artists.length === 0) {
        setError('No artist found on Spotify.');
        setSearchResults([]);
        return;
      }

      setSearchResults(artists);
      setError('');
    } catch (error) {
      console.error('Error fetching artists from Spotify:', error);
      setError('Error fetching artists from Spotify.');
    }
  };

  const fetchTopTracks = async (artistId) => {
    const token = await getAccessToken();
    if (!token) {
      setError('Unable to get Spotify access token.');
      return;
    }

    const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;

    try {
      const topTracksResponse = await axios.get(topTracksUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const trackList = topTracksResponse.data.tracks.map(
        (track) => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artists[0].name)}`
      );
      setTopTracks(trackList);
      onTracksChange(trackList);
      setError('');
    } catch (error) {
      console.error('Error fetching top tracks from Spotify:', error);
      setError('Error fetching tracks from Spotify.');
    }
  };

  const handleArtistSelection = async (artistName) => {
    const token = await getAccessToken();
    if (!token) {
      setError('Unable to get Spotify access token.');
      return;
    }

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
  
    try {
      const response = await axios.get(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const artist = response.data.artists.items[0];
      if (!artist) {
        setError(`No Spotify artist found for ${artistName}`);
        setTopTracks([]);
        return;
      }

      const artistId = artist.id;
      fetchTopTracks(artistId);
      setSelectedArtist(artistName);
      setError('');
    } catch (error) {
      console.error('Error fetching artist from Spotify:', error);
      setError('Error fetching artist from Spotify.');
    }
  };

  const handleInputChange = (event) => {
    setSearchedArtist(event.target.value);
  };

  const handleSearch = () => {
    if (searchedArtist.trim() === '') {
      setError('Please enter an artist name.');
      setTopTracks([]);
      onTracksChange([]);
      return;
    }
    fetchSpotifyArtists(searchedArtist);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <div className="mt-5">
        <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Select from this Week&rsquo;s Top Artists</h2>
        <ul className="grid md:grid-cols-5 grid-cols-2 gap-2">
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
        <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Search for Artist</h2>
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] text-sm md:text-lg rounded-l-xl"
            placeholder="Enter artist name..."
            value={searchedArtist}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl text-sm md:text-lg font-medium text-white hover:opacity-80"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {searchResults.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium mb-4 font-jakarta">Select an Artist</h2>
          <ul className="grid md:grid-cols-5 grid-cols-2 gap-4">
            {searchResults.map((artist) => (
              <li key={artist.id} className='flex flex-col items-center'>
                <div className="w-24 h-24 relative mb-2">
                  <Image
                    src={artist.images[0]?.url || '/api/placeholder/200/200'}
                    alt={artist.name}
                    layout="fill"
                    quality={70}
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                <button
                  className="cursor-pointer rounded-full text-sm font-jakarta bg-[#F4EFE6] px-4 text-neutral-700 font-medium tracking-wide py-2 w-full text-center hover:bg-[#f0e6d4] hover:text-black"
                  onClick={() => handleArtistSelection(artist.name)}
                >
                  {artist.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedArtist && topTracks.length > 0 && (
        <div className="mt-5 font-jakarta">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4">{selectedArtist}&rsquo;s Top Tracks</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {topTracks.map((track) => (
              <li key={track} className="flex md:gap-4 gap-2 mb-2 w-full items-center">
                <div className='p-2 rounded-md bg-[#F4EFE6] font-extrabold text-black'>
                  <PiMusicNoteFill className='md:text-xl text-sm' />
                </div>
                <div className='font-base font-jakarta md:text-xl text-sm'>{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArtistSection;