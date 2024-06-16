import React, { useState, useRef  } from 'react';
import Header from '@/components/Header';
import backgroundImage from '@/public/bg.jpg'
import htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import download from 'downloadjs';

function Lastfm() {
  const [username, setUsername] = useState(''); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userExists, setUserExists] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const trackDataContainerRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitted(true);

    const apiKey = '913f1b2c2126b54f985407d31d49da12';
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getInfo&user=${username}&api_key=${apiKey}&format=json`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.error) {
        setUserExists(false); // User does not exist
        setUserProfile(null);
        return;
      }

      setUserExists(true);
      setUserProfile(data.user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserExists(false); // Handle other errors as user not existing
      setUserProfile(null);
    }
  };

  const handleDownloadImage = async () => {
  
    if (!trackDataContainerRef.current) {
      console.error('Error: trackDataContainerRef is not defined.');
      return;
    }
  
    toBlob(trackDataContainerRef.current)
      .then(function (blob) {
        download(blob, 'track_data.jpg');
      })
      .catch(function (error) {
        console.error('Error converting to image:', error);
      });
  };
  
  

  const handleButtonClick = async (period) => {
    const apiKey = '913f1b2c2126b54f985407d31d49da12';
    const limit = 10;
    const page = 1;
    
    // Mapping the period to Last.fm API's period format
    let periodParam;
    switch (period) {
        case 'Last Week':
          periodParam = '7day';
          break;
        case 'Last Month':
          periodParam = '1month';
          break;
        case 'Last 3 Months':
          periodParam = '3month';
          break;
        case 'Last half Year':
          periodParam = '6month';
          break;
        case 'Last Year':
          periodParam = '12month';
          break;
        default:
          periodParam = 'overall';
          break;
      }

    setSelectedPeriod(period); // Update selected period
  
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${apiKey}&period=${periodParam}&limit=${limit}&page=${page}&format=json`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.toptracks && data.toptracks.track) {
        setTrackData(data.toptracks.track);
      } else {
        setTrackData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTrackData([]);
    }
  };
  

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 my-12 flex flex-col items-center">
        <h1 className="text-4xl font-semibold mb-8 text-black">Last.fm Track Generator</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 bg" htmlFor="username">
              Enter your username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Username"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-[#d92323] text-white hover:opacity-80 bg font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </div>
        </form>
        {isSubmitted && !userExists && (
          <div className="flex justify-center mt-4">
            <p className="text-red-500 bg">Wrong username. Please try again.</p>
          </div>
        )}
        
        {isSubmitted && userProfile && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handleButtonClick('Last Week')} // 7 days
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Week
            </button>
            <button
              onClick={() => handleButtonClick('Last Month')} // Last Month
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Month
            </button>
            <button
              onClick={() => handleButtonClick('Last 3 Months')} // Last 3 Months
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last 3 Months
            </button>
            <button
              onClick={() => handleButtonClick('Last Half Year')} // Half Year
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Half Year
            </button>
            <button
              onClick={() => handleButtonClick('Last Year')} // Year
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full"
            >
              Last Year
            </button>
          </div>
        )}

        {trackData.length > 0 && (
          <div className="mt-8 w-full uppercase max-w-2xl  bg-white bg-opacity-90 rounded-lg p-8 shadow-md" 
          ref={trackDataContainerRef}
            style={{ 
              backgroundImage: `url('/bg.jpg')`, 
              backgroundSize: 'cover',
              minHeight: '100vh', // Set a minimum height if needed to ensure the background is visible
              padding: '20px' // Add padding to see if the background shows up
            }}>
            <h2 className="text-2xl text-center mb-4">MINYFY</h2>
            <h3 className="text-xl text-center mb-2">{selectedPeriod.toUpperCase()}</h3> {/* Display selected period */}
            <p className="mb-2">Order #{userProfile ? userProfile.playcount : 'N/A'} FOR {username.toUpperCase()}</p>
            <p className="mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <table className="w-full">
              <thead>
                <tr className="border-dashed border-y-[0.6px]  border-black">
                  <th className="px-4 py-2 text-left font-normal">QTY</th>
                  <th className="px-4 py-2 text-left font-normal">ITEM</th>
                  <th className="px-4 py-2 text-right font-normal">AMT</th>
                </tr>
              </thead>
              <tbody>
                {trackData.map((track, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{track.playcount}</td>
                    <td className="px-4 py-2">{track.name} - {track.artist.name}</td>
                    <td className="px-4 py-2 text-right">
                      {track.duration
                        ? `${Math.floor(track.duration / 60)}:${(track.duration % 60)
                            .toString()
                            .padStart(2, '0')}`
                        : '0:00'}
                    </td>
                  </tr>
                ))}
              </tbody>
              
              <tfoot className="border-dashed border-y-[0.6px] mb-14  border-black"> 
                <tr >
                  <td className=" px-4 py-2 text-left " colSpan="2">ITEM COUNT:</td>
                  <td className=" px-4 py-2 text-right ">
                    {trackData.reduce((total, track) => total + parseInt(track.playcount), 0)}
                  </td>
                </tr>
                <tr className="">
                  <td className=" px-4 py-2 text-left " colSpan="2">TOTAL:</td>
                  <td className=" px-4 py-2 text-right ">
                    {trackData.reduce((total, track) => total + parseInt(track.duration), 0)
                      .toString()
                      .toHHMMSS()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {trackData.length > 0 && (
            <div className="flex justify-center mt-4">
            <button
                onClick={handleDownloadImage}
                className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full"
            >
                Download as Image
            </button>
            </div>
        )}
      </div>
    </>
  );
}

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if(seconds < 10) {
    seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
    };
    
    export default Lastfm;
