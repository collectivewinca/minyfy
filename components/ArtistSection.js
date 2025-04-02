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

  useEffect(() => {
    if (artist) {
      // If artistName is provided as a prop, fetch Last.fm artist and their top tracks
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

  /* Commented out Spotify token function
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
  */

  /* Commented out Spotify artist search
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
  */

  /* Commented out Spotify top tracks fetch
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
  */

  // Handle artist selection or artistName prop flow
  const handleArtistSelection = async (artistName) => {
    setSearchedArtist(artistName);
    setSelectedArtist(artistName);
    
    try {
      // Fetch top tracks from Last.fm
      const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&artist=${encodeURIComponent(artistName)}&api_key=913f1b2c2126b54f985407d31d49da12&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.toptracks && data.toptracks.track) {
        const tracks = data.toptracks.track
          .slice(0, 50)
          .map(track => `${capitalizeWords(track.name)} - ${capitalizeWords(track.artist.name)}`);
        setTopTracks(tracks);
        onTracksChange(tracks);
        setError('');
      } else {
        setError(`No tracks found for ${artistName}`);
        setTopTracks([]);
        onTracksChange([]);
      }
    } catch (error) {
      console.error('Error fetching artist tracks from Last.fm:', error);
      setError('Error fetching artist tracks.');
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
    handleArtistSelection(searchedArtist);
  };

  // Helper function to capitalize words
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Search by Artist</h2>
      
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter artist name..."
            value={searchedArtist}
            onChange={handleInputChange}
          />
          <button
            className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
      
      {topTracks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Top Tracks:</h3>
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-[#F4EFE6] rounded-lg">
                <PiMusicNoteFill className="text-[#A18249]" />
                <span>{track}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistSection;
