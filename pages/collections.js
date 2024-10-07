import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Head from 'next/head';
import { NextSeo } from 'next-seo';

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
      <NextSeo
        title="Your Mixtape Collection | Miny Vinyl - View and Manage Your Creations"
        description="Explore your personal collection of Miny Vinyl playlists! Rediscover your curated music mixes, share your favorites with friends, and relive your best musical moments."
        canonical="https://minyfy.subwaymusician.xyz/collections"
        openGraph={{
          url: 'https://minyfy.subwaymusician.xyz/collections',
          title:
            'Your Mixtape Collection | Miny Vinyl - View and Manage Your Creations',
          description:
            'Explore your personal collection of Miny Vinyl playlists! Rediscover your curated music mixes, share your favorites with friends, and relive your best musical moments.',
          images: [
            {
              url: 'https://minyfy.subwaymusician.xyz/vinyl.png',
              width: 1200,
              height: 630,
              alt: 'Miny Vinyl - Your Personal Music Playlist Collection', 
            },
          ],
          site_name: 'Miny Vinyl',
        }}
        twitter={{
          handle: '@minyvinyl',
          site: '@minyvinyl',
          cardType: 'summary_large_image',
          title:
            'My Miny Collections: A Showcase of My Musical Journey 🎶 | Miny Vinyl', 
          description:
            'Check out my curated Miny Vinyl playlists! From chill vibes to party anthems, explore my musical world and discover your next favorite mix.',
        }}
        additionalJsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name:
              'Your Mixtape Collection | Miny Vinyl - View and Manage Your Creations',
            description:
              'Explore your personal collection of Miny Vinyl playlists! Rediscover your curated music mixes, share your favorites with friends, and relive your best musical moments.',
            url: 'https://minyfy.subwaymusician.xyz/collections',
          },
        ]}
      />
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
