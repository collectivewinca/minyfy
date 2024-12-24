import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MinySection from '@/components/MinySection';
import { FaReddit } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { NextSeo } from 'next-seo';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import axios from 'axios';
import MakeAMinyImages from "@/utils/MakeAMinyImages";
import mixtapeNames from '@/utils/MixtapeNames';
import { PiMusicNoteFill } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai"; // Import delete icon

function Reddit() {
  const [redditUrl, setRedditUrl] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allTracks, setAllTracks] = useState([]); // Store all fetched tracks
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [userExists, setUserExists] = useState(true);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(MakeAMinyImages[1]);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState(MakeAMinyImages[1]);
  const [finalImage, setFinalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [docId, setDocId] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pngImageUrl, setPngImageUrl] = useState("");
  const [images, setImages] = useState(MakeAMinyImages);

  const handleDocIdChange = (id) => {
    setDocId(id);
    setShowUrlInput(true);
  };

  // Function to handle track selection, with a limit of 10 tracks
  const toggleTrack = (track) => {
    setSelectedTracks(prevSelected => {
      const isCurrentlySelected = prevSelected.includes(track);
      
      if (isCurrentlySelected) {
        // If track is already selected, remove it
        return prevSelected.filter(t => t !== track);
      } else if (prevSelected.length < 10) {
        // If track is not selected and we haven't hit the limit, add it
        return [...prevSelected, track];
      }
      // If we've hit the limit, return the current selection unchanged
      return prevSelected;
    });
  };

  // Function to handle track deletion
  const deleteTrack = (track) => {
    setAllTracks(prevAllTracks => prevAllTracks.filter(t => t !== track));
    setSelectedTracks(prevSelected => prevSelected.filter(t => t !== track));
  };

  const processWithGemini = async (content) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings,
      });

      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `Extract all song tracks from the following content. Return a JSON string in the format: {'tracks': ['Track Name - Artist Name', 'Track Name - Artist Name',...]}.  Also if there is No Track Name return Empty Array {'tracks': []}.`
              },
              {
                text: `This Content is just abstract of a conversation${content}`
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage("Follow the format strictly please: {'tracks': ['Track Name - Artist Name', 'Track Name - Artist Name',...]} Also if there is No Track Name in content return Empty Array {'tracks': []}.");
      const aiResponse = await result.response.text().trim();
      return cleanJSONResponse(aiResponse);
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      throw new Error('Failed to process content with Gemini AI');
    }
  };

  const cleanJSONResponse = (response) => {
    try {
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = response.slice(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonString);
      }
      return null;
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return null;
    }
  };

  const collectRedditContent = async (response) => {
    let content = '';
    
    try {
      // Get main post content
      const mainPost = response.data[0].data.children[0].data;
      content += mainPost.selftext + '\n';
      
      // Get comments and replies
      const comments = response.data[1].data.children;
      comments.slice(0, 13).forEach(comment => {
        if (comment.data.body) {
          content += comment.data.body + '\n';
          
          // Get replies if they exist
          if (comment.data.replies && comment.data.replies.data) {
            comment.data.replies.data.children.forEach(reply => {
              if (reply.data.body) {
                content += reply.data.body + '\n';
              }
            });
          }
        }
      });
      
      return content;
    } catch (error) {
      console.error('Error collecting Reddit content:', error);
      throw new Error('Failed to collect Reddit content');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    setLoading(true);
    setErrorMessage('');

    try {
      let resolvedRedditUrl = redditUrl;

      // Remove any query parameters from the resolved URL
      const cleanUrl = new URL(resolvedRedditUrl);
      const baseRedditUrl = `${cleanUrl.origin}${cleanUrl.pathname}`;

      // Append .json to the clean URL
      const apiUrl = `${baseRedditUrl}.json`;

      // Fetch data from Reddit using axios
      const response = await axios.get(apiUrl);
      const allContent = await collectRedditContent(response);
      const processedData = await processWithGemini(allContent);

      if (processedData?.tracks?.length) {
        // Take only first 10 tracks
        setAllTracks(processedData.tracks); // Update allTracks state
        setSelectedTracks(processedData.tracks.slice(0, 10)); // Select first 10 
        setUserExists(true);
      } else {
        setUserExists(false);
        setErrorMessage('No tracks found in the content. Please try another post.');
      }
    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      setUserExists(false);
      setErrorMessage('Error fetching Reddit data. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    console.log('Starting image generation');
    setLoading1(true);
    const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: 'Generate a detailed image of small, 2-inch vinyl records shaped like hexagons. The records should have the look of classic vinyl, with grooves and a label in the center. The label can have artistic designs, like abstract art or a logo, and should fit neatly into the hexagonal shape. Use a mix of modern and vintage aesthetics, with some records featuring bold, bright colors and others in more muted tones. Display the records in an interesting layout, like stacked or fanned out, showing the unique hexagonal design. Lighting should highlight the textures and depth of the vinyl, making the records look glossy and tactile.',
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      try {
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
        setLoading1(false);
      } catch (error) {
        console.error('Error processing image:', error);
        setLoading1(false);
      }
    } else {
      console.error('Error generating image:', data);
      setLoading1(false);
    }
  };

  const isValidUrl = (url) => {
    const urlPattern = /^[a-zA-Z0-9-]+$/;
    return urlPattern.test(url);
  };

  const createShortUrl = async () => {
    const trimmedCustomUrl = customUrl.trim();
  
    if (trimmedCustomUrl && !isValidUrl(trimmedCustomUrl)) {
      setErrorMessage("Invalid URL. Only alphanumeric characters, dashes are allowed.");
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
  
      if (response.status === 409) {
        setErrorMessage("Link already exists. Please choose a different custom URL.");
        return;
      } else if (!response.ok) {
        setErrorMessage("Error creating short URL. Please try again.");
        console.error('Error creating short URL:', json.message);
        return;
      }
  
      console.log('Short URL created successfully:', json);
  
      await updateDoc(doc(db, "mixtapes", docId), {
        shortenedLink: `https://go.minyvinyl.com/${json.link.slug}` 
      });
  
      window.location.href = json.link.url;
    } catch (err) {
      console.error('Error creating short URL:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

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
    setBackgroundImageUrl(imagePath);
  };

  return (
    <>
      <NextSeo
        title="Reddit Playlist Generator - Create a Playlist from Reddit Posts | Miny Vinyl"
        description="Transform Reddit music discussions into custom playlists! Extract tracks from Reddit posts, generate AI-powered backgrounds, and share with a personalized URL."
        canonical="https://minyfy.minyvinyl.com/reddit"
        openGraph={{
          url: 'https://minyfy.minyvinyl.com/reddit',
          title: 'Reddit Playlist Generator - Create Playlists from Reddit Posts | Miny Vinyl',
          description: 'Transform Reddit music discussions into custom playlists! Extract tracks from Reddit posts, generate AI-powered backgrounds, and share with a personalized URL.',
          images: [
            {
              url: 'https://minyfy.minyvinyl.com/vinyl.png',
              width: 1200,
              height: 630,
              alt: 'Miny Vinyl - Create Playlists from Reddit Posts',
            },
          ],
          site_name: 'Miny Vinyl',
        }}
      />
      <Header />
      <div className="px-4 mt-6 mb-12 flex flex-col justify-center items-center">
        <h1 className="md:text-4xl text-2xl font-extrabold  text-black flex gap-2 items-center">
          <FaReddit className="text-5xl pt-1"/> Reddit Playlist Generator
        </h1>

        {selectedTracks.length > 0 && (
          <div className="md:w-[40%]">
            <MinySection 
              name={inputValue}
              backgroundImage={backgroundImageUrl}
              tracks={selectedTracks}
              backgroundImageSrc={backgroundImageSrc}
              onDocIdChange={handleDocIdChange}
              setPngImageUrl={setPngImageUrl}
              setFinalImage={setFinalImage}
            />
          </div>
        )}

        <form className="w-full mt-6 flex flex-col md:flex-row gap-6">
          {/* Reddit URL Input Section */}
          <div className="w-full">
            <label 
              className="block text-gray-700 text-lg md:text-xl font-bold mb-2" 
              htmlFor="redditUrl"
            >
              Enter Reddit Post URL
            </label>
            <div className="flex h-14">
              <input
                type="text"
                id="redditUrl"
                value={redditUrl}
                onChange={(e) => setRedditUrl(e.target.value)}
                className="px-5 py-3 font-thin font-mono w-full bg-neutral-200 text-lg text-neutral-600 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-[#A18249]"
                placeholder="Reddit Post URL"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#A18249] whitespace-nowrap text-xl text-white hover:opacity-80 font-bold py-3 px-4 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#A18249] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Mixtape Input Section */}
          <div className="w-full">
            <label 
              className="block text-gray-700 text-lg md:text-xl font-bold mb-2"
              htmlFor="mixtapeName"
            >
              Personalize your Mixtape
            </label>
            <input
              id="mixtapeName"
              className="px-5 py-3 h-14 font-thin font-mono w-full bg-neutral-200 text-lg text-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#73c33e]"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Add mixtape name to watermark your MINY..."
            />
          </div>
        </form>
        {isSubmitted && !userExists && (
          <div className="flex justify-center mt-4">
            <p className="text-red-500">{errorMessage}</p>
          </div>
        )}
       
       {allTracks.length > 0 && (
        <div className="mt-5 w-full">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">
            Playlist Tracks
          </h2>
          <p className="text-sm text-gray-700">
            Select up to 10 tracks. Currently selected: {selectedTracks.length}
          </p>
          <p className="mb-2 text-base font-medium text-gray-900">
            Click on the track to select or unselect
          </p>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track) => (
              <li
                key={track}
                
                className="flex justify-between items-center cursor-pointer mb-2 w-full"
              >
                <div className="flex items-center gap-2" onClick={() => toggleTrack(track)}>
                  <button
                    type="button"
                    className={`p-2 rounded-md ${
                      selectedTracks.includes(track)
                        ? 'bg-[#A18249] text-white'
                        : 'bg-[#F4EFE6] text-black'
                    } font-extrabold`}
                    
                  >
                    <PiMusicNoteFill className="md:text-2xl text-lg" />
                  </button>
                  <div className="font-base font-jakarta md:text-xl text-sm">
                    {track}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-black hover:text-red-700"
                  onClick={() => deleteTrack(track)}
                >
                  <AiFillDelete className="md:text-2xl text-lg" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

        <div className='flex flex-col justify-start w-full'>
          <div className='md:text-lg text-base mb-1 mt-3 justify-start text-neutral-800 font-medium font-jakarta'>Set the Scene</div>
          <div className="grid md:grid-cols-6 grid-cols-3 gap-1 md:gap-2">
            <div className="card" onClick={generateImage}>
              {loading1 ? (
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
                className={`cursor-pointer w-full rounded-xl ${backgroundImageUrl === image ? 'border-2 border-black p-1' : 'border-[2.8px] border-transparent'}`}
                src={image}
                alt={`Background ${index + 1}`}
                onClick={() => handleImageSelection(image)}
              />
            ))}
          </div>
        </div>


       
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

export default Reddit;
