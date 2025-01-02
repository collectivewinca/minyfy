import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { supabase } from '@/supabase/config';

function Collections() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        const userEmail = session.user.email;
        fetchUserCollections(userEmail);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        const userEmail = session.user.email;
        fetchUserCollections(userEmail);
      } else {
        setUser(null);
        setImages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserCollections = async (userEmail) => {
    try {
      setLoading(true);
      const { data: mixtapes, error } = await supabase
        .from('mixtapes')
        .select('id, image_url')
        .eq('user_email', userEmail);

      if (error) throw error;

      const imageUrls = mixtapes
        .filter(mixtape => mixtape.image_url)
        .map(mixtape => ({
          id: mixtape.id,
          url: mixtape.image_url
        }));

      setImages(imageUrls);
    } catch (error) {
      console.error("Error fetching user collections: ", error);
    } finally {
      setLoading(false);
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
        canonical="https://minyfy.minyvinyl.com/collections"
        openGraph={{
          url: 'https://minyfy.minyvinyl.com/collections',
          title:
            'Your Mixtape Collection | Miny Vinyl - View and Manage Your Creations',
          description:
            'Explore your personal collection of Miny Vinyl playlists! Rediscover your curated music mixes, share your favorites with friends, and relive your best musical moments.',
          images: [
            {
              url: 'https://minyfy.minyvinyl.com/vinyl.png',
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
            url: 'https://minyfy.minyvinyl.com/collections',
          },
        ]}
      />
      <Header />
      <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
        <h1 className='text-4xl text-center font-bold font-jakarta'>Collections</h1>
        {loading && (
          <div className="flex justify-center items-center mb-2 mt-4">
            <div className="relative">
              <div className="h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-gray-600"></div>
              <div className="absolute top-0 left-0 h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-[#78bf45] animate-spin"></div>
            </div>
          </div>
        )}
        {!loading && !user ? (
          <p className='mt-4 text-center text-3xl font-bold font-jakarta text-neutral-600'>User not Logged In!</p>
        ) : !loading && (
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
                  <img src={image.url} alt={`Image ${index + 1}`} className=" hex-alt w-full h-auto rounded-lg shadow-md transition-all duration-500 ease-in-out hover:scale-105" />
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
