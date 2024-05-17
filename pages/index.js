import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import axios from 'axios';
import { FaSpotify } from "react-icons/fa";

const Home = () => {
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]); // State to hold filtered tracks
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [filterOption, setFilterOption] = useState('all'); // State to track selected filter option

  useEffect(() => {
    const getAccessTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      return params.get('access_token');
    };

    const accessToken = getAccessTokenFromUrl();
    if (accessToken) {
      getRecentlyPlayedTracks(accessToken);
      setIsLoggedIn(true); // Set login status to true
    }
  }, []);

  useEffect(() => {
    // Apply filter when recently played tracks change
    applyFilter();
  }, [recentlyPlayedTracks, filterOption]);

  const getRecentlyPlayedTracks = async (accessToken) => {
    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            limit: 50 
          }
        }
      );

      setRecentlyPlayedTracks(response.data.items); // Store the recently played tracks
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
    }
  };

  const applyFilter = () => {
    // Filter tracks based on the selected option
    if (filterOption === 'all') {
      setFilteredTracks(recentlyPlayedTracks);
    } else {
      const currentDate = new Date();
      let startDate = new Date();

      // Calculate start date based on the selected option
      if (filterOption === 'lastWeek') {
        startDate.setDate(currentDate.getDate() - 7);
      } else if (filterOption === 'lastTwoWeeks') {
        startDate.setDate(currentDate.getDate() - 14);
      } else if (filterOption === 'lastMonth') {
        startDate.setMonth(currentDate.getMonth() - 1);
      }

      // Filter tracks by played time
      const filtered = recentlyPlayedTracks.filter((track) => {
        const playedDate = new Date(track.played_at);
        return playedDate >= startDate && playedDate <= currentDate;
      });

      setFilteredTracks(filtered);
    }
  };

  // Function to handle filter option change
  const handleFilterChange = (option) => {
    setFilterOption(option);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 my-12 ">
        <div className="text-center ">
          <h1 className="text-4xl font-semibold">MINYFY your MIXTAPE</h1>
        </div>
        <div className="flex justify-center mt-4 ">
          {/* Render login buttons only if not logged in */}
          {!isLoggedIn && (
            <>
              <Link href="/api/login"
                className="bg-[#1ad95c] flex hover:opacity-80 text-white font-semibold py-2 px-6 rounded-full mr-4"
              >
                <FaSpotify className="mr-2 text-2xl"/> Log in with Spotify
              </Link>
              {/* <button className="bg-gray-300 hover:opacity-80 text-black font-semibold py-2 px-6 rounded-full">
                Connect to Last.fm
              </button> */}
            </>
          )}
        </div>
        {/* Filter buttons */}
        <div className="flex justify-center mt-4">
          <button onClick={() => handleFilterChange('all')} className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4">
            All
          </button>
          <button onClick={() => handleFilterChange('lastWeek')} className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4">
            Last Week
          </button>
          <button onClick={() => handleFilterChange('lastTwoWeeks')} className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4">
            Last 2 Weeks
          </button>
          <button onClick={() => handleFilterChange('lastMonth')} className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full">
            Last Month
          </button>
        </div>
        {/* Display recently played tracks in a table */}
        {filteredTracks.length > 0 && (
          <div className="mt-8 flex flex-col justify-center ">
            <h2 className="text-xl font-semibold">Tracks</h2>
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Track Name</th>
                  <th className="px-4 py-2">Duration</th>
                  <th className="px-4 py-2">Album Name</th>
                  <th className="px-4 py-2">Artists</th>
                  <th className="px-4 py-2">Played At</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.slice(0,10).map((track, index) => (
                  <tr key={track.played_at}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{track.track.name}</td>
                    <td className="border px-4 py-2">{msToMinutesAndSeconds(track.track.duration_ms)}</td>
                    <td className="border px-4 py-2">{track.track.album.name}</td>
                    <td className="border px-4 py-2">{track.track.artists.map(artist => artist.name).join(', ')}</td>
                    <td className="border px-4 py-2">{new Date(track.played_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

const msToMinutesAndSeconds = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
};

export default Home;
