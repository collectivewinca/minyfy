import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import download from 'downloadjs';
import MinySection from '@/components/MinySection';

function Lastfm() {
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userExists, setUserExists] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("/img3.png");
  const [loading, setLoading] = useState(false);

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
        setTrackData(data.toptracks.track.map(track => `${track.name} - ${track.artist.name}`));
      } else {
        setTrackData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTrackData([]);
    }
  };

  const generateImage = async () => {
    setLoading(true);
    const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: 'create a uniform background image for a list of music track, make it life like, be creative and simple',
        n: 1,
        size: '1024x1024',
      }),
    });
  
    const data = await response.json();
    console.log('Generated image:', data);
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
  
      try {
        
        const apiResponse = await fetch(`/api/fetch-image?imageUrl=${encodeURIComponent(imageUrl)}`);
        if (!apiResponse.ok) {
          throw new Error(`Failed to fetch image: ${apiResponse.statusText}`);
        }
        const blob = await apiResponse.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          setBackgroundImageUrl("/img3.png");
          setLoading(false);
        };
      } catch (error) {
        console.error('Error fetching image data:', error);
        setLoading(false);
      }
    } else {
      console.error('Error generating image:', data);
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className=" px-4 my-12 flex flex-col justify-center items-center">
        <h1 className="md:text-4xl text-2xl font-extrabold mb-8 text-black">Last.fm Track Generator</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="mb-4">
            <label className="block text-gray-700 md:text-xl text-lg font-bold mb-2 bg" htmlFor="username">
              Enter your username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-3 px-5 py-3 font-thin font-mono w-full bg-neutral-200 text-lg text-neutral-500 rounded-xl"
              placeholder="Username"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-[#f28532] shadow-custom text-xl text-white hover:opacity-80 bg font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
          <div className="flex justify-center flex-wrap gap-2 mt-7 mb-8">
            <button
              onClick={() => handleButtonClick('Last Week')}
              className="bg-gray-300 shadow-custom hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Week
            </button>
            <button
              onClick={() => handleButtonClick('Last Month')}
              className="bg-gray-300 shadow-custom hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Month
            </button>
            <button
              onClick={() => handleButtonClick('Last 3 Months')}
              className="bg-gray-300 shadow-custom hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last 3 Months
            </button>
            <button
              onClick={() => handleButtonClick('Last Half Year')}
              className="bg-gray-300 shadow-custom hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full mr-4"
            >
              Last Half Year
            </button>
            <button
              onClick={() => handleButtonClick('Last Year')}
              className="bg-gray-300 shadow-custom hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-full"
            >
              Last Year
            </button>
          </div>
        )}

        {trackData.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={generateImage}
              className="bg-black hover:opacity-80 shadow-custom text-white font-semibold py-2 px-6 rounded-full"
            >
              {loading ? 'Generating...' : 'Generate Background Image'}
            </button>
          </div>
        )}
        
        {trackData.length > 0 && (
          <MinySection 
            name={username} 
            backgroundImage={backgroundImageUrl} 
            tracks={trackData} 
          />
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
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
};

export default Lastfm;
