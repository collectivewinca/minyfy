import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { PiMusicNoteFill } from "react-icons/pi";

const ArtistSection = ({ onTracksChange, artist }) => {
  const [topArtists, setTopArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [searchedArtist, setSearchedArtist] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  console.log(artist);

  useEffect(() => {
    if (artist) {

      // If artistName is provided as a prop, fetch Spotify artist and their top tracks
      handleArtistSelection(artist);
      // Fetch the top artists when no artistName prop is passed
      fetchTopArtists();
    } else {
      // Fetch the top artists when no artistName prop is passed
      fetchTopArtists();
    }
  }, [artist]);

  // Fetch top artists from Last.fm
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

  // Function to get Spotify access token
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

  // Fetch artists from Spotify
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

  // Fetch top tracks for a specific artist ID
  const fetchTopTracks = async (artistId) => {
    const token = await getAccessToken();
    if (!token) {
      setError('Unable to get Spotify access token.');
      return;
    }

    try {
      // 1. First get top tracks
      const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;
      const topTracksResponse = await axios.get(topTracksUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Add console log to see the full response
      console.log('Spotify top tracks response:', topTracksResponse.data);

      // Check if there are any tracks
      if (topTracksResponse.data.tracks.length === 0) {
        setError('No tracks found on Spotify for this artist.');
        setTopTracks([]);
        onTracksChange([]);
        return;
      }

      // Create a Set to track unique track names
      const uniqueTrackNames = new Set();
      const topTracksList = topTracksResponse.data.tracks
        .filter(track => {
          const trackKey = `${track.name.toLowerCase()} - ${track.artists[0].name.toLowerCase()}`;
          if (uniqueTrackNames.has(trackKey)) return false;
          uniqueTrackNames.add(trackKey);
          return true;
        })
        .map(track => ({
          name: track.name,
          artist: track.artists[0].name,
          id: track.id
        }));

      // If we already have 50 tracks, no need to fetch albums
      if (topTracksList.length >= 50) {
        const finalTracks = topTracksList
          .slice(0, 50)
          .map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist)}`);
        setTopTracks(finalTracks);
        onTracksChange(finalTracks);
        return;
      }

      // 2. Then get albums and their tracks if we need more
      const albumsUrl = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=10`;
      const albumsResponse = await axios.get(albumsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (albumsResponse.data.items.length === 0) {
        // If no albums, just return top tracks
        const finalTracks = topTracksList
          .map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist)}`);
        setTopTracks(finalTracks);
        onTracksChange(finalTracks);
        return;
      }

      const albumIds = albumsResponse.data.items.map(album => album.id);
      const tracksUrl = `https://api.spotify.com/v1/albums?ids=${albumIds.join(',')}`;
      const tracksResponse = await axios.get(tracksUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Get album tracks, excluding duplicates
      const albumTracks = tracksResponse.data.albums
        .flatMap(album => album.tracks.items)
        .filter(track => {
          const trackKey = `${track.name.toLowerCase()} - ${track.artists[0].name.toLowerCase()}`;
          if (uniqueTrackNames.has(trackKey)) return false;
          uniqueTrackNames.add(trackKey);
          return true;
        })
        .map(track => ({
          name: track.name,
          artist: track.artists[0].name,
          id: track.id
        }));

      // Combine top tracks with album tracks and limit to 50 total
      const combinedTracks = [...topTracksList, ...albumTracks]
        .slice(0, 50)
        .map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist)}`);

      setTopTracks(combinedTracks);
      onTracksChange(combinedTracks);
      setError('');
    } catch (error) {
      console.error('Error fetching tracks from Spotify:', error);
      setError('Error fetching tracks from Spotify.');
    }
  };

  // Handle artist selection or artistName prop flow
  const handleArtistSelection = async (artistName) => {
    
    setSearchedArtist(artistName);

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
      fetchTopTracks(artistId); // Fetch top tracks for the selected artist
      setSelectedArtist(artistName);
      setError('');
    } catch (error) {
      console.error('Error fetching artist from Spotify:', error);
      setError('Error fetching artist from Spotify.');
    }
  };

  // Handle input change for manual search
  const handleInputChange = (event) => {
    setSearchedArtist(event.target.value);
  };

  // Handle manual search
  const handleSearch = () => {
    if (searchedArtist.trim() === '') {
      setError('Please enter an artist name.');
      setTopTracks([]);
      onTracksChange([]); // Reset tracks if no search query
      return;
    }
    fetchSpotifyArtists(searchedArtist);
  };

  // Helper function to capitalize words
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Add new function for Last.fm track search
  const fetchLastFmTracks = async (artistName) => {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=913f1b2c2126b54f985407d31d49da12&format=json&limit=50`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        setError('No tracks found on Last.fm');
        return;
      }

      const tracks = data.toptracks.track.map(track => 
        `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`
      );
      
      setTopTracks(tracks);
      onTracksChange(tracks);
      setError('');
    } catch (error) {
      console.error('Error fetching Last.fm tracks:', error);
      setError('Error fetching tracks from Last.fm');
    }
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      {/* Top Artists Section */}
      <div className="mt-5">
        <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">
          Select from this Week&rsquo;s Top Artists
        </h2>
        <ul className="grid md:grid-cols-5 grid-cols-2 gap-2">
          {topArtists.map((artist) => (
            <li key={artist.name}>
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

      {/* Search for Artist Section */}
      <div className="mt-5">
        <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Search for Artist</h2>
        <div className="flex flex-col gap-2">
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
          <div className="flex gap-2">
            <button
              className="bg-[#1DB954] px-5 py-2 rounded-xl text-sm md:text-lg font-medium text-white hover:opacity-80 flex-1"
              onClick={() => handleArtistSelection(searchedArtist)}
            >
              Search Spotify Tracks
            </button>
            <button
              className="bg-[#D51007] px-5 py-2 rounded-xl text-sm md:text-lg font-medium text-white hover:opacity-80 flex-1"
              onClick={() => fetchLastFmTracks(searchedArtist)}
            >
              Search Last.fm Tracks
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Artist Search Results Section */}
      {searchResults.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium mb-4 font-jakarta">Select an Artist</h2>
          <ul className="grid md:grid-cols-5 grid-cols-2 gap-4">
            {searchResults.map((artist) => (
              <li key={artist.id} className="flex flex-col items-center">
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

      {/* Display Selected Artist's Top Tracks */}
      {selectedArtist && topTracks.length > 0 && (
        <div className="mt-5 font-jakarta">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4">{selectedArtist}&rsquo;s Top Tracks</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {topTracks.map((track) => (
              <li key={track} className="flex md:gap-4 gap-2 mb-2 w-full items-center">
                <div className="p-2 rounded-md bg-[#F4EFE6] font-extrabold text-black">
                  <PiMusicNoteFill className="md:text-xl text-sm" />
                </div>
                <div className="font-base font-jakarta md:text-xl text-sm">{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArtistSection;
