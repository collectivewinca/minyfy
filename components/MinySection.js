import React, { useRef, useState, useEffect } from 'react';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';
import { FaDownload, FaHeart, FaRegHeart } from "react-icons/fa6";
import { MdRocketLaunch } from "react-icons/md";
import { useRouter } from 'next/router';
import { db, auth, storage } from "@/firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const MinySection = ({ name, backgroundImage, tracks, setFinalImage, onDocIdChange, backgroundImageSrc }) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const trackDataContainerRef = useRef(null);
  const router = useRouter();

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

  const handleDownloadImage = async () => {
    if (!trackDataContainerRef.current) {
      console.error('Error: trackDataContainerRef is not defined.');
      return;
    }

    try {
      const blob = await toBlob(trackDataContainerRef.current);
      if (blob) {
        const random = Math.floor(Math.random() * 1000);
        download(blob, `miny${random}.jpg`);
      } else {
        console.error('Error: Blob is null.');
      }
    } catch (error) {
      console.error('Error converting to image:', error);
    }
  };

  const saveToFirestore = async () => {
    if (!user) {
      await handleLogin();
      return;
    }

    if (!name) {
      alert('Please enter your name to watermark a MINY!');
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

      // Upload image to Firebase Storage
      const blob = await toBlob(trackDataContainerRef.current);
      if (!blob) {
        throw new Error('Error: Blob is null.');
      }
      
      const imageRef = ref(storage, `aminy-generation/miny-${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
      setFinalImage(imageUrl);

      // Save the document in Firestore with the image URL
      const docRef = await addDoc(collection(db, "mixtapes"), {
        name,
        backgroundImage,
        tracks: tracksWithYouTube,
        date: formattedDate,
        isFavorite,
        userDisplayName: user.displayName || 'Anonymous',
        userEmail: user.email,
        imageUrl,
      });

      onDocIdChange(docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
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
        <div className="relative z-10 cursor-pointer">
          <div className="overlay"></div>
          <img className="h-full w-full" src={backgroundImageSrc} alt="Background" />
          <div className="flex flex-col justify-between items-end md:pr-2 pr-2 absolute right-0 top-0 h-full pb-4">
            <p className="text-white font-medium text-lg tracking-wide">
              <img src="/stamp.png" alt="Minyfy Logo" className="md:h-[8vh] h-[4vh] md:px-2 px-2 mt-4" />
            </p>
            <div className="flex flex-col md:gap-[6px] gap-1 items-end md:text-xs text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300 tracking-wider">
              {tracks.map((track, index) => (
                <div key={index}>
                  {toSentenceCase(track.length > 39 ? `${track.slice(0, 39)}..` : track)}
                </div>
              ))}
            </div>
            <div className="flex flex-col  gap-1 items-end md:text-xs text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300 tracking-wider">
              <p>MINY Order for <strong className='text-[#f48531]'>{name}</strong></p>
              <p>{formattedDate}</p>
            </div>
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
