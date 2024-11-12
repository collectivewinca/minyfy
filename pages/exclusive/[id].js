import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged, GoogleAuthProvider, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import SocialShareButtons from '@/components/SocialShareButtons';
import { MdFileDownload } from "react-icons/md";
import { toBlob, toCanvas } from 'html-to-image';
import download from 'downloadjs';
import { PinterestShareButton, PinterestIcon } from 'react-share';
import {FaShoppingCart } from 'react-icons/fa';
import CommentSection from '@/components/CommentSection';
import TrackList from '@/utils/ExTrackList';
import PWAShare from '@/components/PWAshare';
import { NextSeo } from 'next-seo';
import {TbLogin} from 'react-icons/tb'
import {IoRocketSharp} from 'react-icons/io5'
import { FaArrowDownLong } from "react-icons/fa6";
import  Player  from '@vimeo/player';
import {PasswordProtectedPlayer} from "@/utils/PlayerLockOverlay";

export async function getServerSideProps(context) {
  const { id } = context.params;
  let docData = null;
  let docId = null;
  let initialComments = [];

  try {
    // Fetch the main document
    const docRef = doc(db, 'exclusives', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { createdAt, votedBy, comments: commentsData = [], ...rest } = docSnap.data(); // Destructure to exclude createdAt and get comments
      docData = rest; // Assign everything except createdAt to docData
      initialComments = commentsData; // Default to empty array if comments field is missing
      docId = id;
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }

  return {
    props: {
      docData,
      docId,
      initialComments,
    },
  };
}

const PlaylistPage = ({ docData, docId, initialComments }) => {

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [showBuyNow, setShowBuyNow] = useState(false);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPledgeTaken, setIsPledgeTaken] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [currentTrackName, setCurrentTrackName] = useState(docData?.tracks[0]?.title || '');
  const playerRef = useRef(null);
  const router = useRouter();
  const trackDataContainerRef = useRef(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [player, setPlayer] = useState(null);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const loadVimeoPlayer = () => {
      if (docData?.tracks && docData?.tracks.length > 0 && playerRef.current) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${docData?.tracks[currentTrackIndex].id}?autoplay=1`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullScreen = true;
        iframe.title = docData?.tracks[currentTrackIndex].title;

        playerRef.current.innerHTML = '';
        playerRef.current.appendChild(iframe);

        const vimeoPlayer = new Player(iframe);
        setPlayer(vimeoPlayer);

        vimeoPlayer.on('ended', () => {
          const nextIndex = (currentTrackIndex + 1) % docData?.tracks.length;
          setCurrentTrackIndex(nextIndex);
          loadVimeoPlayer();
        });
      }
    };

    loadVimeoPlayer();

    return () => {
      if (player) {
        player.unload();
      }
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
      }
    };
  }, [currentTrackIndex, docData?.tracks, isLocked]);

  const handleTrackClick = (index) => {
    setCurrentTrackIndex(index);
    setCurrentTrackName(docData.tracks[index]?.title || '');
    
    // Create new player instance for the selected track
    if (playerRef.current) {
      playerRef.current.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${docData.tracks[index].id}?autoplay=1`;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullScreen = true;
      iframe.title = docData.tracks[index].title;
      
      playerRef.current.appendChild(iframe);
      
      const newPlayer = new Player(iframe);
      setPlayer(newPlayer);
      
      newPlayer.on('ended', () => {
        const nextIndex = (index + 1) % docData.tracks.length;
        handleTrackClick(nextIndex);
      });
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      // Ensure user is not null before accessing its properties
      if (user) {
        setDisplayName(user.displayName || '');
        setAvatarUrl(user.photoURL || '');
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Update formData with user's name and email
        setDisplayName(currentUser.displayName || '');
        setAvatarUrl(currentUser.photoURL || '');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBuyNowClick = async () => {
    if (user) {
      setShowBuyNow(!showBuyNow);
    } else {
      await handleLogin();
      if (auth.currentUser) {
        setShowBuyNow(true);
      }
    }
  }

  const handlePledgeFormClick = () => {
    if (!isPledgeTaken) {
      setShowPledgeForm(!showPledgeForm);
    }
  };

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

  const handleDownloadImage = async () => {
    if (!trackDataContainerRef.current) {
      console.error('Error: trackDataContainerRef is not defined.');
      return;
    }

    try {
      const canvas = await createCanvas(trackDataContainerRef.current);

      // Compress the image
      const compressedDataUrl = compressCanvas(canvas, 0.7);

      const random = Math.floor(Math.random() * 1000);
      download(compressedDataUrl, `my-miny-order-${random}.jpg`);
    } catch (error) {
      console.error('Error converting to image:', error);
    }
  };

  const compressCanvas = (canvas, quality) => {
    const compressedCanvas = document.createElement('canvas');
    const ctx = compressedCanvas.getContext('2d');

    // Set the compressed canvas size (you can adjust this for further compression)
    compressedCanvas.width = canvas.width * 0.8;
    compressedCanvas.height = canvas.height * 0.8;

    // Draw the original canvas onto the compressed canvas
    ctx.drawImage(canvas, 0, 0, compressedCanvas.width, compressedCanvas.height);

    // Convert to compressed JPEG
    return compressedCanvas.toDataURL('image/jpeg', quality);
  };

  if (!docData) {
    return <div>Loading...</div>;
  }

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  const { name, tracks, date, imageUrl, backgroundImage, unlockPassword, shortenedLink } = docData;
  const topValue = 42 - name.length * 0.4;

  return (
    <>
      <NextSeo
        title={`${toSentenceCase(name)}'s Mixtape - Listen, Comment & Share | Miny Vinyl`}
        description={`${toSentenceCase(name)}'s Mixtape Featuring Tracks : ${tracks.map(track => track.title).join(' • ')}  Join the conversation with text comments, stickers, audio responses, and polls. Discover unique tracks, leave feedback, and enjoy the playlist!`}
        canonical={`https://minyfy.subwaymusician.xyz${router.asPath}`}
        openGraph={{
          url: `https://minyfy.subwaymusician.xyz${router.asPath}`,
          title: `${toSentenceCase(name)}'s Mixtape | Miny Vinyl`,
          description: `${toSentenceCase(name)}'s Mixtape Featuring Tracks : ${tracks.map(track => track.title).join(' • ')}  Join the conversation with text comments, stickers, audio responses, and polls. Discover unique tracks, leave feedback, and enjoy the playlist!.`,
          images: [
            {
              url: backgroundImage,
              alt: `${toSentenceCase(name)}'s Mixtape Cover`,
              width: 1200,
              height: 630,
            },
          ],
          site_name: 'Miny Vinyl',
          type: 'music.playlist',
        }}
        twitter={{
          handle: '@minyvinyl',
          site: '@minyvinyl',
          cardType: 'summary_large_image',
          title: `${toSentenceCase(name)}'s Mixtape | Miny Vinyl`,
          description: `Listen to and comment on ${toSentenceCase(name)}'s mixtape on Miny Vinyl. Share your thoughts with text, stickers, audio comments, and polls.`,
          image: backgroundImage,
        }}
        additionalJsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'MusicPlaylist',
            name: `${toSentenceCase(name)}'s Mixtape`,
            description: `Listen to ${toSentenceCase(
              name
            )}'s custom mixtape on Miny Vinyl. Discover unique tracks, join the conversation, and share your thoughts!`,
            url: `https://minyfy.subwaymusician.xyz${router.asPath}`,
            image: backgroundImage,
          },
        ]}
      />
      <Head>
        <meta property="og:image" content={backgroundImage} />
        <link rel="icon" href={backgroundImage} />
      </Head>

      <header className="w-full bg-black flex items-center justify-between py-2 px-4">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Image
            src="/Logo.png"
            alt="Icon"
            width={140}
            height={100}
            className="w-20 sm:w-24 md:w-28 lg:w-28"
          />
        </div>

        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="text-black border-r-4 border-b-4 border-black bg-[#d6d6d6] hover:opacity-80 focus:ring-4 flex gap-1 items-center focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 "
            >
              <TbLogin className="text-xl" /> Log out
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="text-black border-r-4 border-b-4 border-black bg-[#73c33e] hover:opacity-80 focus:ring-4 flex gap-1 items-center focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 "
            >
              <TbLogin className="text-xl" /> Log in
            </button>
          )}
        </div>
      </header>

      <div className='py-4 px-2 bg-black text-white flex flex-col justify-center items-center'>
        {/* <button onClick={handleBuyNowClick} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-2xl text-lg md:px-6 px-4 md:py-3 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-3 items-center cursor-pointer">
          <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
          <FaShoppingCart className='md:text-3xl text-xl' /> Claim MINY Collectible
        </button> */}

        <SocialShareButtons
          shareUrl={shortenedLink || `https://minyfy.subwaymusician.xyz${router.asPath}`}
          title="Check out my Latest Mixtape on Miny Vinyl"
        />

        <PasswordProtectedPlayer setIsLockedPlayer={setIsLocked}  correctPassword={unlockPassword}>
          <div className="w-full h-full rounded-lg flex items-center justify-center">
            <div
                id="player"
                className="w-full max-w-3xl mx-auto aspect-video mb-6 mt-2 shadow shadow-neutral-600"
                ref={playerRef}
                style={{ position: 'relative' }} // Add position relative to container
            >
                {/* The iframe will be added here */}
            </div>
          </div>
        </PasswordProtectedPlayer>

        <div className='font-bold mb-3 mt-5 text-lg md:text-xl  text-[#f48531] font-jakarta flex items-center gap-1'>
          <FaArrowDownLong className='md:text-2xl text-xl' />
          Tap Track Names to Listen
          <FaArrowDownLong className='md:text-2xl text-xl' />
        </div>


        <div className="relative w-full  md:px-0  md:w-[42%]">
          <div className="absolute left-0 md:left-5 top-0 w-full h-full bg-transparent rounded-lg">
            <div className="absolute  z-10 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-[2.15rem]">
              <TrackList
                tracks={tracks}
                currentTrackIndex={currentTrackIndex}
                handleTrackClick={handleTrackClick}
                comments={comments}
              />
            </div>
          </div>
          <div ref={trackDataContainerRef} className='relative pr-12 md:pr-0 z-10 overflow-y-auto w-full '>
            <div className="relative cursor-pointer hex-alt ">
              <div className="overlay"></div>
              <img className="w-full h-full object-cover" src={backgroundImage} alt="Background" />
              <div className="absolute z-10 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2">
                <div className="flex flex-col md:gap-[6px] gap-[3.5px] items-end text-[2.1vw] md:text-[1.2vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
                  {tracks.map((track, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer ${currentTrackIndex === index ? 'font-bold text-[#f48531]' : ''}`}
                      onClick={() => handleTrackClick(index)}
                    >
                      {toSentenceCase(track.title.length > 33 ? `${track.title.slice(0, 33)}..` : track.title)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute z-10 left-[8.5%] top-[21.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                <div>TURN IT UP. MAKE IT A MINY MOMENT.</div>
              </div>

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
                  <strong className='text-[#f48531] ml-1 uppercase'>{toSentenceCase(name)}</strong>
                </div>
              </div>
              <div className="absolute z-10 left-[7%] bottom-[22.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2 mt-3 mb-3'>
          <button onClick={handleDownloadImage} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-lg text-sm md:px-2 px-2 md:py-2 font-jakarta py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-1 items-center cursor-pointer">
            <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
            <MdFileDownload className='md:text-2xl text-base' /> Download Image
          </button>

          <button onClick={handleDownloadImage} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-lg text-sm md:px-2 px-2 md:py-2 font-jakarta py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-1 items-center cursor-pointer">
            <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
            <IoRocketSharp className='md:text-xl text-base' /> Create A MINY
          </button>
        </div>

        

        <div>
          <CommentSection comments={comments} displayName={displayName} avatarUrl={avatarUrl} handleLogin={handleLogin} currentTrackName={currentTrackName} setComments={setComments} collection={`exclusives`} docId={docId} />
        </div>

      </div>
    </>
  );
};

export default PlaylistPage;