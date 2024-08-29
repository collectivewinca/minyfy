import React, { useRef, useState, useEffect } from 'react';

import { toSvg, toCanvas } from 'html-to-image';
import html2canvas from 'html2canvas';
import { FaDownload, FaHeart, FaRegHeart } from "react-icons/fa6";
import { MdRocketLaunch } from "react-icons/md";
import { useRouter } from 'next/router';
import { db, auth, storage } from "@/firebase/config";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';



const MinySection = ({ name, backgroundImage, tracks, setFinalImage, onDocIdChange, backgroundImageSrc }) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const trackDataContainerRef = useRef(null);
  const router = useRouter();
  const topValue = 42 - name.length * 0.45;
  

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
    const canvas = await html2canvas(node, {
      useCORS: true,
      scale: 2,
      allowTaint: true,
      logging: false,
    });
    return canvas;
  };
  
  const drawHexagonClip = (context, width, height) => {
    const sideLength = Math.min(width, height) / 3;
    const hexHeight = sideLength * Math.sqrt(3) / 2;
  
    context.beginPath();
    context.moveTo(width / 2, 0);
    context.lineTo(width, hexHeight);
    context.lineTo(width, height - hexHeight);
    context.lineTo(width / 2, height);
    context.lineTo(0, height - hexHeight);
    context.lineTo(0, hexHeight);
    context.closePath();
  
    context.clip();
  };

  const uploadImage = async () => {
    if (trackDataContainerRef.current === null) return;
    try {
      const originalCanvas = await createCanvas(trackDataContainerRef.current);
      const width = originalCanvas.width;
      const height = originalCanvas.height;

      // Create a new offscreen canvas
      const hexCanvas = document.createElement("canvas");
      hexCanvas.width = width;
      hexCanvas.height = height;
      const hexContext = hexCanvas.getContext("2d");

      // Draw the hexagon clipping path
      drawHexagonClip(hexContext, width, height);

      // Draw the original canvas content into the hexagon-clipped canvas
      hexContext.drawImage(originalCanvas, 0, 0);

      // Convert the hexagon-clipped canvas to a Data URL
      const dataUrl = hexCanvas.toDataURL("image/png");

      // Convert Data URL to Blob
      const blob = await (await fetch(dataUrl)).blob();
      
      // Create a storage reference
      const fileName = `miny-${uuidv4()}.png`;
      const imageRef = ref(storage, `aminy-generation/${fileName}`);
      
      // Upload the blob to Firebase Storage
      await uploadBytes(imageRef, blob);
  
      const imageUrl = await getDownloadURL(imageRef);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
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
      // Upload image and get URL
      const imageUrl = await uploadImage();
  
      // Save to Firestore
      const docRef = await addDoc(collection(db, "mixtapes"), {
        name,
        backgroundImage,
        tracks: tracksWithYouTube,
        date: formattedDate,
        isFavorite,
        userDisplayName: user.displayName || 'Anonymous',
        userEmail: user.email,
        imageUrl,
        createdAt: serverTimestamp(),
      });
  
      setFinalImage(imageUrl);
      onDocIdChange(docRef.id);
    } catch (error) {
      console.error("Error saving image:", error);
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
              src={backgroundImageSrc} 
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
          
          <div className="absolute z-10 left-[8.5%] top-[20.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
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
          disabled={loading}
        >
          <MdRocketLaunch className='text-lg' />{loading ? `Creating${dots}` : 'Create Mixtape'}
        </button>
      </div>
    </div>
    </>
  );
};

export default MinySection;
