import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Head from 'next/head';

function Collections() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserCollections(user.email);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserCollections = async (userEmail) => {
    try {
      const q = query(collection(db, "mixtapes"), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);

      const imageUrls = querySnapshot.docs
        .filter(doc => doc.data().imageUrl) // Filter out documents without imageUrl field
        .map(doc => ({
          id: doc.id,
          url: doc.data().imageUrl
        }));

      setImages(imageUrls);
    } catch (error) {
      console.error("Error fetching user collections: ", error);
    }
  };

  const openImageInNewTab = (docId) => {
    router.push(`/play/${docId}`);
  };

  const handleCreateCollection = () => {
    router.push('/makeaminy'); // Adjust this path as necessary
  };

  return (
    <>
      <Head>
        <title>Your Mixtape Collection | Miny Vinyl - View and Manage Your Creations</title>
        <meta
          name="description"
          content="Explore your personal collection of Miny Vinyl playlists! Rediscover your curated music mixes, share your favorites with friends, and relive your best musical moments."
        />
        <meta
          name="keywords"
          content="Miny Vinyl, music playlist collection, my playlists, curated playlists, music library, playlist sharing, music community"
        />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />

        {/* Open Graph tags for social sharing */}
        <meta property="og:site_name" content="Miny Vinyl" />
        <meta property="og:locale" content="en_US" />
        <meta 
          property="og:title" 
          content="Your Mixtape Collection | Miny Vinyl - View and Manage Your Creations" 
        />
        <meta
          property="og:description"
          content="Explore your personal collection of Miny Vinyl playlists! Rediscover your curated music mixes, share your favorites with friends, and relive your best musical moments."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minyfy.subwaymusician.xyz/collections" /> 
        <meta
          property="og:image"
          content="https://minyfy.subwaymusician.xyz/vinyl.png" 
        />
        <meta property="og:image:alt" content="Miny Vinyl - Your Personal Music Playlist Collection" /> 
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@minyvinyl" />
        <meta name="twitter:creator" content="@minyvinyl" />
        <meta
          name="twitter:title"
          content="My Miny Collections: A Showcase of My Musical Journey 🎶 | Miny Vinyl" 
        />
        <meta
          name="twitter:description"
          content="Check out my curated Miny Vinyl playlists! From chill vibes to party anthems, explore my musical world and discover your next favorite mix."
        />
        <meta
          name="twitter:image"
          content="https://minyfy.subwaymusician.xyz/vinyl.png" 
        />
      </Head>
      <Header />
      <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
        <h1 className='text-4xl text-center font-bold font-jakarta'>Collections</h1>
        {!user ? (
          <p className='mt-4 text-center text-3xl font-bold font-jakarta text-neutral-600'>User not Logged In!</p>
        ) : (
          images.length === 0 ? (
            <div className='text-center mt-8'>
              <p className='text-3xl font-bold font-jakarta text-neutral-600'>No collections found</p>
              <button 
                onClick={handleCreateCollection} 
                className='mt-4 px-4 py-2 bg-black shadow-custom text-white rounded-lg hover:bg-gray-800 transition-colors duration-300'>
                Create Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={() => openImageInNewTab(image.id)}>
                  <img src={image.url} alt={`Image ${index + 1}`} className=" hex-alt w-full h-auto rounded-lg shadow-md transition-all duration-500 ease-in-out hover:rounded-full hover:rotate-360" />
                </div>
              ))}
            </div>
          )
        )}
      </div>
      
    </>
  );
}

export default Collections;
