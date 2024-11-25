import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import download from 'downloadjs';
import MinySection from '@/components/MinySection';
import { FaLastfm } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db,storage } from "@/firebase/config";
import Head from 'next/head';
import { NextSeo } from 'next-seo';

function Lastfm() {
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userExists, setUserExists] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("/img3.png");
  const [backgroundImageSrc, setBackgroundImageSrc] = useState("/img3.png");
  const [finalImage, setFinalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pngImageUrl, setPngImageUrl] = useState("");

  const handleDocIdChange = (id) => {
    console.log("handleDocIdChange called with ID:", id);
    setDocId(id);
    setShowUrlInput(true);
  };

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
    const limit = 50;
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
    setLoading(true);

    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${apiKey}&period=${periodParam}&limit=${limit}&page=${page}&format=json`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.toptracks && data.toptracks.track) {
        setTrackData(data.toptracks.track.map(track => 
          `${track.name} - ${track.artist.name} (${track.playcount} plays)`
        ));
      } else {
        setTrackData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTrackData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    console.log('Starting image generation');
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
        prompt: 'Generate a detailed image of small, 2-inch vinyl records shaped like hexagons. The records should have the look of classic vinyl, with grooves and a label in the center. The label can have artistic designs, like abstract art or a logo, and should fit neatly into the hexagonal shape. Use a mix of modern and vintage aesthetics, with some records featuring bold, bright colors and others in more muted tones. Display the records in an interesting layout, like stacked or fanned out, showing the unique hexagonal design. Lighting should highlight the textures and depth of the vinyl, making the records look glossy and tactile.',
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await response.json();
    console.log('Generated image data:', data);
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      try {
        // Send the image URL to your server for processing
        const response = await fetch('/api/process-and-upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        });
  
        if (!response.ok) {
          throw new Error(`Server processing failed: ${response.statusText}`);
        }
  
        const { firebaseUrl } = await response.json();
  
        setBackgroundImageUrl(firebaseUrl);
  
        setLoading(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setLoading(false);
      }
      
    } else {
      console.error('Error generating image:', data);
      setLoading(false);
    }
  };

  const isValidUrl = (url) => {
    // Pattern allows alphanumeric characters and dashes
    const urlPattern = /^[a-zA-Z0-9-]+$/;
    return urlPattern.test(url);
  };

  const createShortUrl = async () => {
    const trimmedCustomUrl = customUrl.trim();
  
    // Validate custom URL if provided
    if (trimmedCustomUrl && !isValidUrl(trimmedCustomUrl)) {
      setErrorMessage("Invalid URL. Only alphanumeric characters, dashes are allowed.");
      return;
    }
  
    try {
      // Send POST request to create short URL
      const response = await fetch('/api/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId, customUrl: trimmedCustomUrl }),
      });
  
      const json = await response.json();
  
      if (response.status === 409) {
        // Handle "Link already exists" error
        setErrorMessage("Link already exists. Please choose a different custom URL.");
        return;
      } else if (!response.ok) {
        // Handle other errors
        setErrorMessage("Error creating short URL. Please try again.");
        console.error('Error creating short URL:', json.message);
        return;
      }
  
      console.log('Short URL created successfully:', json);
  
      // Update Firestore document with the shortened link
      await updateDoc(doc(db, "mixtapes", docId), {
        shortenedLink: `https://go.minyvinyl.com/${json.link.slug}` 
      });
  
      // Send email with the shortened link
      try {
        // const emailResponse = await fetch('/api/send-mixtape', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     name: username,
        //     imageUrl: finalImage,
        //     shortenedLink: `https://go.minyvinyl.com/${json.link.slug}`,  // Ensure correct field
        //     email: user.email,
        //     displayName: user.displayName,
        //   }),
        // });
  
        // const emailJson = await emailResponse.json();
        // if (!emailResponse.ok) {
        //   console.error('Error sending email:', emailJson.error);
        //   setErrorMessage('Error sending email. Please try again.');
        //   return;
        // }
  
        // Redirect to the shortened URL
        window.location.href = json.link.url;
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        setErrorMessage('Error sending email. Please try again.');
      }
    } catch (err) {
      console.error('Error creating short URL:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <NextSeo
      title="Last.fm Mixtape - Create a Playlist from Your Listens | Miny Vinyl"
      description="Relive your favorite tracks! Create a Miny Vinyl playlist from your Last.fm listening history. Choose a duration, generate an AI-powered background, customize your playlist, and share with a personalized URL."
      canonical="https://minyfy.subwaymusician.xyz/lastfm" 
      openGraph={{
        url: 'https://minyfy.subwaymusician.xyz/lastfm',
        title: 'Last.fm Mixtape - Create a Playlist from Your Listens | Miny Vinyl',
        description: 'Relive your favorite tracks! Create a Miny Vinyl playlist from your Last.fm listening history. Choose a duration, generate an AI-powered background, customize your playlist, and share with a personalized URL.',
        images: [
          {
            url: 'https://minyfy.subwaymusician.xyz/vinyl.png',
            width: 1200,
            height: 630,
            alt: 'Miny Vinyl - Create a Playlist from Your Last.fm History',
          },
        ],
        site_name: 'Miny Vinyl',
      }}
      twitter={{
        handle: '@minyvinyl',
        site: '@minyvinyl',
        cardType: 'summary_large_image',
        title: 'Turn Your Last.fm History into a Fire Playlist! 🔥 | Miny Vinyl', 
        description: 'Relive your top tracks! Create a playlist from your Last.fm listens with Miny Vinyl. AI art, custom options, and shareable links - lets go! 🚀',
      }}
      additionalJsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Last.fm Mixtape - Create a Playlist from Your Listens',
          description: 'Relive your favorite tracks! Create a Miny Vinyl playlist from your Last.fm listening history. Choose a duration, generate an AI-powered background, customize your playlist, and share with a personalized URL.',
          url: 'https://minyfy.subwaymusician.xyz/lastfm',
        },
      ]}
    />
      <Header />
      <div className=" px-4 my-12 flex flex-col justify-center items-center">
        <h1 className="md:text-4xl text-2xl font-extrabold mb-8 text-black flex gap-2 items-center"> <FaLastfm className="text-5xl pt-1"/> Last.fm Track Generator</h1>
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
              className="bg-[#73c33e] shadow-custom text-xl text-white hover:opacity-80 bg font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
          <div className="md:w-[40%] ">
          <MinySection 
            name={username} 
            backgroundImage={backgroundImageUrl} 
            tracks={trackData} 
            backgroundImageSrc={backgroundImageSrc}
            onDocIdChange={handleDocIdChange}
            setPngImageUrl={setPngImageUrl}
            setFinalImage={setFinalImage}
          />
          </div>
        )}
      </div>
      {showUrlInput && (
        <div className="fixed inset-0 flex z-50 items-center justify-center font-jakarta bg-black bg-opacity-50">
          <div className="bg-white mx-3 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">🥳 Your Playlist Created Successfully 🥳</h2>
            <h2 className="text-lg font-bold mb-4 text-center">Customize Brand URL</h2>
            <div className="text-base">
              <div className="flex items-center border rounded-md">
                <span className="bg-neutral-300 px-2 text-lg py-2 rounded-l-md"><MdModeEdit /></span>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="px-2 py-1 flex-grow"
                  placeholder="(Optional)"
                />
              </div>
            </div>
            <div className="text-xs mt-1 mb-4">
              <p className="font-bold">
                https://go.minyvinyl.com/{customUrl.trim() || '*random*'}
              </p>
            </div>
            {errorMessage && (
              <div className="text-red-500 text-sm mb-4">
                {errorMessage}
              </div>
            )}
            <div className="flex justify-center">
              <button
                onClick={createShortUrl}
                className="bg-gray-700 text-white shadow-custom px-4 py-2 rounded hover:bg-gray-600"
              >
                Let&rsquo;s Go!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;
  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

export default Lastfm;
