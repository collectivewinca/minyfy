import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';
import { FaDownload, FaHeart, FaRegHeart } from "react-icons/fa6";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from 'next/router';
import { MdRocketLaunch } from "react-icons/md";

const MinySection = ({ name, backgroundImage, tracks }) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [loading, setLoading] = useState(false);
  const trackDataContainerRef = useRef(null);
  const router = useRouter();

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

  // Get today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const saveToFirestore = async () => {
    setLoading(true);
    try {
      const tracksWithYouTube = await Promise.all(tracks.map(async (track) => {
        const youtubeData = await fetchYouTubeDataWithRetry(track);
        return {
          track,
          youtubeData,
        };
      }));

      const docRef = await addDoc(collection(db, "mixtapes"), {
        name,
        backgroundImage,
        tracks: tracksWithYouTube,
        date: formattedDate,
        isFavorite,
      });

      router.push(`/play/${docRef.id}`);
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

  return (
    <div className='py-7'>
      <div ref={trackDataContainerRef} className='overflow-y-auto'>
        <div className="relative cursor-pointer">
          <div className="overlay"></div>
          <img className="h-full w-full" src={backgroundImage} alt="Background" />
          <div className="flex flex-col justify-between items-end md:pr-3 pr-2 absolute right-0 top-0 h-full pb-4">
            <p className="text-white font-medium text-lg tracking-wide">
              <img src="/stamp.png" alt="Minyfy Logo" className="md:h-[8vh] h-[4vh] md:px-2 px-2 mt-4" />
            </p>
            <div className="flex flex-col md:gap-2 gap-1 items-end md:text-sm text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300 tracking-wider">
              {tracks.map((track, index) => (
                <div key={index}>
                  {toSentenceCase(track.length > 39 ? `${track.slice(0, 39)}..` : track)}
                </div>
              ))}
            </div>
            <div className="flex flex-col  gap-1 items-end md:text-sm text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300 tracking-wider">
              <p>MINY Order for <strong className='text-[#f48531]'>{name}</strong></p>
              <p>{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex md:flex-row gap-3 flex-col justify-between items-center mt-4">
        <button
          onClick={() => { setIsFavorite(!isFavorite) }}
          className="bg-[#F4EFE6] hover:opacity-80 shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-4 rounded-full"
        >
          {isFavorite ? (<FaRegHeart className='text-xl' />) : (<FaHeart className='text-xl' />)} Add to Favorites
        </button>
        {/* <button
          onClick={handleDownloadImage}
          className="bg-[#f48531] hover:opacity-80 shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-6 rounded-full"
        >
          <FaDownload /> Download & share
        </button> */}
        <button
          onClick={saveToFirestore}
          className="bg-[#f48531] hover:opacity-80 shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-7 rounded-full"
        >
          <MdRocketLaunch className='text-xl' />{loading ? 'Creating...' : 'Create Playlist'}
        </button>
      </div>
    </div>
  );
};

export default MinySection;
