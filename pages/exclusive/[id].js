import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged, GoogleAuthProvider, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import SocialShareButtons from '@/components/SocialShareButtons';
import { MdFileDownload } from "react-icons/md";
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
import { Play, SkipBack, SkipForward } from 'lucide-react'; // Add this import
import { FaComment, FaHeart } from 'react-icons/fa'; // Add this import
import { MdMic, MdPoll } from 'react-icons/md'; // Add this import
import MixtapeCard from '@/utils/MixtapeCard';

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

  const handlePlay = () => {
    if (player) {
      player.getPaused().then(paused => {
        if (paused) {
          player.play();
        } else {
          player.pause();
        }
      });
    }
  };

  const handleTrackChange = (index) => {
    if (isLocked) return; // Prevent track changes if locked
    setCurrentTrackIndex(index);
    setCurrentTrackName(docData.tracks[index]?.title || '');
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}-mixtape.jpg`; // or any filename you want
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
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
        <SocialShareButtons
          shareUrl={shortenedLink || `https://minyfy.subwaymusician.xyz${router.asPath}`}
          title="Check out my Latest Mixtape on Miny Vinyl"
        />

        <PasswordProtectedPlayer setIsLockedPlayer={setIsLocked} correctPassword={unlockPassword}>
          <div className="w-full h-full rounded-lg flex items-center justify-center">
            <div
              id="player"
              className="w-full max-w-3xl mx-auto aspect-video mb-6 mt-2 shadow shadow-neutral-600"
              ref={playerRef}
              style={{ position: 'relative' }}
            />
          </div>
        </PasswordProtectedPlayer>

        <div className='grid grid-cols-1'>
          <MixtapeCard imageUrl={backgroundImage} />
        </div>

        {/* Track Info - Only visible when unlocked */}
        {!isLocked && (
          <div className="w-full md:max-w-3xl p-4 md:p-8 font-jakarta bg-gradient-to-b from-zinc-900 via-zinc-900 to-black rounded-2xl border border-zinc-800/50 shadow-2xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[#73c33e]/10 via-[#8ed654]/10 to-[#73c33e]/10 blur-xl"></div>
              <div className="relative p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-[#73c33e] to-[#8ed654] bg-clip-text text-transparent break-words">
                  {toSentenceCase(tracks[currentTrackIndex]?.title || '')}
                </h2>
              </div>
            </div>

            <div className="relative h-24 mb-8 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-4">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-[#73c33e] to-[#8ed654] rounded-full transform-gpu"
                    style={{
                      animationName: 'waveform',
                      animationDuration: `${0.2 + Math.random() * 0.3}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDirection: 'alternate',
                      animationDelay: `${i * 0.02}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => currentTrackIndex > 0 && handleTrackChange(currentTrackIndex - 1)}
                  className={`p-2 transition-colors ${
                    currentTrackIndex === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white'
                  }`}
                  disabled={currentTrackIndex === 0}
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePlay}
                  className="p-4 rounded-full bg-gradient-to-r from-[#73c33e] to-[#8ed654] hover:from-[#8ed654] hover:to-[#73c33e] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <Play className="w-8 h-8 text-black" fill="black" />
                </button>

                <button
                  onClick={() => currentTrackIndex < tracks.length - 1 && handleTrackChange(currentTrackIndex + 1)}
                  className={`p-2 transition-colors ${
                    currentTrackIndex === tracks.length - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white'
                  }`}
                  disabled={currentTrackIndex === tracks.length - 1}
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar bg-zinc-900/50 p-2 md:p-4">
              {tracks.map((track, index) => {
                const trackComments = comments.filter(comment => comment.trackRefer === track.title);
                const counts = {
                  text: trackComments.reduce((sum, c) => sum + (c.commentType === 'text' ? 1 + (c.replies?.length || 0) : 0), 0),
                  sticker: trackComments.reduce((sum, c) => sum + (c.commentType === 'sticker' ? 1 + (c.replies?.length || 0) : 0), 0),
                  voice: trackComments.reduce((sum, c) => sum + (c.commentType === 'voice' ? 1 + (c.replies?.length || 0) : 0), 0),
                  poll: trackComments.reduce((sum, c) => sum + (c.commentType === 'poll' ? 1 + (c.replies?.length || 0) : 0), 0),
                };

                return (
                  <div
                    key={index}
                    onClick={() => handleTrackChange(index)}
                    className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-300
                      ${currentTrackIndex === index 
                        ? 'bg-gradient-to-r from-[#73c33e]/20 to-[#8ed654]/20 border border-[#73c33e]/20' 
                        : 'hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center
                        ${currentTrackIndex === index 
                          ? 'bg-gradient-to-r from-[#73c33e] to-[#8ed654]' 
                          : 'bg-zinc-800'
                        }`}
                      >
                        {currentTrackIndex === index ? (
                          <div className="flex gap-0.5">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 h-4 bg-black rounded-full"
                                style={{
                                  animation: `equalizer 0.5s ease-in-out infinite alternate`,
                                  animationDelay: `${i * 0.15}s`
                                }}
                              ></div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className={` text-sm font-medium
                          ${currentTrackIndex === index 
                            ? 'text-[#73c33e]' 
                            : 'text-zinc-300 group-hover:text-white'
                          }`}
                        >
                          {toSentenceCase(track.title)}
                        </p>
                        
                        {Object.entries(counts).some(([_, count]) => count > 0) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {counts.text > 0 && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <FaComment className="w-3 h-3" />
                                <span>{counts.text}</span>
                              </div>
                            )}
                            {counts.sticker > 0 && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <FaHeart className="w-3 h-3" />
                                <span>{counts.sticker}</span>
                              </div>
                            )}
                            {counts.voice > 0 && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <MdMic className="w-3 h-3" />
                                <span>{counts.voice}</span>
                              </div>
                            )}
                            {counts.poll > 0 && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <MdPoll className="w-3 h-3" />
                                <span>{counts.poll}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {currentTrackIndex === index && (
                        <div className="flex-shrink-0">
                          {/* Large Screens */}
                          <span className="hidden sm:inline-block text-xs font-medium px-2 py-1 rounded-full bg-[#73c33e]/20 text-[#73c33e] border border-[#73c33e]/20 whitespace-nowrap">
                            NOW PLAYING
                          </span>

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className='flex items-center gap-2 mt-3 mb-3'>
          <button onClick={handleDownloadImage} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-lg text-sm md:px-2 px-2 md:py-2 font-jakarta py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-1 items-center cursor-pointer">
            <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
            <MdFileDownload className='md:text-2xl text-base' /> Download Image
          </button>

          <button onClick={() => (router.push("/makeaminy"))} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-lg text-sm md:px-2 px-2 md:py-2 font-jakarta py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-1 items-center cursor-pointer">
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