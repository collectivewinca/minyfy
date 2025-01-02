import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NextSeo } from 'next-seo';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { FaRegHeart, FaHeart, FaArrowUp, FaPlus } from "react-icons/fa6"; // Import FaPlus
import { MdModeEdit, MdRocketLaunch, MdLock  } from "react-icons/md";
import Header from '@/components/Header';
import Player from '@vimeo/player';
import MakeAMinyImages from "@/utils/MakeAMinyImages";
import mixtapeNames from '@/utils/MixtapeNames';
import { supabase } from '@/supabase/config';

const ExclusiveMixtape = () => {
  // State management
  const [inputValue, setInputValue] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(MakeAMinyImages[1]);
  const [tracks, setTracks] = useState([]);
  const [isFavorite, setIsFavorite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [docId, setDocId] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState(MakeAMinyImages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vimeoLinks, setVimeoLinks] = useState([{ url: '' }]);
  const [unlockPassword, setUnlockPassword] = useState('minylock');
  const [exclusives, setExclusives] = useState([]);

  useEffect(() => {
    const fetchExclusives = async () => {
      try {
        const { data: exclusives, error } = await supabase
          .from('exclusives')
          .select('*')
          .order('createdat', { ascending: false });

        if (error) throw error;
        setExclusives(exclusives);
      } catch (error) {
        console.error('Error fetching exclusives:', error);
        setExclusives([]);
      }
    };

    fetchExclusives();
  }, []);

  const handleVimeoLinkChange = (index, value) => {
    const updatedLinks = [...vimeoLinks];
    updatedLinks[index].url = value;
    setVimeoLinks(updatedLinks);
  };

  const addVimeoLinkInput = () => {
    setVimeoLinks([...vimeoLinks, { url: '' }]);
  };

  const handleVimeoLinksAdd = async (event) => {
    event.preventDefault();

    const validLinks = vimeoLinks.filter(link => link.url.trim() !== ''); // Filter out empty links

    for (const link of validLinks) {
      const vimeoUrl = link.url.trim();
      const videoId = vimeoUrl.split('/').pop();
      try {
        const response = await axios.get(`https://api.vimeo.com/videos/${videoId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN}`,
          },
        });

        setUploadedVideos(prev => [...prev, {
          id: videoId,
          url: vimeoUrl,
          title: response.data.name,
          processed: true
        }]);

        setTracks(prev => [...prev, response.data.name]);
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    }

    setVimeoLinks([{url: ''}]); // Reset the input fields after processing
  };

  const trackDataContainerRef = useRef(null);
  const router = useRouter();

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Initialize inputValue to a random name from the mixtapeNames list
    const getRandomName = () => {
      const randomIndex = Math.floor(Math.random() * mixtapeNames.length);
      return mixtapeNames[randomIndex];
    };

    setInputValue(getRandomName());
  }, []);

  // Handle login
  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  const topValue = 42 - inputValue.length * 0.45;

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setIsProcessing(true);

    for (const file of files) {
      try {
        const response = await axios.post(
          'https://api.vimeo.com/me/videos',
          {
            name: file.name,
            upload: {
              approach: 'tus',
              size: file.size,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const uploadLink = response.data.upload.upload_link;
        const videoId = response.data.uri.split('/').pop();

        await axios({
          method: 'PATCH',
          url: uploadLink,
          data: file,
          headers: {
            'Content-Type': 'application/offset+octet-stream',
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': 0,
          },
        });

        setUploadedVideos(prev => [...prev, {
          id: videoId,
          url: response.data.link,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          processed: false
        }]);

        setTracks(prev => [...prev, file.name.replace(/\.[^/.]+$/, "")]);
      } catch (error) {
        console.error('Error uploading video:', error);
      }
    }
    setIsProcessing(false);
  };

  const uploadImageFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setLoading(true);
    try {
      // Convert the image file to a canvas and then to WebP format
      const imageUrl = await convertImageToWebpAndUpload(file);
      setBackgroundImage(imageUrl);
      setImages(prev => [imageUrl, ...prev]);
    } catch (error) {
      console.error('Error uploading background image:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to convert image to webp format and upload to Firebase
  const convertImageToWebpAndUpload = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          // Create canvas and draw the image on it
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          // Convert canvas to WebP Blob
          canvas.toBlob(async (blob) => {
            try {
              // Upload the Blob to Firebase Storage
              const random = Math.floor(Math.random() * 1000000);
              const webpImageRef = ref(storage, `exclusive-bgs/bg-${random}.webp`);
              await uploadBytes(webpImageRef, blob);

              // Get the download URL
              const downloadUrl = await getDownloadURL(webpImageRef);
              resolve(downloadUrl);
            } catch (error) {
              reject(error);
            }
          }, 'image/webp', 0.8); // Quality set to 80%
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Handle direct Vimeo link input
  const handleVimeoLinkAdd = async (event) => {
    event.preventDefault();
    const vimeoUrl = event.target.vimeoLink.value;
    const videoId = vimeoUrl.split('/').pop();
    
    try {
      const response = await axios.get(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN}`,
        },
      });

      setUploadedVideos(prev => [...prev, {
        id: videoId,
        url: vimeoUrl,
        title: response.data.name,
        processed: true
      }]);

      setTracks(prev => [...prev, response.data.name]);
      event.target.reset();
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  };

  // Check video processing status
  const checkVideoProcessingStatus = async (videoId) => {
    try {
      const response = await axios.get(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN}`,
        },
      });

      const status = response.data.transcode.status;
      setUploadedVideos(prev => 
        prev.map(video => 
          video.id === videoId ? { ...video, processed: status === 'complete' } : video
        )
      );
    } catch (error) {
      console.error('Error checking video status:', error);
    }
  };

  // Refresh processing status
  const refreshProcessingStatus = () => {
    uploadedVideos.forEach(video => {
      if (!video.processed) {
        checkVideoProcessingStatus(video.id);
      }
    });
  };

  // Create mixtape image
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

        // Convert the hexagon-clipped canvas to WebP format using Canvas API
        const webpDataUrl = hexCanvas.toDataURL("image/webp", 0.8); // Quality is set to 80% (0.8)

        // Convert the WebP Data URL to Blob
        const webpBlob = await (await fetch(webpDataUrl)).blob();

        const random = Math.floor(Math.random() * 1000000);

        // Create references for both WebP and PNG uploads
        const webpImageRef = ref(storage, `exclusives/exclusive-miny-${random}.webp`);

        // Upload the WebP blob to Firebase Storage
        await uploadBytes(webpImageRef, webpBlob);

        // Get download URLs for both formats
        const webpImageUrl = await getDownloadURL(webpImageRef);

        // Return both URLs (or choose how to handle them)
        return { webpImageUrl };
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Image upload failed");
    }
  };

  // Save mixtape
  const saveMixtape = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    setLoading(true);
    try {
      const { webpImageUrl } = await uploadImage();

      // Updated field names to match the schema
      const mixtapeData = {
        name: inputValue.toLowerCase(),
        imageurl: webpImageUrl,
        backgroundimage: backgroundImage,
        date: new Date().toLocaleDateString(),
        createdat: new Date().toISOString(),
        userdisplayname: user.user_metadata.full_name,
        useremail: user.email,
        votecount: 0,
        commentcount: 0,
        isfavorite: isFavorite,
        unlockpassword: unlockPassword,
        shortenedlink: null,
        tracks: uploadedVideos || [],
        comments: []
      };

      const { data: newMixtape, error } = await supabase
        .from('exclusives')
        .insert([mixtapeData])
        .select()
        .single();

      if (error) throw error;

      setDocId(newMixtape.id);
      setShowUrlInput(true);
    } catch (error) {
      console.error('Error saving mixtape:', error);
      alert('Error saving mixtape. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create short URL
  const createShortUrl = async () => {
    const trimmedCustomUrl = customUrl.trim();
  
    // Validate custom URL if provided
    if (trimmedCustomUrl && !isValidUrl(trimmedCustomUrl)) {
      setErrorMessage("Invalid URL. Only alphanumeric characters and dashes are allowed.");
      return;
    }
  
    try {
      // Send POST request to create short URL
      const response = await fetch('/api/shorten-ex-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId, customUrl: trimmedCustomUrl }),
      });
  
      const json = await response.json();
  
      if (response.status === 409) {
        setErrorMessage("Link already exists. Please choose a different custom URL.");
        return;
      } else if (!response.ok) {
        setErrorMessage("Error creating short URL. Please try again.");
        console.error('Error creating short URL:', json.message);
        return;
      }
  
      // Update Supabase document with the shortened link using correct field name
      const { error } = await supabase
        .from('exclusives')
        .update({ shortenedlink: `https://exclusive.minyvinyl.com/${json.link.slug}` })
        .eq('id', docId);

      if (error) throw error;
  
      // Redirect to the shortened URL
      window.location.href = json.link.url;
    } catch (err) {
      console.error('Error creating short URL:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error.message);
        return;
      }
      setUser(session?.user || null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    checkUser();
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <>
      <NextSeo
        title="Create Exclusive Mixtape | Miny Vinyl"
        description="Create your exclusive mixtape with custom videos on Miny Vinyl"
      />
      <Header />
      
      <div className="container flex flex-col font-jakarta justify-center items-center gap-3 px-4 py-8">
          {tracks.length > 0 && (
             <div className="md:w-[35%]">
              <div ref={trackDataContainerRef} className="mb-6">
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
                                <strong className='text-[#f48531] ml-1 uppercase'>{inputValue}</strong>
                              </div>
                            </div>
                    {/* Bottom-left text */}
                    <div className="absolute z-10 left-[7%] bottom-[23%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                      <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
                    </div>

                </div>
              </div>
             </div>
          )}
        <div className="max-w-4xl mx-auto">

          <div className="flex justify-center gap-4">
          <div className="mb-6 w-full">
            <label className="block text-base font-medium mb-2">Mixtape Name</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              placeholder="Enter mixtape name..."
            />
            
          </div>
          <div className="mb-6 w-full">
            <label className="text-base font-medium mb-2 flex items-center">
              Unlock Password
            </label>
            <input
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              placeholder="Set a password to protect your mixtape..."
            />
          </div>
          </div>

          


          {/* Background Selection */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Select Background</label>
            <div className="grid grid-cols-3 gap-4">
            <div className="card" >
            {loading ? (
                <>
                  <h2>
                  <div className="flex justify-center items-center mb-2">
                  <div className="relative">
                      <div className="h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-gray-400"></div>
                      <div className="absolute top-0 left-0 h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-[white] animate-spin">
                      </div>
                  </div>
                  </div>
                  </h2>
                  <h2 className='text-xs md:text-sm font-jakarta'>Uploading...</h2>
                </>
                
              ) : (
                <>
                  <h2 className=' px-3 font-jakarta text-center text-xs md:text-lg text-white'>Upload Image File
                  <input
                      id="backgroundUpload"
                      type="file"
                      accept="image/*"
                      onChange={uploadImageFile}
                      className="w-full text-xs px-4 py-2 border border-gray-500 rounded-lg"
                    />
                  </h2>
                </>
              )}
            </div>
            {images.slice(0,5).map((image, index) => (
              <img
                key={index}
                className={`cursor-pointer w-full rounded-xl ${backgroundImage === image ? 'border-2 border-black p-1' : 'border-[2.8px] border-transparent'}`}
                src={image}
                alt={`Background ${index + 1}`}
                onClick={() => setBackgroundImage(image)}
              />
            ))}
            </div>
          </div>

          {/* Video Upload */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Upload Videos</label>
            <label className="block text-lg font-medium mb-2">Click Plus(+) to upload multiple video links at once</label>
            {/* <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileUpload}
              className="w-full"
            /> */}
          </div>

          {/* Direct Vimeo Link */}
          <div className="mb-6">
        <form onSubmit={handleVimeoLinksAdd} className="flex flex-col gap-2">
          {vimeoLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.url}
                onChange={(e) => handleVimeoLinkChange(index, e.target.value)}
                placeholder="Enter Vimeo link..."
                className="flex-1 px-4 py-2 rounded-lg border"
              />
              {index === vimeoLinks.length - 1 && (
                <button
                  type="button"
                  onClick={addVimeoLinkInput}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  <FaPlus /> {/* Plus icon */}
                </button>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2"
          >
            Process Links
          </button>
        </form>
      </div>


          {/* Uploaded Videos List */}
          {uploadedVideos.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Uploaded Videos</h3>
                <button
                  onClick={refreshProcessingStatus}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Refresh Status
                </button>
              </div>
              <div className="space-y-2">
                {uploadedVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{video.title}</span>
                    <span className={`text-sm ${video.processed ? 'text-green-500' : 'text-yellow-500'}`}>
                      {video.processed ? 'Processed' : 'Processing...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mixtape Preview */}
          

          {/* Create Button */}
          <div className="flex justify-center">
            <button
              onClick={saveMixtape}
              disabled={loading || isProcessing || uploadedVideos.some(v => !v.processed)}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                loading || isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              <MdRocketLaunch />
              {loading ? 'Creating...' : 'Create Mixtape'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 text-red-500 text-center">
              {errorMessage}
            </div>
          )}

          {/* Custom URL Modal */}
          {showUrlInput && (
            <div className="fixed inset-0 flex z-50 items-center justify-center font-jakarta bg-black bg-opacity-50">
              <div className="bg-white mx-3 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center">🥳 Your Playlist Created Successfully 🥳</h2>
                <h2 className="text-lg font-bold mb-4 text-center">Customize Brand URL</h2>
                <div className="text-base">
                  <div className="flex items-center border rounded-md">
                    <span className="bg-neutral-300 px-2 text-lg py-2 rounded-l-md"><MdModeEdit /></span>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="px-2 py-1 flex-grow"
                      placeholder="(Optional)"
                    />
                  </div>
                </div>
                <div className="text-xs mt-1 mb-4">
                  <p className="font-bold">
                    https://exclusive.minyvinyl.com/{customUrl.trim() || '*random*'}
                  </p>
                </div>
                {errorMessage && (
                  <div className="text-red-500 text-sm mb-4">
                    {errorMessage}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={createShortUrl}
                    className="bg-gray-700 text-white shadow-custom px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Let&rsquo;s Go!
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
      <div className="container mx-auto px-4 py-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">All Exclusives</h2>
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Name</th>
              <th className="border border-gray-400 px-4 py-2">Date</th>
              <th className="border border-gray-400 px-4 py-2">User</th>
              <th className="border border-gray-400 px-4 py-2">Link</th>
              <th className="border border-gray-400 px-4 py-2">Image</th>
              <th className="border border-gray-400 px-4 py-2">Unlock Password </th>

            </tr>
          </thead>
          <tbody>
            {exclusives.map((exclusive) => (
              <tr key={exclusive.id}>
                <td className="border border-gray-400 px-4 py-2 uppercase">{exclusive.name}</td>
                <td className="border border-gray-400 px-4 py-2">{exclusive.date}</td>
                <td className="border border-gray-400 px-4 py-2">{exclusive.userdisplayname}</td>
                <td className="border border-gray-400 text-blue-600 hover:underline px-4 py-2">
                  <a href={exclusive.shortenedlink || `exclusives/${exclusive.id}`} target="_blank" rel="noopener noreferrer">
                    {exclusive.shortenedlink || "View"}
                  </a>
                </td> {/* Display link */}
                <td className="border border-gray-400 px-4 text-blue-600 hover:underline py-2">
                  <a href={exclusive.imageurl} target="_blank" rel="noopener noreferrer">
                    view
                  </a>
                </td>
                <td className="border border-gray-400 px-4 py-2">{exclusive.unlockpassword || 'None'}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ExclusiveMixtape;