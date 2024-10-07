import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaSpotify } from 'react-icons/fa';
import ImageGallery from '@/components/Gallery';
import { IoRocketSharp } from "react-icons/io5";
import { useRouter } from 'next/router';
import Head from 'next/head';

function Home() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Miny Vinyl -  Create and Discover Awesome Music Playlists</title>
        <meta
          name="description"
          content="Create and discover cool music playlists and mixtapes for any artist.  Design your own mixtapes/playlist or explore curated collections from Spotify, Discogs, Apple Music, YouTube Music, and more!."
        />
        <meta
          name="keywords"
          content="Miny Vinyl, vinyl, artist mixtapes, music playlist,  create playlists, music discovery, music community, mixtape, Spotify playlists, Discogs playlists, Apple Music playlists, YouTube playlists"
        />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta property="og:site_name" content="Miny Vinyl" />
        <meta property="og:locale" content="en_US" />
        <meta
          property="og:title"
          content="Miny Vinyl -  Create and Discover Awesome Music Playlists"
        />
        <meta
          property="og:description"
          content="Create and discover cool music playlists and mixtapes for any artist. Design your own mixtapes/playlist or explore curated collections from Spotify, Discogs, Apple Music, YouTube Music, and more!."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minyfy.subwaymusician.xyz/" />
        <meta
          property="og:image"
          content="https://minyfy.subwaymusician.xyz/vinyl.png"
        />
        <meta property="og:image:alt" content="Miny Vinyl - Music Playlist Creator" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="article:published_time"
          content="2024-10-07T00:00:00+00:00"
        />
        <meta
          property="article:modified_time"
          content="2024-10-07T00:00:00+00:00"
        />
        <meta
          property="article:author"
          content="https://www.linkedin.com/company/goforgreat/"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@minyvinyl" />
        <meta name="twitter:creator" content="@minyvinyl" />
        <meta
          name="twitter:title"
          content="Miny Vinyl -  Create and Discover Awesome Music Playlists"
        />
        <meta
          name="twitter:description"
          content="Create and discover cool music playlists and mixtapes for any artist.  Design your own mixtapes/playlist or explore curated collections from Spotify, Discogs, Apple Music, YouTube Music, and more!."
        />
        <meta
          name="twitter:image"
          content="https://minyfy.subwaymusician.xyz/vinyl.png"
        />
      </Head>
      <Header />
      <div className="container mx-auto px-4 my-6">
        <div className="w-full flex justify-center">
            <div>
              <div className="btn w-full   hex-alt" onClick={() => {router.push("/makeaminy")}}><i className="animation"></i>
             <IoRocketSharp className="text-xl" />
             Create A Mixtape<i className="animation"></i>
              </div>
          </div>
          
        </div>
        
        <div className="mt-8">
          <ImageGallery/>
        </div>
      </div>
    </>
  );
}

export default Home;
