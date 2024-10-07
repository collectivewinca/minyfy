import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaSpotify } from 'react-icons/fa';
import ImageGallery from '@/components/Gallery';
import { IoRocketSharp } from "react-icons/io5";
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

function Home() {
  const router = useRouter();
  return (
    <>
      <NextSeo
        title="Miny Vinyl - Create and Discover Awesome Music Playlists"
        description="Create and discover cool music playlists and mixtapes for any artist. Design your own mixtapes/playlist or explore curated collections from Spotify, Discogs, Apple Music, YouTube Music, and more!."
        canonical="https://minyfy.subwaymusician.xyz/"
        openGraph={{
          url: 'https://minyfy.subwaymusician.xyz/',
          title: 'Miny Vinyl - Create and Discover Awesome Music Playlists',
          description: 'Create and discover cool music playlists and mixtapes for any artist. Design your own mixtapes/playlist or explore curated collections from Spotify, Discogs, Apple Music, YouTube Music, and more!',
          images: [
            {
              url: 'https://minyfy.subwaymusician.xyz/vinyl.png',
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
            url: 'https://minyfy.subwaymusician.xyz/',
          },
        ]}
      />
      <Header />
      <div className="container mx-auto px-4 my-6">
        <div className="w-full flex justify-center">
          <div>
            <div className="btn w-full hex-alt" onClick={() => { router.push("/makeaminy") }}>
              <i className="animation"></i>
              <IoRocketSharp className="text-xl" />
              Create A Mixtape<i className="animation"></i>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <ImageGallery />
        </div>
      </div>
    </>
  );
}

export default Home;
