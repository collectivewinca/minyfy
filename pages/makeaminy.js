import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TracksList from '@/components/TrackList';
import ArtistSection from '@/components/ArtistSection';
import TagSection from '@/components/TagSection';
import MinySection from '@/components/MinySection';
import CustomTrack from '@/components/CustomTrack';
import { FaArrowUp } from "react-icons/fa6";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { MdModeEdit } from "react-icons/md";

const Custom = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [inputValue, setInputValue] = useState('User');
  const [backgroundImage, setBackgroundImage] = useState('/gallery/img6.png');
  const [tracks, setTracks] = useState([]);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [docId, setDocId] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const images = [
    "/gallery/img1.png",
    "/gallery/img2.png",
    "/gallery/img3.png",
    "/gallery/img4.png",
    "/gallery/img5.png",
    "/gallery/img6.png",
  ];

  const handleSelection = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleImageSelection = (imagePath) => {
    setBackgroundImage(imagePath);
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsAtTop(scrollTop === 0);
    if (scrollTop === 0) {
      setShowNotification(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTracksChange = (newTracks) => {
    setTracks(newTracks);
    if (!isAtTop) {
      setShowNotification(true);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createShortUrl = async () => {
    const url = 'https://api.short.io/links';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: process.env.NEXT_PUBLIC_SHORT_IO_KEY
      },
      body: JSON.stringify({
        domain: 'go.minyvinyl.com',
        originalURL: `https://minyfy.subwaymusician.xyz/play/${docId}`,
        title: 'Minyfy',
        ...(customUrl && { path: customUrl })
      })
    };

    try {
      const response = await fetch(url, options);
      const json = await response.json();
      
      if (json.error === "Link already exists") {
        setErrorMessage("Link already exists. Please choose a different custom URL.");
        return;
      }

      console.log(json);

      // Update Firestore document with shortened link
      await updateDoc(doc(db, "mixtapes", docId), {
        shortenedLink: json.shortURL
      });

      // Redirect to the shortened URL
      window.location.href = json.shortURL;
    } catch (err) {
      console.error('error:' + err);
    }
  };

  const handleDocIdChange = (id) => {
    console.log("handleDocIdChange called with ID:", id);
    setDocId(id);
    setShowUrlInput(true);
  };

  return (
    <>
      <Header />

      <div className="md:px-4 flex flex-col justify-center mb-10 items-center px-3">
        <div className='md:w-full flex justify-center items-center'>
          {tracks.length > 0 ? (
            <div className="md:w-[35%]">
              <MinySection
                name={inputValue}
                backgroundImage={backgroundImage}
                tracks={tracks}
                onDocIdChange={handleDocIdChange}
              />
            </div>
          ) : (
            <div className="relative cursor-pointer mt-4 w-full">
              <div className="overlay1 hidden md:block"></div>
              <img className="md:h-auto h-[15vh] w-full rounded-2xl" src="/loog.jpg" alt="" />
              <div className="cardContent shadow-md">
                <p className="text-white font-bold md:text-4xl text-xl tracking-wide md:pb-6 pb-2 font-jakarta absolute bottom-0 left-0 px-4 py-2">
                  Customize Your Miny
                </p>
              </div>
            </div>
          )}
        </div>
        <div className='flex flex-col md:flex-row gap-2 w-full mt-3'>
          <div className='flex flex-col justify-start w-full'>
            <div className='font-jakarta md:text-lg text-base mb-1 justify-start text-neutral-800 font-medium'>Approach for Building Playlist</div>
            <select
              className="px-5 py-3 font-thin font-mono bg-[#F4EFE6] md:text-lg text-base text-neutral-500 rounded-xl"
              value={selectedOption}
              onChange={handleSelection}
            >
              <option value="">Build Your Playlist</option>
              <option value="tracks">Tracks</option>
              <option value="searchArtist">Artists</option>
              <option value="genre">Genres</option>
              <option value="customize">Customize Miny</option>
            </select>
          </div>

          <div className='flex flex-col justify-start w-full'>
            <div className='md:text-lg text-base mb-1 justify-start text-neutral-800 font-medium font-jakarta'>Showcase Your Identity</div>
            <input
              className="px-5 py-2 pb-[10px] md:text-lg text-base font-mono text-neutral-500 bg-[#F4EFE6] rounded-xl"
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Name here...'
            />
          </div>
        </div>

        <div className='flex flex-col justify-start w-full'>
          <div className='md:text-lg text-base mb-1 mt-3 justify-start text-neutral-800 font-medium font-jakarta'>Set the Scene</div>
          <div className="grid md:grid-cols-6 grid-cols-3 gap-1 md:gap-2">
            {images.map((image, index) => (
              <img
                key={index}
                className={`cursor-pointer w-full rounded-xl ${backgroundImage === image ? 'border-2 border-black p-1' : 'border-[2.8px] border-transparent'}`}
                src={image}
                alt={`Background ${index + 1}`}
                onClick={() => handleImageSelection(image)}
              />
            ))}
          </div>
        </div>

        {selectedOption === 'tracks' && (
          <TracksList onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'searchArtist' && (
          <ArtistSection onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'genre' && (
          <TagSection onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'customize' && (
          <CustomTrack onTracksChange={handleTracksChange} />
        )}
      </div>

      {showUrlInput && (
        <div className="fixed inset-0 flex z-50 items-center justify-center font-jakarta bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">🥳 Your Playlist Created Successfully 🥳</h2>
            <h2 className="text-xl font-bold mb-4 text-center">Customize Brand URL</h2>
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
                https://go.minyvinyl.com/{customUrl || '*random*'}
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`p-2 rounded-lg fixed md:right-7 cursor-pointer right-4 md:bottom-4 bottom-4 bg-black shadow-custom ${!isAtTop && showNotification ? 'animate-bounce' : ''}`}
        onClick={handleScrollToTop}
      >
        {!isAtTop && showNotification && (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f83d3d] text-white text-xs absolute top-[-0.5rem] right-[-0.5rem]">
            1
          </div>
        )}
        <FaArrowUp className='md:text-3xl text-xl text-white' />
      </div>
    </>
  );
};

export default Custom;
