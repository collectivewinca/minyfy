import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Header from '@/components/Header';
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from 'next/router';
import Image from 'next/image';

export async function getServerSideProps(context) {
  const { id } = context.params;
  let docData = null;

  try {
    const docRef = doc(db, 'mixtapes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      docData = docSnap.data();
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }

  return {
    props: {
      docData,
    },
  };
}

const PlaylistPage = ({ docData }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const playerRef = useRef(null);
  const router = useRouter();

  const resizePlayer = () => {
    if (playerRef.current) {
      const playerElement = document.getElementById('player');
      const width = playerElement.clientWidth;
      const height = width * (9 / 16); // 16:9 aspect ratio
      playerRef.current.setSize(width, height);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      window.onYouTubeIframeAPIReady = () => {
        setIsYouTubeApiReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setIsYouTubeApiReady(true);
    }

    window.addEventListener('resize', resizePlayer);
    return () => {
      window.removeEventListener('resize', resizePlayer);
    };
  }, []);

  useEffect(() => {
    if (isYouTubeApiReady && docData?.tracks[currentTrackIndex]?.youtubeData?.videoId) {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('player', {
          height: '100%',
          width: '100%',
          videoId: docData.tracks[currentTrackIndex].youtubeData.videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      } else {
        playerRef.current.loadVideoById(docData.tracks[currentTrackIndex].youtubeData.videoId);
      }
    }
  }, [isYouTubeApiReady, currentTrackIndex, docData]);

  const onPlayerReady = (event) => {
    event.target.playVideo();
    resizePlayer();
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      if (currentTrackIndex < docData.tracks.length - 1) {
        setCurrentTrackIndex((prevIndex) => prevIndex + 1);
      } else {
        // If it's the last track, play from the start again
        setCurrentTrackIndex(0);
      }
    }
  };

  const handleTrackClick = (index) => {
    setCurrentTrackIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!docData) {
    return <div>Loading...</div>;
  }

  const { name, tracks, date, backgroundImage } = docData;

  return (
    <div className=' bg-black text-white w-full  min-h-screen flex flex-col justify-center  items-center'>
       <header className="fixed md:top-[-30px] top-[-25px] md:left-[-30px] w-2/3  left-[-10px] right-0 z-50 flex items-center justify-between py-2 px-4 sm:px-6 lg:px-8 ">
      <div className="flex items-center">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Image 
            src="/Logo.png" 
            alt="Icon" 
            width={140} 
            height={100} 
            className="w-20 sm:w-24 md:w-28 lg:w-32 "
          />
        </div>
      </div>
      </header>
      <div className='py-14 px-2 bg-black text-white md:w-2/3  min-h-screen flex flex-col justify-center relative items-center'>
        <button className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-2xl text-lg md:px-6 px-4 md:py-3 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-3 items-center cursor-pointer">
          <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
          <FaShoppingCart className='md:text-3xl text-xl' /> Buy Now
        </button>

        <div id="player" className='w-full max-w-4xl mx-auto aspect-video my-6 shadow shadow-neutral-600'>
          {!isYouTubeApiReady && <div>Loading player...</div>}
        </div>
        <div className='overflow-y-auto w-full md:w-[60%] shadow shadow-neutral-600'>
          <div className="relative cursor-pointer">
            <div className="overlay"></div>
            <img className="h-full w-full" src={backgroundImage} alt="Background" />
            <div className="flex flex-col justify-between items-end md:pr-2 pr-2 absolute right-0 top-0 h-full pb-4">
              <p className="text-white font-medium text-lg tracking-wide">
                <img src="/stamp.png" alt="Minyfy Logo" className="md:h-[8vh] h-[4vh] md:px-2 px-2 mt-4" />
              </p>
              <div className="flex flex-col md:gap-2 gap-1 items-end md:text-xs text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300 tracking-wider">
                {tracks.map((track, index) => (
                  <div
                    key={index}
                    className={` cursor-pointer ${currentTrackIndex === index ? 'font-bold text-[#f48531]' : ''}`}
                    onClick={() => handleTrackClick(index)}
                  >
                    {track.track.length > 39 ? `${track.track.slice(0, 39)}..` : track.track}
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:gap-2 gap-1 items-end md:text-xs text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300 tracking-wider">
                <p>MINY Order for <strong className='text-[#f48531]'>{name}</strong></p>
                <p>{date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
