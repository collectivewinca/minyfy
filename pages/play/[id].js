import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import SocialShareButtons from '@/components/SocialShareButtons';
import BuyNow from '@/components/BuyNow';
import PledgeForm from '@/components/PledgeForm';
import { MdFileDownload } from "react-icons/md";
import { toBlob } from 'html-to-image';
import download from 'downloadjs';

export async function getServerSideProps(context) {
  const { id } = context.params;
  let docData = null;
  let docId = null;

  try {
    const docRef = doc(db, 'mixtapes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      docData = docSnap.data();
      docId = id;
      // console.log('Document id:', docId);
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
    },
  };
}

const PlaylistPage = ({ docData, docId }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [showBuyNow, setShowBuyNow] = useState(false);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [user, setUser] = useState(null);
  const playerRef = useRef(null);
  const router = useRouter();
  const trackDataContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    title: docData?.name || '',
    userName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    agreeTerms: false,
    category: '', 
    signed: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPledgeTaken, setIsPledgeTaken] = useState(false);
  

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update formData with user's name and email
      setFormData(prevData => ({
        ...prevData,
        userName: user.displayName || '',
        email: user.email || ''
      }));
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Update formData with user's name and email
        setFormData(prevData => ({
          ...prevData,
          userName: currentUser.displayName || '',
          email: currentUser.email || ''
        }));
      }
    });
  
    return () => unsubscribe();
  }, []);

  

  const areFieldsFilled = () => {
    return (
      // formData.street.trim() &&
      // formData.phone.trim() &&
      formData.userName.trim() &&
      formData.email.trim() &&
      // formData.city.trim() &&
      // formData.state.trim() &&
      // formData.postalCode.trim() &&
      formData.agreeTerms
      // formData.country.trim()
    );
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  
  const handlePledgeSubmit = async (pledgeData) => {
    try {
      // Update form data
      const updatedFormData = { ...formData, ...pledgeData };
      setFormData(updatedFormData);
      setIsPledgeTaken(true);
      setShowPledgeForm(false);
      setShowBuyNow(true);
      setIsProcessing(true);
  
      // Get current date and time
      const now = new Date();
      const dateTime = now.toISOString();
  
      // Prepare data for Firestore
      const crateData = {
        ...updatedFormData,
        ...docData,
        docId,
        paymentStatus: "initiated",
        dateTime,
        createdAt: serverTimestamp()
      };
  
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'crates'), crateData);
      // console.log("Document written with ID: ", docRef.id);
  
      // Call pledge email API
      const emailResponse = await fetch('/api/send-pledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedFormData.userName,
          category: updatedFormData.category,
          shortenedLink: docData.shortenedLink, 
          email: updatedFormData.email
        }),
      });
  
      if (!emailResponse.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Call create-checkout-session API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedFormData.userName,
          email: updatedFormData.email,
          signed: updatedFormData.signed,
          docId: docId,
          crateId: docRef.id  
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
  
    } catch (error) {
      console.error("Error in handlePledgeSubmit:", error);
      setIsProcessing(false);
      // Handle error (e.g., show error message to user)
    }
  };
  

  const resizePlayer = () => {
    if (playerRef.current) {
      const playerElement = document.getElementById('player');
      const width = playerElement?.clientWidth;
      const height = width * (9 / 16); // 16:9 aspect ratio
      playerRef?.current.setSize(width, height);
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

  const handleBuyNowClick = async () => {
    if (user) {
      // console.log("user logged in")
      setShowBuyNow(!showBuyNow);
    } else {
      // console.log("user not logged in")
      await handleLogin();
      // After successful login, show the Buy Now component
      if (auth.currentUser) {
        setShowBuyNow(true);
      }
    }
  }

  // console.log(formData);

  const handlePledgeFormClick = () => {
    if (!isPledgeTaken) {
      setShowPledgeForm(!showPledgeForm);
    }
    
  };

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

  if (!docData) {
    return <div>Loading...</div>;
  }

  

  const { name, tracks, date, imageUrl, backgroundImage, userEmail, shortenedLink} = docData;
  const description = `Check out ${name}'s Mixtape featuring some amazing tracks. Enjoy the music and feel the vibe!`;


  return (
    <>

    {showPledgeForm ? (
      <PledgeForm 
        formData={formData}
        handleFormChange={handleFormChange}
        handlePledgeSubmit={handlePledgeSubmit}
        handleBack={() => setShowPledgeForm(false)}
      />
      ) : (
      <>
      <div className='bg-black text-white w-full min-h-screen flex flex-col justify-center items-center'>
        <Head>
          <title>{`${name}'s Mixtape`}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={`${name}'s Mixtape`} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={backgroundImage} />
          <meta property="og:type" content="music.playlist" />
          <link rel="icon" href={backgroundImage} />
        </Head>

        <header className="fixed md:top-[-30px] top-[-25px] md:left-[-30px] w-1/3 left-[-10px] right-0 z-50 flex items-center justify-between py-2 px-4 sm:px-6 lg:px-8 ">
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

        <div className='py-14 px-2 bg-black text-white md:w-2/3 min-h-screen flex flex-col justify-center relative items-center'>
          <button onClick={handleBuyNowClick} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-2xl text-lg md:px-6 px-4 md:py-3 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-3 items-center cursor-pointer">
            <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
            <FaShoppingCart className='md:text-3xl text-xl' /> Buy Your Miny
          </button>

          <SocialShareButtons 
            shareUrl={shortenedLink || `https://minyfy.subwaymusician.xyz${router.asPath}`}
            title="Check out my Latest Mixtape on Miny Vinyl"
          />

          <div id="player" className='w-full max-w-4xl mx-auto aspect-video mb-6 mt-2 shadow shadow-neutral-600'>
            {!isYouTubeApiReady && <div>Loading player...</div>}
          </div>

          
          
          <div ref={trackDataContainerRef} className='overflow-y-auto w-full md:w-[60%] shadow shadow-neutral-600'>
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
                      className={`cursor-pointer ${currentTrackIndex === index ? 'font-bold text-[#f48531]' : ''}`}
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
          <div className='flex items-center gap-2 mt-3 mb-3'>
            <button onClick={handleDownloadImage} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-lg text-sm md:px-2 px-2 md:py-2 font-jakarta py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-1 items-center cursor-pointer">
              <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
              <MdFileDownload className='md:text-2xl text-base' /> Download Image
            </button>
            
            
          </div>

        </div>
      </div>
      {showBuyNow && (
        <BuyNow 
          handleClose={handleBuyNowClick} 
          formData={formData}
          handleFormChange={handleFormChange}
          isPledgeTaken={isPledgeTaken}
          handlePledgeFormClick={handlePledgeFormClick}
          backgroundImage={backgroundImage}
          shortenedLink={shortenedLink}
          isProcessing={isProcessing}
        />
      )}
      </>
    ) }
    </>
  );
};

export default PlaylistPage;
