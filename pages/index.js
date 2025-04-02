import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import ImageGallery from '@/components/Gallery';
import { IoRocketSharp } from "react-icons/io5";
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Head from 'next/head';

function Home() {
  const router = useRouter();
  return (
    <>
      <NextSeo
        title="Miny Vinyl - Create and Discover Awesome Music Playlists"
        description="Create and discover cool music playlists and mixtapes for any artist. Design your own mixtapes/playlist or explore curated collections from Discogs, Apple Music, YouTube Music, and more!."
        canonical="https://minyfy.minyvinyl.com/"
        openGraph={{
          url: 'https://minyfy.minyvinyl.com/',
          title: 'Miny Vinyl - Create and Discover Awesome Music Playlists',
          description: 'Create and discover cool music playlists and mixtapes for any artist. Design your own mixtapes/playlist or explore curated collections from Discogs, Apple Music, YouTube Music, and more!',
          images: [
            {
              url: 'https://minyfy.minyvinyl.com/vinyl.png',
              width: 1200,
              height: 630,
              alt: 'Miny Vinyl - Music Playlist Creator',
            },
          ],
          site_name: 'Miny Vinyl',
        }}
        twitter={{
          handle: '@minyvinyl',
          site: '@minyvinyl',
          cardType: 'summary_large_image',
        }}
        additionalJsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Miny Vinyl',
            url: 'https://minyfy.minyvinyl.com/',
          },
        ]}
      />
      <Head>
        <link rel="icon" href="/vinyl.png" type="image/png" /> 
      </Head>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Miny Vinyl</h1>
          <p className="text-xl text-gray-600">Create and discover amazing music playlists</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Create Playlists</h2>
            <p className="text-gray-600">Design your own custom playlists with your favorite tracks</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Discover Music</h2>
            <p className="text-gray-600">Explore curated collections from various music platforms</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Share & Connect</h2>
            <p className="text-gray-600">Share your playlists with friends and discover new music</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/create" className="inline-flex items-center bg-[#A18249] text-white px-6 py-3 rounded-full hover:opacity-90">
            <IoRocketSharp className="mr-2" />
            Start Creating
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
