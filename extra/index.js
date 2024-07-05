import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import axios from 'axios';
import { FaSpotify } from "react-icons/fa";

const Home = () => {
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filterOption, setFilterOption] = useState('all');

  const applyFilter = useCallback(() => {
    if (filterOption === 'all') {
      setFilteredTracks(recentlyPlayedTracks);
    } else {
      const currentDate = new Date();
      let startDate = new Date();
      if (filterOption === 'lastWeek') {
        startDate.setDate(currentDate.getDate() - 7);
      } else if (filterOption === 'lastTwoWeeks') {
        startDate.setDate(currentDate.getDate() - 14);
      } else if (filterOption === 'lastMonth') {
        startDate.setMonth(currentDate.getMonth() - 1);
      }
      const filtered = recentlyPlayedTracks.filter((track) => {
        const playedDate = new Date(track.played_at);
        return playedDate >= startDate && playedDate <= currentDate;
      });
      setFilteredTracks(filtered);
    }
  }, [filterOption, recentlyPlayedTracks]);

  useEffect(() => {
    const getAccessTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      return params.get('access_token');
    };

    const accessToken = getAccessTokenFromUrl();
    if (accessToken) {
      getRecentlyPlayedTracks(accessToken);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    applyFilter();
  }, [recentlyPlayedTracks, filterOption, applyFilter]);

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
      setRecentlyPlayedTracks(response.data.items);
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
    }
  };

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

            <div className='bg-[#1ad95c] w-56 mx-auto text-center mt-4 flex hover:opacity-80 text-white font-semibold py-2 px-4 justify-center rounded-full m'>
              Generate Mixtapes
            </div>
          </div>
        )}
      </div>
      <div ref={trackDataContainerRef} className='m'>
        <div className="relative mt-10  cursor-pointer rounded-2xl" >
            <div className="overlay"></div>
            <img className="h-full w-full rounded-2xl" src='/gallery/img6.png' alt="" />
            <div className="cardContent">
                <p className="text-white font-medium text-lg tracking-wide absolute top-0 right-0 px-4 pb-4 py-1">
                    <img src="/stamp.png" alt="Minyfy Logo" className="mx-auto mt-4" width="100" height="100" />
                </p>
                <div className=" absolute top-44 flex flex-col gap-6 items-end text-xl font-wittgenstein font-base px-4  right-0 text-neutral-300  mt-10 tracking-wider">
                  
                    <div>Be Like You - Taylor Acorn</div>
                    <div>Survival In Motion - Taylor Acorn</div>
                    <div>Applause - Taylor Acorn</div>
                    <div>Final Nail - Taylor Acorn</div>
                    <div>Greener - Taylor Acorn</div>
                    <div>High Horse - Taylor Acorn</div>
                    <div>Nervous System - Taylor Acorn</div>
                    <div>People Watching - Taylor Acorn</div>
                    <div>Kill Me Quickly - Thrice</div>
                    <div>Wilder In The Heart - Butch Walker</div>

                </div>
                <div className="absolute bottom-8 flex flex-col  items-end text-xl font-wittgenstein font-base px-4  right-0 text-neutral-300  mt-10 tracking-wider">
                    <h2 className="">Last Month</h2>
                    <p>MINY Order for Jason Tate</p>
                    <p>Thursday, July 4, 2024</p>
                </div>
            </div>
        </div>
        </div>

            <div className="flex justify-center mt-4">
            <button
                onClick={handleDownloadImage}
                className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full"
            >
                Download as Image
            </button>
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

<div className="flex justify-center mt-4">
          <button  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4">
            All
          </button>
          <button  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4">
            Last Week
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4">
            Last 2 Weeks
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full">
            Last Month
          </button>
        </div>



