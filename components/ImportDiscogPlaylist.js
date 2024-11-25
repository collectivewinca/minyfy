import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportDiscogPlaylist = ({ onTracksChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [discosSearchResults, setDiscosSearchResults] = useState([]);
  const [selectedDiscosAlbum, setSelectedDiscosAlbum] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [error, setError] = useState('');

  // Personal access token for Discogs API
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_DISCOGS_ACCESS_TOKEN;

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setError('Please enter a search query.');
      return;
    }

    try {
      const discosResults = await searchAlbums(searchQuery);
      if (discosResults.length === 0) {
        setError('No albums found.');
      } else {
        setDiscosSearchResults(discosResults.slice(0, 5));
        setError('');
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('Failed to search. Please try again.');
    }
  };

  const handleAlbumSelect = async (album) => {
    try {
      const albumDetails = await getAlbumDetails(album.id);
      if (albumDetails.tracklist && albumDetails.tracklist.length > 0) {
        setSelectedDiscosAlbum(albumDetails);
  
        // Extract and format track titles along with artist names
        const formattedTracks = albumDetails.tracklist.map(track => {
          const artistName = albumDetails.artists?.[0]?.name || 'Unknown Artist';
          return `${track.title} - ${artistName}`;
        });
  
        setAllTracks(formattedTracks);
  
        // Take all tracks instead of just 10
        setSelectedTracks(formattedTracks);
        onTracksChange(formattedTracks);
      } else {
        setError('No tracklist available for this album.');
      }
    } catch (error) {
      console.error('Error fetching album details:', error);
      setError('Failed to fetch album details. Please try again.');
    }
  };
  

  const searchAlbums = async (query) => {
    try {
      const response = await axios.get(
        `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&per_page=5&token=${ACCESS_TOKEN}`,
        {
          headers: {
            'User-Agent': 'MyApp/1.0.0'
          }
        }
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching albums:', error);
      throw error;
    }
  };

  const getAlbumDetails = async (releaseId) => {
    try {
      const response = await axios.get(
        `https://api.discogs.com/releases/${releaseId}?token=${ACCESS_TOKEN}`,
        {
          headers: {
            'User-Agent': 'MyApp/1.0.0'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching album details:', error);
      throw error;
    }
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Discogs Album</h2>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
            placeholder="Enter Discogs album name..."
            value={searchQuery}
            onChange={handleSearchInputChange}
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

      {discosSearchResults.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Discogs Release</h2>
          <ul className="md:pl-5 pl-2 list-disc text-lg">
            {discosSearchResults.map((album) => (
              <li key={album.id} onClick={() => handleAlbumSelect(album)} className="cursor-pointer flex md:gap-4 gap-2 mb-2 w-full items-center">
                <button className="p-2 rounded-md bg-[#F4EFE6] text-black font-extrabold">
                  <PiMusicNoteFill className='md:text-2xl text-lg' />
                </button>
                <div className='font-base font-jakarta md:text-xl text-sm'>
                  {album.title || 'Unknown Release'} ({album.year || 'N/A'})
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* {selectedDiscosAlbum && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Selected Discogs Album</h2>
          <div>Album Title: {selectedDiscosAlbum.title}</div>
          <div>Artist: {selectedDiscosAlbum.artists[0]?.name || 'Unknown Artist'}</div>
          <div>Year: {selectedDiscosAlbum.year || 'N/A'}</div>
          <div>Genres: {selectedDiscosAlbum.genres?.join(', ') || 'N/A'}</div>
          <div>Styles: {selectedDiscosAlbum.styles?.join(', ') || 'N/A'}</div>
          <div>Tracklist:</div>
          <ul>
            {selectedDiscosAlbum.tracklist.map((track, index) => (
              <li key={index}>{track.title}</li>
            ))}
          </ul>
        </div>
      )} */}

      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Album Tracks</h2>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track) => (
              <li key={track} className="flex md:gap-4 gap-2 mb-2 w-full items-center">
                <button className="p-2 rounded-md bg-[#A18249] text-white font-extrabold">
                  <PiMusicNoteFill className='md:text-2xl text-lg' />
                </button>
                <div className='font-base font-jakarta md:text-xl text-sm'>{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportDiscogPlaylist;
