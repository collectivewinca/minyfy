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
import { toBlob, toCanvas } from 'html-to-image';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { PinterestShareButton, PinterestIcon } from 'react-share';
import CommentSection from '@/components/CommentSection';
import TrackList from '@/utils/TrackList';
import PWAShare from '@/components/PWAshare';


export async function getServerSideProps(context) {
  const { id } = context.params;
  let docData = null;
  let docId = null;
  let initialComments = [];

  try {
    // Fetch the main document
    const docRef = doc(db, 'mixtapes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { createdAt, comments: commentsData = [], ...rest } = docSnap.data(); // Destructure to exclude createdAt and get comments
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
  const [comments, setComments] = useState(initialComments);
  const [currentTrackName, setCurrentTrackName] = useState(docData?.tracks[0]?.track || ''); // New state for track name
  const playerRef = useRef(null);
  const router = useRouter();
  const trackDataContainerRef = useRef(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
  
      // Ensure user is not null before accessing its properties
      if (user) {
        setFormData(prevData => ({
          ...prevData,
          userName: user.displayName || '',
          email: user.email || ''
        }));
        setDisplayName(user.displayName || '');
        setAvatarUrl(user.photoURL || '');
      }
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
        setDisplayName(currentUser.displayName || '');
        setAvatarUrl(currentUser.photoURL || '');
      }
    });
  
    return () => unsubscribe();
  }, []); // Ensure the dependencies are correct here
  
  console.log(comments);
  

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
    setCurrentTrackName(docData.tracks[index]?.track || ''); // Update current track name
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
      const compressedDataUrl = compressCanvas(canvas, 0.7); // 0.7 is the quality level (0-1)
      
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

  

  const { name, tracks, date, imageUrl, backgroundImage, userEmail, shortenedLink} = docData;
  const description = `Check out ${name}'s Mixtape featuring some amazing tracks. Enjoy the music and feel the vibe!`;
  const topValue = 42 - name.length * 0.4;


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
            <FaShoppingCart className='md:text-3xl text-xl' /> Buy Your MINY
          </button>

          

          <SocialShareButtons 
            shareUrl={shortenedLink || `https://minyfy.subwaymusician.xyz${router.asPath}`}
            title="Check out my Latest Mixtape on Miny Vinyl"
          />

          <div id="player" className='w-full max-w-4xl mx-auto aspect-video mb-6 mt-2 shadow shadow-neutral-600'>
            {!isYouTubeApiReady && <div>Loading player...</div>}
          </div> 

          <div className="relative w-full  md:px-0  md:w-[60%]">
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
              <img  className="w-full h-full object-cover" src={backgroundImage} alt="Background"  />
              <div className="absolute z-10 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2">
                <div className="flex flex-col md:gap-[6px] gap-[3.5px] items-end text-[2.1vw] md:text-[1vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
                {tracks.map((track, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer ${currentTrackIndex === index ? 'font-bold text-[#f48531]' : ''}`}
                          onClick={() => handleTrackClick(index)}
                        >
                          {toSentenceCase(track.track.length > 33 ? `${track.track.slice(0, 33)}..` : track.track)}
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
          </div>
          
          
          
          <div className='flex items-center gap-2 mt-3 mb-3'>
            <button onClick={handleDownloadImage} className="bg-lime-950 relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-lg text-sm md:px-2 px-2 md:py-2 font-jakarta py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-1 items-center cursor-pointer">
              <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
              <MdFileDownload className='md:text-2xl text-base' /> Download Image
            </button>
            {/* <PinterestShareButton
              url={shortenedLink || `https://minyfy.subwaymusician.xyz${router.asPath}`}
              media={imageUrl}
              description="Check out my Latest Mixtape on Miny Vinyl"
            >
              <PinterestIcon size={32} round />
            </PinterestShareButton> */}
            <PWAShare 
              title="Check out my Latest Mixtape on Miny Vinyl"
              text={`Check out ${name}'s Mixtape featuring some amazing tracks. Enjoy the music and feel the vibe!`}
              url={shortenedLink || `https://minyfy.subwaymusician.xyz${router.asPath}`}
              imageUrl={imageUrl}
            />

            
            
          </div>

          <div>
          <CommentSection comments={comments} displayName={displayName} avatarUrl={avatarUrl} handleLogin={handleLogin} currentTrackName={currentTrackName} setComments={setComments} docId={docId}  />
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
