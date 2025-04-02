import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TracksList from '@/components/TrackList';
import ArtistSection from '@/components/ArtistSection';
import TagSection from '@/components/TagSection';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MinySection from '@/components/MinySection';
import ImportPlaylist from '@/components/ImportPlaylist';
import ImportDiscogPlaylist from '@/components/ImportDiscogPlaylist';
import CustomTrack from '@/components/CustomTrack';
import { FaArrowUp } from "react-icons/fa6";
import { updateDoc, doc } from "firebase/firestore";
import { db, auth, storage } from "@/firebase/config";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { MdModeEdit } from "react-icons/md";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImportAppleMusicPlaylist from '@/components/ImportApplePlaylist';
import mixtapeNames from '@/utils/MixtapeNames';
import ImportYoutubePlaylist from '@/components/ImportYoutubePlaylist';
import FetchRedditThread from "@/components/FetchRedditThread"
import { NextSeo } from 'next-seo';
import MakeAMinyImages from "@/utils/MakeAMinyImages";

const Custom = () => {
  const [selectedOption, setSelectedOption] = useState('customize');
  const [inputValue, setInputValue] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(MakeAMinyImages[1]);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(MakeAMinyImages[1]);
  const [finalImage, setFinalImage] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [docId, setDocId] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [pngImageUrl, setPngImageUrl] = useState("");
  const [images, setImages] = useState(MakeAMinyImages);
  const [artistName, setArtistName] = useState(''); // New state for artist name

  const router = useRouter(); // Get the router object to parse URL

  useEffect(() => {
    const query = router.query; // Access the URL query parameters
    if (query.artist) {
      setSelectedOption('searchArtist'); // Set selected option to 'searchArtist'
      setArtistName(query.artist); // Set artistName from the query parameter
    }
  }, [router.query]);

  const handleSelection = (event) => {
    setSelectedOption(event.target.value);
  };

  

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Initialize inputValue to a random name from the mixtapeNames list
    const getRandomName = () => {
      const randomIndex = Math.floor(Math.random() * mixtapeNames.length);
      return mixtapeNames[randomIndex];
    };

    setInputValue(getRandomName());
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
      // Fetch user data from localStorage
      const userString = localStorage.getItem('user');
      if (!userString) {
        setErrorMessage("User data not found. Please log in again.");
        return;
      }
  
      const userHere = JSON.parse(userString);
  
      // Check if it's the user's first login
      const isFirstLogin = !userHere.lastLoginAt || userHere.lastLoginAt === userHere.createdAt;
  
      // Send POST request to create short URL
      const response = await fetch('/api/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId, customUrl: trimmedCustomUrl }),
      });
  
      const json = await response.json();
  
      if (json.statusCode === 409) {
        setErrorMessage("Link already exists. Please choose a different custom URL.");
        return;
      } else if (!response.ok) {
        setErrorMessage("Error creating short URL. Please try again.");
        console.error('Error creating short URL:', json.message);
        return;
      }
  
  
      // Update Firestore document with the shortened link
      await updateDoc(doc(db, "mixtapes", docId), {
        shortenedLink: `https://go.minyvinyl.com/${json.link.slug}`
      });
  
      // Send email with the shortened link
      // try {
      //   const emailResponse = await fetch('/api/send-mixtape', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       name: inputValue,
      //       imageUrl: pngImageUrl,
      //       shortenedLink: `https://go.minyvinyl.com/${json.link.slug}`,
      //       email: userHere.email,
      //       displayName: userHere.displayName,
      //       isFirstLogin: isFirstLogin
      //     }),
      //   });
  
      //   const emailJson = await emailResponse.json();
      //   if (!emailResponse.ok) {
      //     console.error('Error sending email:', emailJson.error);
      //     setErrorMessage('Error sending email. Please try again.');
      //     return;
      //   }
  
      //   // Update user's lastLoginAt in localStorage
      //   user.lastLoginAt = new Date().getTime().toString();
      //   localStorage.setItem('user', JSON.stringify(user));
  
      //   // Redirect to the shortened URL
      //   window.location.href = json.link.url;
      // } catch (emailError) {
      //   console.error('Error sending email:', emailError);
      //   setErrorMessage('Error sending email. Please try again.');
      // }

      window.location.href = json.link.url;
    } catch (err) {
      console.error('Error creating short URL:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };
  
  const handleDocIdChange = (id) => {
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
    
    setLoading(true);
    const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    try {
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
    
          setBackgroundImage(firebaseUrl);
          const updatedImages = [firebaseUrl, ...images.slice(1)];
          setImages(updatedImages);
    
          setLoading(false);
        } catch (error) {
          console.error('Error processing image:', error);
          setLoading(false);
        }
      } else {
        console.error('Error generating image:', data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
};


  return (
    <>
      <NextSeo
        title="Make A Miny - Craft Your Custom Music Playlist | Miny Vinyl"
        description="Create your own custom mixtape (MINY) on Miny Vinyl! Design a playlist using AI-generated backgrounds, choose top tracks or artists, and import playlists from Apple Music, YouTube, Discogs, and more."
        canonical="https://minyfy.minyvinyl.com/makeaminy"
        openGraph={{
          url: 'https://minyfy.minyvinyl.com/makeaminy',
          title: 'Make A Miny - Craft Your Custom Music Playlist | Miny Vinyl',
          description:
            "Customize your mixtape with AI-generated backgrounds, import playlists from YouTube, Apple Music, and more. Name your mixtape and share it easily with a personalized link.Share your unique 'Miny' with the world!",
          images: [
            {
              url: 'https://minyfy.minyvinyl.com/vinyl.png',
              width: 1200,
              height: 630,
              alt: 'Miny Vinyl - Music Playlist(Mixtape) Creation Page',
            },
          ],
          site_name: 'Miny Vinyl',
        }}
        twitter={{
          handle: '@minyvinyl',
          site: '@minyvinyl',
          cardType: 'summary_large_image',
          title: 'Make A Miny - Craft Your Custom Music Playlist | Miny Vinyl',
          description:
            "Customize your mixtape with AI-generated backgrounds, import playlists from YouTube, Apple Music, and more. Name your mixtape and share it easily with a personalized link.Share your unique 'Miny' with the world!",
        }}
        additionalJsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Make A Miny - Craft Your Custom Music Playlist',
            description:
              "Create your own custom mixtape (MINY) on Miny Vinyl! Design a playlist using AI-generated backgrounds, choose top tracks or artists, and import playlists from Apple Music, YouTube, Discogs, and more.",
            url: 'https://minyfy.minyvinyl.com/makeaminy',
          },
        ]}
      />
      <Header />

      <div className="md:px-4 flex flex-col justify-center mb-10 items-center px-3">
        <div className='md:w-full flex justify-center items-center'>
        {!(tracks.length) > 0 && (
          <div className="relative cursor-pointer mt-4 w-full">
          <div className="overlay1 hidden md:block"></div>
          {/* <img className="md:h-auto h-[15vh] w-full rounded-2xl" src="/loog.jpg" alt="" /> */}
          <img className="md:h-auto h-[15vh] object-cover object-left w-full rounded-2xl" src="/bantwo.webp" alt="" />
          {/* <img className="md:h-auto h-[15vh] w-full rounded-2xl" src="/banone.png" alt="" /> */}
          <div className="cardContent shadow-md">
            <p className="text-white font-bold md:text-4xl text-xl tracking-wide md:pb-6 pb-2 font-jakarta absolute bottom-0 left-0 px-4 py-2">
            Create a Modern Day Mixtape. Share. Play.
            </p>
          </div>
      </div>
        )}
        </div>
        <div className='flex flex-col md:flex-row gap-2 w-full mt-3'>
          <div className='flex flex-col justify-start w-full'>
            <div className='font-jakarta md:text-lg text-base mb-1 justify-start text-neutral-800 font-medium'>Start creating your Mixtape here</div>
            <select
              className="px-5 py-3 font-thin font-mono bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-xl"
              value={selectedOption}
              onChange={handleSelection}
            >
              <option value="customize">Create personal MINY 📼
              </option>
              <option value="searchArtist">Artists</option>
              <option value="tracks">Top Tracks This Week</option>
              <option value="youtube">Import Playlist - YouTube</option>
              <option value="apple">Import Playlist - Apple Music</option>
              <option value="discogs">Import Playlist - Discogs</option>
              {/* <option value="reddit">Import Playlist - Reddit</option> */}
              <option value="genre">Genres</option>
              
            </select>
          </div>

          <div className='flex flex-col justify-start w-full'>
            <div className='md:text-lg text-base mb-1 justify-start text-neutral-800 font-medium font-jakarta'>Personalize your Mixtape</div>
            <input
              className="px-5 placeholder:text-neutral-500 py-2 pb-[10px] md:text-lg text-sm font-mono text-neutral-500 bg-[#F4EFE6] rounded-xl"
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Add mixtape name to watermark your MINY...'
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
                  <div className="flex justify-center items-center mb-2">
                  <div className="relative">
                      <div className="h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-gray-400"></div>
                      <div className="absolute top-0 left-0 h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-[white] animate-spin">
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
            {images.slice(0,5).map((image, index) => (
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
                setFinalImage={setFinalImage}
                setPngImageUrl={setPngImageUrl}
              />
            </div>
          </>
        )}

        {selectedOption === 'tracks' && (
          <TracksList onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'searchArtist' && (
          <ArtistSection artist={artistName} onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'genre' && (
          <TagSection onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'customize' && (
          <CustomTrack onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'import' && (
          <ImportPlaylist onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'apple' && (
          <ImportAppleMusicPlaylist onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'youtube' && (
          <ImportYoutubePlaylist onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'discogs' && (
          <ImportDiscogPlaylist onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'reddit' && (
          <FetchRedditThread onTracksChange={handleTracksChange} />
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

      {/* <div
        className={`p-2 rounded-lg fixed md:right-7 cursor-pointer right-4 md:bottom-4 bottom-4 bg-black shadow-custom ${!isAtTop && showNotification ? 'animate-bounce' : ''}`}
        onClick={handleScrollToTop}
      >
        {!isAtTop && showNotification && (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f83d3d] text-white text-xs absolute top-[-0.5rem] right-[-0.5rem]">
            1
          </div>
        )}
        <FaArrowUp className='md:text-3xl text-xl text-white' />
      </div> */}
    </>
  );
};

export default Custom;
