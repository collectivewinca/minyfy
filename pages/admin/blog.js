import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { storage, db } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, query, orderBy, limit } from "firebase/firestore";

function Blog() {
  const [title, setTitle] = useState('50 Essential 21st-Century Arabic Pop Songs: A Celebration of Global Influence and Evolution');
  const [description, setDescription] = useState('From the shores of the Mediterranean to the Arabian Gulf and beyond, Arabic pop music has captivated hearts and moved bodies for decades. This collection of 50 essential tracks showcases the genre\'s incredible evolution and global impact in the 21st century.');
  const [backgroundImage, setBackgroundImage] = useState('https://miny.subwaymusician.xyz/images/arabbg.jpg');
  const [playlists, setPlaylists] = useState([
    {
      imageUrl: 'https://miny.subwaymusician.xyz/images/pop.jpg',
      link: 'https://go.minyvinyl.com/arabpop',
      heading: '✨ Arab Pop Essentials ✨',
      subheading: 'From chart-toppers to viral sensations, this collection features a mix of essential tracks that define 21st-century Arabic pop. Get ready to discover a diverse range of styles and artists that represent the evolution and global influence of this vibrant genre.'
    }
  ]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [featuredTitle, setFeaturedTitle] = useState('Featured Playlists');

  // Meta information state
  const [metaTitle, setMetaTitle] = useState('Top Arabic Pop Playlists by MINY - Create your own MINY Mixtape');
  const [metaDescription, setMetaDescription] = useState('Explore the vibrant world of Arabic Pop with MINY\'s Top Playlists! From Heartbreak anthems to global dance hits and legendary classics, discover the best of Arabic music. Create your own MINY Mixtape!');
  const [metaKeywords, setMetaKeywords] = useState(' Playlists, Music, MINY, Music Playlists, Create a Mixtape');
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [recentMixtapes, setRecentMixtapes] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadMessage, setUploadMessage] = useState(null);
  const [buyNowTitle, setbuyNowTitle] = useState('💀 MINY buyNow Collection');
  const [buyNowPrice, setbuyNowPrice] = useState('All Mixtapes for $99 USD');
  const [buyNowDescription, setbuyNowDescription] = useState('Take your Halloween experience to the next level by getting the entire MINY Halloween collection! For just $99 USD, you\'ll gain access to all 10 expertly curated mixtapes, perfect for every spooky occasion.');
  const [buyNowButtonLink, setbuyNowButtonLink] = useState('https://buy.stripe.com/8wM7td96D2YZ5So4gi');



  const handlebuyNowTitleChange = (event) => {
    setbuyNowTitle(event.target.value);
  };

  const handlebuyNowPriceChange = (event) => {
    setbuyNowPrice(event.target.value);
  };

  const handlebuyNowDescriptionChange = (event) => {
    setbuyNowDescription(event.target.value);
  };

  const handlebuyNowButtonLinkChange = (event) => {
    setbuyNowButtonLink(event.target.value);
  };

  const handleUploadButtonClick = () => {
    setShowUploadModal(true);
  };

  const handleUploadFileNameChange = (event) => {
    setUploadFileName(event.target.value);
  };

  const handleUpload = async () => {
    try {
      // Basic validation: Check if filename is provided and ends with .html
      if (!uploadFileName) {
        setUploadMessage({ type: 'error', text: 'Please enter a valid name' });
        return; 
      }

      // Get the HTML content (you'll likely fetch this dynamically)
      const htmlContent = previewHtml; // Assuming previewHtml holds your HTML content

      // Create a Blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });

      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `blogs/${uploadFileName.replace(/\s+/g, '-')}.html`);

      // Upload the file
      await uploadBytes(storageRef, blob);

      setUploadMessage({ type: 'success', text: uploadFileName });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage({ type: 'error', text: 'An error occurred during upload.' });
    }
  };

  useEffect(() => {
    const fetchRecentMixtapes = async () => {
      try {
        const mixtapesRef = collection(db, 'mixtapes');
        const q = query(mixtapesRef, orderBy('createdAt', 'desc'), limit(70));
        const querySnapshot = await getDocs(q);

        const mixtapesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecentMixtapes(mixtapesData);
      } catch (error) {
        console.error("Error fetching mixtapes: ", error);
      }
    };

    fetchRecentMixtapes();
  }, []);

  useEffect(() => {
    // Update preview HTML whenever playlists or other data changes
    const generatePreviewHtml = () => {
      // ... [Your HTML generation logic] 
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="" />
        <link
          rel="stylesheet"
          as="style"
          onload="this.rel='stylesheet'"
          href="https://fonts.googleapis.com/css2?display=swap&family=Be+Vietnam+Pro%3Awght%40400%3B500%3B700%3B900&family=Noto+Sans%3Awght%40400%3B500%3B700%3B900"
        />
        <title>${metaTitle}</title>
        <meta name="description" content="${metaDescription}" />
        <meta name="keywords" content="${metaKeywords}" />
        <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />

        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <style>
          .hexagon-container {
            overflow: hidden;
            aspect-ratio: cos(30deg);
            clip-path: polygon(-50% 50%,50% 100%,150% 50%,50% 0);
          }
          .hexagon-image {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Or object-fit: contain; */
            transition: transform 0.3s ease; /* Smooth transition on hover */
          }
          .hexagon-image:hover {
            transform: scale(1.1); /* Zoom in effect on hover */
          }
        </style>
      </head>
      <body>
        <div
          class="relative flex size-full min-h-screen flex-col bg-[#111118] dark group/design-root overflow-x-hidden"
          style="font-family: 'Be Vietnam Pro', 'Noto Sans', sans-serif"
        >
          <div class="layout-container flex h-full grow flex-col">
            <header
              class="flex flex-col md:flex-row items-center justify-between whitespace-nowrap border-b border-solid border-b-[#292938] px-5 md:px-10 py-3"
            >
              <div
                class="flex items-center justify-between w-full md:w-auto gap-8 mb-3 md:mb-0"
              >
                <div class="flex items-center gap-2 text-white">
                  
                  
                    <a
                      class=""
                      href="https://minyvinyl.com/"
                      >
                      <div class="size-12 mr-3">
                            <img src="https://minyfy.subwaymusician.xyz/Minylogo.png" alt="Miny Vinyl Logo" className=" h-12" />
                        </div>
                      </a>
                </div>
                <label class="flex flex-col min-w-40 !h-10 max-w-64 md:hidden">
                  <div class="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div
                      class="text-[#9d9db8] flex border-none bg-[#292938] items-center justify-center pl-4 rounded-l-xl border-r-0"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        </path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#292938] focus:border-none h-full placeholder:text-[#9d9db8] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      value=""
                    />
                  </div>
                </label>
              </div>
              <div class="flex flex-col md:flex-row flex-1 justify-between gap-8">
                <div
                  class="flex items-center gap-4 md:gap-9 flex-wrap justify-center md:justify-start"
                >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://go.minyvinyl.com/prezmix"
                    >Prez Mix</a
                  >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://go.minyvinyl.com/genrex"
                    >New Genres</a
                  >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://minyfy.subwaymusician.xyz/makeaminy"
                    >Create a Mixtape</a
                  >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://www.instagram.com/minyvinyl/"
                    >Instagram</a
                  >
                </div>
                <label class="flex flex-col min-w-40 !h-10 max-w-64 hidden md:flex">
                  <div class="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div
                      class="text-[#9d9db8] flex border-none bg-[#292938] items-center justify-center pl-4 rounded-l-xl border-r-0"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#292938] focus:border-none h-full placeholder:text-[#9d9db8] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      value=""
                    />
                  </div>
                </label>
              </div>
            </header>
            <div class=" px-2 md:px-40 flex flex-col justify-center pb-5">
              <div
                class="layout-content-container flex flex-col md:max-w-[960px] w-full flex-1"
              >
                <div class="@container">
                  <div
                    class="flex flex-col gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row"
                  >
                    <div
                      class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl @[480px]:h-auto @[480px]:min-w-[400px] @[864px]:w-full"
                      style="
                        background-image: url('${backgroundImage}');
                      "
                    ></div>
                    <div
                      class="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center"
                    >
                      <div class="flex flex-col gap-4 justify-center items-center">
                        <h1
                          class="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                        >
                          ${title}
                        </h1>
                        <h2
                          class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                        >
                          ${description}
                        </h2>
                        <div class="flex justify-center items-center w-full">
                          <a
                          href="https://minyfy.subwaymusician.xyz/makeaminy"
                          class="bg-[#1919e6] text-white px-4 py-3 rounded-full text-lg font-bold text-center hero-button"
                          >Create a MINY mixtape</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2
                  class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
                >
                  ${featuredTitle}
                </h2>
                <div
                  class="grid grid-cols-1 md:grid-cols-4 gap-3 p-4"
                >
                ${playlists.map((playlist, index) => `
                  <div class="flex flex-col gap-3 pb-3">
                    <a href="${playlist.link}" class="relative">
                      <div class="hexagon-container relative">
                        <img
                          src="${playlist.imageUrl}"
                          alt="${playlist.heading}"
                          class="hexagon-image"
                        />
                        <div
                          class="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300"
                        >
                          <div class="flex gap-2">
                            <button
                              class="bg-[#1919e6] text-white px-3 py-2 rounded-full text-sm font-bold"
                            >
                              View Mixtape
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="text-white text-base font-medium leading-normal">
                        <h2 class="text-base mt-1 font-semibold text-center mb-2">${playlist.heading}</h2>
                        <p class="text-sm text-center">${playlist.subheading}</p>
                      </div>
                    </a>
                  </div>
                `).join('')}
                </div>
              </div>
              <div class="flex flex-col justify-center items-center gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row">
                <div class="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center">
                  <div class="flex flex-col gap-2 justify-center text-center">
                    <h1
                      class="text-white text-center text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                    >
                      ${buyNowTitle}
                    </h1>
                    <h2
                      class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                    >
                      All Mixtapes for $${buyNowPrice}
                    </h2>
                    <p
                      class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                    >
                      ${buyNowDescription}
                    </p>
              
                    <!-- Centering the button -->
                    <div class="flex justify-center mt-2">
                      <a
                        href="${buyNowButtonLink}"
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#193be6] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                      >
                        <span class="truncate">Buy your Collection Now</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="container">
                <p class="text-sm text-center text-gray-500 mt-4">
                  Disclaimer: MINY is not affiliated with, endorsed by, or sponsored
                  by ACL Festival or any of the artists or brands mentioned. We do
                  not own or claim to own any rights to the music, logos, or other
                  content shared on this page. This is a fan-created project
                  intended for entertainment purposes only. No copyright
                  infringement is intended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
      return htmlContent;
    };

    setPreviewHtml(generatePreviewHtml());
  }, [
    playlists, 
    title, 
    description, 
    backgroundImage, 
    metaTitle, 
    metaDescription, 
    metaKeywords, 
    featuredTitle, // Add featuredTitle here
    buyNowTitle,
    buyNowPrice,
    buyNowDescription,
    buyNowButtonLink
]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleFeaturedTileChange = (event) => {
    setFeaturedTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleBackgroundImageUpload = async (event) => {
    const file = event.target.files[0];
    const storageRef = ref(storage, `blog-images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    setBackgroundImage(downloadURL);
  };

  const handlePlaylistImageUpload = async (index, event) => {
    const file = event.target.files[0];
    const storageRef = ref(storage, `playlist-images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists[index].imageUrl = downloadURL;
      return updatedPlaylists;
    });
  };

  const handlePlaylistLinkChange = (index, event) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists[index].link = event.target.value;
      return updatedPlaylists;
    });
  };

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  const handlePlaylistHeadingChange = (index, event) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists[index].heading = event.target.value;
      return updatedPlaylists;
    });
  };

  const handlePlaylistSubheadingChange = (index, event) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists[index].subheading = event.target.value;
      return updatedPlaylists;
    });
  };

  const handleAddPlaylist = () => {
    setShowPlaylistSelector(true);
  };

  const handleSelectPlaylist = (selectedMixtape) => {
    const emoji = ["✨", "❤️", "🔥", "🎤", "☀️", "🤩"];

    // Combine track strings from selectedMixtape
    const combined_tracks = selectedMixtape.tracks.map(track => track.track).join(' • ');

    // Get a random emoji
    const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];

    // Update playlists state
    setPlaylists(prevPlaylists => [
        ...prevPlaylists, 
        {
            imageUrl: selectedMixtape.backgroundImage,
            link: selectedMixtape.shortenedLink,
            heading: `${randomEmoji} ${toSentenceCase(selectedMixtape.name)} ${randomEmoji}`, // Use the same random emoji
            subheading: combined_tracks // You can adjust this if needed
        }
    ]);

    // Hide playlist selector
    setShowPlaylistSelector(false);
};



  const handleDeletePlaylist = (index) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists.splice(index, 1);
      return updatedPlaylists;
    });
  };

  // Handlers for meta information
  const handleMetaTitleChange = (event) => {
    setMetaTitle(event.target.value);
  };

  const handleMetaDescriptionChange = (event) => {
    setMetaDescription(event.target.value);
  };

  const handleMetaKeywordsChange = (event) => {
    setMetaKeywords(event.target.value);
  };

  const downloadHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="" />
        <link
          rel="stylesheet"
          as="style"
          onload="this.rel='stylesheet'"
          href="https://fonts.googleapis.com/css2?display=swap&family=Be+Vietnam+Pro%3Awght%40400%3B500%3B700%3B900&family=Noto+Sans%3Awght%40400%3B500%3B700%3B900"
        />
        <title>${metaTitle}</title>
        <meta name="description" content="${metaDescription}" />
        <meta name="keywords" content="${metaKeywords}" />
        <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />

        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <style>
          .hexagon-container {
            overflow: hidden;
            aspect-ratio: cos(30deg);
            clip-path: polygon(-50% 50%,50% 100%,150% 50%,50% 0);
          }
          .hexagon-image {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Or object-fit: contain; */
            transition: transform 0.3s ease; /* Smooth transition on hover */
          }
          .hexagon-image:hover {
            transform: scale(1.1); /* Zoom in effect on hover */
          }
        </style>
      </head>
      <body>
        <div
          class="relative flex size-full min-h-screen flex-col bg-[#111118] dark group/design-root overflow-x-hidden"
          style="font-family: 'Be Vietnam Pro', 'Noto Sans', sans-serif"
        >
          <div class="layout-container flex h-full grow flex-col">
            <header
              class="flex flex-col md:flex-row items-center justify-between whitespace-nowrap border-b border-solid border-b-[#292938] px-5 md:px-10 py-3"
            >
              <div
                class="flex items-center justify-between w-full md:w-auto gap-8 mb-3 md:mb-0"
              >
                <div class="flex items-center gap-2 text-white">
                  
                  
                    <a
                      class=""
                      href="https://minyvinyl.com/"
                      >
                      <div class="size-12 mr-3">
                            <img src="https://minyfy.subwaymusician.xyz/Minylogo.png" alt="Miny Vinyl Logo" className=" h-12" />
                        </div>
                      </a>
                </div>
                <label class="flex flex-col min-w-40 !h-10 max-w-64 md:hidden">
                  <div class="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div
                      class="text-[#9d9db8] flex border-none bg-[#292938] items-center justify-center pl-4 rounded-l-xl border-r-0"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        </path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#292938] focus:border-none h-full placeholder:text-[#9d9db8] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      value=""
                    />
                  </div>
                </label>
              </div>
              <div class="flex flex-col md:flex-row flex-1 justify-between gap-8">
                <div
                  class="flex items-center gap-4 md:gap-9 flex-wrap justify-center md:justify-start"
                >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://go.minyvinyl.com/prezmix"
                    >Prez Mix</a
                  >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://go.minyvinyl.com/genrex"
                    >New Genres</a
                  >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://minyfy.subwaymusician.xyz/makeaminy"
                    >Create a Mixtape</a
                  >
                  <a
                    class="text-white text-xs md:text-sm font-medium leading-normal"
                    href="https://www.instagram.com/minyvinyl/"
                    >Instagram</a
                  >
                </div>
                <label class="flex flex-col min-w-40 !h-10 max-w-64 hidden md:flex">
                  <div class="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div
                      class="text-[#9d9db8] flex border-none bg-[#292938] items-center justify-center pl-4 rounded-l-xl border-r-0"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#292938] focus:border-none h-full placeholder:text-[#9d9db8] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      value=""
                    />
                  </div>
                </label>
              </div>
            </header>
            <div class=" px-2 md:px-40 flex flex-col justify-center pb-5">
              <div
                class="layout-content-container flex flex-col md:max-w-[960px] w-full flex-1"
              >
                <div class="@container">
                  <div
                    class="flex flex-col gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row"
                  >
                    <div
                      class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl @[480px]:h-auto @[480px]:min-w-[400px] @[864px]:w-full"
                      style="
                        background-image: url('${backgroundImage}');
                      "
                    ></div>
                    <div
                      class="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center"
                    >
                      <div class="flex flex-col gap-4 justify-center items-center">
                        <h1
                          class="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                        >
                          ${title}
                        </h1>
                        <h2
                          class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                        >
                          ${description}
                        </h2>
                        <div class="flex justify-center items-center w-full">
                          <a
                          href="https://minyfy.subwaymusician.xyz/makeaminy"
                          class="bg-[#1919e6] text-white px-4 py-3 rounded-full text-lg font-bold text-center hero-button"
                          >Create a MINY mixtape</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2
                  class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
                >
                  ${featuredTitle}
                </h2>
                <div
                  class="grid grid-cols-1 md:grid-cols-4 gap-3 p-4"
                >
                ${playlists.map((playlist, index) => `
                  <div class="flex flex-col gap-3 pb-3">
                    <a href="${playlist.link}" class="relative">
                      <div class="hexagon-container relative">
                        <img
                          src="${playlist.imageUrl}"
                          alt="${playlist.heading}"
                          class="hexagon-image"
                        />
                        <div
                          class="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300"
                        >
                          <div class="flex gap-2">
                            <button
                              class="bg-[#1919e6] text-white px-3 py-2 rounded-full text-sm font-bold"
                            >
                              View Mixtape
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="text-white text-base font-medium leading-normal">
                        <h2 class="text-base mt-1 font-semibold text-center mb-2">${playlist.heading}</h2>
                        <p class="text-sm text-center">${playlist.subheading}</p>
                      </div>
                    </a>
                  </div>
                `).join('')}
                </div>
              </div>
              <div class="flex flex-col justify-center items-center gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row">
                <div class="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center">
                  <div class="flex flex-col gap-2 justify-center text-center">
                    <h1
                      class="text-white text-center text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                    >
                      ${buyNowTitle}
                    </h1>
                    <h2
                      class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                    >
                      All Mixtapes for $${buyNowPrice}
                    </h2>
                    <p
                      class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                    >
                      ${buyNowDescription}
                    </p>
              
                    <!-- Centering the button -->
                    <div class="flex justify-center mt-2">
                      <a
                        href="${buyNowButtonLink}"
                        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#193be6] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                      >
                        <span class="truncate">Buy your Collection Now</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="container">
                <p class="text-sm text-center text-gray-500 mt-4">
                  Disclaimer: MINY is not affiliated with, endorsed by, or sponsored
                  by ACL Festival or any of the artists or brands mentioned. We do
                  not own or claim to own any rights to the music, logos, or other
                  content shared on this page. This is a fan-created project
                  intended for entertainment purposes only. No copyright
                  infringement is intended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const element = document.createElement('a');
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'index.html';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h1 className='text-center text-xl'>Edit Blog </h1>

          <h2>Meta Information</h2>
          <div className="mb-4">
            <label htmlFor="metaTitle" className="block text-gray-700 font-bold mb-2">Meta Title:</label>
            <input
              type="text"
              id="metaTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={metaTitle}
              onChange={handleMetaTitleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="metaDescription" className="block text-gray-700 font-bold mb-2">Meta Description:</label>
            <textarea
              id="metaDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="metaKeywords" className="block text-gray-700 font-bold mb-2">Meta Keywords:</label>
            <input
              type="text"
              id="metaKeywords"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={metaKeywords}
              onChange={handleMetaKeywordsChange}
            />
          </div>

          <h2>Main Content</h2>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title:</label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description:</label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="backgroundImage" className="block text-gray-700 font-bold mb-2">Background Image:</label>
            <input type="file" id="backgroundImage" onChange={handleBackgroundImageUpload} />
            {backgroundImage && <img src={backgroundImage} alt="Background" style={{ maxWidth: '200px' }} />}
          </div>

          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Featured Playlist Title:</label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={featuredTitle}
              onChange={handleFeaturedTileChange}
            />
          </div>
          {playlists.map((playlist, index) => (
            <div key={index} className="mb-6 border p-4 rounded-md">
              <h3>Playlist {index + 1}</h3>
              <div className="mb-4">
                <label htmlFor={`playlistImage-${index}`} className="block text-gray-700 font-bold mb-2">Image:</label>
                <input
                  type="file"
                  id={`playlistImage-${index}`}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onChange={(event) => handlePlaylistImageUpload(index, event)}
                />
                {playlist.imageUrl && (
                  <img src={playlist.imageUrl} alt="Playlist" style={{ maxWidth: '100px' }} />
                )}
              </div>
              <div className="mb-4">
                <label htmlFor={`playlistLink-${index}`} className="block text-gray-700 font-bold mb-2">Link:</label>
                <input
                  type="text"
                  id={`playlistLink-${index}`}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={playlist.link}
                  onChange={(event) => handlePlaylistLinkChange(index, event)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor={`playlistHeading-${index}`} className="block text-gray-700 font-bold mb-2">Heading:</label>
                <input
                  type="text"
                  id={`playlistHeading-${index}`}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={playlist.heading}
                  onChange={(event) => handlePlaylistHeadingChange(index, event)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor={`playlistSubheading-${index}`} className="block text-gray-700 font-bold mb-2">Subheading:</label>
                <textarea
                  id={`playlistSubheading-${index}`}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={playlist.subheading}
                  onChange={(event) => handlePlaylistSubheadingChange(index, event)}
                />
              </div>
              <button 
                    onClick={() => handleDeletePlaylist(index)}
                    className=" bg-red-500 hover:bg-red-700 
                            text-white text-sm font-bold py-1 px-2 rounded 
                            focus:outline-none focus:shadow-outline"
                >
                    Delete
                </button>
            </div>
          ))}
          <button
                onClick={handleAddPlaylist}
                className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Add Playlist
            </button>

          <h2 className='mt-2 font-extrabold'>Buy Now Section</h2>
          <div className="mb-4">
            <label htmlFor="buyNowTitle" className="block text-gray-700 font-bold mb-2">Buy Now Title:</label>
            <input 
              type="text"
              id="BuyNowTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={buyNowTitle}
              onChange={handlebuyNowTitleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="buyNowPrice" className="block text-gray-700 font-bold mb-2">Buy Now Price:</label>
            <input 
              type="text" 
              id="buyNowPrice" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={buyNowPrice}
              onChange={handlebuyNowPriceChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="buyNowDescription" className="block text-gray-700 font-bold mb-2">Buy Now  Description:</label>
            <textarea 
              id="buyNowDescription" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={buyNowDescription}
              onChange={handlebuyNowDescriptionChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="buyNowButtonLink" className="block text-gray-700 font-bold mb-2">Buy Now  Button Link:</label>
            <input 
              type="text" 
              id="buyNowButtonLink" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={buyNowButtonLink}
              onChange={handlebuyNowButtonLinkChange}
            />
          </div>
          
          <button
            onClick={downloadHTML}
            className="mt-4 bg-green-500 mr-2 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Download HTML
          </button>
          <button 
                onClick={handleUploadButtonClick}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Upload Blog
            </button>
        </div>
      </div>

      <div className="my-8">
        <h2 className="text-xl font-bold mb-4">HTML Preview</h2>
        <iframe 
          srcDoc={previewHtml} 
          title="Preview"
          className="w-full h-[100vh] border rounded-md"
        />
      </div>
      

      {/* Playlist Selector Modal */}
      {showPlaylistSelector && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Select a Mixtape</h2>
              <button 
                onClick={() => setShowPlaylistSelector(false)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-grow p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentMixtapes.map((mixtape) => (
                <div 
                  key={mixtape.id} 
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" 
                  onClick={() => handleSelectPlaylist(mixtape)}
                >
                  <img 
                    src={mixtape.imageUrl} 
                    alt={mixtape.name} 
                    className="w-full object-cover" 
                  />
                  <div className="p-2">
                    <p className="text-sm font-medium">{mixtape.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

    {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Upload HTML File</h2>

            {/* Display upload message */}
            {uploadMessage && (
              <div className={`mb-4 p-3  rounded ${uploadMessage.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                <a className="hover:underline cursor-pointer" onClick={() => window.open(`https://miny.subwaymusician.xyz/blog/${uploadMessage.text}`)}>https://miny.subwaymusician.xyz/blog/{uploadMessage.text}</a>
                
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="uploadFileName" className="block text-gray-700 font-bold mb-2">Enter route in /blog/...</label>
              <input 
                type="text" 
                id="uploadFileName" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={uploadFileName}
                onChange={handleUploadFileNameChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={handleUpload}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Upload
              </button>
              <button 
                onClick={() => {setShowUploadModal(false), setUploadMessage(null), setUploadFileName('')}}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Blog;