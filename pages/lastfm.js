import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
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
        setUserExists(false);
        setUserProfile(null);
        return;
      }

      setUserExists(true);
      setUserProfile(data.user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserExists(false);
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
      case 'Last Half Year':
        periodParam = '6month';
        break;
      case 'Last Year':
        periodParam = '12month';
        break;
      default:
        periodParam = 'overall';
        break;
    }

    setSelectedPeriod(period);

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

  console.log(trackData);

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
          <div className="flex justify-center mt-4 mb-8">
            <button
              onClick={() => handleButtonClick('Last Week')}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Week
            </button>
            <button
              onClick={() => handleButtonClick('Last Month')}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Month
            </button>
            <button
              onClick={() => handleButtonClick('Last 3 Months')}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last 3 Months
            </button>
            <button
              onClick={() => handleButtonClick('Last Half Year')}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Half Year
            </button>
            <button
              onClick={() => handleButtonClick('Last Year')}
              className="bg-gray-300  hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full"
            >
              Last Year
            </button>
          </div>
        )}

        {trackData.length > 0 && (
          <div
            className=" w-full uppercase max-w-4xl relative bg-white bg-opacity-90 shadow-md"
            ref={trackDataContainerRef}
            style={{
              backgroundImage: `url('/img3.png')`, // Your background image
              backgroundSize: 'cover',
              minHeight: '100vh',
              padding: '50px 50px',
            }}
          >
            <div className="absolute inset-0 bg-gray-200 bg-opacity-30 blur-2xl"></div>
            <div className="relative p-6 shadow-2xl rounded-lg bg-gray-900 bg-opacity-50 text-white">
              <h2 className="text-3xl text-center font-semibold mb-4">MINYFY</h2>
              <h3 className="text-xl text-center mb-2">{selectedPeriod.toUpperCase()}</h3>
              <p className="mb-2">Order #{userProfile ? userProfile.playcount : 'N/A'} FOR {username.toUpperCase()}</p>
              <p className="mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <table className="w-full">
                <thead>
                  <tr className="border-dashed border-y-[0.6px] border-black">
                    <th className="px-4 py-2 text-left font-normal">QTY</th>
                    <th className="px-4 py-2 text-left font-normal">ITEM</th>
                    <th className="px-4 py-2 text-right font-normal">AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {trackData.map((track, index) => (
                    <tr key={index}>
                      <td className="px-4 py-1">{track.playcount}</td>
                      <td className="px-4 py-1">{track.name} - {track.artist.name}</td>
                      <td className="px-4 py-1 text-right">
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
                  <td className=" px-4 py-1 text-left " colSpan="2">ITEM COUNT:</td>
                  <td className=" px-4 py-1 text-right ">
                    {trackData.reduce((total, track) => total + parseInt(track.playcount), 0)}
                  </td>
                </tr>
                <tr className="">
                  <td className=" px-4 py-1 text-left " colSpan="2">TOTAL:</td>
                  <td className=" px-4 py-1  text-right ">
                    {trackData.reduce((total, track) => total + parseInt(track.duration), 0)
                      .toString()
                      .toHHMMSS()}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div>
              <p className="text-center mt-4">Thank you for your order!</p>
              <img src="/Minylogo.png" alt="Minyfy Logo" className="mx-auto mt-4" width="100" height="100" />
            </div>
            </div>
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