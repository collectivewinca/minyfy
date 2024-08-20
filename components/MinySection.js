import React, { useRef, useState, useEffect } from 'react';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';
import { toSvg, toCanvas } from 'html-to-image';
import { FaDownload, FaHeart, FaRegHeart } from "react-icons/fa6";
import { MdRocketLaunch } from "react-icons/md";
import { useRouter } from 'next/router';
import { db, auth, storage } from "@/firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";



const MinySection = ({ name, backgroundImage, tracks, setFinalImage, onDocIdChange, backgroundImageSrc }) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const trackDataContainerRef = useRef(null);
  const router = useRouter();
  const topValue = 38 - name.length * 0.45;
  

  const useLoadingDots = () => {
    const [dots, setDots] = useState('');
    useEffect(() => {
      const timer = setInterval(() => {
        setDots(d => d.length < 4 ? d + '.' : '');
      }, 500);
      return () => clearInterval(timer);
    }, []);
    return dots;
  };
  const dots = useLoadingDots();

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const createCanvas = async (node) => {
    const isSafariOrChrome = /safari|chrome/i.test(navigator.userAgent) && !/android/i.test(navigator.userAgent);
  
    let dataUrl = "";
    let canvas;
    let i = 0;
    let maxAttempts = isSafariOrChrome ? 5 : 1;
    let cycle = [];
    let repeat = true;
  
    while (repeat && i < maxAttempts) {
      canvas = await toCanvas(node, {
        fetchRequestInit: {
          cache: "no-cache",
        },
        includeQueryParams: true,
        quality: 1,
      });
      i += 1;
      dataUrl = canvas.toDataURL("image/png");
      cycle[i] = dataUrl.length;
  
      if (dataUrl.length > cycle[i - 1]) repeat = false;
    }
    console.log("is safari or chrome:" + isSafariOrChrome + "_repeat_need_" + i);
    return canvas;
  };

  const saveToFirestore = async () => {
    if (!user) {
      await handleLogin();
      return;
    }
  
    if (!name) {
      alert('Please enter mixtape name to watermark the MINY!');
      return;
    }
  
    setLoading(true);
    try {
      const tracksWithYouTube = await Promise.all(tracks.map(async (track) => {
        const youtubeData = await fetchYouTubeDataWithRetry(track);
        return {
          track,
          youtubeData,
        };
      }));
  
      // Generate the canvas
      const canvas = await createCanvas(trackDataContainerRef.current);
  
      // Convert canvas to base64
      const imageData = canvas.toDataURL("image/png");
  
      // Send the image data to the server-side API
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          name,
          backgroundImage,
          tracks: tracksWithYouTube,
          user,
          isFavorite,
          date: formattedDate,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setFinalImage(data.imageUrl);
        onDocIdChange(data.docId);
      } else {
        throw new Error(data.message || 'Failed to save image');
      }
    } catch (error) {
      console.error("Error saving image: ", error);
    } finally {
      setLoading(false);
    }
  };
  


  const fetchYouTubeData = async (track) => {
    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: track }),
      });

      const data = await response.json();

      if (response.ok && data && data.length > 0) {
        return data[0]; // Assuming the first result is the most relevant one
      } else {
        console.error(`Error fetching YouTube data for track: ${track}`, data);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching YouTube data for track: ${track}`, error);
      return null;
    }
  };

  const fetchYouTubeDataWithRetry = async (track, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const youtubeData = await fetchYouTubeData(track);
      if (youtubeData) {
        return youtubeData;
      }
      console.warn(`Retry ${attempt} for fetching YouTube data for track: ${track}`);
    }
    console.error(`Failed to fetch YouTube data for track: ${track} after ${retries} retries.`);
    return null;
  };

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  // Get today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <>
    <div className='py-7'>
      <div ref={trackDataContainerRef} className='overflow-y-auto'>
      <div className="relative z-10 cursor-pointer hex-alt">
          <div className="overlay"></div>
         
          
          <img  className="w-full h-full object-cover" 
              src={backgroundImage} 
              alt="Background"  />

          <div className="absolute z-10 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2 w-full">
            <div className="flex flex-col md:gap-[6px] gap-[3.5px] items-end text-[2.4vw] md:text-[0.9vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
              {tracks.map((track, index) => (
                <div key={index} className="w-full text-right">
                  {toSentenceCase(track.length > 33 ? `${track.slice(0, 33)}..` : track)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute z-10 left-[8.5%] top-[21.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
              <div>TURN IT UP. MAKE IT A MINY MOMENT.</div>
            </div>
            
            {/* Middle-left text */}
            <div 
                      className="absolute z-10 left-2 top-1/2 text-[1.7vw] md:text-[0.75vw] font-medium text-white origin-left"
                      style={{ 
                        top: `${topValue}%`,
                        transform: "translateY(-50%) rotate(-90deg) translateX(-100%)",
                        transformOrigin: "",
                        textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)"
                      }}
                    >
                      <div className="whitespace-nowrap">
                        MINY MIXTAPE :
                        <strong className='text-[#f48531] ml-1 uppercase'>{name}</strong>
                      </div>
                    </div>
            {/* Bottom-left text */}
            <div className="absolute z-10 left-[7%] bottom-[22.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
              <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
            </div>

        
          
          
        </div>
      </div>

      <div className="flex md:flex-row gap-3 flex-col justify-between items-center mt-4">
        <button
          onClick={() => { setIsFavorite(!isFavorite) }}
          className="bg-[#F4EFE6] hover:opacity-80 text-sm shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-4 rounded-full"
        >
          {isFavorite ? (<FaRegHeart className='text-lg' />) : (<FaHeart className='text-xl' />)} Add to Favorites
        </button>
        <button
          onClick={saveToFirestore}
          className="bg-[#f48531] hover:opacity-80 text-sm shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-7 rounded-full"
        >
          <MdRocketLaunch className='text-lg' />{loading ? `Creating${dots}` : 'Create Mixtape'}
        </button>
      </div>
    </div>
    </>
  );
};

export default MinySection;
