import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai"; // Import delete icon
import axios from 'axios';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const ImportRedditPlaylist = ({ onTracksChange }) => {
  const [redditUrl, setRedditUrl] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedditUrlChange = (event) => {
    setRedditUrl(event.target.value);
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
        topK: 40,
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
      comments.slice(0,13).forEach(comment => {
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

  const handleUrlImport = async () => {
    if (!redditUrl.trim()) {
      setError('Please enter a Reddit post URL! Please Try Again.');
      return;
    }

    setLoading(true);
    setError('');

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
        // Remove duplicates and store unique tracks
        const uniqueTracks = [...new Set(processedData.tracks)];
        setAllTracks(uniqueTracks);
        onTracksChange(uniqueTracks);
      } else {
        setError('No tracks found in the content. Please Try Importing Again.');
      }
    } catch (error) {
      console.error('Error importing from Reddit:', error);
      setError('Failed to import playlist. Please check the URL and try importing again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrack = (track) => {
    setAllTracks(prevAllTracks => {
      const updatedTracks = prevAllTracks.filter(t => t !== track);
      onTracksChange(updatedTracks);
      return updatedTracks;
    });
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Reddit Playlist</h2>
      
      <div className="flex items-center">
        <input
          type="text"
          className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
          placeholder="Enter Reddit post URL..."
          value={redditUrl}
          onChange={handleRedditUrlChange}
        />
        <button
          className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80 disabled:opacity-50"
          onClick={handleUrlImport}
          disabled={loading}
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
      
      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Playlist Tracks</h2>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track) => (
              <li 
                key={track} 
                className="flex justify-between items-center mb-2 w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-[#A18249] text-white font-extrabold">
                    <PiMusicNoteFill className="md:text-2xl text-lg" />
                  </div>
                  <div className="font-base font-jakarta md:text-xl text-sm">{track}</div>
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
    </div>
  );
};

export default ImportRedditPlaylist;
