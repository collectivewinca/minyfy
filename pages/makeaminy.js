import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TracksList from '@/components/TrackList';
import ArtistSection from '@/components/ArtistSection';
import TagSection from '@/components/TagSection';
import MinySection from '@/components/MinySection';
import CustomTrack from '@/components/CustomTrack';
import { FaArrowUp } from "react-icons/fa6";
import { updateDoc, doc } from "firebase/firestore";
import { db, auth, storage } from "@/firebase/config";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { MdModeEdit } from "react-icons/md";

const Custom = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('/gallery/img6.png');
  const [backgroundImageSrc, setBackgroundImageSrc] = useState("/gallery/img6.png");
  const [tracks, setTracks] = useState([]);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [docId, setDocId] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([
    "/gallery/img1.png",
    "/gallery/img3.png",
    "/gallery/img4.png",
    "/gallery/img5.png",
    "/gallery/img6.png",
  ]);

  const handleSelection = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleImageSelection = (imagePath) => {
    setBackgroundImage(imagePath);
    setBackgroundImageSrc(imagePath);
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

  const isValidUrl = (url) => {
    const urlPattern = /^[a-zA-Z0-9-_]+$/; // Adjust pattern as needed
    return urlPattern.test(url);
  };

  const createShortUrl = async () => {
    const trimmedCustomUrl = customUrl.trim();
    
    if (trimmedCustomUrl && !isValidUrl(trimmedCustomUrl)) {
      setErrorMessage("Invalid URL. Only alphanumeric characters, dashes, and underscores are allowed.");
      return;
    }

    try {
      const response = await fetch('/api/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId, customUrl: trimmedCustomUrl }),
      });
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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const generateImage = async () => {
    if (!user) {
      await handleLogin();
      return;
    }
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
        prompt: 'Create a uniform background image. Generate an image focused on a random music-related theme, incorporating elements that evoke the essence of different music genres, artists, and tracks. Apply a random artistic style that blends various visual influences, creating a unique and visually striking image. The overall mood should capture a random feeling, creating an immersive and engaging atmosphere. Use a color scheme that includes random bright colors, pastel colors, and neutral colors to create a balanced and vibrant look. Arrange the elements to depict a scene that includes random activities or scenes related to music, ensuring a dynamic and interesting composition. Use random lighting types to enhance the visual appeal and depth of the image. Incorporate specific details such as random musical instruments, symbols, and settings to add richness and context to the scene.',
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await response.json();
    console.log('Generated image data:', data);
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      const updatedImages = [imageUrl, ...images.slice(1)];
      setImages(updatedImages);
      setBackgroundImage(imageUrl);
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
          setBackgroundImageSrc(base64data);
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

      <div className="md:px-4 flex flex-col justify-center mb-10 items-center px-3">
        <div className='md:w-full flex justify-center items-center'>
        {!(tracks.length) > 0 && (
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
              <option value="">Build Your Playlist...</option>
              <option value="tracks">Tracks</option>
              <option value="searchArtist">Artists</option>
              <option value="genre">Genres</option>
              <option value="customize">Customize Miny</option>
            </select>
          </div>

          <div className='flex flex-col justify-start w-full'>
            <div className='md:text-lg text-base mb-1 justify-start text-neutral-800 font-medium font-jakarta'>Showcase Your Identity</div>
            <input
              className="px-5 placeholder:text-neutral-500 py-2 pb-[10px] md:text-lg text-base font-mono text-neutral-500 bg-[#F4EFE6] rounded-xl"
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Add your name to watermark a MINY...'
            />
          </div>
        </div>

        <div className='flex flex-col justify-start w-full'>
          <div className='md:text-lg text-base mb-1 mt-3 justify-start text-neutral-800 font-medium font-jakarta'>Set the Scene</div>
          <div className="grid md:grid-cols-6 grid-cols-3 gap-1 md:gap-2">
            <div className="card" onClick={generateImage}>
              {loading ? (
                <>
                  <h2>
                  <div class="flex justify-center items-center mb-2">
                  <div class="relative">
                      <div class="h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-gray-400"></div>
                      <div class="absolute top-0 left-0 h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-[white] animate-spin">
                      </div>
                  </div>
                  </div>
                  </h2>
                  <h2 className='text-xs md:text-sm font-jakarta'>Generating...</h2>
                </>
                
              ) : (
                <>
                  <h2 className='font-jakarta text-xs md:text-lg text-white'>Generate Scene</h2>
                  <h2 className='font-jakarta text-xs md:text-lg text-white'>with AI</h2>
                </>
              )}
            </div>
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

        {tracks.length > 0 && (
          <>
          <div className="md:w-[35%]">
              <MinySection
                name={inputValue}
                backgroundImage={backgroundImage}
                tracks={tracks}
                backgroundImageSrc={backgroundImageSrc}
                onDocIdChange={handleDocIdChange}
              />
            </div>
          </>
        )}

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
